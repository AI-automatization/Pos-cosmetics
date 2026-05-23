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
 * Pin hashlarni olish:
 * openssl s_client -servername HOST -connect HOST:443 \
 *   | openssl x509 -pubkey -noout \
 *   | openssl pkey -pubin -outform DER \
 *   | openssl dgst -sha256 -binary \
 *   | openssl enc -base64
 */
export async function setupSslPinning(): Promise<void> {
  if (__DEV__ || !sslModule) return;

  await sslModule.initializeSslPinning({
    [API_HOST]: {
      includeSubdomains: true,
      publicKeyHashes: [
        // TODO: Production deploy oldidan haqiqiy hash bilan almashtirish
        // Leaf certificate hash:
        'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
        // Backup/intermediate certificate hash:
        'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=',
      ],
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
      // Production da error tracking ga yuborish kerak
      // reportError('ssl_pinning_failure', { hostname: error.serverHostname });
      void error;
    });
    return () => subscription.remove();
  } catch {
    // Native module not linked — skip silently
    return () => {};
  }
}
