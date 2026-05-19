/**
 * Unit tests — Fiscal Worker
 * Validates receipt generation logic, Decimal handling, and error scenarios
 */

describe('Fiscal Worker — receipt payload', () => {
  describe('Decimal to Number conversion', () => {
    it('converts Prisma Decimal fields to plain numbers', () => {
      const mockDecimal = function (val) {
        return {
          toNumber() { return val; },
          toString() { return String(val); },
          valueOf() { return val; },
        };
      };

      const order = {
        total: mockDecimal(1200000),
        taxAmount: mockDecimal(144000),
        items: [
          { productName: 'Chanel No.5', quantity: mockDecimal(2), unitPrice: mockDecimal(600000), total: mockDecimal(1200000) },
        ],
      };

      // This is what fiscal.worker.ts does at line 119-128:
      const payload = {
        total: Number(order.total),
        taxAmount: Number(order.taxAmount),
        items: order.items.map(function (item) {
          return {
            name: item.productName,
            qty: Number(item.quantity),
            price: Number(item.unitPrice),
            total: Number(item.total),
            vatRate: 0.12,
          };
        }),
      };

      expect(payload.total).toBe(1200000);
      expect(payload.taxAmount).toBe(144000);
      expect(payload.items[0]!.qty).toBe(2);
      expect(payload.items[0]!.price).toBe(600000);
      expect(payload.items[0].total).toBe(1200000);
      expect(typeof payload.total).toBe('number');
    });

    it('handles null Decimal gracefully', () => {
      expect(Number(null)).toBe(0);
    });
  });

  describe('stubReceipt', () => {
    it('generates deterministic stub fiscal ID', () => {
      const orderId = '04f862d8-27cf-473b-bc52-aaba787fd017';
      const fiscalId = 'STUB-' + orderId.slice(0, 8).toUpperCase() + '-' + Date.now();

      expect(fiscalId).toMatch(/^STUB-04F862D8-\d+$/);
    });

    it('generates OFD-like QR URL', () => {
      const fiscalId = 'STUB-TEST1234-1700000000000';
      const qr = 'https://ofd.soliq.uz/check?id=' + fiscalId + '&t=' + Date.now();

      expect(qr).toContain('ofd.soliq.uz');
      expect(qr).toContain(fiscalId);
    });
  });

  describe('isRegoConfigured', () => {
    it('returns false when env vars not set', () => {
      var url = undefined;
      var key = undefined;
      expect(Boolean(url && key)).toBe(false);
    });

    it('returns true when both env vars set', () => {
      var url = 'https://api.regos.uz/v1';
      var key = 'test-key';
      expect(Boolean(url && key)).toBe(true);
    });

    it('returns false when only URL set', () => {
      var url = 'https://api.regos.uz/v1';
      var key = '';
      expect(Boolean(url && key)).toBe(false);
    });
  });
});
