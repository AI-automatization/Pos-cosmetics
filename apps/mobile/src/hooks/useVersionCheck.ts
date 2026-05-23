import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import api from '../api/client';

export interface VersionStatus {
  readonly needsUpdate: boolean;
  readonly currentVersion: string;
  readonly minVersion: string | null;
  readonly storeUrl: string | null;
}

const STORE_URLS = {
  ios: 'https://apps.apple.com/app/raos/id000000000', // TODO: real App Store ID
  android: 'https://play.google.com/store/apps/details?id=uz.raos.mobile',
} as const;

/** Semver solishtirish: a < b bo'lsa true */
function isVersionLessThan(a: string, b: string): boolean {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na < nb) return true;
    if (na > nb) return false;
  }
  return false;
}

export function useVersionCheck(): VersionStatus {
  const currentVersion = Constants.expoConfig?.version ?? '0.0.0';
  const [status, setStatus] = useState<VersionStatus>({
    needsUpdate: false,
    currentVersion,
    minVersion: null,
    storeUrl: null,
  });

  useEffect(() => {
    if (__DEV__) return;

    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get<{ minVersion: string }>('/app/min-version');
        if (cancelled) return;

        const needs = isVersionLessThan(currentVersion, data.minVersion);
        setStatus({
          needsUpdate: needs,
          currentVersion,
          minVersion: data.minVersion,
          storeUrl: Platform.OS === 'ios' ? STORE_URLS.ios : STORE_URLS.android,
        });
      } catch {
        // Endpoint mavjud bo'lmasa yoki xato — xavfsiz davom etish
      }
    })();

    return () => { cancelled = true; };
  }, [currentVersion]);

  return status;
}
