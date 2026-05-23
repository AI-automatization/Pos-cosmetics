export interface PrinterSettings {
  enabled: boolean;
  autoPrint: boolean;
  model: string;
  connection: 'usb' | 'network' | 'browser';
  networkIp: string;
  networkPort: string;
  paperWidth: '58' | '80';
  copies: number;
  openDrawerOnCash: boolean;
  storeName: string;
  inn: string;
  address: string;
  footerText: string;
}

export const DEFAULT_PRINTER_SETTINGS: PrinterSettings = {
  enabled: true,
  autoPrint: false,
  model: '',
  connection: 'browser',
  networkIp: '',
  networkPort: '9100',
  paperWidth: '80',
  copies: 1,
  openDrawerOnCash: false,
  storeName: '',
  inn: '',
  address: '',
  footerText: '',
};
