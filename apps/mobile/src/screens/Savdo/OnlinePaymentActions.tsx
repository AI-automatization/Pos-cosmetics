import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PaymentIntentStatus } from '../../api/payments.api';

// ─── Props ────────────────────────────────────────────────

interface Props {
  readonly status: PaymentIntentStatus;
  readonly polling: boolean;
  readonly error: string | null;
  readonly providerColor: string;
  readonly deeplink: string | null;
  readonly checkoutUrl: string | null;
  readonly onOpenApp: () => void;
  readonly onCancel: () => void;
}

// ─── Component ────────────────────────────────────────────

export default function OnlinePaymentActions({
  status,
  polling,
  error,
  providerColor,
  deeplink,
  checkoutUrl,
  onOpenApp,
  onCancel,
}: Props) {
  const isTerminal = status === 'CONFIRMED' || status === 'SETTLED';
  const isFailed = status === 'FAILED';
  const hasDeeplink = Boolean(deeplink ?? checkoutUrl);
  const hasCheckoutUrl = Boolean(checkoutUrl);

  return (
    <>
      {/* Status indicator */}
      <View style={styles.statusRow}>
        {status === 'CREATED' && polling && (
          <>
            <ActivityIndicator size="small" color={providerColor} />
            <Text style={styles.statusText}>{"To'lov kutilmoqda..."}</Text>
          </>
        )}
        {isTerminal && (
          <>
            <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
            <Text style={[styles.statusText, styles.statusSuccess]}>
              {"To'lov tasdiqlandi!"}
            </Text>
          </>
        )}
        {isFailed && (
          <>
            <Ionicons name="close-circle" size={24} color="#DC2626" />
            <Text style={[styles.statusText, styles.statusFailed]}>
              {error ?? "To'lov amalga oshmadi"}
            </Text>
          </>
        )}
      </View>

      {/* Action buttons */}
      {!isTerminal && (
        <View style={styles.actions}>
          {hasDeeplink && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: providerColor }]}
              onPress={onOpenApp}
              activeOpacity={0.85}
            >
              <Ionicons name="phone-portrait-outline" size={18} color="#FFF" />
              <Text style={styles.actionBtnText}>Ilovada ochish</Text>
            </TouchableOpacity>
          )}

          {hasCheckoutUrl && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnOutline]}
              onPress={() => {
                if (checkoutUrl) void Linking.openURL(checkoutUrl);
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="globe-outline" size={18} color="#374151" />
              <Text style={styles.actionBtnOutlineText}>Brauzerda ochish</Text>
            </TouchableOpacity>
          )}

          {!hasDeeplink && !hasCheckoutUrl && (
            <Text style={styles.noLinkText}>
              {"To'lov havolasi hali tayyor emas"}
            </Text>
          )}

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onCancel}
            activeOpacity={0.85}
          >
            <Text style={styles.cancelBtnText}>Bekor qilish</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    minHeight: 56,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  statusSuccess: {
    color: '#16A34A',
  },
  statusFailed: {
    color: '#DC2626',
  },
  actions: {
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionBtnOutline: {
    backgroundColor: '#F3F4F6',
    shadowOpacity: 0,
    elevation: 0,
  },
  actionBtnOutlineText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  noLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 8,
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginTop: 4,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
  },
});
