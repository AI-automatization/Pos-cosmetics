import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import Badge from '@/components/common/Badge';
import Card from '@/components/common/Card';
import ErrorView from '@/components/common/ErrorView';
import EmptyState from '@/components/common/EmptyState';
import { Text } from 'react-native';

describe('Badge', () => {
  it('renders label', () => {
    render(<Badge label="HIGH" variant="error" />);
    expect(screen.getByText('HIGH')).toBeTruthy();
  });

  it('renders all variants without crash', () => {
    const variants = ['success', 'error', 'warning', 'info'] as const;
    variants.forEach((variant) => {
      const { unmount } = render(<Badge label={variant} variant={variant} />);
      expect(screen.getByText(variant)).toBeTruthy();
      unmount();
    });
  });
});

describe('Card', () => {
  it('renders children', () => {
    render(
      <Card>
        <Text>Test content</Text>
      </Card>,
    );
    expect(screen.getByText('Test content')).toBeTruthy();
  });
});

describe('ErrorView', () => {
  it('renders error message and retry button', () => {
    const onRetry = jest.fn();
    render(<ErrorView error={new Error('Test error')} onRetry={onRetry} />);
    expect(screen.getByText('Test error')).toBeTruthy();
  });

  it('calls onRetry when button pressed', () => {
    const onRetry = jest.fn();
    render(<ErrorView error={new Error('fail')} onRetry={onRetry} />);
    fireEvent.press(screen.getByText('Qayta urinish'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('EmptyState', () => {
  it('renders message and icon', () => {
    render(<EmptyState message="Ma'lumot yo'q" icon="📦" />);
    expect(screen.getByText("Ma'lumot yo'q")).toBeTruthy();
    expect(screen.getByText('📦')).toBeTruthy();
  });
});
