import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import type { TabParamList } from './types';
import SmenaScreen from '../screens/Smena';
import SavdoScreen from '../screens/Savdo';
import SalesNavigator from './SalesNavigator';
import NasiyaScreen from '../screens/Nasiya';
import KirimScreen from '../screens/Kirim';
import SettingsScreen from '../screens/Settings';

const Tab = createBottomTabNavigator<TabParamList>();

const PRIMARY = '#5B5BD6';
const INACTIVE = '#9CA3AF';

export default function TabNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={SmenaScreen}
        options={{
          tabBarLabel: 'Smena',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'time' : 'time-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Savdo"
        component={SavdoScreen}
        options={{
          tabBarLabel: t('savdo.title'),
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'cart' : 'cart-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="SavdoTarixi"
        component={SalesNavigator}
        options={{
          tabBarLabel: 'Tarix',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'receipt' : 'receipt-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Nasiya"
        component={NasiyaScreen}
        options={{
          tabBarLabel: 'Nasiya',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'card' : 'card-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Kirim"
        component={KirimScreen}
        options={{
          tabBarLabel: t('kirim.title'),
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'archive' : 'archive-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: t('settings.title'),
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
