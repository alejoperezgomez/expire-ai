import { Tabs } from 'expo-router';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../context/ThemeContext';
import { expiria } from '../../theme';

function FabButton({ onPress }: { onPress?: () => void }) {
    const colors = useThemeColors();
    return (
        <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primaryInk }]} onPress={onPress} activeOpacity={0.85}>
            <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
    );
}

export default function TabLayout() {
    const colors = useThemeColors();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: colors.primaryInk,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: {
                    backgroundColor: colors.primarySurface,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    paddingTop: 6,
                    paddingBottom: 4,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                    marginTop: 2,
                },
                headerStyle: {
                    backgroundColor: colors.primarySurface,
                },
                headerTitleStyle: {
                    color: colors.text,
                    fontWeight: '600',
                    fontSize: 20,
                },
                headerShadowVisible: false,
                headerTitleAlign: 'left',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Expiria',
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="scan"
                options={{
                    title: 'Add Item',
                    tabBarLabel: '',
                    tabBarIcon: () => null,
                    tabBarButton: (props) => (
                        <View style={styles.fabWrapper}>
                            <FabButton onPress={props.onPress as (() => void) | undefined} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    fab: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -18,
        shadowColor: '#4a8840',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.40,
        shadowRadius: 10,
        elevation: 6,
    },
    fabWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 4,
    },
});
