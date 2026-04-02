// ESC/POS thermal printer utility
// Browser → local proxy (localhost:6543) → TCP printer
// Proxy format: POST /print { ip, port, data: base64 }

const PROXY_URL = 'http://localhost:6543';
const TIMEOUT_MS = 3000;

// ESC/POS command bytes
const ESC = 0x1b;
const GS = 0x1d;
const _LF = 0x0a;
const _CR = 0x0d;

function encode(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function concat(...parts: (Uint8Array | number[])[]): Uint8Array {
  const total = parts.reduce((s, p) => s + p.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    result.set(Array.isArray(part) ? new Uint8Array(part) : part, offset);
    offset += part.length;
  }
  return result;
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

export interface EscPosReceiptData {
  storeName?: string;
  inn?: string;
  address?: string;
  orderNumber?: number | string;
  date?: string;
  cashier?: string;
  items: Array<{ name: string; qty: number; price: number; total: number }>;
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  paymentMethod?: string;
  change?: number;
  footer?: string;
  paperWidth?: 32 | 48; // 58mm=32 chars, 80mm=48 chars
}

/** Build ESC/POS byte sequence for an 80mm receipt */
export function buildEscPosReceipt(data: EscPosReceiptData): Uint8Array {
  const cols = data.paperWidth ?? 48;
  const parts: (Uint8Array | number[])[] = [];

  // Initialize + align center
  parts.push([ESC, 0x40]);               // Init printer
  parts.push([ESC, 0x61, 0x01]);          // Center align

  // Store name (bold)
  if (data.storeName) {
    parts.push([ESC, 0x45, 0x01]);        // Bold on
    parts.push(encode(data.storeName + '\n'));
    parts.push([ESC, 0x45, 0x00]);        // Bold off
  }
  if (data.inn) parts.push(encode(`INN: ${data.inn}\n`));
  if (data.address) parts.push(encode(`${data.address}\n`));

  // Separator
  parts.push(encode('─'.repeat(cols) + '\n'));

  // Left align
  parts.push([ESC, 0x61, 0x00]);

  if (data.orderNumber) parts.push(encode(`Chek #${data.orderNumber}\n`));
  if (data.date) parts.push(encode(`Sana: ${data.date}\n`));
  if (data.cashier) parts.push(encode(`Kassir: ${data.cashier}\n`));

  parts.push(encode('─'.repeat(cols) + '\n'));

  // Items
  for (const item of data.items) {
    const name = item.name.length > cols - 10 ? item.name.slice(0, cols - 10) + '…' : item.name;
    parts.push(encode(name + '\n'));
    const detail = `  ${item.qty} x ${item.price.toLocaleString()}`;
    const totalStr = item.total.toLocaleString();
    const pad = cols - detail.length - totalStr.length;
    parts.push(encode(detail + ' '.repeat(Math.max(1, pad)) + totalStr + '\n'));
  }

  parts.push(encode('─'.repeat(cols) + '\n'));

  // Totals
  const fmt = (label: string, value: string) => {
    const pad = cols - label.length - value.length;
    return label + ' '.repeat(Math.max(1, pad)) + value + '\n';
  };

  parts.push(encode(fmt('Jami:', data.subtotal.toLocaleString())));
  if (data.discount) parts.push(encode(fmt('Chegirma:', `-${data.discount.toLocaleString()}`)));
  if (data.tax) parts.push(encode(fmt('QQS 12%:', data.tax.toLocaleString())));

  // Bold total
  parts.push([ESC, 0x45, 0x01]);
  parts.push(encode(fmt('JAMI:', data.total.toLocaleString() + ' UZS')));
  parts.push([ESC, 0x45, 0x00]);

  if (data.paymentMethod) parts.push(encode(fmt("To'lov:", data.paymentMethod)));
  if (data.change) parts.push(encode(fmt('Qaytim:', data.change.toLocaleString() + ' UZS')));

  parts.push(encode('─'.repeat(cols) + '\n'));

  // Footer — center
  parts.push([ESC, 0x61, 0x01]);
  if (data.footer) {
    parts.push(encode(data.footer + '\n'));
  } else {
    parts.push(encode('Xaridingiz uchun rahmat!\n'));
  }

  // Cut paper
  parts.push([GS, 0x56, 0x42, 0x00]);   // Full cut

  return concat(...parts);
}

/** Send receipt to local proxy → thermal printer via TCP
 *  Returns true on success, false on failure (caller should fallback to window.print)
 */
export async function sendToNetworkPrinter(
  ip: string,
  port: number,
  data: EscPosReceiptData,
): Promise<boolean> {
  try {
    const bytes = buildEscPosReceipt(data);
    const response = await fetch(`${PROXY_URL}/print`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip, port, data: toBase64(bytes) }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/** Check if local proxy is running */
export async function isPrinterProxyAvailable(): Promise<boolean> {
  try {
    const r = await fetch(`${PROXY_URL}/health`, { signal: AbortSignal.timeout(500) });
    return r.ok;
  } catch {
    return false;
  }
}
