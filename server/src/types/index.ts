// TypeScript type definitions for FoodTracker backend

export interface FoodItem {
    id: string;
    name: string;
    purchaseDate: string;
    expirationDate: string;
    isEstimated: boolean;
    imageUrl?: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateFoodItemInput {
    name: string;
    purchaseDate: string;
    expirationDate: string;
    isEstimated?: boolean;
}

export interface UpdateFoodItemInput {
    name?: string;
    expirationDate?: string;
    isEstimated?: boolean;
}

export interface ScanReceiptResponse {
    items: ExtractedFoodItem[];
    rawText?: string;
}

export interface ExtractedFoodItem {
    name: string;
    estimatedExpirationDays: number;
    confidence: number;
}

export interface ScanLabelResponse {
    expirationDate: string | null;
    confidence: number;
}

export type TrafficLightStatus = 'green' | 'yellow' | 'red';

export interface FoodItemWithStatus extends FoodItem {
    status: TrafficLightStatus;
    daysUntilExpiration: number;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

/**
 * Request body for image scan endpoints
 * The image should be a base64-encoded string (without data URI prefix)
 */
export interface ScanImageRequest {
    /** Base64-encoded image data (PNG, JPEG, GIF, or WebP) */
    image: string;
}

// Error codes
export const ErrorCodes = {
    CAMERA_PERMISSION_DENIED: 'CAMERA_PERMISSION_DENIED',
    IMAGE_PROCESSING_FAILED: 'IMAGE_PROCESSING_FAILED',
    NO_ITEMS_FOUND: 'NO_ITEMS_FOUND',
    FOOD_ITEM_NOT_FOUND: 'FOOD_ITEM_NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    INVALID_IMAGE_DATA: 'INVALID_IMAGE_DATA',
} as const;
