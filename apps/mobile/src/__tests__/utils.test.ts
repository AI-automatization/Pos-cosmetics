import { formatCurrency, formatDateTime, formatRelativeTime } from '@/utils/format';
import { extractErrorMessage } from '@/utils/error';

// Normalize various Unicode spaces to regular space for comparison
const normalizeSpaces = (str: string): string => str.replace(/[\u00a0\u202f\u2009]/g, ' ');

describe('formatCurrency', () => {
  it('formats UZS amount with commas', () => {
    const result = normalizeSpaces(formatCurrency(1500000, 'UZS'));
    expect(result).toContain('1 500 000');
  });

  it('uses UZS as default currency', () => {
    const result = normalizeSpaces(formatCurrency(100000));
    expect(result).toContain('100 000');
  });

  it('handles zero amount', () => {
    expect(formatCurrency(0, 'UZS')).toContain('0');
  });
});

describe('extractErrorMessage', () => {
  it('extracts message from Error instance', () => {
    expect(extractErrorMessage(new Error('test error'))).toBe('test error');
  });

  it('returns fallback for unknown error', () => {
    const msg = extractErrorMessage('not an error');
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(0);
  });

  it('handles null/undefined', () => {
    const msg = extractErrorMessage(null);
    expect(typeof msg).toBe('string');
  });
});

describe('formatDateTime', () => {
  it('returns non-empty string for valid date', () => {
    const result = formatDateTime('2026-03-01T10:00:00.000Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('formatRelativeTime', () => {
  it('returns non-empty string for valid date', () => {
    const result = formatRelativeTime(new Date().toISOString());
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
