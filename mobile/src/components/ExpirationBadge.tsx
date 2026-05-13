import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrafficLightStatus } from '../types';
import { formatRelativeExpiration } from '../utils/dateUtils';
import { expiria } from '../theme';
import { useThemeColors } from '../context/ThemeContext';

interface ExpirationBadgeProps {
    status: TrafficLightStatus;
    daysUntilExpiration: number;
    size?: 'sm' | 'md' | 'lg';
}

export function ExpirationBadge({ status, daysUntilExpiration, size = 'md' }: ExpirationBadgeProps) {
    const colors = useThemeColors();
    const expirationText = formatRelativeExpiration(daysUntilExpiration);

    const isExpired = daysUntilExpiration < 0;

    const statusConfig = {
        green: {
            bg: colors.statusGreenBg,
            text: colors.statusGreenText,
            border: colors.statusGreenBorder,
            dot: colors.statusGreenDot,
        },
        yellow: {
            bg: colors.statusYellowBg,
            text: colors.statusYellowText,
            border: colors.statusYellowBorder,
            dot: colors.statusYellowDot,
        },
        red: isExpired
            ? {
                bg: colors.statusExpiredBg,
                text: colors.statusExpiredText,
                border: colors.statusExpiredBorder,
                dot: colors.statusExpiredDot,
              }
            : {
                bg: colors.statusRedBg,
                text: colors.statusRedText,
                border: colors.statusRedBorder,
                dot: colors.statusRedDot,
              },
    };

    const cfg = statusConfig[status];

    const sizes = {
        sm: { fontSize: 10, paddingH: 8, paddingV: 3, dotSize: 5, gap: 4 },
        md: { fontSize: 11, paddingH: 10, paddingV: 4, dotSize: 6, gap: 5 },
        lg: { fontSize: 13, paddingH: 12, paddingV: 6, dotSize: 7, gap: 6 },
    };
    const s = sizes[size];

    return (
        <View
            style={[
                styles.badge,
                {
                    backgroundColor: cfg.bg,
                    borderColor: cfg.border,
                    paddingHorizontal: s.paddingH,
                    paddingVertical: s.paddingV,
                },
            ]}
        >
            <View style={[styles.dot, { backgroundColor: cfg.dot, width: s.dotSize, height: s.dotSize, borderRadius: s.dotSize / 2 }]} />
            <Text style={[styles.text, { color: cfg.text, fontSize: s.fontSize }]}>{expirationText}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderRadius: expiria.borderRadius.full,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    dot: {
        flexShrink: 0,
    },
    text: {
        fontWeight: '600',
        lineHeight: 16,
    },
});
