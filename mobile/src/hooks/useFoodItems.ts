import { useState, useCallback, useEffect, useRef } from 'react';
import { FoodItem, FoodItemWithStatus, CreateFoodItemInput, UpdateFoodItemInput } from '../types';
import { calculateDaysUntilExpiration, getTrafficLightStatus } from '../utils/dateUtils';
import * as api from '../services/api';
import * as storage from '../services/storage';
import { useNetworkStatus } from './useNetworkStatus';

interface UseFoodItemsReturn {
    items: FoodItemWithStatus[];
    isLoading: boolean;
    error: string | null;
    isOffline: boolean;
    pendingOperations: number;
    refresh: () => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
    addItems: (items: CreateFoodItemInput[]) => Promise<FoodItem[]>;
    updateItem: (id: string, updates: UpdateFoodItemInput) => Promise<FoodItem>;
    clearError: () => void;
    syncOfflineOperations: () => Promise<void>;
}

/**
 * Add traffic light status to food items based on expiration date
 */
function addStatusToItems(items: FoodItem[]): FoodItemWithStatus[] {
    return items
        .map(item => {
            const daysUntilExpiration = calculateDaysUntilExpiration(item.expirationDate);
            const status = getTrafficLightStatus(daysUntilExpiration);
            return { ...item, daysUntilExpiration, status };
        })
        .sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration);
}

/**
 * Hook for managing food items with API integration and offline support
 * Provides CRUD operations, loading/error states, caching, and offline queue
 */
export function useFoodItems(): UseFoodItemsReturn {
    const [items, setItems] = useState<FoodItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pendingOperations, setPendingOperations] = useState(0);
    const { isOnline } = useNetworkStatus();
    const isSyncing = useRef(false);

    // Update pending operations count
    const updatePendingCount = useCallback(async () => {
        const count = await storage.getPendingOperationsCount();
        setPendingOperations(count);
    }, []);

    // Fetch all food items from API or cache
    const fetchItems = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            if (isOnline) {
                // Fetch from API
                const foodItems = await api.getFoodItems();
                setItems(foodItems);
                // Cache for offline use
                await storage.cacheFoodItems(foodItems);
            } else {
                // Load from cache when offline
                const cachedItems = await storage.getCachedFoodItems();
                setItems(cachedItems);
                if (cachedItems.length === 0) {
                    setError('No cached data available. Connect to the internet to load items.');
                }
            }
        } catch (err) {
            // On network error, try to load from cache
            const cachedItems = await storage.getCachedFoodItems();
            if (cachedItems.length > 0) {
                setItems(cachedItems);
                setError('Using cached data. Some information may be outdated.');
            } else {
                const message = err instanceof api.ApiClientError
                    ? err.message
                    : 'Failed to load food items. Please try again.';
                setError(message);
            }
        } finally {
            setIsLoading(false);
            await updatePendingCount();
        }
    }, [isOnline, updatePendingCount]);

    // Sync offline operations when back online
    const syncOfflineOperations = useCallback(async () => {
        if (isSyncing.current || !isOnline) return;

        isSyncing.current = true;
        const queue = await storage.getOfflineQueue();

        for (const operation of queue) {
            try {
                switch (operation.type) {
                    case 'CREATE':
                        if (operation.data.items) {
                            await api.createFoodItems(operation.data.items);
                        }
                        break;
                    case 'UPDATE':
                        if (operation.data.itemId && operation.data.updates) {
                            await api.updateFoodItem(operation.data.itemId, operation.data.updates);
                        }
                        break;
                    case 'DELETE':
                        if (operation.data.itemId) {
                            try {
                                await api.deleteFoodItem(operation.data.itemId);
                            } catch (err) {
                                // Ignore 404 errors for delete (item may already be deleted)
                                if (err instanceof api.ApiClientError && err.code === 'FOOD_ITEM_NOT_FOUND') {
                                    // Item already deleted, continue
                                } else {
                                    throw err;
                                }
                            }
                        }
                        break;
                }
                // Remove successful operation from queue
                await storage.removeFromQueue(operation.id);
            } catch (err) {
                console.error('Failed to sync operation:', operation, err);
                // Keep failed operations in queue for retry
            }
        }

        isSyncing.current = false;
        await updatePendingCount();
        // Refresh items after sync
        await fetchItems();
    }, [isOnline, fetchItems, updatePendingCount]);

    // Initial fetch on mount
    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // Sync when coming back online
    useEffect(() => {
        if (isOnline) {
            syncOfflineOperations();
        }
    }, [isOnline, syncOfflineOperations]);

    // Refresh items (pull-to-refresh)
    const refresh = useCallback(async () => {
        if (isOnline) {
            await syncOfflineOperations();
        }
        await fetchItems();
    }, [fetchItems, isOnline, syncOfflineOperations]);

    // Delete a food item
    const deleteItem = useCallback(async (id: string) => {
        // Optimistically remove from local state
        setItems(prev => prev.filter(item => item.id !== id));

        try {
            if (isOnline) {
                await api.deleteFoodItem(id);
                // Update cache
                const updatedItems = items.filter(item => item.id !== id);
                await storage.cacheFoodItems(updatedItems);
            } else {
                // Queue for later sync
                await storage.queueOfflineOperation({
                    type: 'DELETE',
                    data: { itemId: id },
                });
                await updatePendingCount();
            }
        } catch (err) {
            // Revert optimistic update on error
            await fetchItems();
            const message = err instanceof api.ApiClientError
                ? err.message
                : 'Failed to delete item. Please try again.';
            setError(message);
            throw err;
        }
    }, [isOnline, items, fetchItems, updatePendingCount]);

    // Add one or more food items
    const addItems = useCallback(async (newItems: CreateFoodItemInput[]): Promise<FoodItem[]> => {
        try {
            if (isOnline) {
                const result = await api.createFoodItems(newItems);
                const createdItems = Array.isArray(result) ? result : [result];
                // Update local state and cache
                setItems(prev => {
                    const updated = [...prev, ...createdItems];
                    storage.cacheFoodItems(updated);
                    return updated;
                });
                return createdItems;
            } else {
                // Create temporary items for offline display
                const now = new Date().toISOString();
                const tempItems: FoodItem[] = newItems.map((item, index) => ({
                    ...item,
                    id: `temp-${Date.now()}-${index}`,
                    isEstimated: item.isEstimated ?? true,
                    createdAt: now,
                    updatedAt: now,
                }));

                // Add to local state
                setItems(prev => {
                    const updated = [...prev, ...tempItems];
                    storage.cacheFoodItems(updated);
                    return updated;
                });

                // Queue for later sync
                await storage.queueOfflineOperation({
                    type: 'CREATE',
                    data: { items: newItems },
                });
                await updatePendingCount();

                return tempItems;
            }
        } catch (err) {
            const message = err instanceof api.ApiClientError
                ? err.message
                : 'Failed to add items. Please try again.';
            setError(message);
            throw err;
        }
    }, [isOnline, updatePendingCount]);

    // Update a food item
    const updateItem = useCallback(async (id: string, updates: UpdateFoodItemInput): Promise<FoodItem> => {
        // Find current item for optimistic update
        const currentItem = items.find(item => item.id === id);
        if (!currentItem) {
            throw new Error('Item not found');
        }

        // Optimistically update local state
        const optimisticItem: FoodItem = {
            ...currentItem,
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        setItems(prev => prev.map(item => item.id === id ? optimisticItem : item));

        try {
            if (isOnline) {
                const updatedItem = await api.updateFoodItem(id, updates);
                // Update with server response
                setItems(prev => {
                    const updated = prev.map(item => item.id === id ? updatedItem : item);
                    storage.cacheFoodItems(updated);
                    return updated;
                });
                return updatedItem;
            } else {
                // Update cache with optimistic data
                setItems(prev => {
                    storage.cacheFoodItems(prev);
                    return prev;
                });

                // Queue for later sync (skip temp items)
                if (!id.startsWith('temp-')) {
                    await storage.queueOfflineOperation({
                        type: 'UPDATE',
                        data: { itemId: id, updates },
                    });
                    await updatePendingCount();
                }

                return optimisticItem;
            }
        } catch (err) {
            // Revert optimistic update on error
            setItems(prev => prev.map(item => item.id === id ? currentItem : item));
            const message = err instanceof api.ApiClientError
                ? err.message
                : 'Failed to update item. Please try again.';
            setError(message);
            throw err;
        }
    }, [isOnline, items, updatePendingCount]);

    // Clear error state
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Add status to items before returning (sorted by expiration)
    const itemsWithStatus = addStatusToItems(items);

    return {
        items: itemsWithStatus,
        isLoading,
        error,
        isOffline: !isOnline,
        pendingOperations,
        refresh,
        deleteItem,
        addItems,
        updateItem,
        clearError,
        syncOfflineOperations,
    };
}
