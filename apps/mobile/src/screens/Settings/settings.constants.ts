// ─── Colors ────────────────────────────────────────────
export const C = {
  bg:        '#F9FAFB',
  white:     '#FFFFFF',
  text:      '#111827',
  muted:     '#9CA3AF',
  secondary: '#6B7280',
  border:    '#E5E7EB',
  primary:   '#2563EB',
  red:       '#DC2626',
} as const;

// ─── Constants ─────────────────────────────────────────
export const ROLE_LABELS: Record<string, string> = {
  ADMIN:   'Administrator',
  CASHIER: 'Kassir',
  MANAGER: 'Menejer',
  OWNER:   'Egasi',
};

export const LANGUAGES = [
  { value: 'uz', label: "O'zbek" },
  { value: 'ru', label: 'Рус' },
  { value: 'en', label: 'EN' },
] as const;

export type ThemeOption = 'light' | 'dark' | 'system';

export const THEMES: Array<{ value: ThemeOption; label: string }> = [
  { value: 'light',  label: "Yorug'" },
  { value: 'dark',   label: "Qorong'u" },
  { value: 'system', label: 'Tizim' },
];

export const AUTO_LOCK_OPTIONS: Array<{ minutes: 15 | 30 | 60; label: string }> = [
  { minutes: 15, label: '15 daqiqa' },
  { minutes: 30, label: '30 daqiqa' },
  { minutes: 60, label: '1 soat' },
];
