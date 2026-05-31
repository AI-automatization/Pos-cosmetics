import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Slide } from './onboarding.data';
import styles from './Onboarding.styles';

interface SlideItemProps {
  readonly item: Slide;
  readonly width: number;
  readonly illustrationHeight: number;
  readonly totalSlides: number;
}

function SlideItem({ item, width, illustrationHeight, totalSlides }: SlideItemProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <View style={{ width }}>
      {/* Coloured illustration area */}
      <View style={[styles.illustrationBg, { backgroundColor: item.softBg, height: illustrationHeight }]}>
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
          <Text style={styles.badgeText}>{item.id} / {totalSlides}</Text>
        </View>
      </View>

      {/* Text content */}
      <View style={styles.cardContent}>
        <Text style={styles.slideTitle}>{t(item.titleKey)}</Text>
        <Text style={styles.slideDesc}>{t(item.descKey)}</Text>
      </View>
    </View>
  );
}

export default React.memo(SlideItem);
