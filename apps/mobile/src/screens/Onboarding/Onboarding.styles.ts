import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  /* Illustration */
  illustrationBg: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  blobLarge: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -50,
    right: -50,
  },
  blobSmall: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    bottom: 10,
    left: 16,
  },
  brand: {
    position: 'absolute',
    top: 56,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 4,
  },
  outerRing: {
    width: 192,
    height: 192,
    borderRadius: 96,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerRing: {
    width: 148,
    height: 148,
    borderRadius: 74,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 70,
  },
  badge: {
    position: 'absolute',
    bottom: 18,
    right: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* Content */
  cardContent: {
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 4,
    backgroundColor: '#ffffff',
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 32,
  },
  slideDesc: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 23,
  },

  /* Bottom bar */
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    gap: 14,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dotActive: {
    width: 28,
    height: 8,
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  dotInactive: {
    width: 8,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },

  /* Buttons */
  btnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    alignItems: 'center',
  },
  backBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563EB',
  },
  backPlaceholder: {
    width: 52,
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  nextArrow: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  skipText: {
    color: '#9ca3af',
    fontSize: 15,
  },
  skipAbsolute: {
    position: 'absolute',
    top: 52,
    right: 20,
    zIndex: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
});

export default styles;
