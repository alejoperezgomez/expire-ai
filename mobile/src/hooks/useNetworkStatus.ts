/**
 * Hook for monitoring network connectivity status
 */

import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkStatus {
    isConnected: boolean;
    isInternetReachable: boolean | null;
    type: string | null;
}

interface UseNetworkStatusReturn {
    isOnline: boolean;
    networkStatus: NetworkStatus;
    checkConnection: () => Promise<boolean>;
}

/**
 * Hook to monitor and check network connectivity
 */
export function useNetworkStatus(): UseNetworkStatusReturn {
    const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
        isConnected: true,
        isInternetReachable: true,
        type: null,
    });

    // Update network status from NetInfo state
    const updateNetworkStatus = useCallback((state: NetInfoState) => {
        setNetworkStatus({
            isConnected: state.isConnected ?? false,
            isInternetReachable: state.isInternetReachable,
            type: state.type,
        });
    }, []);

    // Subscribe to network state changes
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(updateNetworkStatus);

        // Get initial state
        NetInfo.fetch().then(updateNetworkStatus);

        return () => {
            unsubscribe();
        };
    }, [updateNetworkStatus]);

    // Manual connection check
    const checkConnection = useCallback(async (): Promise<boolean> => {
        const state = await NetInfo.fetch();
        updateNetworkStatus(state);
        return state.isConnected ?? false;
    }, [updateNetworkStatus]);

    // Consider online if connected and internet is reachable (or unknown)
    const isOnline = networkStatus.isConnected &&
        (networkStatus.isInternetReachable === true || networkStatus.isInternetReachable === null);

    return {
        isOnline,
        networkStatus,
        checkConnection,
    };
}
