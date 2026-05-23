import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  background: '#EFF6FF',
  surface: '#FFFFFF',
  primary: '#2563EB',
  primaryLight: 'rgba(37, 99, 235, 0.1)',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
};

interface ForceUpdateScreenProps {
  readonly currentVersion: string;
  readonly minVersion: string | null;
  readonly storeUrl: string | null;
}

export default function ForceUpdateScreen({
  currentVersion,
  minVersion,
  storeUrl,
}: ForceUpdateScreenProps) {
  const handleUpdate = () => {
    if (storeUrl) {
      Linking.openURL(storeUrl);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons name="cloud-download-outline" size={48} color={COLORS.primary} />
        </View>

        <Text style={styles.title}>Yangilash kerak</Text>

        <Text style={styles.message}>
          Ilovaning yangi versiyasi mavjud. Davom etish uchun yangilang.
        </Text>

        <View style={styles.versionBox}>
          <Text style={styles.versionText}>
            Joriy: v{currentVersion} → Minimum: v{minVersion ?? '?'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleUpdate}
          activeOpacity={0.85}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="download-outline" size={20} color={COLORS.white} />
            <Text style={styles.buttonText}>Yangilash</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  versionBox: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 32,
    width: '100%',
  },
  versionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
