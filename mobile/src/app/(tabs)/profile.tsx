import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ProfileBox } from '../../components/ProfileBox';
import { HelpBox } from '../../components/HelpBox';
import { AboutSection } from '../../components/AboutSection';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useThemeMode, useThemeColors } from '../../context/ThemeContext';
import { expiria } from '../../theme';
import { UserProfile } from '../../types';
import { useFoodItems } from '../../hooks/useFoodItems';

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
    const colors = useThemeColors();
    return (
        <TouchableOpacity
            onPress={onChange}
            style={[
                styles.toggle,
                { backgroundColor: value ? colors.primaryInk : colors.border },
            ]}
            activeOpacity={0.8}
        >
            <View style={[styles.toggleThumb, { left: value ? 21 : 3 }]} />
        </TouchableOpacity>
    );
}

interface SectionProps { title: string; children: React.ReactNode }
function Section({ title, children }: SectionProps) {
    const colors = useThemeColors();
    return (
        <View style={styles.sectionBlock}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{title}</Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.primarySurface, borderColor: colors.border }]}>
                {children}
            </View>
        </View>
    );
}

interface ToggleRowProps { label: string; sub?: string; value: boolean; onChange: () => void }
function ToggleRow({ label, sub, value, onChange }: ToggleRowProps) {
    const colors = useThemeColors();
    return (
        <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
            <View style={styles.toggleRowText}>
                <Text style={[styles.toggleRowLabel, { color: colors.text }]}>{label}</Text>
                {sub && <Text style={[styles.toggleRowSub, { color: colors.textMuted }]}>{sub}</Text>}
            </View>
            <Toggle value={value} onChange={onChange} />
        </View>
    );
}

interface LinkRowProps { label: string; danger?: boolean; onPress?: () => void }
function LinkRow({ label, danger, onPress }: LinkRowProps) {
    const colors = useThemeColors();
    return (
        <TouchableOpacity
            style={[styles.linkRow, { borderBottomColor: colors.border }]}
            onPress={onPress}
            activeOpacity={0.6}
        >
            <Text style={[styles.linkRowLabel, { color: danger ? colors.statusExpiredText : colors.text }]}>
                {label}
            </Text>
            <Ionicons
                name={danger ? 'log-out-outline' : 'chevron-forward'}
                size={16}
                color={danger ? colors.statusExpiredText : colors.textMuted}
            />
        </TouchableOpacity>
    );
}

export default function ProfileScreen() {
    const colors = useThemeColors();
    const { mode, toggle: toggleTheme } = useThemeMode();
    const { profile, updateProfile } = useUserProfile();
    const { items } = useFoodItems();

    const [notifs, setNotifs] = React.useState({
        morning: true, evening: false, dayBefore: true, weekBefore: false,
    });

    const toggleNotif = (key: keyof typeof notifs) => setNotifs(n => ({ ...n, [key]: !n[key] }));

    const handleUpdateField = (field: keyof UserProfile, value: string | number) => {
        updateProfile({ [field]: value });
    };

    // Compute stats from real items
    const trackedCount = items.length;
    const savedCount = items.filter(i => i.daysUntilExpiration >= 0).length;
    const useRate = trackedCount > 0 ? Math.round((savedCount / trackedCount) * 100) : 0;

    // Avatar initials
    const initials = [profile?.name, profile?.lastName]
        .filter(Boolean)
        .map(s => s![0].toUpperCase())
        .join('') || '🌿';

    const displayName = [profile?.name, profile?.lastName].filter(Boolean).join(' ') || 'Your Profile';
    const displayEmail = profile?.email || '';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.canvas }]} edges={[]}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Avatar header */}
                <View style={styles.avatarHeader}>
                    <View style={[styles.avatarCircle, { backgroundColor: colors.primaryInk }]}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <View>
                        <Text style={[styles.avatarName, { color: colors.text }]}>{displayName}</Text>
                        {!!displayEmail && (
                            <Text style={[styles.avatarEmail, { color: colors.textMuted }]}>{displayEmail}</Text>
                        )}
                    </View>
                </View>

                {/* Stats grid */}
                <View style={[styles.statsGrid, { borderColor: colors.border, backgroundColor: colors.primarySurface }]}>
                    {[
                        { value: String(trackedCount), label: 'Items tracked' },
                        { value: String(savedCount), label: 'Still fresh' },
                        { value: `${useRate}%`, label: 'Use rate' },
                    ].map((stat, i) => (
                        <View
                            key={stat.label}
                            style={[styles.statCell, i < 2 && { borderRightColor: colors.border, borderRightWidth: 1 }]}
                        >
                            <Text style={[styles.statValue, { color: colors.primaryInk }]}>{stat.value}</Text>
                            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Profile fields */}
                <Section title="Profile">
                    <ProfileBox profile={profile} onUpdateField={handleUpdateField} />
                </Section>

                {/* Notifications */}
                <Section title="Reminders">
                    <ToggleRow label="Morning digest" sub="8:00 AM daily" value={notifs.morning} onChange={() => toggleNotif('morning')} />
                    <ToggleRow label="Evening reminder" sub="6:00 PM daily" value={notifs.evening} onChange={() => toggleNotif('evening')} />
                    <ToggleRow label="Day-before alert" sub="When something expires tomorrow" value={notifs.dayBefore} onChange={() => toggleNotif('dayBefore')} />
                    <ToggleRow label="1-week heads up" sub="Plan meals in advance" value={notifs.weekBefore} onChange={() => toggleNotif('weekBefore')} />
                </Section>

                {/* Appearance */}
                <Section title="Appearance">
                    <ToggleRow label="Dark mode" sub="Easier on the eyes at night" value={mode === 'dark'} onChange={toggleTheme} />
                </Section>

                {/* Account */}
                <Section title="Account">
                    <LinkRow label="Export my data" />
                    <LinkRow label="Sign out" danger />
                </Section>

                <HelpBox />
                <AboutSection />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { flex: 1 },
    content: {
        paddingBottom: expiria.spacing.xxl,
        gap: 0,
    },

    // Avatar
    avatarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        padding: 20,
        paddingBottom: 16,
    },
    avatarCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    avatarText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
    },
    avatarName: {
        fontSize: 20,
        fontWeight: '600',
    },
    avatarEmail: {
        fontSize: 13,
        marginTop: 2,
    },

    // Stats grid
    statsGrid: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 8,
        borderRadius: expiria.borderRadius.md,
        borderWidth: 1,
        overflow: 'hidden',
    },
    statCell: {
        flex: 1,
        padding: 14,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 22,
        fontWeight: '500',
    },
    statLabel: {
        fontSize: 10,
        marginTop: 3,
        textAlign: 'center',
    },

    // Section
    sectionBlock: {
        marginTop: 8,
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.09,
        textTransform: 'uppercase',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 6,
    },
    sectionContent: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        paddingHorizontal: 20,
    },

    // Toggle rows
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 13,
        borderBottomWidth: 1,
    },
    toggleRowText: { flex: 1, marginRight: 12 },
    toggleRowLabel: { fontSize: 14, fontWeight: '500' },
    toggleRowSub: { fontSize: 11, marginTop: 1 },
    toggle: {
        width: 44,
        height: 26,
        borderRadius: 13,
        position: 'relative',
        flexShrink: 0,
    },
    toggleThumb: {
        position: 'absolute',
        top: 3,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 2,
    },

    // Link rows
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    linkRowLabel: { fontSize: 14, fontWeight: '500' },
});
