/**
 * Local Storage Service for FoodTracker
 * Handles caching food items and queuing offline operations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodItem, CreateFoodItemInput, UpdateFoodItemInput } from '../types';

// Storage keys
const STORAGE_KEYS = {
    FOOD_ITEMS_CACHE: '@FoodTracker:foodItems',
    OFFLINE_QUEUE: '@FoodTracker:offlineQueue',
    LAST_SYNC: '@FoodTracker:lastSync',
};

// Types for offline operations
export type OfflineOperationType = 'CREATE' | 'UPDATE' | 'DELETE';

export interface OfflineOperation {
    id: string;
    type: OfflineOperationType;
    timestamp: number;
    data: {
        itemId?: string;
        items?: CreateFoodItemInput[];
        updates?: UpdateFoodItemInput;
    };
}

// ============================================
// Food Items Cache
// ============================================

/**
 * Cache food items for offline viewing
 */
export async function cacheFoodItems(items: FoodItem[]): Promise<void> {
    try {
        await AsyncStorage.setItem(
            STORAGE_KEYS.FOOD_ITEMS_CACHE,
            JSON.stringify(items)
        );
        await AsyncStorage.setItem(
            STORAGE_KEYS.LAST_SYNC,
            new Date().toISOString()
        );
    } catch (error) {
        console.error('Failed to cache food items:', error);
    }
}

/**
 * Get cached food items
 */
export async function getCachedFoodItems(): Promise<FoodItem[]> {
    try {
        const cached = await AsyncStorage.getItem(STORAGE_KEYS.FOOD_ITEMS_CACHE);
        return cached ? JSON.parse(cached) : [];
    } catch (error) {
        console.error('Failed to get cached food items:', error);
        return [];
    }
}

/**
 * Get last sync timestamp
 */
export async function getLastSyncTime(): Promise<string | null> {
    try {
        return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    } catch (error) {
        console.error('Failed to get last sync time:', error);
        return null;
    }
}

/**
 * Clear food items cache
 */
export async function clearFoodItemsCache(): Promise<void> {
    try {
        await AsyncStorage.removeItem(STORAGE_KEYS.FOOD_ITEMS_CACHE);
        await AsyncStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
    } catch (error) {
        console.error('Failed to clear food items cache:', error);
    }
}

// ============================================
// Offline Queue
// ============================================

/**
 * Add operation to offline queue
 */
export async function queueOfflineOperation(
    operation: Omit<OfflineOperation, 'id' | 'timestamp'>
): Promise<void> {
    try {
        const queue = await getOfflineQueue();
        const newOperation: OfflineOperation = {
            ...operation,
            id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
        };
        queue.push(newOperation);
        await AsyncStorage.setItem(
            STORAGE_KEYS.OFFLINE_QUEUE,
            JSON.stringify(queue)
        );
    } catch (error) {
        console.error('Failed to queue offline operation:', error);
    }
}

/**
 * Get all queued offline operations
 */
export async function getOfflineQueue(): Promise<OfflineOperation[]> {
    try {
        const queue = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
        return queue ? JSON.parse(queue) : [];
    } catch (error) {
        console.error('Failed to get offline queue:', error);
        return [];
    }
}

/**
 * Remove operation from queue after successful sync
 */
export async function removeFromQueue(operationId: string): Promise<void> {
    try {
        const queue = await getOfflineQueue();
        const filtered = queue.filter(op => op.id !== operationId);
        await AsyncStorage.setItem(
            STORAGE_KEYS.OFFLINE_QUEUE,
            JSON.stringify(filtered)
        );
    } catch (error) {
        console.error('Failed to remove operation from queue:', error);
    }
}

/**
 * Clear entire offline queue
 */
export async function clearOfflineQueue(): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify([]));
    } catch (error) {
        console.error('Failed to clear offline queue:', error);
    }
}

/**
 * Check if there are pending offline operations
 */
export async function hasPendingOperations(): Promise<boolean> {
    const queue = await getOfflineQueue();
    return queue.length > 0;
}

/**
 * Get count of pending operations
 */
export async function getPendingOperationsCount(): Promise<number> {
    const queue = await getOfflineQueue();
    return queue.length;
}

// ============================================
// Utility exports
// ============================================

export const storage = {
    cache: {
        save: cacheFoodItems,
        get: getCachedFoodItems,
        clear: clearFoodItemsCache,
        getLastSync: getLastSyncTime,
    },
    queue: {
        add: queueOfflineOperation,
        getAll: getOfflineQueue,
        remove: removeFromQueue,
        clear: clearOfflineQueue,
        hasPending: hasPendingOperations,
        getPendingCount: getPendingOperationsCount,
    },
};

export default storage;
