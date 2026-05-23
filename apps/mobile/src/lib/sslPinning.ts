// Safe dynamic import — native module may not be available in dev client
let sslModule: {
  initializeSslPinning: (config: Record<string, { includeSubdomains: boolean; publicKeyHashes: string[] }>) => Promise<void>;
  addSslPinningErrorListener: (cb: (error: { serverHostname: string }) => void) => { remove: () => void };
} | null = null;

try {
  sslModule = require('react-native-ssl-public-key-pinning');
} catch {
  // Not available in dev client
}

const API_HOST = process.env.EXPO_PUBLIC_API_HOST ?? 'api.raos.uz';

/**
 * SSL Certificate Pinning — MITM himoyasi
 *
 * Pin hashlarni yangilash (sertifikat almashganda):
 * openssl s_client -servername api.raos.uz -connect api.raos.uz:443 \
 *   | openssl x509 -pubkey -noout \
 *   | openssl pkey -pubin -outform DER \
 *   | openssl dgst -sha256 -binary \
 *   | openssl enc -base64
 *
 * Intermediate hash uchun: -showcerts flag + ikkinchi sertifikatni ajratish
 */

// Env orqali override qilish mumkin (sertifikat rotatsiyasida)
const SSL_PIN_LEAF =
  process.env.EXPO_PUBLIC_SSL_PIN_LEAF ??
  'hbqVMvQWHIEJaLCQ5o43DS3BKKT3BHkkuLOw9DcWWyQ=';

const SSL_PIN_INTERMEDIATE =
  process.env.EXPO_PUBLIC_SSL_PIN_INTERMEDIATE ??
  'y7xVm0TVJNahMr2sZydE2jQH8SquXV9yLF9seROHHHU=';

const PLACEHOLDER_PATTERN = /^[A-B]+=$/;

export async function setupSslPinning(): Promise<void> {
  if (__DEV__ || !sslModule) return;

  // Placeholder hash bilan production ga chiqishni oldini olish
  if (PLACEHOLDER_PATTERN.test(SSL_PIN_LEAF) || PLACEHOLDER_PATTERN.test(SSL_PIN_INTERMEDIATE)) {
    throw new Error('SSL pinning: placeholder hash detected — real hashes required for production');
  }

  await sslModule.initializeSslPinning({
    [API_HOST]: {
      includeSubdomains: true,
      publicKeyHashes: [SSL_PIN_LEAF, SSL_PIN_INTERMEDIATE],
    },
  });
}

/**
 * SSL pinning xatoliklarini tinglash.
 * Qaytarilgan cleanup funksiyani useEffect da ishlatish mumkin.
 */
export function registerSslPinningErrorListener(): () => void {
  if (__DEV__ || !sslModule) return () => {};

  try {
    const subscription = sslModule.addSslPinningErrorListener((error) => {
      // POST /api/v1/logs/client-error ga yuborish
      fetch(`https://${API_HOST}/api/v1/logs/client-error`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'mobile',
          error: `SSL pinning failure: ${error.serverHostname}`,
          url: error.serverHostname,
        }),
      }).catch(() => { /* network failure — kutilgan holat */ });
    });
    return () => subscription.remove();
  } catch {
    // Native module not linked — skip silently
    return () => {};
  }
}
