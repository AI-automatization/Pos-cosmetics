import {
  initializeSslPinning,
  addSslPinningErrorListener,
} from 'react-native-ssl-public-key-pinning';

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
  if (__DEV__) return; // Dev da localhost/emulator — SSL yo'q

  await initializeSslPinning({
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
  const subscription = addSslPinningErrorListener((error) => {
    // Production da error tracking ga yuborish kerak
    // reportError('ssl_pinning_failure', { hostname: error.serverHostname });
    void error;
  });

  return () => subscription.remove();
}
