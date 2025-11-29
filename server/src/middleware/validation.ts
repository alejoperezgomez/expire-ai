import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { validationError } from './errorHandler';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = validationError('Validation failed', { errors: errors.array() });
        return res.status(error.statusCode).json({
            code: error.code,
            message: error.message,
            details: error.details,
        });
    }
    next();
};

export const validateCreateFoodItem = [
    // Support both single object and array of objects
    body().custom((value, { req }) => {
        const items = Array.isArray(value) ? value : [value];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (!item || typeof item !== 'object') {
                throw new Error(`Item at index ${i} must be an object`);
            }

            if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
                throw new Error(`Item at index ${i}: Name is required`);
            }

            if (!item.purchaseDate || !isValidISODate(item.purchaseDate)) {
                throw new Error(`Item at index ${i}: Purchase date must be a valid ISO date`);
            }

            if (!item.expirationDate || !isValidISODate(item.expirationDate)) {
                throw new Error(`Item at index ${i}: Expiration date must be a valid ISO date`);
            }

            if (item.isEstimated !== undefined && typeof item.isEstimated !== 'boolean') {
                throw new Error(`Item at index ${i}: isEstimated must be a boolean`);
            }
        }

        return true;
    }),
    handleValidationErrors,
];

// Helper function to validate ISO date strings
function isValidISODate(dateString: string): boolean {
    if (typeof dateString !== 'string') return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime()) && dateString === date.toISOString().split('T')[0];
}

export const validateUpdateFoodItem = [
    param('id').isUUID().withMessage('Invalid food item ID'),
    body('name').optional().isString().trim().notEmpty().withMessage('Name cannot be empty'),
    body('expirationDate').optional().isISO8601().withMessage('Expiration date must be a valid ISO date'),
    body('isEstimated').optional().isBoolean().withMessage('isEstimated must be a boolean'),
    handleValidationErrors,
];

export const validateFoodItemId = [
    param('id').isUUID().withMessage('Invalid food item ID'),
    handleValidationErrors,
];

/**
 * Validates that the image is a valid base64 string
 * Checks for common base64 image magic bytes (PNG, JPEG, GIF, WebP)
 */
const isValidBase64Image = (value: string): boolean => {
    if (!value || typeof value !== 'string') return false;

    // Remove data URI prefix if present
    const base64Data = value.replace(/^data:image\/\w+;base64,/, '');

    // Check minimum length (a valid image should have some content)
    if (base64Data.length < 100) return false;

    // Check for valid base64 characters
    const base64Regex = /^[A-Za-z0-9+/]+=*$/;
    if (!base64Regex.test(base64Data.substring(0, 100))) return false;

    // Check for common image format magic bytes in base64
    // PNG: iVBORw0KGgo, JPEG: /9j/, GIF: R0lGOD, WebP: UklGR
    const validPrefixes = ['iVBORw0KGgo', '/9j/', 'R0lGOD', 'UklGR'];
    return validPrefixes.some(prefix => base64Data.startsWith(prefix));
};

export const validateImageUpload = [
    body('image')
        .isString()
        .notEmpty()
        .withMessage('Image data is required')
        .custom((value) => {
            if (!isValidBase64Image(value)) {
                throw new Error('Invalid image data. Expected base64-encoded PNG, JPEG, GIF, or WebP image.');
            }
            return true;
        }),
    handleValidationErrors,
];
