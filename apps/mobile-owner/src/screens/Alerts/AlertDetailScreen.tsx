import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AlertsStackParamList } from '../../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  route: RouteProp<AlertsStackParamList, 'AlertDetail'>;
  navigation: NativeStackNavigationProp<AlertsStackParamList, 'AlertDetail'>;
};

export default function AlertDetailScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { alertId } = route.params;

  // In a real app, you'd fetch the alert by ID
  // For now, we display the alertId and action buttons
  void alertId;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.placeholder}>{t('alerts.title')}</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>{t('common.back')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16, gap: 16 },
  placeholder: { fontSize: 18, color: '#111827', fontWeight: '600' },
  button: {
    backgroundColor: '#2563EB',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
