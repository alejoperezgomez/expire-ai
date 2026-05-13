import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrafficLightStatus } from '../types';
import { formatDate } from '../utils/dateUtils';
import { ExpirationBadge } from './ExpirationBadge';
import { expiria } from '../theme';
import { useThemeColors } from '../context/ThemeContext';

const CATEGORY_EMOJI: Record<string, string> = {
    'Dairy': '🥛',
    'Produce': '🥬',
    'Meat': '🍗',
    'Seafood': '🐟',
    'Pantry': '🫙',
    'Frozen': '❄️',
    'Beverage': '🧃',
    'Bakery': '🍞',
    'Leftovers': '🍱',
    'Condiments': '🥫',
};

function getCategoryEmoji(category?: string): string {
    if (!category) return '🍽️';
    return CATEGORY_EMOJI[category] ?? '🍽️';
}

interface FoodCardProps {
    id: string;
    name: string;
    purchaseDate: string;
    expirationDate: string;
    status: TrafficLightStatus;
    daysUntilExpiration: number;
    isEstimated: boolean;
    category?: string;
    location?: string;
    quantity?: string;
    variant?: 'list' | 'grid';
    onPress: () => void;
    onDelete: () => void;
}

const STATUS_STRIP: Record<TrafficLightStatus, string> = {
    green: '#4a8840',
    yellow: '#b07d00',
    red: '#c85e28',
};

export function FoodCard({
    name,
    purchaseDate,
    expirationDate,
    status,
    daysUntilExpiration,
    isEstimated,
    category,
    location,
    quantity,
    variant = 'list',
    onPress,
    onDelete,
}: FoodCardProps) {
    const colors = useThemeColors();
    const stripColor = daysUntilExpiration < 0 ? '#c0392b' : STATUS_STRIP[status];
    const emoji = getCategoryEmoji(category);

    if (variant === 'grid') {
        return (
            <TouchableOpacity
                style={[styles.gridCard, { backgroundColor: colors.primarySurface, borderColor: colors.border }]}
                onPress={onPress}
                activeOpacity={0.75}
            >
                {/* Status strip at top */}
                <View style={[styles.gridStrip, { backgroundColor: stripColor }]} />

                <View style={styles.gridContent}>
                    {/* Category / location overline */}
                    <Text style={[styles.gridOverline, { color: colors.textMuted }]} numberOfLines={1}>
                        {[category, location].filter(Boolean).join(' · ') || formatDate(purchaseDate)}
                    </Text>

                    {/* Name */}
                    <Text style={[styles.gridName, { color: colors.text }]} numberOfLines={2}>
                        {name}
                    </Text>

                    {/* Quantity */}
                    <Text style={[styles.gridQty, { color: colors.textMuted }]} numberOfLines={1}>
                        {quantity || ' '}
                    </Text>

                    {/* Badge + date row */}
                    <View style={styles.gridFooter}>
                        <ExpirationBadge status={status} daysUntilExpiration={daysUntilExpiration} size="sm" />
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    // List variant
    const iconBg = {
        green: colors.statusGreenBg,
        yellow: colors.statusYellowBg,
        red: daysUntilExpiration < 0 ? colors.statusExpiredBg : colors.statusRedBg,
    }[status];

    return (
        <TouchableOpacity
            style={[styles.listCard, { backgroundColor: colors.primarySurface, borderColor: colors.border }]}
            onPress={onPress}
            activeOpacity={0.75}
        >
            {/* Emoji icon */}
            <View style={[styles.listIcon, { backgroundColor: iconBg }]}>
                <Text style={styles.listEmoji}>{emoji}</Text>
            </View>

            {/* Content */}
            <View style={styles.listBody}>
                <Text style={[styles.listName, { color: colors.text }]} numberOfLines={1}>
                    {name}
                </Text>
                <Text style={[styles.listMeta, { color: colors.textMuted }]} numberOfLines={1}>
                    {[quantity, location].filter(Boolean).join(' · ') || formatDate(purchaseDate)}
                </Text>
            </View>

            {/* Badge + delete */}
            <View style={styles.listRight}>
                <ExpirationBadge status={status} daysUntilExpiration={daysUntilExpiration} size="sm" />
                <Pressable
                    style={styles.deleteButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    hitSlop={8}
                >
                    <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
                </Pressable>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    // — List variant —
    listCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderRadius: expiria.borderRadius.md,
        borderWidth: 1,
        padding: 12,
        ...expiria.shadows.card,
    },
    listIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    listEmoji: {
        fontSize: 20,
    },
    listBody: {
        flex: 1,
        minWidth: 0,
    },
    listName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    listMeta: {
        fontSize: 11,
    },
    listRight: {
        alignItems: 'flex-end',
        gap: 6,
        flexShrink: 0,
    },
    deleteButton: {
        padding: expiria.spacing.xs,
    },

    // — Grid variant —
    gridCard: {
        flex: 1,
        borderRadius: expiria.borderRadius.md,
        borderWidth: 1,
        overflow: 'hidden',
        ...expiria.shadows.card,
    },
    gridStrip: {
        height: 5,
    },
    gridContent: {
        padding: 12,
    },
    gridOverline: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.08,
        textTransform: 'uppercase',
        marginBottom: 3,
    },
    gridName: {
        fontSize: Platform.select({ ios: 15, android: 14 }) ?? 15,
        fontWeight: '600',
        marginBottom: 2,
        lineHeight: 20,
    },
    gridQty: {
        fontSize: 11,
        marginBottom: 10,
    },
    gridFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
