export interface Slide {
  readonly id: string;
  readonly icon: string;
  readonly titleKey: string;
  readonly descKey: string;
  readonly accent: string;
  readonly softBg: string;
  readonly circleBg: string;
}

export const SLIDES: readonly Slide[] = [
  {
    id: '1',
    icon: '\uD83C\uDFEA',
    titleKey: 'onboarding.slide1Title',
    descKey: 'onboarding.slide1Desc',
    accent: '#1a56db',
    softBg: '#dbeafe',
    circleBg: '#bfdbfe',
  },
  {
    id: '2',
    icon: '\uD83D\uDCB0',
    titleKey: 'onboarding.slide2Title',
    descKey: 'onboarding.slide2Desc',
    accent: '#059669',
    softBg: '#d1fae5',
    circleBg: '#a7f3d0',
  },
  {
    id: '3',
    icon: '\uD83D\uDD14',
    titleKey: 'onboarding.slide3Title',
    descKey: 'onboarding.slide3Desc',
    accent: '#d97706',
    softBg: '#fef3c7',
    circleBg: '#fde68a',
  },
];
