import { useState, useCallback, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DatePicker } from '../../components/DatePicker';
import { ExpirationBadge } from '../../components/ExpirationBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { CameraViewComponent } from '../../components/CameraView';
import { useFoodItems } from '../../hooks/useFoodItems';
import { CameraError } from '../../hooks/useCamera';
import { formatDate, calculateDaysUntilExpiration, getTrafficLightStatus } from '../../utils/dateUtils';
import * as api from '../../services/api';

export default function FoodDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { items, isLoading, updateItem, deleteItem } = useFoodItems();

    const [showLabelScanner, setShowLabelScanner] = useState(false);
    const [isProcessingLabel, setIsProcessingLabel] = useState(false);
    const [expirationDate, setExpirationDate] = useState<Date>(new Date());
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Find the current item
    const item = items.find(i => i.id === id);

    // Initialize expiration date when item loads
    useEffect(() => {
        if (item) {
            setExpirationDate(new Date(item.expirationDate));
        }
    }, [item?.expirationDate]);

    // Handle expiration date change
    const handleDateChange = useCallback((date: Date) => {
        setExpirationDate(date);
        setHasChanges(true);
    }, []);

    // Save changes
    const handleSave = useCallback(async () => {
        if (!item || !hasChanges) return;

        setIsSaving(true);
        try {
            await updateItem(item.id, {
                expirationDate: expirationDate.toISOString(),
                isEstimated: false, // Mark as user-set when manually changed
            });
            setHasChanges(false);
            Alert.alert('Saved', 'Expiration date updated successfully.');
        } catch (err) {
            Alert.alert('Error', 'Failed to save changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }, [item, hasChanges, expirationDate, updateItem]);

    // Handle delete
    const handleDelete = useCallback(() => {
        if (!item) return;

        Alert.alert(
            'Delete Item',
            `Are you sure you want to delete "${item.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteItem(item.id);
                            router.back();
                        } catch (err) {
                            Alert.alert('Error', 'Failed to delete item. Please try again.');
                        }
                    },
                },
            ]
        );
    }, [item, deleteItem, router]);

    // Handle label scan
    const handleLabelCapture = useCallback(async (imageUri: string) => {
        setIsProcessingLabel(true);

        try {
            // Convert image URI to base64 for API
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result as string;
                    const base64Data = result.split(',')[1] || result;
                    resolve(base64Data);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            // Call the scan label API
            const scanResult = await api.scanLabel(base64);

            if (!scanResult.expirationDate) {
                Alert.alert(
                    'Date Not Found',
                    'Could not find an expiration date on the label. Please enter it manually.'
                );
                setShowLabelScanner(false);
                return;
            }

            const extractedDate = new Date(scanResult.expirationDate);
            setExpirationDate(extractedDate);
            setHasChanges(true);
            setShowLabelScanner(false);

            Alert.alert(
                'Date Extracted',
                `Expiration date set to ${formatDate(extractedDate)} (${Math.round(scanResult.confidence * 100)}% confidence). Don't forget to save your changes.`
            );
        } catch (err) {
            const message = err instanceof api.ApiClientError
                ? err.message
                : 'Failed to extract date from label. Please try again or enter manually.';
            Alert.alert('Error', message);
        } finally {
            setIsProcessingLabel(false);
        }
    }, []);

    // Handle camera error
    const handleCameraError = useCallback((error: CameraError) => {
        setShowLabelScanner(false);
        Alert.alert('Camera Error', error.message);
    }, []);

    // Loading state
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container} edges={['bottom']}>
                <LoadingSpinner message="Loading item details..." />
            </SafeAreaView>
        );
    }

    // Item not found
    if (!item) {
        return (
            <SafeAreaView style={styles.container} edges={['bottom']}>
                <View style={styles.notFoundContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#9ca3af" />
                    <Text style={styles.notFoundTitle}>Item Not Found</Text>
                    <Text style={styles.notFoundText}>
                        This food item may have been deleted.
                    </Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const daysUntilExpiration = calculateDaysUntilExpiration(expirationDate);
    const status = getTrafficLightStatus(daysUntilExpiration);

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                {/* Item Name */}
                <View style={styles.header}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <ExpirationBadge status={status} daysUntilExpiration={daysUntilExpiration} />
                </View>

                {/* Info Cards */}
                <View style={styles.infoSection}>
                    <View style={styles.infoCard}>
                        <Ionicons name="cart-outline" size={24} color="#3b82f6" />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Purchase Date</Text>
                            <Text style={styles.infoValue}>{formatDate(item.purchaseDate)}</Text>
                        </View>
                    </View>

                    <View style={styles.infoCard}>
                        <Ionicons name="calendar-outline" size={24} color="#3b82f6" />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Added On</Text>
                            <Text style={styles.infoValue}>{formatDate(item.createdAt)}</Text>
                        </View>
                    </View>

                    {item.isEstimated && (
                        <View style={styles.estimatedBanner}>
                            <Ionicons name="information-circle-outline" size={20} color="#854d0e" />
                            <Text style={styles.estimatedText}>
                                Expiration date is an AI estimate. Scan the label or edit manually for accuracy.
                            </Text>
                        </View>
                    )}
                </View>

                {/* Expiration Date Editor */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Expiration Date</Text>
                    <DatePicker
                        value={expirationDate}
                        onChange={handleDateChange}
                        label="Select expiration date"
                    />

                    <TouchableOpacity
                        style={styles.scanLabelButton}
                        onPress={() => setShowLabelScanner(true)}
                    >
                        <Ionicons name="camera-outline" size={20} color="#3b82f6" />
                        <Text style={styles.scanLabelText}>Scan Product Label</Text>
                    </TouchableOpacity>
                </View>

                {/* Save Button */}
                {hasChanges && (
                    <TouchableOpacity
                        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <Text style={styles.saveButtonText}>Saving...</Text>
                        ) : (
                            <>
                                <Ionicons name="checkmark" size={20} color="#ffffff" />
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </ScrollView>

            {/* Delete Button */}
            <View style={styles.bottomActions}>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    <Text style={styles.deleteButtonText}>Delete Item</Text>
                </TouchableOpacity>
            </View>

            {/* Label Scanner Modal */}
            <Modal
                visible={showLabelScanner}
                animationType="slide"
                presentationStyle="fullScreen"
            >
                {isProcessingLabel ? (
                    <SafeAreaView style={styles.processingContainer}>
                        <LoadingSpinner message="Extracting expiration date..." />
                    </SafeAreaView>
                ) : (
                    <CameraViewComponent
                        mode="label"
                        onCapture={handleLabelCapture}
                        onError={handleCameraError}
                        onCancel={() => setShowLabelScanner(false)}
                    />
                )}
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    itemName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1a1a1a',
        flex: 1,
        marginRight: 12,
    },
    infoSection: {
        marginBottom: 24,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    infoContent: {
        marginLeft: 12,
    },
    infoLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    estimatedBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fef9c3',
        borderRadius: 8,
        padding: 12,
        gap: 8,
    },
    estimatedText: {
        flex: 1,
        fontSize: 13,
        color: '#854d0e',
        lineHeight: 18,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 12,
    },
    scanLabelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#eff6ff',
        borderWidth: 1,
        borderColor: '#3b82f6',
        borderRadius: 8,
        paddingVertical: 12,
        gap: 8,
    },
    scanLabelText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#3b82f6',
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        paddingVertical: 14,
        gap: 8,
    },
    saveButtonDisabled: {
        backgroundColor: '#9ca3af',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    bottomActions: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        backgroundColor: '#ffffff',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fecaca',
        borderRadius: 8,
        paddingVertical: 12,
        gap: 8,
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#ef4444',
    },
    notFoundContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    notFoundTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1f2937',
        marginTop: 16,
    },
    notFoundText: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginTop: 8,
    },
    backButton: {
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#3b82f6',
        borderRadius: 8,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    processingContainer: {
        flex: 1,
        backgroundColor: '#000000',
    },
});
