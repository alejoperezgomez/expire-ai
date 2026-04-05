import { useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FoodCardList } from '../../components/FoodCardList';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { OfflineIndicator } from '../../components/OfflineIndicator';
import { useFoodItems } from '../../hooks/useFoodItems';
import { useThemeColors } from '../../context/ThemeContext';

export default function HomeScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const { items, isLoading, error, refresh, deleteItem, isOffline, pendingOperations } = useFoodItems();

    // Navigate to food detail screen
    const handleItemPress = useCallback((id: string) => {
        router.push(`/food/${id}`);
    }, [router]);

    // Handle delete with confirmation
    const handleItemDelete = useCallback((id: string) => {
        const item = items.find(i => i.id === id);
        Alert.alert(
            'Delete Item',
            `Are you sure you want to delete "${item?.name || 'this item'}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteItem(id),
                },
            ]
        );
    }, [items, deleteItem]);

    // Navigate to scan screen
    const handleAddItem = useCallback(() => {
        router.push('/(tabs)/scan');
    }, [router]);

    // Loading state
    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.canvas }]} edges={[]}>
                <LoadingSpinner message="Loading your food items..." />
            </SafeAreaView>
        );
    }

    // Error state
    if (error) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.canvas }]} edges={[]}>
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: colors.statusRedText }]}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.canvas }]} edges={[]}>
            <OfflineIndicator pendingCount={pendingOperations} />
            <FoodCardList
                items={items}
                onItemPress={handleItemPress}
                onItemDelete={handleItemDelete}
                onRefresh={refresh}
                refreshing={isLoading}
                onAddItem={handleAddItem}
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
});
