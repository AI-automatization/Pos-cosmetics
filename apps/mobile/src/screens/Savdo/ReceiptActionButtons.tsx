import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import styles from './PaymentSuccessView.styles';

// ─── Props ──────────────────────────────────────────────────────────────────

interface ReceiptActionButtonsProps {
  readonly isPrinterAvailable: boolean;
  readonly isPrinting: boolean;
  readonly isPdfAvailable: boolean;
  readonly isGeneratingPdf: boolean;
  readonly isSendingSms: boolean;
  readonly onPrint: () => void;
  readonly onSharePdf: () => void;
  readonly onSendSms: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ReceiptActionButtons({
  isPrinterAvailable,
  isPrinting,
  isPdfAvailable,
  isGeneratingPdf,
  isSendingSms,
  onPrint,
  onSharePdf,
  onSendSms,
}: ReceiptActionButtonsProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.printRow}>
      {isPrinterAvailable ? (
        <TouchableOpacity
          style={[styles.printBtn, isPrinting && styles.printBtnDisabled]}
          onPress={onPrint}
          disabled={isPrinting}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isPrinting ? 'hourglass-outline' : 'print-outline'}
            size={18}
            color="#FFFFFF"
          />
          <Text style={styles.printBtnText}>
            {isPrinting ? t('receipt.printing') : t('receipt.print')}
          </Text>
        </TouchableOpacity>
      ) : null}

      {isPdfAvailable ? (
        <TouchableOpacity
          style={[styles.pdfBtn, isGeneratingPdf && styles.printBtnDisabled]}
          onPress={onSharePdf}
          disabled={isGeneratingPdf}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isGeneratingPdf ? 'hourglass-outline' : 'share-outline'}
            size={18}
            color="#FFFFFF"
          />
          <Text style={styles.printBtnText}>
            {isGeneratingPdf ? t('receipt.generatingPdf') : t('receipt.sharePdf')}
          </Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        style={[styles.smsBtn, isSendingSms && styles.printBtnDisabled]}
        onPress={onSendSms}
        disabled={isSendingSms}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isSendingSms ? 'hourglass-outline' : 'chatbubble-outline'}
          size={18}
          color="#FFFFFF"
        />
        <Text style={styles.printBtnText}>
          {isSendingSms ? t('receipt.sendingSms') : t('receipt.sendSms')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
