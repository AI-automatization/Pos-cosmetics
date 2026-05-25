import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { MoreStackParamList } from './types';
import MoreMenuScreen from '../screens/MoreMenu';
import KirimScreen from '../screens/Kirim';
import OmborScreen from '../screens/Ombor';
import SettingsScreen from '../screens/Settings';
import BranchesScreen from '../screens/Settings/BranchesScreen';
import AuditLogScreen from '../screens/Settings/AuditLogScreen';
import CustomersScreen from '../screens/Customers/CustomersScreen';
import CustomerDetailScreen from '../screens/Customers/CustomerDetailScreen';
import PromotionsScreen from '../screens/Promotions/PromotionsScreen';
import UsersScreen from '../screens/Settings/UsersScreen';
import LowStockScreen from '../screens/Inventory/LowStockList';
import SuppliersScreen from '../screens/Catalog/SuppliersScreen';
import SystemHealthScreen from '../screens/SystemHealth/SystemHealthScreen';
import DebtsScreen from '../screens/Debts';
import ShiftsOwnerScreen from '../screens/ShiftsOwner';
import StockOutScreen from '../screens/StockOut';
import StockTransferScreen from '../screens/StockTransfer';
import TransferListScreen from '../screens/StockTransfer/TransferListScreen';
import ExpiryScreen from '../screens/Expiry';
import StockMovementsScreen from '../screens/StockMovements';
import SalesOrdersScreen from '../screens/SalesOrders';
import SalesReturnsScreen from '../screens/SalesReturns';
import ChegirmaScreen from '../screens/Chegirmalar/ChegirmaScreen';
import BillingScreen from '../screens/Billing/BillingScreen';
import TasksScreen from '../screens/Tasks/TasksScreen';
import TesterScreen from '../screens/Ombor/TesterScreen';
import IncomingTransfersScreen from '../screens/IncomingTransfers/IncomingTransfersScreen';
import PrinterScreen from '../screens/Settings/PrinterScreen';

const MoreStack = createNativeStackNavigator<MoreStackParamList>();

const HIDDEN = { headerShown: false } as const;

export default function MoreNavigator(): React.JSX.Element {
  return (
    <MoreStack.Navigator screenOptions={{ headerShown: false }}>
      <MoreStack.Screen name="MoreMenu" component={MoreMenuScreen} />
      <MoreStack.Screen name="KirimScreen" component={KirimScreen} />
      <MoreStack.Screen name="OmborScreen" component={OmborScreen} />
      <MoreStack.Screen name="SettingsScreen" component={SettingsScreen} />
      <MoreStack.Screen name="BranchesScreen" component={BranchesScreen} />
      <MoreStack.Screen name="AuditLogScreen" component={AuditLogScreen} />
      <MoreStack.Screen name="CustomersScreen" component={CustomersScreen} options={HIDDEN} />
      <MoreStack.Screen name="CustomerDetail" component={CustomerDetailScreen} options={HIDDEN} />
      <MoreStack.Screen name="PromotionsScreen" component={PromotionsScreen} options={HIDDEN} />
      <MoreStack.Screen name="UsersScreen" component={UsersScreen} options={HIDDEN} />
      <MoreStack.Screen name="LowStockList" component={LowStockScreen} options={HIDDEN} />
      <MoreStack.Screen name="SuppliersScreen" component={SuppliersScreen} options={HIDDEN} />
      <MoreStack.Screen name="SystemHealthScreen" component={SystemHealthScreen} options={HIDDEN} />
      <MoreStack.Screen name="DebtsScreen" component={DebtsScreen} options={HIDDEN} />
      <MoreStack.Screen name="ShiftsOwnerScreen" component={ShiftsOwnerScreen} options={HIDDEN} />
      <MoreStack.Screen name="StockOutScreen" component={StockOutScreen} options={HIDDEN} />
      <MoreStack.Screen name="TransferScreen" component={StockTransferScreen} options={HIDDEN} />
      <MoreStack.Screen name="TransferListScreen" component={TransferListScreen} options={HIDDEN} />
      <MoreStack.Screen name="ExpiryScreen" component={ExpiryScreen} options={HIDDEN} />
      <MoreStack.Screen name="StockMovementsScreen" component={StockMovementsScreen} options={HIDDEN} />
      <MoreStack.Screen name="SalesOrdersScreen" component={SalesOrdersScreen} options={HIDDEN} />
      <MoreStack.Screen name="SalesReturnsScreen" component={SalesReturnsScreen} options={HIDDEN} />
      <MoreStack.Screen name="ChegirmaScreen" component={ChegirmaScreen} options={HIDDEN} />
      <MoreStack.Screen name="BillingScreen" component={BillingScreen} options={HIDDEN} />
      <MoreStack.Screen name="TasksScreen" component={TasksScreen} options={HIDDEN} />
      <MoreStack.Screen name="TesterScreen" component={TesterScreen} options={HIDDEN} />
      <MoreStack.Screen name="IncomingTransfersScreen" component={IncomingTransfersScreen} options={HIDDEN} />
      <MoreStack.Screen name="PrinterScreen" component={PrinterScreen} options={HIDDEN} />
    </MoreStack.Navigator>
  );
}
