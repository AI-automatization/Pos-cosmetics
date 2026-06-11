import {
  createNavigationContainerRef,
  type NavigatorScreenParams,
} from '@react-navigation/native';
import type { RootStackParamList, TabParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// Cold start: container may not be mounted when a killed app is launched by a
// notification tap. Retry briefly until the navigation tree is ready.
const READY_RETRY_MS = 100;
const READY_MAX_ATTEMPTS = 50; // ~5s ceiling, then give up silently

/**
 * Push tap / deep link target: Main > BoshSahifa > NotificationsScreen.
 * No-ops safely when navigation is not ready OR the user is not authenticated
 * (the `Main` route only exists in the authenticated RootNavigator tree).
 */
export function navigateToNotifications(): void {
  if (!navigationRef.isReady()) return;
  const hasMain = navigationRef.getRootState().routeNames.includes('Main');
  if (!hasMain) return; // unauthenticated -> Auth tree mounted -> no-op
  const tabParams: NavigatorScreenParams<TabParamList> = {
    screen: 'BoshSahifa',
    params: { screen: 'NotificationsScreen' },
  };
  navigationRef.navigate('Main', tabParams);
}

/** Runs an intent once the navigation container is ready (bounded retry). */
export function runWhenReady(intent: () => void, attempt = 0): void {
  if (navigationRef.isReady()) {
    intent();
    return;
  }
  if (attempt >= READY_MAX_ATTEMPTS) return;
  setTimeout(() => runWhenReady(intent, attempt + 1), READY_RETRY_MS);
}
