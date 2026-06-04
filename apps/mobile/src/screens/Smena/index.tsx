import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { SavdoStackParamList } from '../../navigation/types';
import { C, HistoryCard } from './SmenaComponents';
import { useSmenaData, formatDate } from './useSmenaData';
import ActiveShiftView from './ActiveShiftView';
import NoShiftView from './NoShiftView';
import ShiftFooter from './ShiftFooter';
import SmenaOpenSheet from './SmenaOpenSheet';
import SmenaCloseSheet from './SmenaCloseSheet';
import { styles } from './styles';

// ─── Main Screen ───────────────────────────────────────
export default function SmenaScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SavdoStackParamList>>();
  const {
    isShiftOpen,
    loading,
    shift,
    shiftDetail,
    historyShifts,
    cashierName,
    openSheetVisible,
    closeSheetVisible,
    setOpenSheetVisible,
    setCloseSheetVisible,
    handleToggleShift,
    handleOpenConfirm,
    handleCloseConfirm,
  } = useSmenaData();

  const todayStr = formatDate(new Date());

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        {navigation.canGoBack() && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Orqaga"
          >
            <Ionicons name="arrow-back" size={20} color={C.text} />
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.headerTitle}>Smena</Text>
          <Text style={styles.headerDate}>{todayStr}</Text>
        </View>
        <View style={[styles.statusPill, isShiftOpen ? styles.statusPillActive : styles.statusPillClosed]}>
          <View style={[styles.statusDot, { backgroundColor: isShiftOpen ? C.green : C.muted }]} />
          <Text style={[styles.statusText, { color: isShiftOpen ? C.green : C.muted }]}>
            {isShiftOpen ? 'Faol' : 'Yopilgan'}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {isShiftOpen && shiftDetail && shift ? (
          <ActiveShiftView
            shift={shift}
            shiftDetail={shiftDetail}
            cashierName={cashierName}
          />
        ) : isShiftOpen ? (
          <View style={styles.noShift}>
            <ActivityIndicator size="large" color={C.primary} />
          </View>
        ) : (
          <NoShiftView />
        )}

        {/* Shift history */}
        {historyShifts.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Oxirgi smenalar</Text>
            {historyShifts.map((s) => (
              <HistoryCard key={s.id} shift={s} />
            ))}
          </View>
        )}
      </ScrollView>

      <SmenaOpenSheet
        visible={openSheetVisible}
        loading={loading}
        onClose={() => setOpenSheetVisible(false)}
        onConfirm={handleOpenConfirm}
      />
      <SmenaCloseSheet
        visible={closeSheetVisible}
        loading={loading}
        shift={shift}
        onClose={() => setCloseSheetVisible(false)}
        onConfirm={(cash) => { void handleCloseConfirm(cash); }}
      />

      <ShiftFooter
        isShiftOpen={isShiftOpen}
        loading={loading}
        onPress={handleToggleShift}
      />
    </SafeAreaView>
  );
}
