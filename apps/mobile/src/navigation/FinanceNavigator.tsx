import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { FinanceStackParamList } from './types';
import FinanceScreen from '../screens/Finance/FinanceScreen';
import DailyRevenueScreen from '../screens/Finance/DailyRevenueScreen';
import ExpensesScreen from '../screens/Finance/ExpensesScreen';
import PnLScreen from '../screens/Finance/PnLScreen';
import TopProductsScreen from '../screens/Finance/TopProductsScreen';
import PaymentsHistoryScreen from '../screens/Finance/PaymentsHistoryScreen';
import NasiyaAgingScreen from '../screens/Finance/NasiyaAgingScreen';
import ShiftReportsScreen from '../screens/Finance/ShiftReportsScreen';
import ReportsHubScreen from '../screens/Finance/ReportsHubScreen';
import ExchangeRatesScreen from '../screens/Finance/ExchangeRatesScreen';
import BranchReportsScreen from '../screens/Finance/BranchReportsScreen';
import ReportBuilderScreen from '../screens/Finance/ReportBuilderScreen';
import ExportScreen from '../screens/Finance/ExportScreen';

const FinanceStack = createNativeStackNavigator<FinanceStackParamList>();

export default function FinanceNavigator(): React.JSX.Element {
  return (
    <FinanceStack.Navigator screenOptions={{ headerShown: false }}>
      <FinanceStack.Screen name="FinanceMain" component={FinanceScreen} />
      <FinanceStack.Screen name="DailyRevenue" component={DailyRevenueScreen} />
      <FinanceStack.Screen name="Expenses" component={ExpensesScreen} />
      <FinanceStack.Screen name="PnL" component={PnLScreen} />
      <FinanceStack.Screen name="TopProducts" component={TopProductsScreen} />
      <FinanceStack.Screen name="PaymentsHistory" component={PaymentsHistoryScreen} />
      <FinanceStack.Screen name="NasiyaAging" component={NasiyaAgingScreen} />
      <FinanceStack.Screen name="ShiftReports" component={ShiftReportsScreen} />
      <FinanceStack.Screen name="ReportsHub" component={ReportsHubScreen} />
      <FinanceStack.Screen name="ExchangeRates" component={ExchangeRatesScreen} options={{ headerShown: false }} />
      <FinanceStack.Screen name="BranchReports" component={BranchReportsScreen} options={{ headerShown: false }} />
      <FinanceStack.Screen name="ReportBuilder" component={ReportBuilderScreen} />
      <FinanceStack.Screen name="Export" component={ExportScreen} />
    </FinanceStack.Navigator>
  );
}
