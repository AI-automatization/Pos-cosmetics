import { StyleSheet } from 'react-native';

// ─── Colors ────────────────────────────────────────────
export const COLORS = {
  primary: '#2563EB',
  primaryLight: 'rgba(37, 99, 235, 0.1)',
  background: '#F9FAFB',
  white: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  borderFocus: '#2563EB',
  label: '#374151',
};

// ─── Styles ────────────────────────────────────────────
export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
    justifyContent: 'center',
  },

  // ── Logo ──
  logoArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 88,
    height: 88,
    borderRadius: 20,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 3,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // ── Form ──
  form: {
    gap: 0,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.label,
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  forgotText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: COLORS.borderFocus,
    shadowColor: COLORS.borderFocus,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  inputPasswordField: {
    paddingRight: 4,
  },
  eyeButton: {
    paddingLeft: 8,
  },

  // ── Login Button ──
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.65,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Divider ──
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerLabel: {
    marginHorizontal: 12,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
  },

  // ── Biometric ──
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    height: 52,
    gap: 10,
    backgroundColor: COLORS.white,
  },
  biometricText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // ── Register ──
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // ── Language ──
  langRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 10,
  },
  langSep: {
    color: COLORS.border,
    fontSize: 13,
  },
  langText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  langTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // ── Version ──
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 8,
    marginBottom: 8,
  },

  // ── Dev Demo ──
  demoButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 16,
  },
  demoText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
});
