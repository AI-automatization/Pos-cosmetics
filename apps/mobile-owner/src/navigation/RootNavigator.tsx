import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useAuthStore } from '../store/auth.store';
import { useOnboardingStore } from '../store/onboarding.store';
import { useBranchStore } from '../store/branch.store';
import AuthNavigator from './AuthNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, isLoading, checkAuth, setLoading } = useAuthStore();
  const { isComplete, loadPersistedState } = useOnboardingStore();
  const loadPersistedBranch = useBranchStore((s) => s.loadPersistedBranch);

  useEffect(() => {
    // Hard fallback: if loading takes more than 5s, force it off
    const fallback = setTimeout(() => setLoading(false), 5000);
    void (async () => {
      await checkAuth();
      await loadPersistedState();
      await loadPersistedBranch();
      clearTimeout(fallback);
    })();
    return () => clearTimeout(fallback);
  }, [checkAuth, loadPersistedState, loadPersistedBranch, setLoading]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : !isComplete ? (
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      ) : (
        <Stack.Screen name="Main" component={TabNavigator} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});
