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
import { expiria } from '../../theme';
import { useThemeColors } from '../../context/ThemeContext';

const CATEGORY_EMOJI: Record<string, string> = {
    'Dairy': '🥛', 'Produce': '🥬', 'Meat': '🍗', 'Seafood': '🐟',
    'Pantry': '🫙', 'Frozen': '❄️', 'Beverage': '🧃', 'Bakery': '🍞',
    'Leftovers': '🍱', 'Condiments': '🥫',
};

const STATUS_HERO_COLOR: Record<string, string> = {
    green: '#4a8840', yellow: '#b07d00', red: '#c85e28', expired: '#c0392b',
};

export default function FoodDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { items, isLoading, updateItem, deleteItem } = useFoodItems();
    const colors = useThemeColors();

    const [showLabelScanner, setShowLabelScanner] = useState(false);
    const [isProcessingLabel, setIsProcessingLabel] = useState(false);
    const [expirationDate, setExpirationDate] = useState<Date>(new Date());
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [confirmed, setConfirmed] = useState<'used' | 'discarded' | null>(null);

    const item = items.find(i => i.id === id);

    useEffect(() => {
        if (item) {
            setExpirationDate(new Date(item.expirationDate));
        }
    }, [item?.expirationDate]);

    const handleDateChange = useCallback((date: Date) => {
        setExpirationDate(date);
        setHasChanges(true);
    }, []);

    const handleSave = useCallback(async () => {
        if (!item || !hasChanges) return;
        setIsSaving(true);
        try {
            await updateItem(item.id, {
                expirationDate: expirationDate.toISOString(),
                isEstimated: false,
            });
            setHasChanges(false);
            Alert.alert('Saved', 'Expiration date updated successfully.');
        } catch {
            Alert.alert('Error', 'Failed to save changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }, [item, hasChanges, expirationDate, updateItem]);

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
                        } catch {
                            Alert.alert('Error', 'Failed to delete item. Please try again.');
                        }
                    },
                },
            ]
        );
    }, [item, deleteItem, router]);

    const handleLabelCapture = useCallback(async (imageUri: string) => {
        setIsProcessingLabel(true);
        try {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result as string;
                    resolve(result.split(',')[1] || result);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            const scanResult = await api.scanLabel(base64);
            if (!scanResult.expirationDate) {
                Alert.alert('Date Not Found', 'Could not find an expiration date on the label. Please enter it manually.');
                setShowLabelScanner(false);
                return;
            }
            const extractedDate = new Date(scanResult.expirationDate);
            setExpirationDate(extractedDate);
            setHasChanges(true);
            setShowLabelScanner(false);
            Alert.alert('Date Extracted', `Expiration date set to ${formatDate(extractedDate)} (${Math.round(scanResult.confidence * 100)}% confidence). Don't forget to save.`);
        } catch (err) {
            const message = err instanceof api.ApiClientError ? err.message : 'Failed to extract date from label.';
            Alert.alert('Error', message);
        } finally {
            setIsProcessingLabel(false);
        }
    }, []);

    const handleCameraError = useCallback((error: CameraError) => {
        setShowLabelScanner(false);
        Alert.alert('Camera Error', error.message);
    }, []);

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.canvas }]} edges={['bottom']}>
                <LoadingSpinner message="Loading item details..." />
            </SafeAreaView>
        );
    }

    if (!item) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.canvas }]} edges={['bottom']}>
                <View style={styles.notFoundContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={colors.textMuted} />
                    <Text style={[styles.notFoundTitle, { color: colors.text }]}>Item Not Found</Text>
                    <Text style={[styles.notFoundText, { color: colors.textMuted }]}>This food item may have been deleted.</Text>
                    <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primaryInk }]} onPress={() => router.back()}>
                        <Text style={styles.primaryBtnText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const daysUntilExpiration = calculateDaysUntilExpiration(expirationDate);
    const status = getTrafficLightStatus(daysUntilExpiration);
    const isExpired = daysUntilExpiration < 0;
    const heroKey = isExpired ? 'expired' : status;
    const heroColor = STATUS_HERO_COLOR[heroKey] ?? '#4a8840';
    const emoji = item.category ? (CATEGORY_EMOJI[item.category] ?? '🍽️') : '🍽️';

    // Confirmation success screens
    if (confirmed === 'used') {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.canvas }]} edges={['bottom']}>
                <View style={styles.confirmCenter}>
                    <View style={[styles.confirmIcon, { backgroundColor: colors.statusGreenBg, borderColor: colors.statusGreenBorder }]}>
                        <Ionicons name="checkmark" size={36} color={colors.primaryInk} />
                    </View>
                    <Text style={[styles.confirmTitle, { color: colors.text }]}>Nice work!</Text>
                    <Text style={[styles.confirmMsg, { color: colors.textMuted }]}>
                        You used {item.name} before it expired. That's one less item wasted.
                    </Text>
                    <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primaryInk, marginTop: 8 }]} onPress={() => router.back()}>
                        <Text style={styles.primaryBtnText}>Back to fridge</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (confirmed === 'discarded') {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.canvas }]} edges={['bottom']}>
                <View style={styles.confirmCenter}>
                    <View style={[styles.confirmIcon, { backgroundColor: colors.statusExpiredBg, borderColor: colors.statusExpiredBorder }]}>
                        <Ionicons name="trash" size={30} color={colors.statusExpiredText} />
                    </View>
                    <Text style={[styles.confirmTitle, { color: colors.text }]}>Item removed</Text>
                    <Text style={[styles.confirmMsg, { color: colors.textMuted }]}>
                        {item.name} has been removed from your fridge. Try to use it sooner next time.
                    </Text>
                    <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primaryInk, marginTop: 8 }]} onPress={() => router.back()}>
                        <Text style={styles.primaryBtnText}>Back to fridge</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.canvas }]} edges={['bottom']}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

                {/* Hero section */}
                <View style={[styles.hero, { backgroundColor: `${heroColor}14`, borderBottomColor: `${heroColor}22` }]}>
                    <Text style={styles.heroEmoji}>{emoji}</Text>
                    <Text style={[styles.heroName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.heroMeta, { color: colors.textMuted }]}>
                        {[item.category, item.location, item.quantity].filter(Boolean).join(' · ')}
                    </Text>
                    {/* Countdown chip */}
                    <View style={[styles.countdownChip, { backgroundColor: `${heroColor}18` }]}>
                        <Text style={[styles.countdownText, { color: heroColor }]}>
                            {isExpired
                                ? `Expired · –${Math.abs(daysUntilExpiration)}d`
                                : daysUntilExpiration === 0
                                ? 'Expires today'
                                : `${daysUntilExpiration} days left`}
                        </Text>
                    </View>
                </View>

                {/* Detail rows */}
                <View style={[styles.detailSection, { borderTopColor: colors.border }]}>
                    {[
                        { label: 'Expiry date', value: formatDate(expirationDate), mono: true },
                        { label: 'Purchased', value: formatDate(item.purchaseDate) },
                        { label: 'Storage', value: item.location || '—' },
                        { label: 'Quantity', value: item.quantity || '—' },
                        { label: 'Category', value: item.category || '—' },
                    ].map(row => (
                        <View key={row.label} style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{row.label}</Text>
                            <Text style={[
                                styles.detailValue,
                                { color: colors.text },
                                row.mono && { fontVariant: ['tabular-nums'] },
                            ]}>{row.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Edit expiry date */}
                <View style={[styles.section, { borderTopColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Update Expiry Date</Text>
                    <DatePicker value={expirationDate} onChange={handleDateChange} label="Select expiration date" />
                    <TouchableOpacity
                        style={[styles.outlineBtn, { borderColor: colors.primaryInk }]}
                        onPress={() => setShowLabelScanner(true)}
                    >
                        <Ionicons name="camera-outline" size={18} color={colors.primaryInk} />
                        <Text style={[styles.outlineBtnText, { color: colors.primaryInk }]}>Scan Product Label</Text>
                    </TouchableOpacity>
                    {hasChanges && (
                        <TouchableOpacity
                            style={[styles.primaryBtn, { backgroundColor: isSaving ? colors.textMuted : colors.primaryInk, marginTop: 10 }]}
                            onPress={handleSave}
                            disabled={isSaving}
                        >
                            <Ionicons name="checkmark" size={18} color="#fff" />
                            <Text style={styles.primaryBtnText}>{isSaving ? 'Saving…' : 'Save Changes'}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Quick-action buttons */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.primaryBtn, { backgroundColor: colors.primaryInk }]}
                        onPress={() => setConfirmed('used')}
                    >
                        <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                        <Text style={styles.primaryBtnText}>Mark as used</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.dangerBtn, { backgroundColor: colors.statusExpiredBg, borderColor: colors.statusExpiredBorder }]}
                        onPress={() => setConfirmed('discarded')}
                    >
                        <Ionicons name="trash-outline" size={18} color={colors.statusExpiredText} />
                        <Text style={[styles.dangerBtnText, { color: colors.statusExpiredText }]}>Discard item</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Bottom delete bar */}
            <View style={[styles.bottomBar, { borderTopColor: colors.border, backgroundColor: colors.primarySurface }]}>
                <TouchableOpacity
                    style={[styles.deleteBtn, { backgroundColor: colors.statusExpiredBg, borderColor: colors.statusExpiredBorder }]}
                    onPress={handleDelete}
                >
                    <Ionicons name="trash-outline" size={18} color={colors.statusExpiredText} />
                    <Text style={[styles.deleteBtnText, { color: colors.statusExpiredText }]}>Delete Item</Text>
                </TouchableOpacity>
            </View>

            {/* Label scanner modal */}
            <Modal visible={showLabelScanner} animationType="slide" presentationStyle="fullScreen">
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
    container: { flex: 1 },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 24 },

    // Hero
    hero: {
        alignItems: 'center',
        paddingVertical: 28,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        gap: 8,
    },
    heroEmoji: { fontSize: 52 },
    heroName: {
        fontSize: 26,
        fontWeight: '600',
        textAlign: 'center',
    },
    heroMeta: { fontSize: 12, textAlign: 'center' },
    countdownChip: {
        borderRadius: expiria.borderRadius.sm,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginTop: 4,
    },
    countdownText: { fontSize: 14, fontWeight: '500' },

    // Detail rows
    detailSection: { borderTopWidth: 1, marginTop: 8, paddingHorizontal: 20 },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 13,
        borderBottomWidth: 1,
    },
    detailLabel: { fontSize: 13 },
    detailValue: { fontSize: 14, fontWeight: '500' },

    // Sections
    section: {
        marginTop: 8,
        borderTopWidth: 1,
        padding: 20,
        gap: 12,
    },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },

    // Actions
    actions: { paddingHorizontal: 20, paddingTop: 12, gap: 10 },

    // Buttons
    primaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: expiria.borderRadius.md,
    },
    primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
    outlineBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: expiria.borderRadius.sm,
        borderWidth: 1,
    },
    outlineBtnText: { fontSize: 14, fontWeight: '500' },
    dangerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: expiria.borderRadius.md,
        borderWidth: 1,
    },
    dangerBtnText: { fontSize: 15, fontWeight: '600' },

    // Bottom bar
    bottomBar: { padding: expiria.spacing.md, borderTopWidth: 1 },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: expiria.borderRadius.sm,
        borderWidth: 1,
    },
    deleteBtnText: { fontSize: 14, fontWeight: '500' },

    // Not found / confirmation
    notFoundContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    notFoundTitle: { fontSize: 20, fontWeight: '600', marginTop: 16 },
    notFoundText: { fontSize: 14, textAlign: 'center', marginTop: 8 },
    confirmCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 16 },
    confirmIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmTitle: { fontSize: 22, fontWeight: '600' },
    confirmMsg: { fontSize: 14, textAlign: 'center', lineHeight: 22 },

    // Label scanner
    processingContainer: { flex: 1, backgroundColor: '#000' },
});
