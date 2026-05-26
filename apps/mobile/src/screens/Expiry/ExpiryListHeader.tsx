// ExpiryListHeader.tsx — filtrlar, tab switcher, qidiruv, banner

import React, { useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './ExpiryColors';
import type { ExpiryTab, DaysFilter } from './ExpiryTypes';

interface ExpiryListHeaderProps {
  readonly tab: ExpiryTab;
  readonly onTabChange: (tab: ExpiryTab) => void;
  readonly daysFilter: DaysFilter;
  readonly onDaysChange: (days: DaysFilter) => void;
  readonly search: string;
  readonly onSearchChange: (v: string) => void;
  readonly expiringCount: number;
  readonly expiredCount: number;
  readonly resultCount: number;
}

const DAYS_OPTIONS: DaysFilter[] = [30, 60, 90];

export const ExpiryListHeader = React.memo(function ExpiryListHeader({
  tab,
  onTabChange,
  daysFilter,
  onDaysChange,
  search,
  onSearchChange,
  expiringCount,
  expiredCount,
  resultCount,
}: ExpiryListHeaderProps) {
  const handleTabExpiring = useCallback(() => onTabChange('EXPIRING'), [onTabChange]);
  const handleTabExpired  = useCallback(() => onTabChange('EXPIRED'), [onTabChange]);

  const handleDays30 = useCallback(() => onDaysChange(30), [onDaysChange]);
  const handleDays60 = useCallback(() => onDaysChange(60), [onDaysChange]);
  const handleDays90 = useCallback(() => onDaysChange(90), [onDaysChange]);

  const daysHandlers: Record<DaysFilter, () => void> = {
    30: handleDays30,
    60: handleDays60,
    90: handleDays90,
  };

  return (
    <View style={styles.container}>
      {expiredCount > 0 && (
        <View style={styles.alertBannerRed}>
          <Ionicons name="warning-outline" size={16} color={C.red} />
          <Text style={styles.alertBannerRedText}>
            {expiredCount} ta mahsulot muddati o'tgan — darhol olib tashlang!
          </Text>
        </View>
      )}

      {expiringCount > 0 && (
        <View style={styles.alertBannerYellow}>
          <Ionicons name="time-outline" size={16} color={C.yellow} />
          <Text style={styles.alertBannerYellowText}>
            {expiringCount} ta mahsulot {daysFilter} kun ichida muddati tugaydi
          </Text>
        </View>
      )}

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'EXPIRING' && styles.tabBtnActive]}
          onPress={handleTabExpiring}
          activeOpacity={0.75}
        >
          <Text style={[styles.tabText, tab === 'EXPIRING' && styles.tabTextActive]}>
            Muddati yaqin
          </Text>
          {expiringCount > 0 && (
            <View style={[styles.tabBadge, tab === 'EXPIRING' && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, tab === 'EXPIRING' && styles.tabBadgeTextActive]}>
                {expiringCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, tab === 'EXPIRED' && styles.tabBtnActiveRed]}
          onPress={handleTabExpired}
          activeOpacity={0.75}
        >
          <Text style={[styles.tabText, tab === 'EXPIRED' && styles.tabTextActiveRed]}>
            Muddati o'tgan
          </Text>
          {expiredCount > 0 && (
            <View style={[styles.tabBadge, tab === 'EXPIRED' && styles.tabBadgeActiveRed]}>
              <Text style={[styles.tabBadgeText, tab === 'EXPIRED' && styles.tabBadgeTextActiveRed]}>
                {expiredCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {tab === 'EXPIRING' && (
        <View style={styles.daysRow}>
          {DAYS_OPTIONS.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.daysBtn, daysFilter === d && styles.daysBtnActive]}
              onPress={daysHandlers[d]}
              activeOpacity={0.75}
            >
              <Text style={[styles.daysBtnText, daysFilter === d && styles.daysBtnTextActive]}>
                {d} kun
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={C.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Mahsulot yoki partiya izlash..."
          placeholderTextColor={C.muted}
          value={search}
          onChangeText={onSearchChange}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => onSearchChange('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color={C.muted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.resultRow}>
        <Text style={styles.resultText}>{resultCount} ta mahsulot</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
  },
  alertBannerRed: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             8,
    backgroundColor: C.redBg,
    marginHorizontal: 16,
    marginBottom:    8,
    paddingHorizontal: 12,
    paddingVertical:   10,
    borderRadius:    10,
    borderWidth:     1,
    borderColor:     C.red + '30',
  },
  alertBannerRedText: {
    flex:       1,
    fontSize:   13,
    fontWeight: '600',
    color:      C.red,
  },
  alertBannerYellow: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             8,
    backgroundColor: C.yellowBg,
    marginHorizontal: 16,
    marginBottom:    8,
    paddingHorizontal: 12,
    paddingVertical:   10,
    borderRadius:    10,
    borderWidth:     1,
    borderColor:     C.yellow + '30',
  },
  alertBannerYellowText: {
    flex:       1,
    fontSize:   13,
    fontWeight: '600',
    color:      C.yellow,
  },
  tabRow: {
    flexDirection:   'row',
    marginHorizontal: 16,
    marginBottom:    12,
    backgroundColor: C.bg,
    borderRadius:    12,
    padding:         4,
    borderWidth:     1,
    borderColor:     C.border,
  },
  tabBtn: {
    flex:           1,
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius:   10,
    gap:            6,
  },
  tabBtnActive: {
    backgroundColor: C.primary,
  },
  tabBtnActiveRed: {
    backgroundColor: C.red,
  },
  tabText: {
    fontSize:   14,
    fontWeight: '600',
    color:      C.secondary,
  },
  tabTextActive: {
    color: C.white,
  },
  tabTextActiveRed: {
    color: C.white,
  },
  tabBadge: {
    backgroundColor:  C.border,
    borderRadius:     10,
    paddingHorizontal: 6,
    paddingVertical:   2,
    minWidth:          20,
    alignItems:        'center',
  },
  tabBadgeActive: {
    backgroundColor: C.white + '30',
  },
  tabBadgeActiveRed: {
    backgroundColor: C.white + '30',
  },
  tabBadgeText: {
    fontSize:   11,
    fontWeight: '700',
    color:      C.secondary,
  },
  tabBadgeTextActive: {
    color: C.white,
  },
  tabBadgeTextActiveRed: {
    color: C.white,
  },
  daysRow: {
    flexDirection:   'row',
    marginHorizontal: 16,
    marginBottom:    12,
    gap:             8,
  },
  daysBtn: {
    paddingHorizontal: 16,
    paddingVertical:   7,
    borderRadius:      8,
    backgroundColor:   C.white,
    borderWidth:       1,
    borderColor:       C.border,
  },
  daysBtnActive: {
    backgroundColor: C.primary + '15',
    borderColor:     C.primary,
  },
  daysBtnText: {
    fontSize:   13,
    fontWeight: '600',
    color:      C.secondary,
  },
  daysBtnTextActive: {
    color: C.primary,
  },
  searchRow: {
    flexDirection:    'row',
    alignItems:       'center',
    marginHorizontal: 16,
    marginBottom:     8,
    backgroundColor:  C.white,
    borderRadius:     10,
    borderWidth:      1,
    borderColor:      C.border,
    paddingHorizontal: 12,
    height:           44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex:     1,
    fontSize: 14,
    color:    C.text,
  },
  resultRow: {
    paddingHorizontal: 16,
    paddingBottom:     8,
  },
  resultText: {
    fontSize: 13,
    color:    C.muted,
  },
});
