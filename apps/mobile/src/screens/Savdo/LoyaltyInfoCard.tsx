import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import styles from './PaymentSuccessView.styles';

// ─── Props ──────────────────────────────────────────────────────────────────

interface LoyaltyInfoCardProps {
  readonly pointsEarned?: number;
  readonly pointsRedeemed?: number;
  readonly newBalance?: number;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function LoyaltyInfoCard({
  pointsEarned,
  pointsRedeemed,
  newBalance,
}: LoyaltyInfoCardProps) {
  const { t } = useTranslation();

  if (!pointsEarned && !pointsRedeemed) {
    return null;
  }

  return (
    <View style={styles.loyaltyInfo}>
      {pointsRedeemed ? (
        <Text style={styles.loyaltyText}>
          {t('receipt.pointsRedeemed', { points: pointsRedeemed })}
        </Text>
      ) : null}
      {pointsEarned ? (
        <Text style={styles.loyaltyEarn}>
          {t('receipt.pointsEarned', { points: pointsEarned })}
        </Text>
      ) : null}
      {newBalance !== undefined ? (
        <Text style={styles.loyaltyBalance}>
          {t('receipt.pointsBalance', { points: newBalance })}
        </Text>
      ) : null}
    </View>
  );
}
