import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrafficLightStatus } from '../types';
import { formatDate } from '../utils/dateUtils';
import { ExpirationBadge } from './ExpirationBadge';

interface FoodCardProps {
    id: string;
    name: string;
    purchaseDate: string;
    expirationDate: string;
    status: TrafficLightStatus;
    daysUntilExpiration: number;
    isEstimated: boolean;
    onPress: () => void;
    onDelete: () => void;
}

export function FoodCard({
    name,
    purchaseDate,
    expirationDate,
    status,
    daysUntilExpiration,
    isEstimated,
    onPress,
    onDelete,
}: FoodCardProps) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.name} numberOfLines={1}>
                        {name}
                    </Text>
                    <Pressable
                        style={styles.deleteButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        hitSlop={8}
                    >
                        <Ionicons name="trash-outline" size={20} color="#9ca3af" />
                    </Pressable>
                </View>

                <View style={styles.dates}>
                    <View style={styles.dateRow}>
                        <Text style={styles.dateLabel}>Purchased:</Text>
                        <Text style={styles.dateValue}>{formatDate(purchaseDate)}</Text>
                    </View>
                    <View style={styles.dateRow}>
                        <Text style={styles.dateLabel}>Expires:</Text>
                        <Text style={styles.dateValue}>{formatDate(expirationDate)}</Text>
                        {isEstimated && (
                            <View style={styles.estimatedBadge}>
                                <Text style={styles.estimatedText}>Est.</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.footer}>
                    <ExpirationBadge status={status} daysUntilExpiration={daysUntilExpiration} />
                </View>
            </View>
        </TouchableOpacity>
    );
}


const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        flex: 1,
        marginRight: 8,
    },
    deleteButton: {
        padding: 4,
    },
    dates: {
        marginBottom: 12,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    dateLabel: {
        fontSize: 14,
        color: '#6b7280',
        width: 80,
    },
    dateValue: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    estimatedBadge: {
        backgroundColor: '#e5e7eb',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    estimatedText: {
        fontSize: 11,
        color: '#6b7280',
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
});
