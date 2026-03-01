import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { extractErrorMessage } from '@/utils/error';

interface ErrorViewProps {
  error: unknown;
  onRetry?: () => void;
}

export default function ErrorView({ error, onRetry }: ErrorViewProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message}>{extractErrorMessage(error)}</Text>
      {onRetry ? (
        <TouchableOpacity style={styles.button} onPress={onRetry} accessibilityRole="button">
          <Text style={styles.buttonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  icon: {
    fontSize: 40,
  },
  message: {
    fontSize: 15,
    color: '#374151',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1a56db',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
});
