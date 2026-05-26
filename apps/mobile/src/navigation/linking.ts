import { type LinkingOptions, getStateFromPath } from '@react-navigation/native';
import type { RootStackParamList } from './types';

/** Ruxsat berilgan URL prefixlar — boshqalari rad etiladi */
const ALLOWED_PREFIXES: readonly string[] = [
  'raos://',
  'https://raos.uz/app',
  'https://www.raos.uz/app',
];

/** Xavfli URL patternlarni bloklash */
const BLOCKED_PATTERNS: readonly RegExp[] = [
  /javascript:/i,
  /data:/i,
  /vbscript:/i,
  /\.\.\//,
  /%2e%2e/i,
  /\x00/,
  /<script/i,
];

function isPathSafe(path: string): boolean {
  if (!path || path.length > 512) return false;
  return !BLOCKED_PATTERNS.some((p) => p.test(path));
}

/**
 * Deep linking konfiguratsiya — URL whitelist + validation.
 *
 * XAVFSIZLIK QOIDALARI:
 * - Auth ekranlariga deep link TAQIQLANGAN (redirect hijack xavfi)
 * - Finance/Payment ekranlariga deep link TAQIQLANGAN (sensitive data)
 * - Faqat xavfsiz, public navigatsiya ruxsat berilgan
 * - getStateFromPath da path validation — xavfli URL lar rad etiladi
 */
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [...ALLOWED_PREFIXES],

  getStateFromPath(path, options) {
    if (!isPathSafe(path)) return undefined;
    return getStateFromPath(path, options);
  },

  config: {
    screens: {
      // Auth ekranlariga deep link TAQIQLANGAN
      // Finance, Payment, Nasiya ekranlari ham ochilmaydi
      // Faqat xavfsiz yo'naltirishlar:
      SaleDetail: 'sale/:saleId',
      AlertDetail: 'alert/:alertId',
    },
  },
};

export default linking;
