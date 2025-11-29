import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    Pressable,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { toISODateString } from '../utils/dateUtils';

interface DatePickerProps {
    value: Date;
    onChange: (date: Date) => void;
    minDate?: Date;
    maxDate?: Date;
    label?: string;
}

type InputMode = 'calendar' | 'manual';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Default reasonable date range: 1 year in the past to 2 years in the future
const getDefaultMinDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date;
};

const getDefaultMaxDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 2);
    return date;
};

export function DatePicker({
    value,
    onChange,
    minDate = getDefaultMinDate(),
    maxDate = getDefaultMaxDate(),
    label,
}: DatePickerProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const [inputMode, setInputMode] = useState<InputMode>('calendar');
    const [viewDate, setViewDate] = useState(new Date(value));
    const [manualInput, setManualInput] = useState('');
    const [inputError, setInputError] = useState<string | null>(null);

    const formatDisplayDate = (date: Date): string => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const openModal = () => {
        setViewDate(new Date(value));
        setManualInput(toISODateString(value));
        setInputError(null);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setInputError(null);
    };

    const validateDate = useCallback((date: Date): string | null => {
        if (isNaN(date.getTime())) {
            return 'Invalid date format';
        }
        if (date < minDate) {
            return `Date must be after ${formatDisplayDate(minDate)}`;
        }
        if (date > maxDate) {
            return `Date must be before ${formatDisplayDate(maxDate)}`;
        }
        return null;
    }, [minDate, maxDate]);

    const handleDateSelect = (day: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const error = validateDate(newDate);
        if (!error) {
            onChange(newDate);
            closeModal();
        }
    };

    const handleManualSubmit = () => {
        const parsed = new Date(manualInput);
        const error = validateDate(parsed);
        if (error) {
            setInputError(error);
            return;
        }
        onChange(parsed);
        closeModal();
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setViewDate(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(newDate.getMonth() - 1);
            } else {
                newDate.setMonth(newDate.getMonth() + 1);
            }
            return newDate;
        });
    };

    const getDaysInMonth = (year: number, month: number): number => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number): number => {
        return new Date(year, month, 1).getDay();
    };

    const isDateDisabled = (day: number): boolean => {
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        return date < minDate || date > maxDate;
    };

    const isSelectedDate = (day: number): boolean => {
        return (
            value.getDate() === day &&
            value.getMonth() === viewDate.getMonth() &&
            value.getFullYear() === viewDate.getFullYear()
        );
    };

    const isToday = (day: number): boolean => {
        const today = new Date();
        return (
            today.getDate() === day &&
            today.getMonth() === viewDate.getMonth() &&
            today.getFullYear() === viewDate.getFullYear()
        );
    };

    const renderCalendar = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days: (number | null)[] = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        return (
            <View style={styles.calendar}>
                <View style={styles.calendarHeader}>
                    <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
                        <Ionicons name="chevron-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text style={styles.monthYearText}>
                        {MONTHS[month]} {year}
                    </Text>
                    <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
                        <Ionicons name="chevron-forward" size={24} color="#374151" />
                    </TouchableOpacity>
                </View>

                <View style={styles.weekDaysRow}>
                    {DAYS_OF_WEEK.map(day => (
                        <Text key={day} style={styles.weekDayText}>{day}</Text>
                    ))}
                </View>

                <View style={styles.daysGrid}>
                    {days.map((day, index) => (
                        <View key={index} style={styles.dayCell}>
                            {day !== null ? (
                                <TouchableOpacity
                                    style={[
                                        styles.dayButton,
                                        isSelectedDate(day) && styles.selectedDay,
                                        isToday(day) && !isSelectedDate(day) && styles.todayDay,
                                        isDateDisabled(day) && styles.disabledDay,
                                    ]}
                                    onPress={() => handleDateSelect(day)}
                                    disabled={isDateDisabled(day)}
                                >
                                    <Text
                                        style={[
                                            styles.dayText,
                                            isSelectedDate(day) && styles.selectedDayText,
                                            isDateDisabled(day) && styles.disabledDayText,
                                        ]}
                                    >
                                        {day}
                                    </Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const renderManualInput = () => (
        <View style={styles.manualInputContainer}>
            <Text style={styles.manualInputLabel}>Enter date (YYYY-MM-DD):</Text>
            <TextInput
                style={[styles.manualInput, inputError && styles.manualInputError]}
                value={manualInput}
                onChangeText={(text) => {
                    setManualInput(text);
                    setInputError(null);
                }}
                placeholder="2025-12-31"
                placeholderTextColor="#9ca3af"
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
            />
            {inputError && <Text style={styles.errorText}>{inputError}</Text>}
            <TouchableOpacity style={styles.submitButton} onPress={handleManualSubmit}>
                <Text style={styles.submitButtonText}>Set Date</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TouchableOpacity style={styles.inputButton} onPress={openModal}>
                <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                <Text style={styles.inputText}>{formatDisplayDate(value)}</Text>
                <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={closeModal}
            >
                <Pressable style={styles.modalOverlay} onPress={closeModal}>
                    <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Date</Text>
                            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modeToggle}>
                            <TouchableOpacity
                                style={[styles.modeButton, inputMode === 'calendar' && styles.modeButtonActive]}
                                onPress={() => setInputMode('calendar')}
                            >
                                <Ionicons
                                    name="calendar"
                                    size={18}
                                    color={inputMode === 'calendar' ? '#ffffff' : '#6b7280'}
                                />
                                <Text style={[styles.modeButtonText, inputMode === 'calendar' && styles.modeButtonTextActive]}>
                                    Calendar
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modeButton, inputMode === 'manual' && styles.modeButtonActive]}
                                onPress={() => setInputMode('manual')}
                            >
                                <Ionicons
                                    name="create"
                                    size={18}
                                    color={inputMode === 'manual' ? '#ffffff' : '#6b7280'}
                                />
                                <Text style={[styles.modeButtonText, inputMode === 'manual' && styles.modeButtonTextActive]}>
                                    Manual
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            {inputMode === 'calendar' ? renderCalendar() : renderManualInput()}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    inputButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        gap: 8,
    },
    inputText: {
        flex: 1,
        fontSize: 16,
        color: '#1a1a1a',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        width: '100%',
        maxWidth: 360,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    closeButton: {
        padding: 4,
    },
    modeToggle: {
        flexDirection: 'row',
        padding: 12,
        gap: 8,
    },
    modeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
        gap: 6,
    },
    modeButtonActive: {
        backgroundColor: '#3b82f6',
    },
    modeButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6b7280',
    },
    modeButtonTextActive: {
        color: '#ffffff',
    },
    modalBody: {
        padding: 16,
    },
    calendar: {
        width: '100%',
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    navButton: {
        padding: 8,
    },
    monthYearText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    weekDaysRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    weekDayText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '500',
        color: '#6b7280',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '14.28%',
        aspectRatio: 1,
        padding: 2,
    },
    dayButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    selectedDay: {
        backgroundColor: '#3b82f6',
    },
    todayDay: {
        backgroundColor: '#e5e7eb',
    },
    disabledDay: {
        opacity: 0.3,
    },
    dayText: {
        fontSize: 14,
        color: '#1a1a1a',
    },
    selectedDayText: {
        color: '#ffffff',
        fontWeight: '600',
    },
    disabledDayText: {
        color: '#9ca3af',
    },
    manualInputContainer: {
        padding: 8,
    },
    manualInputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    manualInput: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1a1a1a',
    },
    manualInputError: {
        borderColor: '#ef4444',
    },
    errorText: {
        fontSize: 12,
        color: '#ef4444',
        marginTop: 4,
    },
    submitButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
});
