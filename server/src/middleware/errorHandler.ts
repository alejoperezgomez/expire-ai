import { Request, Response, NextFunction } from 'express';
import { ApiError, ErrorCodes } from '../types';

export class AppError extends Error {
    public code: string;
    public statusCode: number;
    public details?: Record<string, unknown>;

    constructor(code: string, message: string, statusCode: number = 500, details?: Record<string, unknown>) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error('Error:', err);

    if (err instanceof AppError) {
        const response: ApiError = {
            code: err.code,
            message: err.message,
            details: err.details,
        };
        res.status(err.statusCode).json(response);
        return;
    }

    // Default error response
    const response: ApiError = {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
    };
    res.status(500).json(response);
};

// Helper functions to create common errors
export const notFoundError = (resource: string) =>
    new AppError(ErrorCodes.FOOD_ITEM_NOT_FOUND, `${resource} not found`, 404);

export const validationError = (message: string, details?: Record<string, unknown>) =>
    new AppError(ErrorCodes.VALIDATION_ERROR, message, 400, details);

export const imageProcessingError = (message: string) =>
    new AppError(ErrorCodes.IMAGE_PROCESSING_FAILED, message, 422);
