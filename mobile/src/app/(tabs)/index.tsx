import { useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FoodCardList } from '../../components/FoodCardList';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { OfflineIndicator } from '../../components/OfflineIndicator';
import { useFoodItems } from '../../hooks/useFoodItems';
import { useThemeColors } from '../../context/ThemeContext';
import { FoodItemWithStatus } from '../../types';
import { expiria } from '../../theme';

type FilterKey = 'all' | 'soon' | 'expired';

const FILTERS: { id: FilterKey; label: string }[] = [
    { id: 'all', label: 'All items' },
    { id: 'soon', label: 'Expiring soon' },
    { id: 'expired', label: 'Expired' },
];

function filterItems(items: FoodItemWithStatus[], key: FilterKey): FoodItemWithStatus[] {
    switch (key) {
        case 'soon':
            return items.filter(i => i.daysUntilExpiration >= 0 && i.daysUntilExpiration <= 6);
        case 'expired':
            return items.filter(i => i.daysUntilExpiration < 0);
        default:
            return items;
    }
}

export default function HomeScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const { items, isLoading, error, refresh, deleteItem, isOffline, pendingOperations } = useFoodItems();

    const [filter, setFilter] = useState<FilterKey>('all');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    const urgentItems = useMemo(
        () => items.filter(i => i.daysUntilExpiration <= 2),
        [items]
    );
    const soonCount = useMemo(
        () => items.filter(i => i.daysUntilExpiration >= 0 && i.daysUntilExpiration <= 6).length,
        [items]
    );
    const expiredCount = useMemo(
        () => items.filter(i => i.daysUntilExpiration < 0).length,
        [items]
    );
    const filteredItems = useMemo(() => filterItems(items, filter), [items, filter]);

    const handleItemPress = useCallback((id: string) => {
        router.push(`/food/${id}`);
    }, [router]);

    const handleItemDelete = useCallback((id: string) => {
        const item = items.find(i => i.id === id);
        Alert.alert(
            'Delete Item',
            `Are you sure you want to delete "${item?.name || 'this item'}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteItem(id) },
            ]
        );
    }, [items, deleteItem]);

    const handleAddItem = useCallback(() => {
        router.push('/(tabs)/scan');
    }, [router]);

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.canvas }]} edges={[]}>
                <LoadingSpinner message="Loading your food items..." />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.canvas }]} edges={[]}>
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: colors.statusExpiredText }]}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.canvas }]} edges={[]}>
            <OfflineIndicator pendingCount={pendingOperations} />

            {/* Urgency banner */}
            {urgentItems.length > 0 && (
                <View style={[styles.urgencyBanner, { backgroundColor: colors.statusRedBg, borderColor: colors.statusRedBorder }]}>
                    <View style={[styles.urgencyIcon, { backgroundColor: colors.accent }]}>
                        <Ionicons name="alert" size={18} color="#fff" />
                    </View>
                    <View style={styles.urgencyText}>
                        <Text style={[styles.urgencyTitle, { color: colors.statusRedText }]}>
                            {urgentItems.length} item{urgentItems.length > 1 ? 's' : ''} need attention
                        </Text>
                        <Text style={[styles.urgencyNames, { color: colors.accent }]} numberOfLines={1}>
                            {urgentItems.map(i => i.name).join(', ')}
                        </Text>
                    </View>
                </View>
            )}

            {/* Stats row */}
            {items.length > 0 && (
                <View style={[styles.statsRow, { borderBottomColor: colors.border }]}>
                    <View style={[styles.statCard, { backgroundColor: colors.primarySurface, borderColor: colors.border }]}>
                        <Text style={[styles.statValue, { color: colors.text }]}>{items.length}</Text>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total items</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.statusRedBg, borderColor: colors.statusRedBorder }]}>
                        <Text style={[styles.statValue, { color: colors.accent }]}>{soonCount}</Text>
                        <Text style={[styles.statLabel, { color: colors.accent }]}>Expiring soon</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.statusExpiredBg, borderColor: colors.statusExpiredBorder }]}>
                        <Text style={[styles.statValue, { color: colors.statusExpiredText }]}>{expiredCount}</Text>
                        <Text style={[styles.statLabel, { color: colors.statusExpiredText }]}>Expired</Text>
                    </View>
                </View>
            )}

            {/* Filter tabs + view toggle */}
            <View style={[styles.filterBar, { borderBottomColor: colors.border }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterScrollContent}>
                    {FILTERS.map(f => {
                        const active = filter === f.id;
                        return (
                            <TouchableOpacity
                                key={f.id}
                                onPress={() => setFilter(f.id)}
                                style={[
                                    styles.filterChip,
                                    active
                                        ? { backgroundColor: colors.statusGreenBg, borderColor: colors.statusGreenBorder }
                                        : { backgroundColor: colors.primarySurface, borderColor: colors.border },
                                ]}
                            >
                                <Text style={[
                                    styles.filterChipText,
                                    { color: active ? colors.statusGreenText : colors.textMuted },
                                    active && { fontWeight: '600' },
                                ]}>
                                    {f.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Grid / List toggle */}
                <View style={styles.viewToggle}>
                    {(['list', 'grid'] as const).map(m => (
                        <TouchableOpacity
                            key={m}
                            onPress={() => setViewMode(m)}
                            style={[
                                styles.toggleBtn,
                                viewMode === m
                                    ? { backgroundColor: colors.statusGreenBg, borderColor: colors.statusGreenBorder }
                                    : { backgroundColor: colors.primarySurface, borderColor: colors.border },
                            ]}
                        >
                            <Ionicons
                                name={m === 'list' ? 'list-outline' : 'grid-outline'}
                                size={16}
                                color={viewMode === m ? colors.primaryInk : colors.textMuted}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Items list / grid */}
            <FoodCardList
                items={filteredItems}
                onItemPress={handleItemPress}
                onItemDelete={handleItemDelete}
                onRefresh={refresh}
                refreshing={isLoading}
                onAddItem={handleAddItem}
                viewMode={viewMode}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
    },
    urgencyBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        margin: 16,
        marginBottom: 0,
        borderRadius: expiria.borderRadius.md,
        borderWidth: 1,
        padding: 14,
    },
    urgencyIcon: {
        width: 36,
        height: 36,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    urgencyText: {
        flex: 1,
    },
    urgencyTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    urgencyNames: {
        fontSize: 12,
        marginTop: 1,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 10,
        padding: 16,
        paddingBottom: 14,
    },
    statCard: {
        flex: 1,
        borderRadius: expiria.borderRadius.md,
        borderWidth: 1,
        padding: 10,
        ...expiria.shadows.soft,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '500',
        lineHeight: 26,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '500',
        marginTop: 3,
    },
    filterBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 16,
        paddingBottom: 12,
        paddingTop: 4,
        borderBottomWidth: 1,
    },
    filterScroll: {
        flex: 1,
    },
    filterScrollContent: {
        paddingLeft: 16,
        gap: 8,
        paddingRight: 8,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: expiria.borderRadius.sm,
        borderWidth: 1,
    },
    filterChipText: {
        fontSize: 12,
        fontWeight: '500',
    },
    viewToggle: {
        flexDirection: 'row',
        gap: 4,
    },
    toggleBtn: {
        width: 32,
        height: 32,
        borderRadius: expiria.borderRadius.sm,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
