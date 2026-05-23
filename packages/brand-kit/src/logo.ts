/**
 * RAOS Logo asset paths within the monorepo.
 *
 * Source canonical: Desktop/screenshots/RAOS/Final-Logo-2026-05-18/
 * (Real-ESRGAN 4x AI-upscaled master)
 *
 * Generated via Pillow LANCZOS downsample (see scripts/upscale_logo.py).
 */

export const raosLogoPaths = {
  // Web (apps/web)
  webIconSvg:        '/icon.svg',
  webIconPng:        '/icon.png',
  webAppleTouch:     '/apple-touch-icon.png',
  webFaviconIco:     '/favicon.ico',
  webFavicon16:      '/favicon-16x16.png',
  webFavicon32:      '/favicon-32x32.png',
  webAndroid192:     '/android-chrome-192x192.png',
  webAndroid512:     '/android-chrome-512x512.png',
  webOgImage:        '/opengraph-image.png',
  webTwitterImage:   '/twitter-image.png',
  webManifest:       '/manifest.json',

  // Mobile (apps/mobile)
  mobileIcon:           './src/assets/icon.png',
  mobileAdaptiveIcon:   './src/assets/adaptive-icon.png',
  mobileNotification:   './src/assets/notification-icon.png',
  mobileSplash:         './src/assets/splash.png',

  // iOS native (apps/mobile/ios/RAOS)
  iosAppIcon1024: 'Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png',

  // Mobile-owner (apps/mobile-owner)
  mobileOwnerIcon:           './assets/icon.png',
  mobileOwnerAdaptive:       './assets/adaptive-icon.png',
  mobileOwnerSplash:         './assets/splash-icon.png',
} as const;

/**
 * Inline SVG of the R favicon — useful for emails, embeds, or CSS data-URI.
 * Mirrors apps/web/src/app/icon.svg.
 */
export const raosLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#112F4B"/><stop offset="100%" stop-color="#0E1530"/></linearGradient><linearGradient id="r" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stop-color="#5FEEFB"/><stop offset="100%" stop-color="#0FA8C8"/></linearGradient></defs><rect width="32" height="32" rx="7" fill="url(#bg)"/><text x="16" y="23" font-family="Inter,system-ui,Arial,sans-serif" font-size="20" font-weight="900" fill="url(#r)" text-anchor="middle">R</text></svg>`;
