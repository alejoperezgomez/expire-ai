import { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import { CameraViewComponent } from '../../components/CameraView';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useFoodItems } from '../../hooks/useFoodItems';
import { ExtractedFoodItem } from '../../types';
import { CameraError } from '../../hooks/useCamera';
import { addDays, toISODateString } from '../../utils/dateUtils';
import * as api from '../../services/api';

type ScanState = 'camera' | 'processing' | 'confirm' | 'error';

interface EditableItem extends ExtractedFoodItem {
    id: string;
    selected: boolean;
}

export default function ScanScreen() {
    const router = useRouter();
    const { addItems } = useFoodItems();

    const [scanState, setScanState] = useState<ScanState>('camera');
    const [extractedItems, setExtractedItems] = useState<EditableItem[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>('');

    // Handle image capture
    const handleCapture = useCallback(async (imageUri: string) => {
        console.log('[SCAN] Image captured:', imageUri);
        setScanState('processing');

        try {
            // Convert image URI to base64 for API using expo-file-system
            console.log('[SCAN] Converting image to base64...');
            const base64 = await FileSystem.readAsStringAsync(imageUri, {
                encoding: 'base64',
            });
            console.log('[SCAN] Base64 length:', base64.length);

            // Call the scan API
            console.log('[SCAN] Calling scan API...');
            const scanResult = await api.scanReceipt(base64);
            console.log('[SCAN] Scan result:', scanResult);

            if (scanResult.items.length === 0) {
                setErrorMessage('No food items found in the receipt. Please try again with a clearer image.');
                setScanState('error');
                return;
            }

            // Convert to editable items
            const editableItems: EditableItem[] = scanResult.items.map((item, index) => ({
                ...item,
                id: `item-${Date.now()}-${index}`,
                selected: true,
            }));

            setExtractedItems(editableItems);
            setScanState('confirm');
        } catch (err) {
            console.error('Scan error:', err);
            const message = err instanceof api.ApiClientError
                ? err.message
                : err instanceof Error
                    ? err.message
                    : 'Failed to process the receipt. Please try again.';
            setErrorMessage(message);
            setScanState('error');
        }
    }, []);

    // Handle camera error
    const handleCameraError = useCallback((error: CameraError) => {
        setErrorMessage(error.message);
        setScanState('error');
    }, []);

    // Toggle item selection
    const toggleItemSelection = useCallback((id: string) => {
        setExtractedItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, selected: !item.selected } : item
            )
        );
    }, []);

    // Update item name
    const updateItemName = useCallback((id: string, name: string) => {
        setExtractedItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, name } : item
            )
        );
    }, []);

    // Remove item
    const removeItem = useCallback((id: string) => {
        setExtractedItems(prev => prev.filter(item => item.id !== id));
    }, []);

    // Save confirmed items
    const handleSaveItems = useCallback(async () => {
        const selectedItems = extractedItems.filter(item => item.selected);

        if (selectedItems.length === 0) {
            Alert.alert('No Items Selected', 'Please select at least one item to save.');
            return;
        }

        try {
            const today = new Date();
            const itemsToSave = selectedItems.map(item => ({
                name: item.name,
                purchaseDate: toISODateString(today),
                expirationDate: toISODateString(addDays(today, item.estimatedExpirationDays)),
                isEstimated: true,
            }));

            await addItems(itemsToSave);

            Alert.alert(
                'Items Saved',
                `${selectedItems.length} item(s) added to your food tracker.`,
                [{ text: 'OK', onPress: () => router.push('/(tabs)/') }]
            );

            // Reset state
            setExtractedItems([]);
            setScanState('camera');
        } catch (err) {
            Alert.alert('Error', 'Failed to save items. Please try again.');
        }
    }, [extractedItems, addItems, router]);

    // Retry scanning
    const handleRetry = useCallback(() => {
        setErrorMessage('');
        setExtractedItems([]);
        setScanState('camera');
    }, []);

    // Render camera view
    if (scanState === 'camera') {
        return (
            <CameraViewComponent
                mode="receipt"
                onCapture={handleCapture}
                onError={handleCameraError}
            />
        );
    }

    // Render processing state
    if (scanState === 'processing') {
        return (
            <SafeAreaView style={styles.container} edges={['bottom']}>
                <LoadingSpinner message="Processing receipt..." />
                <Text style={styles.processingSubtext}>
                    Our AI is extracting food items from your receipt
                </Text>
            </SafeAreaView>
        );
    }

    // Render error state
    if (scanState === 'error') {
        return (
            <SafeAreaView style={styles.container} edges={['bottom']}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
                    <Text style={styles.errorTitle}>Scan Failed</Text>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                        <Ionicons name="refresh" size={20} color="#ffffff" />
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Render confirmation view
    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView style={styles.confirmContainer}>
                <Text style={styles.confirmTitle}>Confirm Items</Text>
                <Text style={styles.confirmSubtitle}>
                    Review and edit the extracted items before saving
                </Text>

                {extractedItems.map(item => (
                    <View key={item.id} style={styles.itemCard}>
                        <TouchableOpacity
                            style={styles.checkbox}
                            onPress={() => toggleItemSelection(item.id)}
                        >
                            <Ionicons
                                name={item.selected ? 'checkbox' : 'square-outline'}
                                size={24}
                                color={item.selected ? '#3b82f6' : '#9ca3af'}
                            />
                        </TouchableOpacity>

                        <View style={styles.itemContent}>
                            <TextInput
                                style={styles.itemNameInput}
                                value={item.name}
                                onChangeText={(text) => updateItemName(item.id, text)}
                                placeholder="Item name"
                            />
                            <Text style={styles.itemExpiry}>
                                Expires in ~{item.estimatedExpirationDays} days
                            </Text>
                            <View style={styles.confidenceBadge}>
                                <Text style={styles.confidenceText}>
                                    {Math.round(item.confidence * 100)}% confidence
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => removeItem(item.id)}
                        >
                            <Ionicons name="close-circle" size={24} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                ))}

                {extractedItems.length === 0 && (
                    <View style={styles.emptyItems}>
                        <Text style={styles.emptyItemsText}>No items to confirm</Text>
                        <TouchableOpacity style={styles.scanAgainButton} onPress={handleRetry}>
                            <Text style={styles.scanAgainText}>Scan Again</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            <View style={styles.bottomActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleRetry}>
                    <Text style={styles.cancelButtonText}>Scan Again</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        extractedItems.filter(i => i.selected).length === 0 && styles.saveButtonDisabled,
                    ]}
                    onPress={handleSaveItems}
                    disabled={extractedItems.filter(i => i.selected).length === 0}
                >
                    <Ionicons name="checkmark" size={20} color="#ffffff" />
                    <Text style={styles.saveButtonText}>
                        Save ({extractedItems.filter(i => i.selected).length})
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    processingSubtext: {
        textAlign: 'center',
        color: '#6b7280',
        fontSize: 14,
        marginTop: -60,
        paddingHorizontal: 20,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1f2937',
        marginTop: 16,
    },
    errorText: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3b82f6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 24,
        gap: 8,
    },
    retryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    confirmContainer: {
        flex: 1,
        padding: 16,
    },
    confirmTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    confirmSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 20,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    checkbox: {
        marginRight: 12,
    },
    itemContent: {
        flex: 1,
    },
    itemNameInput: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        padding: 0,
        marginBottom: 4,
    },
    itemExpiry: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 4,
    },
    confidenceBadge: {
        backgroundColor: '#e5e7eb',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    confidenceText: {
        fontSize: 11,
        color: '#6b7280',
    },
    removeButton: {
        padding: 4,
    },
    emptyItems: {
        alignItems: 'center',
        padding: 32,
    },
    emptyItemsText: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 16,
    },
    scanAgainButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#e5e7eb',
        borderRadius: 8,
    },
    scanAgainText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    bottomActions: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        backgroundColor: '#ffffff',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: '#e5e7eb',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    saveButton: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: '#3b82f6',
        alignItems: 'center',
        justifyContent: 'center',
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
});
