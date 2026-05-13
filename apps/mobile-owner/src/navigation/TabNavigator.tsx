import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TabParamList } from './types';
import { useAlertsStore } from '../store/alerts.store';
import { useAuthStore } from '../store/auth.store';
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

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: Colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: Colors.textWhite,
    fontSize: 10,
    fontWeight: '700',
  },
});

function AlertsBellTabIcon({ color, size }: { color: string; size: number }) {
  const unreadCount = useAlertsStore((s) => s.unreadCount);
  return (
    <View>
      <Ionicons name="notifications-outline" size={size} color={color} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : String(unreadCount)}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabNavigator() {
  const { user } = useAuthStore();
  const role = user?.role;

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
