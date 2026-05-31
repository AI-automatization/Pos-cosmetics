import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  StatusBar,
  type ListRenderItem,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { useAppStore } from '@/store/app.store';
import { SLIDES, type Slide } from './onboarding.data';
import SlideItem from './SlideItem';
import BottomControls from './BottomControls';
import styles from './Onboarding.styles';

export const ONBOARDING_KEY = 'onboarding_completed';

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

  const finish = useCallback((): void => {
    void markDone().then(() => setOnboardingDone(true));
  }, [setOnboardingDone]);

  const next = useCallback((): void => {
    if (isLast) { finish(); return; }
    const n = idx + 1;
    listRef.current?.scrollToIndex({ index: n, animated: true });
    setIdx(n);
  }, [idx, isLast, finish]);

  const back = useCallback((): void => {
    if (idx === 0) return;
    const p = idx - 1;
    listRef.current?.scrollToIndex({ index: p, animated: true });
    setIdx(p);
  }, [idx]);

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      setIdx(Math.round(e.nativeEvent.contentOffset.x / W));
    },
    [W],
  );

  const getItemLayout = useCallback(
    (_d: ArrayLike<Slide> | null | undefined, i: number) => ({
      length: W,
      offset: W * i,
      index: i,
    }),
    [W],
  );

  const renderSlide: ListRenderItem<Slide> = useCallback(
    ({ item }) => (
      <SlideItem
        item={item}
        width={W}
        illustrationHeight={ILLUS_H}
        totalSlides={SLIDES.length}
      />
    ),
    [W, ILLUS_H],
  );

  const keyExtractor = useCallback((s: Slide) => s.id, []);

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
        keyExtractor={keyExtractor}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled
        onMomentumScrollEnd={handleScrollEnd}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={() => undefined}
      />

      <BottomControls
        currentIndex={idx}
        totalSlides={SLIDES.length}
        isLast={isLast}
        onBack={back}
        onNext={next}
      />
    </View>
  );
}
