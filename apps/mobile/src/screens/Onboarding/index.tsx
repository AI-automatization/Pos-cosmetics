import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  type ListRenderItem,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

export const ONBOARDING_KEY = 'onboarding_completed';

interface Slide {
  id: string;
  icon: string;
  titleKey: string;
  descKey: string;
  bgColor: string;
  iconBg: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    icon: '🏪',
    titleKey: 'onboarding.slide1Title',
    descKey: 'onboarding.slide1Desc',
    bgColor: '#eff6ff',
    iconBg: '#dbeafe',
  },
  {
    id: '2',
    icon: '💰',
    titleKey: 'onboarding.slide2Title',
    descKey: 'onboarding.slide2Desc',
    bgColor: '#f0fdf4',
    iconBg: '#dcfce7',
  },
  {
    id: '3',
    icon: '🔔',
    titleKey: 'onboarding.slide3Title',
    descKey: 'onboarding.slide3Desc',
    bgColor: '#fff7ed',
    iconBg: '#ffedd5',
  },
];

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

async function completeOnboarding(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
}

export default function OnboardingScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const flatListRef = useRef<FlatList<Slide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLast = currentIndex === SLIDES.length - 1;

  const goToNext = (): void => {
    if (isLast) {
      void completeOnboarding().then(() => navigation.replace('Auth'));
    } else {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }
  };

  const skip = (): void => {
    void completeOnboarding().then(() => navigation.replace('Auth'));
  };

  const renderSlide: ListRenderItem<Slide> = ({ item }) => (
    <View style={[styles.slide, { width: SCREEN_WIDTH, backgroundColor: item.bgColor }]}>
      <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>
      <Text style={styles.title}>{t(item.titleKey)}</Text>
      <Text style={styles.desc}>{t(item.descKey)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Skip button */}
      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={skip} accessibilityRole="button">
          <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.flatList}
        getItemLayout={(_data, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        onScrollToIndexFailed={() => undefined}
      />

      {/* Bottom area */}
      <View style={styles.bottom}>
        {/* Dot indicators */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex && styles.dotActive]}
            />
          ))}
        </View>

        {/* Next / Get Started button */}
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={goToNext}
          accessibilityRole="button"
          testID="onboarding-next-btn"
        >
          <Text style={styles.nextText}>
            {isLast ? t('onboarding.getStarted') : t('onboarding.next')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  skipBtn: {
    position: 'absolute',
    top: 52,
    right: 24,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  flatList: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  desc: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    gap: 20,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#1a56db',
  },
  nextBtn: {
    backgroundColor: '#1a56db',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    minHeight: 52,
    justifyContent: 'center',
  },
  nextText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});
