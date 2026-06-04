import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '../../store/auth.store';

const COLORS = {
  background: '#FEF2F2',
  surface: '#FFFFFF',
  danger: '#DC2626',
  dangerLight: 'rgba(220, 38, 38, 0.1)',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
};

interface CompromisedDeviceScreenProps {
  readonly reason: string | null;
}

export default function CompromisedDeviceScreen({ reason }: CompromisedDeviceScreenProps) {
  const handleExit = async () => {
    // Compromised device: server tokenni ham bekor qilish kerak (best-effort),
    // keyin local clear. logout() ikkalasini ham kafolatlaydi.
    await useAuthStore.getState().logout();
    BackHandler.exitApp();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>&#x26A0;&#xFE0F;</Text>
        </View>

        <Text style={styles.title}>Xavfsizlik xatosi</Text>

        <Text style={styles.message}>
          Bu qurilma jailbreak yoki root qilingan. Xavfsizlik sababli RAOS
          ilovasi bunday qurilmalarda ishlamaydi.
        </Text>

        {reason ? (
          <View style={styles.reasonBox}>
            <Text style={styles.reasonText}>{reason}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.button}
          onPress={handleExit}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Chiqish</Text>
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
    backgroundColor: COLORS.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.danger,
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
  reasonBox: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 32,
    width: '100%',
  },
  reasonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
