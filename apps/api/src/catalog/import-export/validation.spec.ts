import { validateRow, BARCODE_PATTERN } from '@raos/catalog-import';
import type { ProductImportRow } from '@raos/catalog-import';

const base: ProductImportRow = { name: 'Cream', sku: 'A-1', price: 100 };

describe('validateRow', () => {
  it('accepts a valid row with sku', () => {
    expect(validateRow(base)).toBeNull();
  });

  it('rejects an empty name', () => {
    expect(validateRow({ ...base, name: '  ' })).toMatch(/nomi/);
  });

  it('rejects a negative price', () => {
    expect(validateRow({ ...base, price: -1 })).toMatch(/narx/);
  });

  it('rejects a non-finite price', () => {
    expect(validateRow({ ...base, price: NaN })).toMatch(/narx/);
  });

  it('rejects a row with neither sku nor barcode (validation D)', () => {
    expect(validateRow({ name: 'X', price: 10 })).toMatch(/SKU yoki barkod/);
  });

  it('accepts a row with only a valid barcode', () => {
    expect(validateRow({ name: 'X', price: 10, barcode: '12345678' })).toBeNull();
  });

  it('rejects a malformed barcode (validation A)', () => {
    expect(validateRow({ name: 'X', price: 10, barcode: '1234567890' })).toMatch(/barkod formati/);
  });

  it('accepts EAN-8, UPC-A, EAN-13, ITF-14', () => {
    expect(BARCODE_PATTERN.test('12345678')).toBe(true);
    expect(BARCODE_PATTERN.test('123456789012')).toBe(true);
    expect(BARCODE_PATTERN.test('1234567890123')).toBe(true);
    expect(BARCODE_PATTERN.test('12345678901234')).toBe(true);
    expect(BARCODE_PATTERN.test('123')).toBe(false);
  });
});
