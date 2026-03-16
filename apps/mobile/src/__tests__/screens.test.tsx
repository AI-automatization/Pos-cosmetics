import React from 'react';
import { render, screen } from '@testing-library/react-native';
import TrendCard from '@/screens/AIInsights/TrendCard';
import MiniChart from '@/components/charts/MiniChart';
import BarChart from '@/components/charts/BarChart';
import type { InsightItem } from '@/api/analytics.api';

const mockInsight: InsightItem = {
  id: '1',
  type: 'TREND',
  title: 'Savdo o\'sishi',
  description: 'Bugun savdo 15% ga oshdi',
  priority: 'HIGH',
  createdAt: new Date().toISOString(),
};

describe('TrendCard', () => {
  it('renders title and description', () => {
    render(<TrendCard item={mockInsight} />);
    expect(screen.getByText("Savdo o'sishi")).toBeTruthy();
    expect(screen.getByText('Bugun savdo 15% ga oshdi')).toBeTruthy();
  });

  it('renders priority badge', () => {
    render(<TrendCard item={mockInsight} />);
    expect(screen.getByText('HIGH')).toBeTruthy();
  });

  it('renders TREND emoji', () => {
    render(<TrendCard item={mockInsight} />);
    expect(screen.getByText('📈')).toBeTruthy();
  });

  it('renders DEADSTOCK emoji', () => {
    const item: InsightItem = { ...mockInsight, type: 'DEADSTOCK' };
    render(<TrendCard item={item} />);
    expect(screen.getByText('📦')).toBeTruthy();
  });

  it('renders MARGIN emoji', () => {
    const item: InsightItem = { ...mockInsight, type: 'MARGIN' };
    render(<TrendCard item={item} />);
    expect(screen.getByText('💰')).toBeTruthy();
  });

  it('renders FORECAST emoji', () => {
    const item: InsightItem = { ...mockInsight, type: 'FORECAST' };
    render(<TrendCard item={item} />);
    expect(screen.getByText('🔮')).toBeTruthy();
  });

  it('renders MEDIUM priority badge', () => {
    const item: InsightItem = { ...mockInsight, priority: 'MEDIUM' };
    render(<TrendCard item={item} />);
    expect(screen.getByText('MEDIUM')).toBeTruthy();
  });
});

describe('MiniChart', () => {
  it('renders without crash with valid data', () => {
    expect(() => render(<MiniChart data={[100, 200, 150, 300, 250]} />)).not.toThrow();
  });

  it('renders without crash with empty data', () => {
    expect(() => render(<MiniChart data={[]} />)).not.toThrow();
  });

  it('renders without crash with single value', () => {
    expect(() => render(<MiniChart data={[500]} />)).not.toThrow();
  });

  it('renders without crash with custom color', () => {
    expect(() =>
      render(<MiniChart data={[100, 200]} color="#10b981" height={60} />),
    ).not.toThrow();
  });
});

describe('BarChart', () => {
  const data = [
    { label: 'Yan', value: 100 },
    { label: 'Fev', value: 200 },
    { label: 'Mar', value: 150 },
  ];

  it('renders without crash with valid data', () => {
    expect(() => render(<BarChart data={data} />)).not.toThrow();
  });

  it('renders all labels', () => {
    render(<BarChart data={data} />);
    expect(screen.getByText('Yan')).toBeTruthy();
    expect(screen.getByText('Fev')).toBeTruthy();
    expect(screen.getByText('Mar')).toBeTruthy();
  });

  it('renders formatted values when formatValue provided', () => {
    render(
      <BarChart
        data={[{ label: 'Test', value: 1500000 }]}
        formatValue={(v) => `${v} so'm`}
      />,
    );
    expect(screen.getByText("1500000 so'm")).toBeTruthy();
  });

  it('renders without crash with empty data', () => {
    expect(() => render(<BarChart data={[]} />)).not.toThrow();
  });
});
