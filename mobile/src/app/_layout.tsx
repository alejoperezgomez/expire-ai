import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNotifications } from '../hooks/useNotifications';

// Theme colors for consistent styling
const theme = {
    primary: '#3b82f6',
    background: '#ffffff',
    text: '#1a1a1a',
};

export default function RootLayout() {
    // Initialize push notifications
    useNotifications();

    return (
        <SafeAreaProvider>
            <StatusBar style="auto" />
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: theme.background,
                    },
                    headerTitleStyle: {
                        color: theme.text,
                        fontWeight: '600',
                        fontSize: 18,
                    },
                    headerTintColor: theme.primary,
                    headerShadowVisible: false,
                    contentStyle: {
                        backgroundColor: theme.background,
                    },
                }}
            >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="food/[id]"
                    options={{
                        title: 'Food Details',
                        headerBackTitle: 'Back',
                    }}
                />
            </Stack>
        </SafeAreaProvider>
    );
}
