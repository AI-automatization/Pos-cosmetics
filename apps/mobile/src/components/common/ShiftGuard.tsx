import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useShiftStore } from '../../store/shiftStore';
import { type TabParamList } from '../../navigation/types';

interface ShiftGuardProps {
  children: React.ReactNode;
}

export default function ShiftGuard({ children }: ShiftGuardProps) {
  const { isShiftOpen } = useShiftStore();
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();

  if (isShiftOpen) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.content} pointerEvents="auto">
          <Ionicons name="lock-closed" size={48} color="#6366F1" />
          <Text style={styles.title}>Smena ochilmagan</Text>
          <Text style={styles.message}>
            Bu sahifaga o'tish uchun smena ochish kerak.
          </Text>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Text style={styles.buttonText}>Smena ochish →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(249, 250, 251, 0.97)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  message: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#5B5BD6',
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 14,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
