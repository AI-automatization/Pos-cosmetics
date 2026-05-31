import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './SmenaComponents';
import { styles } from './styles';

interface ShiftFooterProps {
  readonly isShiftOpen: boolean;
  readonly loading: boolean;
  readonly onPress: () => void;
}

export default function ShiftFooter({ isShiftOpen, loading, onPress }: ShiftFooterProps) {
  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={[styles.toggleBtn, isShiftOpen ? styles.toggleBtnClose : styles.toggleBtnOpen]}
        onPress={onPress}
        activeOpacity={0.85}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={C.white} size="small" />
        ) : (
          <>
            <Ionicons
              name={isShiftOpen ? 'lock-closed-outline' : 'play-circle-outline'}
              size={22}
              color={C.white}
            />
            <Text style={styles.toggleBtnText}>
              {isShiftOpen ? 'Smenani yopish' : 'Smena ochish'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
