// Cash drawer control utility
// ESC/POS drawer kick command bytes
// Standard: ESC p 0 25 250 (pulse pin 2, 50ms on, 500ms off)
// Alternative: DLE EOT 1 (status request that some drawers interpret as kick)

const LS_KEY = 'raos_printer_settings';

// ESC p m t1 t2 — Epson standard drawer kick command
// m=0 (pin 2), t1=25 (50ms on), t2=250 (500ms off)
const DRAWER_KICK_BYTES = new Uint8Array([0x1b, 0x70, 0x00, 0x19, 0xfa]);

// Fallback: DLE EOT 1 — some Chinese printers use this
const DRAWER_KICK_ALT = new Uint8Array([0x10, 0x14, 0x01, 0x00, 0x05]);

interface PrinterSettings {
  enabled: boolean;
  openDrawerOnCash: boolean;
  connection: 'usb' | 'network' | 'browser';
  networkIp: string;
  networkPort: string;
}

function getPrinterSettings(): PrinterSettings | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ─── Cached USB serial port (persists across calls within session) ───────────

let cachedSerialPort: SerialPort | null = null;

/**
 * Send raw bytes to a Web Serial port.
 * Reuses the last paired port if available, otherwise prompts user to select.
 */
async function sendViaWebSerial(data: Uint8Array): Promise<boolean> {
  if (!('serial' in navigator)) return false;

  try {
    // Try to reuse a previously granted port
    if (!cachedSerialPort) {
      const ports = await navigator.serial.getPorts();
      cachedSerialPort = ports[0] ?? null;
    }

    // If no port cached, ask user to pick one (requires user gesture)
    if (!cachedSerialPort) {
      cachedSerialPort = await navigator.serial.requestPort();
    }

    // Open if not already open
    if (!cachedSerialPort.writable) {
      await cachedSerialPort.open({ baudRate: 9600 });
    }

    const writer = cachedSerialPort.writable!.getWriter();
    try {
      await writer.write(data);
      // Send both command variants for maximum compatibility
      await writer.write(DRAWER_KICK_ALT);
    } finally {
      writer.releaseLock();
    }
    return true;
  } catch {
    // User cancelled dialog or port error — reset cache
    cachedSerialPort = null;
    return false;
  }
}

/**
 * Open cash drawer via direct browser printing.
 * Creates an invisible iframe with raw ESC/POS data encoded as text,
 * then triggers window.print. Works as a last-resort fallback.
 */
function sendViaBrowserPrint(): boolean {
  try {
    // Create a hidden iframe with ESC/POS raw bytes as content
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument;
    if (!doc) { document.body.removeChild(iframe); return false; }

    // Write ESC/POS command as raw binary string
    const raw = String.fromCharCode(...DRAWER_KICK_BYTES);
    doc.open();
    doc.write(`<pre style="font-family:monospace;font-size:1px;color:transparent">${raw}</pre>`);
    doc.close();

    iframe.contentWindow?.print();

    setTimeout(() => document.body.removeChild(iframe), 2000);
    return true;
  } catch {
    return false;
  }
}

/**
 * Open cash drawer.
 * - network: POST to local printer proxy with ESC/POS command
 * - usb: Web Serial API — direct ESC/POS bytes to USB printer
 * - browser: fallback via window.print with ESC/POS payload
 * Returns true if a real command was sent.
 */
export async function openCashDrawer(): Promise<boolean> {
  const settings = getPrinterSettings();
  if (!settings?.enabled || !settings.openDrawerOnCash) return false;

  if (settings.connection === 'network' && settings.networkIp) {
    try {
      const url = `http://${settings.networkIp}:${settings.networkPort || '6543'}/drawer`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'kick' }),
        signal: AbortSignal.timeout(1500),
      });
      return true;
    } catch {
      return false;
    }
  }

  if (settings.connection === 'usb') {
    return sendViaWebSerial(DRAWER_KICK_BYTES);
  }

  if (settings.connection === 'browser') {
    return sendViaBrowserPrint();
  }

  return false;
}

/** Check if cash drawer is configured and enabled */
export function isCashDrawerEnabled(): boolean {
  const settings = getPrinterSettings();
  return !!(settings?.enabled && settings.openDrawerOnCash);
}
