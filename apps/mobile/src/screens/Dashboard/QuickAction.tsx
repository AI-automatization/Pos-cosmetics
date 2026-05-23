import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';

interface QuickActionProps {
  readonly icon: React.ComponentProps<typeof Ionicons>['name'];
  readonly label: string;
  readonly color: string;
  readonly bg: string;
  readonly onPress: () => void;
}

function QuickAction({ icon, label, color, bg, onPress }: QuickActionProps) {
  return (
    <TouchableOpacity
      style={[styles.quickCard, { backgroundColor: bg }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.quickIconCircle, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.quickLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default React.memo(QuickAction);
