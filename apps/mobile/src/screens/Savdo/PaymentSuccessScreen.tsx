import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import type { SavdoStackParamList } from '../../navigation/types';
import SuccessAnimation from './SuccessAnimation';
import OrderSummarySection from './OrderSummarySection';

// ─── Constants ──────────────────────────────────────────────────────────────

const COUNTDOWN_START = 3;

// ─── Types ───────────────────────────────────────────────────────────────────

type Props = {
  navigation: NativeStackNavigationProp<SavdoStackParamList, 'PaymentSuccess'>;
  route: RouteProp<SavdoStackParamList, 'PaymentSuccess'>;
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function PaymentSuccessScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { items, paymentMethod, orderNumber } = route.params;

  const [countdown, setCountdown] = useState(COUNTDOWN_START);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('SavdoMain');
    }, COUNTDOWN_START * 1000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SuccessAnimation size={120} />

        <Text style={styles.title}>{t('payment.successTitle')}</Text>

        <Text style={styles.orderNumber}>#{orderNumber}</Text>

        <Text style={styles.countdown}>
          {t('payment.autoClose', { seconds: countdown })}
        </Text>

        <View style={styles.card}>
          <OrderSummarySection items={items} paymentMethod={paymentMethod} />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('SavdoMain')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>{t('payment.newSale')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.printButton}
          onPress={() => {}}
          activeOpacity={0.7}
        >
          <Text style={styles.printButtonText}>{t('payment.printReceipt')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#16A34A',
    marginTop: 20,
    textAlign: 'center',
  },
  orderNumber: {
    fontSize: 16,
    color: '#2563EB',
    fontFamily: 'monospace',
    marginTop: 8,
    textAlign: 'center',
  },
  countdown: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    backgroundColor: '#FFFFFF',
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
  },
  primaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  printButton: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  printButtonText: {
    fontSize: 13,
    color: '#6B7280',
  },
});
