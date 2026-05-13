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
import { expiria } from '../../theme';
import { useThemeColors } from '../../context/ThemeContext';

type ScanMode = 'manual' | 'scan';
type ScanState = 'camera' | 'processing' | 'confirm' | 'error';

interface EditableItem extends ExtractedFoodItem {
    id: string;
    selected: boolean;
}

const CATEGORIES = ['Dairy', 'Produce', 'Meat', 'Seafood', 'Bakery', 'Pantry', 'Beverage', 'Leftovers', 'Frozen', 'Condiments'];
const LOCATIONS = ['Fridge', 'Freezer', 'Pantry', 'Counter'];

export default function ScanScreen() {
    const router = useRouter();
    const { addItems } = useFoodItems();
    const colors = useThemeColors();

    const [mode, setMode] = useState<ScanMode>('manual');
    const [scanState, setScanState] = useState<ScanState>('camera');
    const [extractedItems, setExtractedItems] = useState<EditableItem[]>([]);
    const [errorMessage, setErrorMessage] = useState('');

    // Manual entry form state
    const [form, setForm] = useState({
        name: '', category: 'Dairy', location: 'Fridge', quantity: '', expiryDate: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const updateForm = (key: keyof typeof form, val: string) =>
        setForm(f => ({ ...f, [key]: val }));

    // ── Manual entry submit ──────────────────────────────────────────
    const handleManualSubmit = useCallback(async () => {
        if (!form.name.trim()) return;
        try {
            const today = new Date();
            // Parse expiryDate if provided, otherwise default 7 days
            let expirationDate = toISODateString(addDays(today, 7));
            if (form.expiryDate.trim()) {
                const parsed = new Date(form.expiryDate.trim());
                if (!isNaN(parsed.getTime())) {
                    expirationDate = toISODateString(parsed);
                }
            }
            await addItems([{
                name: form.name.trim(),
                purchaseDate: toISODateString(today),
                expirationDate,
                isEstimated: !form.expiryDate.trim(),
                category: form.category,
                location: form.location,
                quantity: form.quantity.trim() || undefined,
            }]);
            setSubmitted(true);
        } catch {
            Alert.alert('Error', 'Failed to add item. Please try again.');
        }
    }, [form, addItems]);

    const resetManual = () => {
        setForm({ name: '', category: 'Dairy', location: 'Fridge', quantity: '', expiryDate: '' });
        setSubmitted(false);
    };

    // ── Receipt scan handlers ────────────────────────────────────────
    const handleCapture = useCallback(async (imageUri: string) => {
        setScanState('processing');
        try {
            const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' });
            const scanResult = await api.scanReceipt(base64);
            if (scanResult.items.length === 0) {
                setErrorMessage('No food items found in the receipt. Please try again with a clearer image.');
                setScanState('error');
                return;
            }
            setExtractedItems(scanResult.items.map((item, index) => ({
                ...item,
                id: `item-${Date.now()}-${index}`,
                selected: true,
            })));
            setScanState('confirm');
        } catch (err) {
            const message = err instanceof api.ApiClientError ? err.message
                : err instanceof Error ? err.message
                : 'Failed to process the receipt. Please try again.';
            setErrorMessage(message);
            setScanState('error');
        }
    }, []);

    const handleCameraError = useCallback((error: CameraError) => {
        setErrorMessage(error.message);
        setScanState('error');
    }, []);

    const toggleItem = (id: string) =>
        setExtractedItems(prev => prev.map(i => i.id === id ? { ...i, selected: !i.selected } : i));
    const updateItemName = (id: string, name: string) =>
        setExtractedItems(prev => prev.map(i => i.id === id ? { ...i, name } : i));
    const removeItem = (id: string) =>
        setExtractedItems(prev => prev.filter(i => i.id !== id));

    const handleSaveItems = useCallback(async () => {
        const selected = extractedItems.filter(i => i.selected);
        if (!selected.length) {
            Alert.alert('No Items Selected', 'Please select at least one item to save.');
            return;
        }
        try {
            const today = new Date();
            await addItems(selected.map(item => ({
                name: item.name,
                purchaseDate: toISODateString(today),
                expirationDate: toISODateString(addDays(today, item.estimatedExpirationDays)),
                isEstimated: true,
            })));
            Alert.alert('Items Saved', `${selected.length} item(s) added to your food tracker.`, [
                { text: 'OK', onPress: () => router.push('/(tabs)/') },
            ]);
            setExtractedItems([]);
            setScanState('camera');
        } catch {
            Alert.alert('Error', 'Failed to save items. Please try again.');
        }
    }, [extractedItems, addItems, router]);

    const handleRetry = useCallback(() => {
        setErrorMessage('');
        setExtractedItems([]);
        setScanState('camera');
    }, []);

    // ── Shared styles ────────────────────────────────────────────────
    const inputStyle = {
        fontSize: 14,
        color: colors.text,
        backgroundColor: colors.primarySurface,
        borderColor: colors.border,
        borderWidth: 1.5,
        borderRadius: expiria.borderRadius.sm,
        paddingHorizontal: 12,
        paddingVertical: 10,
    } as const;

    // ── Manual entry success screen ──────────────────────────────────
    if (mode === 'manual' && submitted) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.canvas }]} edges={['bottom']}>
                <View style={styles.center}>
                    <View style={[styles.successIcon, { backgroundColor: colors.statusGreenBg, borderColor: colors.statusGreenBorder }]}>
                        <Ionicons name="leaf-outline" size={36} color={colors.primaryInk} />
                    </View>
                    <Text style={[styles.successTitle, { color: colors.text }]}>Item added!</Text>
                    <Text style={[styles.successMsg, { color: colors.textMuted }]}>
                        {form.name || 'Your item'} has been added to your {form.location.toLowerCase()}.
                    </Text>
                    <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primaryInk, marginTop: 8 }]} onPress={resetManual}>
                        <Text style={styles.primaryBtnText}>Add another item</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/')}>
                        <Text style={[styles.ghostBtnText, { color: colors.textMuted }]}>Back to fridge</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ── Scan: camera view ────────────────────────────────────────────
    if (mode === 'scan' && scanState === 'camera') {
        return (
            <View style={styles.container}>
                {/* Mode toggle overlay */}
                <View style={styles.modeToggleOverlay}>
                    <ModeToggle mode={mode} onSwitch={setMode} colors={colors} />
                </View>
                <CameraViewComponent mode="receipt" onCapture={handleCapture} onError={handleCameraError} />
            </View>
        );
    }

    if (mode === 'scan' && scanState === 'processing') {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.canvas }]} edges={['bottom']}>
                <LoadingSpinner message="Processing receipt…" />
                <Text style={[styles.processingNote, { color: colors.textMuted }]}>
                    AI is extracting food items from your receipt
                </Text>
            </SafeAreaView>
        );
    }

    if (mode === 'scan' && scanState === 'error') {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.canvas }]} edges={['bottom']}>
                <View style={styles.center}>
                    <Ionicons name="alert-circle-outline" size={64} color={colors.statusExpiredText} />
                    <Text style={[styles.successTitle, { color: colors.text }]}>Scan Failed</Text>
                    <Text style={[styles.successMsg, { color: colors.textMuted }]}>{errorMessage}</Text>
                    <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primaryInk }]} onPress={handleRetry}>
                        <Ionicons name="refresh" size={18} color="#fff" />
                        <Text style={styles.primaryBtnText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (mode === 'scan' && scanState === 'confirm') {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.canvas }]} edges={['bottom']}>
                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                    <Text style={[styles.confirmTitle, { color: colors.text }]}>Confirm Items</Text>
                    <Text style={[styles.confirmSub, { color: colors.textMuted }]}>
                        Review and edit the extracted items before saving
                    </Text>
                    {extractedItems.map(item => (
                        <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.secondarySurface, borderColor: colors.border }]}>
                            <TouchableOpacity onPress={() => toggleItem(item.id)} style={styles.checkbox}>
                                <Ionicons
                                    name={item.selected ? 'checkbox' : 'square-outline'}
                                    size={24}
                                    color={item.selected ? colors.primaryInk : colors.textMuted}
                                />
                            </TouchableOpacity>
                            <View style={styles.itemContent}>
                                <TextInput
                                    style={[styles.itemNameInput, { color: colors.text }]}
                                    value={item.name}
                                    onChangeText={text => updateItemName(item.id, text)}
                                    placeholder="Item name"
                                    placeholderTextColor={colors.textMuted}
                                />
                                <Text style={[styles.itemExpiry, { color: colors.textMuted }]}>
                                    Expires in ~{item.estimatedExpirationDays} days
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeBtn}>
                                <Ionicons name="close-circle" size={22} color={colors.statusExpiredText} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
                <View style={[styles.bottomBar, { borderTopColor: colors.border, backgroundColor: colors.primarySurface }]}>
                    <TouchableOpacity style={[styles.outlineBtn, { borderColor: colors.border }]} onPress={handleRetry}>
                        <Text style={[styles.outlineBtnText, { color: colors.text }]}>Scan Again</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.primaryBtn,
                            { backgroundColor: extractedItems.filter(i => i.selected).length ? colors.primaryInk : colors.textMuted, flex: 1 },
                        ]}
                        onPress={handleSaveItems}
                        disabled={!extractedItems.filter(i => i.selected).length}
                    >
                        <Ionicons name="checkmark" size={18} color="#fff" />
                        <Text style={styles.primaryBtnText}>
                            Save ({extractedItems.filter(i => i.selected).length})
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ── Manual entry form ────────────────────────────────────────────
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.canvas }]} edges={['bottom']}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                {/* Mode toggle */}
                <ModeToggle mode={mode} onSwitch={setMode} colors={colors} />

                {/* Form */}
                <View style={styles.formSection}>
                    {/* Name */}
                    <View style={styles.field}>
                        <Text style={[styles.fieldLabel, { color: colors.text }]}>Item name</Text>
                        <TextInput
                            style={[inputStyle, styles.textInput]}
                            placeholder="e.g. Whole milk"
                            placeholderTextColor={colors.textMuted}
                            value={form.name}
                            onChangeText={v => updateForm('name', v)}
                        />
                    </View>

                    {/* Category */}
                    <View style={styles.field}>
                        <Text style={[styles.fieldLabel, { color: colors.text }]}>Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScrollContent}>
                            {CATEGORIES.map(c => (
                                <TouchableOpacity
                                    key={c}
                                    onPress={() => updateForm('category', c)}
                                    style={[
                                        styles.chip,
                                        form.category === c
                                            ? { backgroundColor: colors.primaryInk, borderColor: colors.primaryInk }
                                            : { backgroundColor: colors.primarySurface, borderColor: colors.border },
                                    ]}
                                >
                                    <Text style={[styles.chipText, { color: form.category === c ? '#fff' : colors.textMuted }]}>{c}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Location */}
                    <View style={styles.field}>
                        <Text style={[styles.fieldLabel, { color: colors.text }]}>Storage location</Text>
                        <View style={styles.chipRow}>
                            {LOCATIONS.map(l => (
                                <TouchableOpacity
                                    key={l}
                                    onPress={() => updateForm('location', l)}
                                    style={[
                                        styles.chip,
                                        form.location === l
                                            ? { backgroundColor: colors.primaryInk, borderColor: colors.primaryInk }
                                            : { backgroundColor: colors.primarySurface, borderColor: colors.border },
                                    ]}
                                >
                                    <Text style={[styles.chipText, { color: form.location === l ? '#fff' : colors.textMuted }]}>{l}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Expiry + Quantity */}
                    <View style={styles.row2}>
                        <View style={[styles.field, styles.flex1]}>
                            <Text style={[styles.fieldLabel, { color: colors.text }]}>Expiry date</Text>
                            <TextInput
                                style={[inputStyle, styles.textInput]}
                                placeholder="e.g. May 10, 2026"
                                placeholderTextColor={colors.textMuted}
                                value={form.expiryDate}
                                onChangeText={v => updateForm('expiryDate', v)}
                            />
                        </View>
                        <View style={[styles.field, styles.flex1]}>
                            <Text style={[styles.fieldLabel, { color: colors.text }]}>Quantity</Text>
                            <TextInput
                                style={[inputStyle, styles.textInput]}
                                placeholder="e.g. 2L"
                                placeholderTextColor={colors.textMuted}
                                value={form.quantity}
                                onChangeText={v => updateForm('quantity', v)}
                            />
                        </View>
                    </View>

                    {/* Submit */}
                    <TouchableOpacity
                        style={[
                            styles.primaryBtn,
                            { backgroundColor: form.name.trim() ? colors.primaryInk : colors.border, marginTop: 8 },
                        ]}
                        onPress={handleManualSubmit}
                        disabled={!form.name.trim()}
                    >
                        <Ionicons name="add-circle-outline" size={18} color={form.name.trim() ? '#fff' : colors.textMuted} />
                        <Text style={[styles.primaryBtnText, { color: form.name.trim() ? '#fff' : colors.textMuted }]}>
                            Add to fridge
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ── Mode toggle component ──────────────────────────────────────────────────────

interface ModeToggleProps {
    mode: ScanMode;
    onSwitch: (m: ScanMode) => void;
    colors: ReturnType<typeof useThemeColors>;
}

function ModeToggle({ mode, onSwitch, colors }: ModeToggleProps) {
    return (
        <View style={[styles.modeToggle, { backgroundColor: colors.secondarySurface }]}>
            {([
                { id: 'manual' as ScanMode, label: 'Manual entry', icon: 'pencil-outline' },
                { id: 'scan' as ScanMode, label: 'Scan receipt', icon: 'scan-outline' },
            ] as const).map(m => {
                const active = mode === m.id;
                return (
                    <TouchableOpacity
                        key={m.id}
                        onPress={() => onSwitch(m.id)}
                        style={[
                            styles.modeBtn,
                            active && { backgroundColor: colors.primarySurface, ...expiria.shadows.soft },
                        ]}
                    >
                        <Ionicons name={m.icon} size={14} color={active ? colors.primaryInk : colors.textMuted} />
                        <Text style={[styles.modeBtnText, { color: active ? colors.primaryInk : colors.textMuted }]}>
                            {m.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 40,
        gap: 20,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        gap: 16,
    },
    processingNote: {
        textAlign: 'center',
        fontSize: 13,
        marginTop: -60,
        paddingHorizontal: 24,
    },

    // Mode toggle
    modeToggle: {
        flexDirection: 'row',
        borderRadius: expiria.borderRadius.md,
        padding: 3,
    },
    modeToggleOverlay: {
        position: 'absolute',
        top: 16,
        left: 20,
        right: 20,
        zIndex: 10,
    },
    modeBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 9,
        borderRadius: expiria.borderRadius.sm,
    },
    modeBtnText: { fontSize: 13, fontWeight: '600' },

    // Form
    formSection: { gap: 16 },
    field: { gap: 6 },
    fieldLabel: { fontSize: 12, fontWeight: '600' },
    textInput: { paddingHorizontal: 12, paddingVertical: 10 },
    row2: { flexDirection: 'row', gap: 12 },
    flex1: { flex: 1 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chipScroll: { maxHeight: 36 },
    chipScrollContent: { gap: 8, paddingRight: 4 },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: expiria.borderRadius.full,
        borderWidth: 1,
    },
    chipText: { fontSize: 12, fontWeight: '500' },

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
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 13,
        borderRadius: expiria.borderRadius.sm,
        borderWidth: 1,
    },
    outlineBtnText: { fontSize: 14, fontWeight: '600' },
    ghostBtnText: { fontSize: 14, marginTop: 4 },

    // Success
    successIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    successTitle: { fontSize: 22, fontWeight: '600' },
    successMsg: { fontSize: 14, textAlign: 'center', lineHeight: 22 },

    // Confirm scan
    confirmTitle: { fontSize: 20, fontWeight: '600' },
    confirmSub: { fontSize: 13, marginTop: 4, marginBottom: 8 },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: expiria.borderRadius.md,
        borderWidth: 1,
        padding: 12,
        marginBottom: 10,
    },
    checkbox: { marginRight: 12 },
    itemContent: { flex: 1 },
    itemNameInput: { fontSize: 14, fontWeight: '600', padding: 0, marginBottom: 4 },
    itemExpiry: { fontSize: 12 },
    removeBtn: { padding: 4 },

    // Bottom bar (confirm state)
    bottomBar: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
    },
});
