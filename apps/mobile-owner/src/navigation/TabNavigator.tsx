import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TabParamList } from './types';
import { useAuthStore } from '../store/auth.store';
import { setNavigationRef } from '../notifications/handler';
import {
  canSeeAnalytics,
  canSeeEmployees,
  canSeeSystemHealth,
  canSeeShifts,
  canSeeInventory,
} from '../utils/roles';
import { Colors } from '../config/theme';

import DashboardNavigator from './DashboardNavigator';
import AnalyticsNavigator from './AnalyticsNavigator';
import ShiftsScreen from '../screens/Shifts';
import WarehouseScreen from '../screens/Warehouse';
import EmployeesNavigator from './EmployeesNavigator';
import AlertsScreen from '../screens/Alerts';
import SettingsScreen from '../screens/Settings';
import SystemHealthScreen from '../screens/SystemHealth';

const Tab = createBottomTabNavigator<TabParamList>();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export default function TabNavigator() {
  const { user } = useAuthStore();
  const role = user?.role;
  const navigation = useNavigation();

  useEffect(() => {
    setNavigationRef(navigation as unknown as { navigate: (screen: string, params?: object) => void });
  }, [navigation]);

  function tabIcon(name: IoniconsName) {
    return ({ color, size }: { color: string; size: number }) => (
      <Ionicons name={name} size={size} color={color} />
    );
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          borderTopColor: Colors.border,
          backgroundColor: Colors.bgSurface,
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
      }}
    >
      {/* Dashboard — har doim ko'rinadi */}
      <Tab.Screen
        name="Dashboard"
        component={DashboardNavigator}
        options={{ tabBarIcon: tabIcon('grid-outline'), title: 'DASHBOARD' }}
      />

      {/* Analytics — OWNER, ADMIN, MANAGER (level >= 3) */}
      {canSeeAnalytics(role) && (
        <Tab.Screen
          name="Analytics"
          component={AnalyticsNavigator}
          options={{ tabBarIcon: tabIcon('bar-chart-outline'), title: 'ANALITIKA' }}
        />
      )}

      {/* Shifts — OWNER, ADMIN, MANAGER (level >= 3) */}
      {canSeeShifts(role) && (
        <Tab.Screen
          name="Shifts"
          component={ShiftsScreen}
          options={{ tabBarIcon: tabIcon('time-outline'), title: 'SMENLAR' }}
        />
      )}

      {/* Inventory — OWNER, ADMIN, MANAGER (level >= 3) yoki WAREHOUSE */}
      {canSeeInventory(role) && (
        <Tab.Screen
          name="Inventory"
          component={WarehouseScreen}
          options={{ tabBarIcon: tabIcon('cube-outline'), title: 'OMBOR' }}
        />
      )}

      {/* Employees — OWNER, ADMIN faqat (level >= 4) */}
      {canSeeEmployees(role) && (
        <Tab.Screen
          name="Employees"
          component={EmployeesNavigator}
          options={{ tabBarIcon: tabIcon('people-outline'), title: 'XODIMLAR' }}
        />
      )}

      {/* Settings — har doim ko'rinadi */}
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarIcon: tabIcon('settings-outline'), title: 'SOZLAMALAR' }}
      />

      {/* SystemHealth — OWNER, ADMIN faqat (level >= 4) */}
      {canSeeSystemHealth(role) && (
        <Tab.Screen
          name="SystemHealth"
          component={SystemHealthScreen}
          options={{ tabBarIcon: tabIcon('pulse-outline'), title: 'SISTEMA' }}
        />
      )}

      {/* Hidden tab — faqat header dagi qo'ng'iroq icon orqali navigatsiya */}
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tab.Navigator>
  );
}
