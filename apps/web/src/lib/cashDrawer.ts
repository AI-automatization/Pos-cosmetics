// Cash drawer control utility
// ESC/POS: DLE EOT 1 — drawer kick sequence

const LS_KEY = 'raos_printer_settings';

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

/**
 * Open cash drawer.
 * - network mode: POST to local printer proxy (localhost:6543/drawer)
 * - browser/usb mode: simulated (toast shown by caller)
 * Returns true if a real command was sent, false if simulated.
 */
export async function openCashDrawer(): Promise<boolean> {
  const settings = getPrinterSettings();
  if (!settings?.enabled || !settings.openDrawerOnCash) return false;

  if (settings.connection === 'network' && settings.networkIp) {
    try {
      // ESC/POS drawer kick bytes: DLE(0x10) EOT(0x14) 01 00 05
      const url = `http://${settings.networkIp}:${settings.networkPort || '6543'}/drawer`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'kick' }),
        signal: AbortSignal.timeout(1500),
      });
      return true;
    } catch {
      // Silently fail — drawer command is best-effort
      return false;
    }
  }

  // browser/usb mode: simulated — caller shows toast
  return false;
}

/** Check if cash drawer is configured and enabled */
export function isCashDrawerEnabled(): boolean {
  const settings = getPrinterSettings();
  return !!(settings?.enabled && settings.openDrawerOnCash);
}
