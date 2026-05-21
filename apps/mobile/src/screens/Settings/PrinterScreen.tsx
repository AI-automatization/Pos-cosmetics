import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useSunmiPrinter } from '../../hooks/useSunmiPrinter';
import type { PrinterStatus } from '../../services/PrinterService';

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:        '#F9FAFB',
  white:     '#FFFFFF',
  text:      '#111827',
  muted:     '#9CA3AF',
  secondary: '#6B7280',
  border:    '#E5E7EB',
  green:     '#059669',
  orange:    '#D97706',
  red:       '#DC2626',
} as const;

// ─── Async Storage Keys ────────────────────────────────
const KEY_AUTO_PRINT = '@printer_auto_print';
const KEY_AUTO_CUT = '@printer_auto_cut';

// ─── Status config ─────────────────────────────────────
interface StatusConfig {
  readonly color: string;
  readonly labelKey: string;
}

const STATUS_MAP: Record<PrinterStatus, StatusConfig> = {
  NORMAL:       { color: C.green,  labelKey: 'printer.statusNormal' },
  OUT_OF_PAPER: { color: C.orange, labelKey: 'printer.statusOutOfPaper' },
  OVERHEAT:     { color: C.red,    labelKey: 'printer.statusOverheat' },
  ERROR:        { color: C.red,    labelKey: 'printer.statusError' },
  UNAVAILABLE:  { color: C.muted,  labelKey: 'printer.statusUnavailable' },
};

// ─── Sub-components ────────────────────────────────────
const Card = ({ children }: { readonly children: React.ReactNode }) => (
  <View style={styles.card}>{children}</View>
);
const Divider = () => <View style={styles.divider} />;
const SectionTitle = ({ title }: { readonly title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

// ─── Main Screen ───────────────────────────────────────
export default function PrinterScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { status, isPrinting, error, checkStatus, testPrint } = useSunmiPrinter();

  const [autoPrint, setAutoPrint] = useState(false);
  const [autoCut, setAutoCut] = useState(false);

  const statusCfg = STATUS_MAP[status];

  // Load saved settings
  useEffect(() => {
    const load = async () => {
      const [savedPrint, savedCut] = await Promise.all([
        AsyncStorage.getItem(KEY_AUTO_PRINT),
        AsyncStorage.getItem(KEY_AUTO_CUT),
      ]);
      if (savedPrint !== null) setAutoPrint(savedPrint === 'true');
      if (savedCut !== null) setAutoCut(savedCut === 'true');
    };
    void load();
  }, []);

  const toggleAutoPrint = useCallback(async (val: boolean) => {
    setAutoPrint(val);
    await AsyncStorage.setItem(KEY_AUTO_PRINT, String(val));
  }, []);

  const toggleAutoCut = useCallback(async (val: boolean) => {
    setAutoCut(val);
    await AsyncStorage.setItem(KEY_AUTO_CUT, String(val));
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.printer')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Printer Status */}
        <SectionTitle title={t('printer.status')} />
        <Card>
          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <View style={[styles.statusDot, { backgroundColor: statusCfg.color }]} />
              <View>
                <Text style={styles.statusLabel}>{t(statusCfg.labelKey)}</Text>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
              </View>
            </View>
            <Ionicons name="print-outline" size={28} color={C.muted} />
          </View>
        </Card>

        {/* Actions */}
        <SectionTitle title={t('printer.actions')} />
        <Card>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => { void testPrint(); }}
            disabled={isPrinting}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="document-text-outline" size={18} color={C.green} />
            </View>
            <Text style={styles.menuLabel}>
              {t('printer.testPrint')}
            </Text>
            {isPrinting ? (
              <ActivityIndicator size="small" color={C.green} />
            ) : (
              <Ionicons name="chevron-forward" size={16} color={C.muted} />
            )}
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => { void checkStatus(); }}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="refresh-outline" size={18} color="#2563EB" />
            </View>
            <Text style={styles.menuLabel}>
              {t('printer.refreshStatus')}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={C.muted} />
          </TouchableOpacity>
        </Card>

        {/* Settings */}
        <SectionTitle title={t('printer.settingsSection')} />
        <Card>
          <View style={styles.menuRow}>
            <View style={[styles.menuIcon, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="print-outline" size={18} color={C.orange} />
            </View>
            <Text style={[styles.menuLabel, styles.menuLabelFlex]}>
              {t('printer.autoPrint')}
            </Text>
            <Switch
              value={autoPrint}
              onValueChange={(v) => { void toggleAutoPrint(v); }}
              trackColor={{ false: C.border, true: C.green }}
              thumbColor={C.white}
            />
          </View>
          <Divider />
          <View style={styles.menuRow}>
            <View style={[styles.menuIcon, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="cut-outline" size={18} color="#7C3AED" />
            </View>
            <Text style={[styles.menuLabel, styles.menuLabelFlex]}>
              {t('printer.autoCut')}
            </Text>
            <Switch
              value={autoCut}
              onValueChange={(v) => { void toggleAutoCut(v); }}
              trackColor={{ false: C.border, true: C.green }}
              thumbColor={C.white}
            />
          </View>
        </Card>

        {/* Info */}
        <SectionTitle title={t('printer.infoSection')} />
        <Card>
          <View style={styles.menuRow}>
            <View style={[styles.menuIcon, { backgroundColor: '#F3F4F6' }]}>
              <Ionicons name="hardware-chip-outline" size={18} color={C.secondary} />
            </View>
            <Text style={[styles.menuLabel, styles.menuLabelFlex]}>
              {t('printer.printerType')}
            </Text>
            <Text style={styles.menuValue}>Sunmi ichki printer</Text>
          </View>
          <Divider />
          <View style={styles.menuRow}>
            <View style={[styles.menuIcon, { backgroundColor: '#F3F4F6' }]}>
              <Ionicons name="resize-outline" size={18} color={C.secondary} />
            </View>
            <Text style={[styles.menuLabel, styles.menuLabelFlex]}>
              {t('printer.paperWidth')}
            </Text>
            <Text style={styles.menuValue}>58mm</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 32, height: 32, justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: C.text, textAlign: 'center' },
  headerSpacer: { width: 32 },
  scroll: { paddingBottom: 40, gap: 8, paddingTop: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: C.muted, letterSpacing: 0.8, textTransform: 'uppercase', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 6 },
  card: { marginHorizontal: 16, backgroundColor: C.white, borderRadius: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: C.border, marginLeft: 52 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16 },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  statusLabel: { fontSize: 16, fontWeight: '600', color: C.text },
  errorText: { fontSize: 12, color: C.red, marginTop: 2 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 12 },
  menuIcon: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: 15, fontWeight: '500', color: C.text },
  menuLabelFlex: { flex: 1 },
  menuValue: { fontSize: 13, color: C.muted },
});
