import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Theme colors for consistent styling
const theme = {
    primary: '#3b82f6',
    background: '#ffffff',
    text: '#1a1a1a',
    textMuted: '#6b7280',
    border: '#e5e7eb',
};

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.textMuted,
                tabBarStyle: {
                    backgroundColor: theme.background,
                    borderTopColor: theme.border,
                    borderTopWidth: 1,
                    paddingTop: 8,
                    paddingBottom: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
                headerStyle: {
                    backgroundColor: theme.background,
                },
                headerTitleStyle: {
                    color: theme.text,
                    fontWeight: '600',
                    fontSize: 18,
                },
                headerShadowVisible: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'My Food',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="basket-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="scan"
                options={{
                    title: 'Scan',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="camera-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
