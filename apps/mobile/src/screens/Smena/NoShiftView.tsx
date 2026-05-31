import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { C } from './SmenaComponents';
import { styles } from './styles';

export default function NoShiftView() {
  return (
    <View style={styles.noShift}>
      <View style={styles.noShiftIcon}>
        <MaterialCommunityIcons name="clock-outline" size={48} color={C.muted} />
      </View>
      <Text style={styles.noShiftTitle}>Faol smena yo'q</Text>
      <Text style={styles.noShiftSub}>
        Yangi smena boshlash uchun quyidagi tugmani bosing
      </Text>
    </View>
  );
}
