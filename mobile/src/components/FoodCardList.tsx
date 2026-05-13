import React, { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, RefreshControl, View } from 'react-native';
import { FoodItemWithStatus } from '../types';
import { FoodCard } from './FoodCard';
import { EmptyState } from './EmptyState';
import { expiria } from '../theme';
import { useThemeColors } from '../context/ThemeContext';

interface FoodCardListProps {
    items: FoodItemWithStatus[];
    onItemPress: (id: string) => void;
    onItemDelete: (id: string) => void;
    onRefresh?: () => void;
    refreshing?: boolean;
    onAddItem?: () => void;
    viewMode?: 'list' | 'grid';
}

export function FoodCardList({
    items,
    onItemPress,
    onItemDelete,
    onRefresh,
    refreshing = false,
    onAddItem,
    viewMode = 'list',
}: FoodCardListProps) {
    const colors = useThemeColors();

    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            const dateA = new Date(a.expirationDate).getTime();
            const dateB = new Date(b.expirationDate).getTime();
            return dateA - dateB;
        });
    }, [items]);

    const renderItem = useCallback(
        ({ item }: { item: FoodItemWithStatus }) => (
            <FoodCard
                id={item.id}
                name={item.name}
                purchaseDate={item.purchaseDate}
                expirationDate={item.expirationDate}
                status={item.status}
                daysUntilExpiration={item.daysUntilExpiration}
                isEstimated={item.isEstimated}
                category={item.category}
                location={item.location}
                quantity={item.quantity}
                variant={viewMode}
                onPress={() => onItemPress(item.id)}
                onDelete={() => onItemDelete(item.id)}
            />
        ),
        [onItemPress, onItemDelete, viewMode]
    );

    const keyExtractor = useCallback((item: FoodItemWithStatus) => item.id, []);

    const renderEmptyState = useCallback(
        () => (
            <EmptyState
                icon="basket-outline"
                illustration={require('../../assets/empty-fridge.png')}
                title="No Food Items"
                message="Start tracking your food by scanning a receipt or adding items manually."
                actionLabel={onAddItem ? 'Add Item' : undefined}
                onAction={onAddItem}
            />
        ),
        [onAddItem]
    );

    const isGrid = viewMode === 'grid';

    return (
        <FlatList
            key={viewMode} // remount when switching layout to reset column count
            data={sortedItems}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            numColumns={isGrid ? 2 : 1}
            columnWrapperStyle={isGrid ? styles.gridRow : undefined}
            contentContainerStyle={[
                isGrid ? styles.gridContent : styles.listContent,
                sortedItems.length === 0 && styles.emptyContent,
            ]}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
                onRefresh ? (
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primaryInk}
                        colors={[colors.primaryInk]}
                    />
                ) : undefined
            }
            showsVerticalScrollIndicator={false}
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingHorizontal: expiria.spacing.md,
        paddingBottom: expiria.spacing.lg,
        gap: expiria.spacing.sm,
    },
    gridContent: {
        paddingHorizontal: expiria.spacing.md,
        paddingBottom: expiria.spacing.lg,
    },
    gridRow: {
        gap: 10,
        marginBottom: 10,
    },
    emptyContent: {
        flexGrow: 1,
    },
});
