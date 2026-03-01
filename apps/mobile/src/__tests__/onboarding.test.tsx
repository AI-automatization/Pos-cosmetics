import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import OnboardingScreen from '@/screens/Onboarding';

// AsyncStorage mock
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
}));

const mockReplace = jest.fn();
const mockNavigation = {
  replace: mockReplace,
  navigate: jest.fn(),
  goBack: jest.fn(),
} as never;

describe('OnboardingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders first slide title', () => {
    render(<OnboardingScreen navigation={mockNavigation} />);
    expect(screen.getByText('RAOS ga xush kelibsiz!')).toBeTruthy();
  });

  it('renders first slide description', () => {
    render(<OnboardingScreen navigation={mockNavigation} />);
    expect(
      screen.getByText(
        "O'zbekistondagi retail va investor bizneslari uchun zamonaviy boshqaruv tizimi",
      ),
    ).toBeTruthy();
  });

  it('shows Skip button on first slide', () => {
    render(<OnboardingScreen navigation={mockNavigation} />);
    expect(screen.getByText("O'tkazib yuborish")).toBeTruthy();
  });

  it('shows Next button on first slide', () => {
    render(<OnboardingScreen navigation={mockNavigation} />);
    expect(screen.getByText('Keyingisi')).toBeTruthy();
  });

  it('renders next button with testID', () => {
    render(<OnboardingScreen navigation={mockNavigation} />);
    expect(screen.getByTestId('onboarding-next-btn')).toBeTruthy();
  });

  it('skip navigates to Auth', async () => {
    render(<OnboardingScreen navigation={mockNavigation} />);
    await act(async () => {
      fireEvent.press(screen.getByText("O'tkazib yuborish"));
    });
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('Auth');
    });
  });

  it('Next button advances to slide 2', async () => {
    render(<OnboardingScreen navigation={mockNavigation} />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('onboarding-next-btn'));
    });
    expect(screen.getByText('Sotuvlar va Nasiya')).toBeTruthy();
  });

  it('advances to slide 3', async () => {
    render(<OnboardingScreen navigation={mockNavigation} />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('onboarding-next-btn'));
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('onboarding-next-btn'));
    });
    expect(screen.getByText('Omborxona va Alertlar')).toBeTruthy();
  });

  it('shows GetStarted on last slide', async () => {
    render(<OnboardingScreen navigation={mockNavigation} />);
    await act(async () => { fireEvent.press(screen.getByTestId('onboarding-next-btn')); });
    await act(async () => { fireEvent.press(screen.getByTestId('onboarding-next-btn')); });
    expect(screen.getByText('Boshlash')).toBeTruthy();
  });

  it('GetStarted navigates to Auth', async () => {
    render(<OnboardingScreen navigation={mockNavigation} />);
    await act(async () => { fireEvent.press(screen.getByTestId('onboarding-next-btn')); });
    await act(async () => { fireEvent.press(screen.getByTestId('onboarding-next-btn')); });
    await act(async () => {
      fireEvent.press(screen.getByTestId('onboarding-next-btn'));
    });
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('Auth');
    });
  });

  it('Skip button is hidden on last slide', async () => {
    render(<OnboardingScreen navigation={mockNavigation} />);
    await act(async () => { fireEvent.press(screen.getByTestId('onboarding-next-btn')); });
    await act(async () => { fireEvent.press(screen.getByTestId('onboarding-next-btn')); });
    expect(screen.queryByText("O'tkazib yuborish")).toBeNull();
  });
});
