import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PaymentIntentResponse } from '../../api/payments.api';
import { paymentsApi } from '../../api/payments.api';
import { fmt, METHODS } from './PaymentSheetTypes';
import OnlinePaymentActions from './OnlinePaymentActions';

const POLL_INTERVAL_MS = 3_000;
const SUCCESS_DELAY_MS = 1_500;
const QR_SIZE = 200;

const PROVIDER_COLORS: Record<string, string> = {
  PAYME: '#00CCCC', CLICK: '#00AA00', UZUM: '#7B2FBE',
};

interface Props {
  readonly visible: boolean;
  readonly intent: PaymentIntentResponse | null;
  readonly onSuccess: () => void;
  readonly onCancel: () => void;
}

function getProviderColor(m: string): string {
  return PROVIDER_COLORS[m.toUpperCase()] ?? '#2563EB';
}

function getProviderLabel(m: string): string {
  return METHODS.find((c) => c.key.toUpperCase() === m.toUpperCase())?.label ?? m;
}

export default function OnlinePaymentSheet({
  visible,
  intent,
  onSuccess,
  onCancel,
}: Props) {
  const [currentIntent, setCurrentIntent] = useState(intent);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setCurrentIntent(intent); setError(null); }, [intent]);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  useEffect(() => {
    if (!visible || !currentIntent) return;
    if (currentIntent.status !== 'CREATED') return;

    setPolling(true);
    timerRef.current = setInterval(async () => {
      try {
        const updated = await paymentsApi.getIntentStatus(currentIntent.id);
        setCurrentIntent(updated);

        if (updated.status === 'CONFIRMED' || updated.status === 'SETTLED') {
          if (timerRef.current) clearInterval(timerRef.current);
          setPolling(false);
          // success side-effect handled by the dedicated effect below
        } else if (updated.status === 'FAILED') {
          if (timerRef.current) clearInterval(timerRef.current);
          setPolling(false);
          setError("To'lov amalga oshmadi");
        }
      } catch {
        // Backend may not be ready — continue polling silently
      }
    }, POLL_INTERVAL_MS);

    return () => { if (timerRef.current) clearInterval(timerRef.current); setPolling(false); };
  }, [visible, currentIntent?.id, currentIntent?.status]);

  // Schedule onSuccess after a short delay once the intent reaches a paid state.
  // Keyed on the terminal status so React cancels the timer on unmount or when
  // the status leaves the success state (e.g. parent clears intent on cancel).
  useEffect(() => {
    const status = currentIntent?.status;
    if (status !== 'CONFIRMED' && status !== 'SETTLED') return;

    const handle = setTimeout(onSuccess, SUCCESS_DELAY_MS);
    return () => clearTimeout(handle);
  }, [currentIntent?.status, onSuccess]);

  const handleOpenApp = useCallback(async () => {
    if (!currentIntent) return;
    const url = currentIntent.deeplink ?? currentIntent.checkoutUrl;
    if (!url) return;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else if (currentIntent.checkoutUrl && url !== currentIntent.checkoutUrl) {
        await Linking.openURL(currentIntent.checkoutUrl);
      }
    } catch {
      if (currentIntent.checkoutUrl) {
        try { await Linking.openURL(currentIntent.checkoutUrl); }
        catch { setError("Havolani ochib bo'lmadi"); }
      }
    }
  }, [currentIntent]);

  const handleCancel = useCallback(async () => {
    if (currentIntent?.status === 'CREATED') {
      try { await paymentsApi.cancelIntent(currentIntent.id); }
      catch { /* Backend may not support cancel yet */ }
    }
    onCancel();
  }, [currentIntent, onCancel]);

  if (!currentIntent) return null;
  const providerColor = getProviderColor(currentIntent.method);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleCancel}>
      <View style={styles.container}>
        {/* Provider header */}
        <View style={[styles.headerBar, { backgroundColor: providerColor }]}>
          <Text style={styles.headerLabel}>
            {getProviderLabel(currentIntent.method)}
          </Text>
          <TouchableOpacity onPress={handleCancel} style={styles.headerClose}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Amount */}
        <View style={styles.amountBlock}>
          <Text style={styles.amountLabel}>{"To'lov summasi"}</Text>
          <Text style={styles.amountValue}>{fmt(currentIntent.amount)}</Text>
        </View>

        {/* QR Code */}
        <View style={styles.qrContainer}>
          {currentIntent.qrCodeUrl ? (
            <Image
              source={{ uri: currentIntent.qrCodeUrl }}
              style={styles.qrImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.qrPlaceholder}>
              <ActivityIndicator size="small" color={providerColor} />
              <Text style={styles.qrPlaceholderText}>
                QR kod yuklanmoqda...
              </Text>
            </View>
          )}
        </View>

        {/* Status + Actions (extracted component) */}
        <OnlinePaymentActions
          status={currentIntent.status}
          polling={polling}
          error={error}
          providerColor={providerColor}
          deeplink={currentIntent.deeplink}
          checkoutUrl={currentIntent.checkoutUrl}
          onOpenApp={handleOpenApp}
          onCancel={handleCancel}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  headerLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountBlock: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  amountValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  qrImage: {
    width: QR_SIZE,
    height: QR_SIZE,
    borderRadius: 12,
  },
  qrPlaceholder: {
    width: QR_SIZE,
    height: QR_SIZE,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  qrPlaceholderText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
