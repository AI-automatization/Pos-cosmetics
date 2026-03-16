import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useOnboardingStore } from '../../store/onboarding.store';
import { ONBOARDING_STEPS_COUNT } from '../../config/constants';
import WelcomeStep from './steps/WelcomeStep';
import MonitorStep from './steps/MonitorStep';
import BranchStep from './steps/BranchStep';
import AlertsStep from './steps/AlertsStep';
import AnalyticsStep from './steps/AnalyticsStep';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radii, Shadows } from '../../config/theme';

const STEPS = [WelcomeStep, MonitorStep, BranchStep, AlertsStep, AnalyticsStep];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { currentStep, nextStep, completeOnboarding } = useOnboardingStore();

  const isLast = currentStep === ONBOARDING_STEPS_COUNT - 1;
  const StepComponent = STEPS[currentStep] ?? WelcomeStep;

  function handleNext() {
    if (isLast) {
      completeOnboarding();
    } else {
      nextStep();
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <StepComponent />
      </View>

      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {Array.from({ length: ONBOARDING_STEPS_COUNT }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentStep ? styles.dotActive : styles.dotInactive]}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.85}>
        <Text style={styles.buttonText}>
          {isLast ? t('common.getStarted') : t('common.next')}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgSurface,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: Radii.pill,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: Colors.border,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.lg,
    paddingVertical: 15,
    alignItems: 'center',
    ...Shadows.card,
  },
  buttonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
});
