import { validateRow, BARCODE_PATTERN, findDuplicateBarcodeIndices, findDuplicateSkuIndices } from '@raos/catalog-import';
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

describe('findDuplicateBarcodeIndices', () => {
  it('flags the 2nd+ occurrence of a barcode, not the first', () => {
    const rows = [
      { name: 'A', price: 1, barcode: '12345678' },
      { name: 'B', price: 1, barcode: '99999999' },
      { name: 'C', price: 1, barcode: '12345678' },
      { name: 'D', price: 1, barcode: '12345678' },
    ];
    const dups = findDuplicateBarcodeIndices(rows);
    expect([...dups].sort()).toEqual([2, 3]);
  });

  it('ignores empty/missing barcodes', () => {
    const rows = [
      { name: 'A', price: 1, sku: 'A-1' },
      { name: 'B', price: 1, barcode: '' },
      { name: 'C', price: 1, sku: 'C-1' },
    ];
    expect(findDuplicateBarcodeIndices(rows).size).toBe(0);
  });
});

describe('findDuplicateSkuIndices', () => {
  it('flags the 2nd+ occurrence of a sku, not the first', () => {
    const rows = [
      { sku: 'A-1' },
      { sku: 'A-1' },
      { sku: 'B' },
    ];
    const dups = findDuplicateSkuIndices(rows);
    expect([...dups]).toEqual([1]);
  });

  it('ignores empty/missing skus', () => {
    const rows = [
      { sku: '' },
      { barcode: '12345678' },
      { sku: '  ' },
    ];
    expect(findDuplicateSkuIndices(rows).size).toBe(0);
  });
});
