import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import styles from './Onboarding.styles';

interface BottomControlsProps {
  readonly currentIndex: number;
  readonly totalSlides: number;
  readonly isLast: boolean;
  readonly onBack: () => void;
  readonly onNext: () => void;
}

function BottomControls({
  currentIndex,
  totalSlides,
  isLast,
  onBack,
  onNext,
}: BottomControlsProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <View style={styles.bottomBar}>
      {/* Dots indicator */}
      <View style={styles.dotsRow}>
        {Array.from({ length: totalSlides }, (_, i) => (
          <View
            key={i}
            style={i === currentIndex ? styles.dotActive : styles.dotInactive}
          />
        ))}
      </View>

      {/* Back + Next row */}
      <View style={styles.btnRow}>
        {currentIndex > 0 ? (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            accessibilityRole="button"
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}

        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: isLast ? '#16A34A' : '#2563EB' }]}
          onPress={onNext}
          accessibilityRole="button"
          testID="onboarding-next-btn"
        >
          <Text style={styles.nextText}>
            {isLast ? t('onboarding.getStarted') : t('onboarding.next')}
          </Text>
          <Text style={styles.nextArrow}>{isLast ? ' \u2713' : ' \u2192'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default React.memo(BottomControls);
