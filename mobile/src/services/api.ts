/**
 * API Client Service for FoodTracker
 * Provides typed methods for all backend API endpoints
 */

import {
    FoodItem,
    CreateFoodItemInput,
    UpdateFoodItemInput,
    ScanReceiptResponse,
    ScanLabelResponse,
    ApiError,
    ErrorCodes,
} from '../types';

// Base URL configuration - adjust for your environment
// For iOS simulator: use localhost
// For Android emulator: use 10.0.2.2
// For physical device: use your computer's IP address (e.g., 192.168.1.x)
const API_BASE_URL = __DEV__
    ? 'http://192.168.1.146:3005/api'  // Using local network IP for physical device
    : 'https://your-production-url.com/api';

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 30000;

/**
 * Custom error class for API errors
 */
export class ApiClientError extends Error {
    code: string;
    details?: Record<string, unknown>;

    constructor(error: ApiError) {
        super(error.message);
        this.name = 'ApiClientError';
        this.code = error.code;
        this.details = error.details;
    }
}

/**
 * Create a fetch request with timeout
 */
async function fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number = REQUEST_TIMEOUT
): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        return response;
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Handle API response and parse JSON
 */
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let errorData: ApiError;
        try {
            errorData = await response.json();
        } catch {
            errorData = {
                code: ErrorCodes.NETWORK_ERROR,
                message: `HTTP error: ${response.status} ${response.statusText}`,
            };
        }
        throw new ApiClientError(errorData);
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

/**
 * Make an API request with error handling
 */
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
    };

    console.log(`[API] ${options.method || 'GET'} ${url}`);

    try {
        const response = await fetchWithTimeout(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        });

        console.log(`[API] Response status: ${response.status}`);
        return handleResponse<T>(response);
    } catch (error) {
        console.error(`[API] Request failed:`, error);
        if (error instanceof ApiClientError) {
            throw error;
        }

        // Handle network errors
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new ApiClientError({
                    code: ErrorCodes.NETWORK_ERROR,
                    message: 'Request timed out. Please check your connection.',
                });
            }
            throw new ApiClientError({
                code: ErrorCodes.NETWORK_ERROR,
                message: error.message || 'Network error occurred',
            });
        }

        throw new ApiClientError({
            code: ErrorCodes.NETWORK_ERROR,
            message: 'An unexpected error occurred',
        });
    }
}

// ============================================
// Food Items API
// ============================================

/**
 * Get all food items for the current user
 */
export async function getFoodItems(): Promise<FoodItem[]> {
    return apiRequest<FoodItem[]>('/food-items');
}

/**
 * Get a single food item by ID
 */
export async function getFoodItem(id: string): Promise<FoodItem> {
    return apiRequest<FoodItem>(`/food-items/${id}`);
}

/**
 * Create one or more food items
 */
export async function createFoodItems(
    items: CreateFoodItemInput | CreateFoodItemInput[]
): Promise<FoodItem | FoodItem[]> {
    return apiRequest<FoodItem | FoodItem[]>('/food-items', {
        method: 'POST',
        body: JSON.stringify(items),
    });
}

/**
 * Update a food item
 */
export async function updateFoodItem(
    id: string,
    updates: UpdateFoodItemInput
): Promise<FoodItem> {
    return apiRequest<FoodItem>(`/food-items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    });
}

/**
 * Delete a food item
 */
export async function deleteFoodItem(id: string): Promise<void> {
    return apiRequest<void>(`/food-items/${id}`, {
        method: 'DELETE',
    });
}

// ============================================
// Scan API
// ============================================

/**
 * Process a receipt image and extract food items
 */
export async function scanReceipt(imageBase64: string): Promise<ScanReceiptResponse> {
    return apiRequest<ScanReceiptResponse>('/scan/receipt', {
        method: 'POST',
        body: JSON.stringify({ image: imageBase64 }),
    });
}

/**
 * Process a product label image and extract expiration date
 */
export async function scanLabel(imageBase64: string): Promise<ScanLabelResponse> {
    return apiRequest<ScanLabelResponse>('/scan/label', {
        method: 'POST',
        body: JSON.stringify({ image: imageBase64 }),
    });
}

// ============================================
// Notifications API
// ============================================

/**
 * Register push notification token
 */
export async function registerPushToken(
    pushToken: string
): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>('/notifications/register', {
        method: 'POST',
        body: JSON.stringify({ pushToken }),
    });
}

// ============================================
// API Client Object (alternative interface)
// ============================================

export const api = {
    foodItems: {
        getAll: getFoodItems,
        getOne: getFoodItem,
        create: createFoodItems,
        update: updateFoodItem,
        delete: deleteFoodItem,
    },
    scan: {
        receipt: scanReceipt,
        label: scanLabel,
    },
    notifications: {
        register: registerPushToken,
    },
    registerPushToken, // Expose at top level for convenience
};

export default api;
