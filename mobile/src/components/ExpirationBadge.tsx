import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrafficLightStatus } from '../types';
import { formatRelativeExpiration } from '../utils/dateUtils';

interface ExpirationBadgeProps {
    status: TrafficLightStatus;
    daysUntilExpiration: number;
}

const statusColors: Record<TrafficLightStatus, { background: string; text: string }> = {
    green: {
        background: '#dcfce7',
        text: '#166534',
    },
    yellow: {
        background: '#fef9c3',
        text: '#854d0e',
    },
    red: {
        background: '#fee2e2',
        text: '#991b1b',
    },
};

export function ExpirationBadge({ status, daysUntilExpiration }: ExpirationBadgeProps) {
    const colors = statusColors[status];
    const expirationText = formatRelativeExpiration(daysUntilExpiration);

    return (
        <View style={[styles.badge, { backgroundColor: colors.background }]}>
            <View style={[styles.dot, { backgroundColor: colors.text }]} />
            <Text style={[styles.text, { color: colors.text }]}>{expirationText}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    text: {
        fontSize: 13,
        fontWeight: '600',
    },
});
