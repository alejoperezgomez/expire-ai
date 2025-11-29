/**
 * Offline Indicator Component
 * Shows a banner when the device is offline
 */

import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

interface OfflineIndicatorProps {
    /** Custom message to display */
    message?: string;
    /** Show pending operations count */
    pendingCount?: number;
}

export function OfflineIndicator({
    message = 'You are offline',
    pendingCount
}: OfflineIndicatorProps) {
    const { isOnline } = useNetworkStatus();
    const [visible, setVisible] = React.useState(!isOnline);
    const slideAnim = React.useRef(new Animated.Value(isOnline ? -50 : 0)).current;

    React.useEffect(() => {
        if (!isOnline) {
            setVisible(true);
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -50,
                duration: 300,
                useNativeDriver: true,
            }).start(() => setVisible(false));
        }
    }, [isOnline, slideAnim]);

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ translateY: slideAnim }] }
            ]}
        >
            <View style={styles.content}>
                <View style={styles.dot} />
                <Text style={styles.text}>{message}</Text>
                {pendingCount !== undefined && pendingCount > 0 && (
                    <Text style={styles.pendingText}>
                        ({pendingCount} pending)
                    </Text>
                )}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#f59e0b',
        paddingVertical: 8,
        paddingHorizontal: 16,
        zIndex: 1000,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
        marginRight: 8,
    },
    text: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    pendingText: {
        color: '#fff',
        fontSize: 12,
        marginLeft: 8,
        opacity: 0.9,
    },
});

export default OfflineIndicator;
