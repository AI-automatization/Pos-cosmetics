/** Uzbekistan bank reference for POS terminal configuration */
export const UZ_BANKS = [
  { id: 'xalq', name: 'Xalq banki', commission: 1.0 },
  { id: 'ipoteka', name: 'Ipoteka-bank', commission: 1.0 },
  { id: 'asaka', name: 'Asaka bank', commission: 0.8 },
  { id: 'kapital', name: 'Kapitalbank', commission: 1.2 },
  { id: 'davr', name: 'Davr bank', commission: 1.0 },
  { id: 'hamkor', name: 'Hamkorbank', commission: 1.0 },
  { id: 'orient', name: 'Orient Finans bank', commission: 1.5 },
  { id: 'uzpromstroy', name: 'Uzpromstroybank', commission: 1.0 },
  { id: 'aloqa', name: 'Aloqa bank', commission: 1.0 },
  { id: 'infin', name: 'InfinBank', commission: 1.2 },
  { id: 'tbc', name: 'TBC Bank', commission: 1.5 },
  { id: 'anor', name: 'Anor bank', commission: 1.0 },
  { id: 'nbu', name: 'Milliy bank (NBU)', commission: 0.8 },
  { id: 'other', name: 'Boshqa', commission: 1.0 },
] as const;

export type UzBankId = (typeof UZ_BANKS)[number]['id'];

export const CARD_TYPES = ['UZCARD', 'HUMO', 'VISA', 'MASTERCARD'] as const;
export type CardType = (typeof CARD_TYPES)[number];
