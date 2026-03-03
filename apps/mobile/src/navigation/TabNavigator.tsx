import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';
import type { TabParamList } from './types';
import DashboardScreen from '../screens/Dashboard';
import SalesScreen from '../screens/Sales';
import InventoryScreen from '../screens/Inventory';
import NasiyaScreen from '../screens/Nasiya';

const Tab = createBottomTabNavigator<TabParamList>();

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{icon}</Text>
  );
}

export default function TabNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: { paddingBottom: 4, height: 60 },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: t('dashboard.title'),
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📊" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Sales"
        component={SalesScreen}
        options={{
          tabBarLabel: t('sales.title'),
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🛍️" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarLabel: t('inventory.title'),
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📦" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Nasiya"
        component={NasiyaScreen}
        options={{
          tabBarLabel: t('nasiya.title'),
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="💸" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
