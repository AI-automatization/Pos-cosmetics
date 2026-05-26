import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import './i18n';
import { useAuthStore } from './store/auth.store';
import { useShiftStore } from './store/shiftStore';
import RootNavigator from './navigation/RootNavigator';
import linking from './navigation/linking';
import { useNotifications } from './hooks/useNotifications';
import { useSecurityCheck } from './hooks/useSecurityCheck';
import { useVersionCheck } from './hooks/useVersionCheck';
import { setupSslPinning, registerSslPinningErrorListener } from './lib/sslPinning';
import CompromisedDeviceScreen from './screens/Auth/CompromisedDeviceScreen';
import ForceUpdateScreen from './screens/Auth/ForceUpdateScreen';
import OfflineBanner from './components/common/OfflineBanner';
import ErrorBoundary from './components/common/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
    },
  },
});

function AppContent() {
  const [ready, setReady] = useState(false);
  const security = useSecurityCheck();
  const versionStatus = useVersionCheck();

  useNotifications();

  useEffect(() => {
    setupSslPinning()
      .then(() => useAuthStore.getState().loadFromStorage())
      .then(() => useShiftStore.getState().syncWithApi())
      .finally(() => setReady(true));

    const unsubscribe = registerSslPinningErrorListener();
    return unsubscribe;
  }, []);

  if (security.isCompromised) {
    return <CompromisedDeviceScreen reason={security.reason} />;
  }

  if (versionStatus.needsUpdate) {
    return (
      <ForceUpdateScreen
        currentVersion={versionStatus.currentVersion}
        minVersion={versionStatus.minVersion}
        storeUrl={versionStatus.storeUrl}
      />
    );
  }

  if (!ready) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <StatusBar style="dark" />
      <OfflineBanner />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
});
