import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileBox } from '../../components/ProfileBox';
import { SettingsBox } from '../../components/SettingsBox';
import { HelpBox } from '../../components/HelpBox';
import { AboutSection } from '../../components/AboutSection';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useThemeMode, useThemeColors } from '../../context/ThemeContext';
import { expiria } from '../../theme';
import { UserProfile } from '../../types';

export default function ProfileScreen() {
  const colors = useThemeColors();
  const { mode, toggle } = useThemeMode();
  const { profile, updateProfile } = useUserProfile();

  const handleUpdateField = (field: keyof UserProfile, value: string | number) => {
    updateProfile({ [field]: value });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.canvas }]} edges={[]}>
      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.canvas }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ProfileBox profile={profile} onUpdateField={handleUpdateField} />
        <SettingsBox isDarkMode={mode === 'dark'} onToggleTheme={toggle} />
        <HelpBox />
        <AboutSection />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: expiria.spacing.lg,
    paddingTop: expiria.spacing.lg,
    paddingBottom: expiria.spacing.xxl,
    gap: expiria.spacing.lg,
  },
});
