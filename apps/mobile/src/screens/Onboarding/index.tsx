import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  StatusBar,
  type ListRenderItem,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { useAppStore } from '@/store/app.store';

export const ONBOARDING_KEY = 'onboarding_completed';

interface Slide {
  id: string;
  icon: string;
  titleKey: string;
  descKey: string;
  accent: string;
  softBg: string;
  circleBg: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    icon: '🏪',
    titleKey: 'onboarding.slide1Title',
    descKey: 'onboarding.slide1Desc',
    accent: '#1a56db',
    softBg: '#dbeafe',
    circleBg: '#bfdbfe',
  },
  {
    id: '2',
    icon: '💰',
    titleKey: 'onboarding.slide2Title',
    descKey: 'onboarding.slide2Desc',
    accent: '#059669',
    softBg: '#d1fae5',
    circleBg: '#a7f3d0',
  },
  {
    id: '3',
    icon: '🔔',
    titleKey: 'onboarding.slide3Title',
    descKey: 'onboarding.slide3Desc',
    accent: '#d97706',
    softBg: '#fef3c7',
    circleBg: '#fde68a',
  },
];

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

async function markDone(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
}

export default function OnboardingScreen({ navigation: _navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { width: W, height: H } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);
  const [idx, setIdx] = useState(0);
  const { setOnboardingDone } = useAppStore();

  const isLast = idx === SLIDES.length - 1;
  const ILLUS_H = H * 0.60;

  const finish = (): void => {
    void markDone().then(() => setOnboardingDone(true));
  };

  const next = (): void => {
    if (isLast) { finish(); return; }
    const n = idx + 1;
    listRef.current?.scrollToIndex({ index: n, animated: true });
    setIdx(n);
  };

  const back = (): void => {
    if (idx === 0) return;
    const p = idx - 1;
    listRef.current?.scrollToIndex({ index: p, animated: true });
    setIdx(p);
  };

  const renderSlide: ListRenderItem<Slide> = ({ item }) => (
    <View style={{ width: W }}>
      {/* Coloured illustration area */}
      <View style={[styles.illustrationBg, { backgroundColor: item.softBg, height: ILLUS_H }]}>
        {/* Decorative blobs */}
        <View style={[styles.blobLarge, { backgroundColor: item.accent + '18' }]} />
        <View style={[styles.blobSmall, { backgroundColor: item.accent + '28' }]} />

        {/* Brand */}
        <Text style={[styles.brand, { color: item.accent }]}>RAOS</Text>

        {/* Icon rings */}
        <View style={[styles.outerRing, { backgroundColor: item.circleBg + '80' }]}>
          <View style={[styles.innerRing, { backgroundColor: item.circleBg }]}>
            <Text style={styles.emojiText}>{item.icon}</Text>
          </View>
        </View>

        {/* Slide number badge */}
        <View style={[styles.badge, { backgroundColor: item.accent }]}>
          <Text style={styles.badgeText}>{item.id} / {SLIDES.length}</Text>
        </View>
      </View>

      {/* Text content */}
      <View style={styles.cardContent}>
        <Text style={styles.slideTitle}>{t(item.titleKey)}</Text>
        <Text style={styles.slideDesc}>{t(item.descKey)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {!isLast && (
        <TouchableOpacity
          onPress={finish}
          accessibilityRole="button"
          style={styles.skipAbsolute}
        >
          <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
        </TouchableOpacity>
      )}

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled
        onMomentumScrollEnd={(e) => {
          setIdx(Math.round(e.nativeEvent.contentOffset.x / W));
        }}
        getItemLayout={(_d, i) => ({ length: W, offset: W * i, index: i })}
        onScrollToIndexFailed={() => undefined}
      />

      {/* Fixed bottom controls */}
      <View style={styles.bottomBar}>
        {/* Animated dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === idx
                  ? { width: 28, height: 8, backgroundColor: '#2563EB', borderRadius: 4 }
                  : { width: 8, height: 8, backgroundColor: '#E5E7EB', borderRadius: 4 },
              ]}
            />
          ))}
        </View>

        {/* Back + Next row */}
        <View style={styles.btnRow}>
          {idx > 0 ? (
            <TouchableOpacity
              style={[styles.backBtn, { borderColor: '#2563EB' }]}
              onPress={back}
              accessibilityRole="button"
            >
              <Text style={[styles.backArrow, { color: '#2563EB' }]}>←</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backPlaceholder} />
          )}

          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: isLast ? '#16A34A' : '#2563EB' }]}
            onPress={next}
            accessibilityRole="button"
            testID="onboarding-next-btn"
          >
            <Text style={styles.nextText}>
              {isLast ? t('onboarding.getStarted') : t('onboarding.next')}
            </Text>
            <Text style={styles.nextArrow}>{isLast ? ' ✓' : ' →'}</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  /* Illustration */
  illustrationBg: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  blobLarge: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -50,
    right: -50,
  },
  blobSmall: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    bottom: 10,
    left: 16,
  },
  brand: {
    position: 'absolute',
    top: 56,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 4,
  },
  outerRing: {
    width: 192,
    height: 192,
    borderRadius: 96,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerRing: {
    width: 148,
    height: 148,
    borderRadius: 74,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 70,
  },
  badge: {
    position: 'absolute',
    bottom: 18,
    right: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* Content */
  cardContent: {
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 4,
    backgroundColor: '#ffffff',
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 32,
  },
  slideDesc: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 23,
  },

  /* Bottom bar */
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    gap: 14,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {},

  /* Buttons */
  btnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    alignItems: 'center',
  },
  backBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 20,
    fontWeight: '700',
  },
  backPlaceholder: {
    width: 52,
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  nextArrow: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  skipBtn: {
    minHeight: 32,
    justifyContent: 'center',
  },
  skipText: {
    color: '#9ca3af',
    fontSize: 15,
  },
  skipAbsolute: {
    position: 'absolute',
    top: 52,
    right: 20,
    zIndex: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
});
