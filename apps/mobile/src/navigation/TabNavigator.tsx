import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import type { TabParamList, SavdoStackParamList, MoreStackParamList } from './types';

// Existing screens
import DashboardScreen from '../screens/Dashboard';
import SavdoScreen from '../screens/Savdo';
import SmenaScreen from '../screens/Smena';
import SalesNavigator from './SalesNavigator';
import NasiyaScreen from '../screens/Nasiya';
import KirimScreen from '../screens/Kirim';
import OmborScreen from '../screens/Ombor';
import SettingsScreen from '../screens/Settings';
import MoreMenuScreen from '../screens/MoreMenu';
import BranchesScreen from '../screens/Settings/BranchesScreen';
import AuditLogScreen from '../screens/Settings/AuditLogScreen';

// ─── Colors ───────────────────────────────────────────────
const PRIMARY = '#2563EB';
const INACTIVE = '#9CA3AF';

// ─── Spacing / sizing tokens ──────────────────────────────
const FONT_SM = 11;
const FONT_LG = 20;
const FONT_MD = 14;
const FONT_XL = 48;
const SPACING_4 = 4;
const SPACING_6 = 6;
const SPACING_8 = 8;
const SPACING_16 = 16;
const SPACING_32 = 32;
const TAB_HEIGHT = 60;
const ICON_SIZE = 22;

// ─── Placeholder screens for new tabs ─────────────────────
function CatalogPlaceholder(): React.JSX.Element {
  return (
    <View style={placeholderStyles.container}>
      <Text style={placeholderStyles.emoji}>{'[grid]'}</Text>
      <Text style={placeholderStyles.title}>Katalog</Text>
      <Text style={placeholderStyles.sub}>Tez orada ishga tushadi</Text>
    </View>
  );
}

function FinancePlaceholder(): React.JSX.Element {
  return (
    <View style={placeholderStyles.container}>
      <Text style={placeholderStyles.emoji}>{'[chart]'}</Text>
      <Text style={placeholderStyles.title}>Moliya</Text>
      <Text style={placeholderStyles.sub}>Tez orada ishga tushadi</Text>
    </View>
  );
}


const placeholderStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING_32,
  },
  emoji: {
    fontSize: FONT_XL,
    marginBottom: SPACING_16,
    color: '#6B7280',
  },
  title: {
    fontSize: FONT_LG,
    fontWeight: '700',
    color: '#111827',
    marginBottom: SPACING_8,
  },
  sub: {
    fontSize: FONT_MD,
    color: '#9CA3AF',
  },
});

// ─── Savdo Stack (SavdoMain + nested screens) ──────────────
const SavdoStack = createNativeStackNavigator<SavdoStackParamList>();

function SavdoNavigator(): React.JSX.Element {
  return (
    <SavdoStack.Navigator screenOptions={{ headerShown: false }}>
      <SavdoStack.Screen name="SavdoMain" component={SavdoScreen} />
      <SavdoStack.Screen name="SmenaScreen" component={SmenaScreen} />
      <SavdoStack.Screen name="SalesHistory" component={SalesNavigator} />
      <SavdoStack.Screen name="NasiyaScreen" component={NasiyaScreen} />
    </SavdoStack.Navigator>
  );
}

// ─── Ko'proq Stack (MoreMenu + nested screens) ─────────────
const MoreStack = createNativeStackNavigator<MoreStackParamList>();

function MoreNavigator(): React.JSX.Element {
  return (
    <MoreStack.Navigator screenOptions={{ headerShown: false }}>
      <MoreStack.Screen name="MoreMenu" component={MoreMenuScreen} />
      <MoreStack.Screen name="KirimScreen" component={KirimScreen} />
      <MoreStack.Screen name="OmborScreen" component={OmborScreen} />
      <MoreStack.Screen name="SettingsScreen" component={SettingsScreen} />
      <MoreStack.Screen name="BranchesScreen" component={BranchesScreen} />
      <MoreStack.Screen name="AuditLogScreen" component={AuditLogScreen} />
    </MoreStack.Navigator>
  );
}

// ─── Tab icon helper ───────────────────────────────────────
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon(
  focused: boolean,
  outlineName: IoniconsName,
  filledName: IoniconsName,
  color: string,
): React.JSX.Element {
  return (
    <Ionicons
      name={focused ? filledName : outlineName}
      size={ICON_SIZE}
      color={color}
    />
  );
}

// ─── Bottom Tab Navigator ──────────────────────────────────
const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      {/* Tab 1: Bosh sahifa */}
      <Tab.Screen
        name="BoshSahifa"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Bosh sahifa',
          tabBarIcon: ({ focused, color }) =>
            TabIcon(focused, 'home-outline', 'home', color),
        }}
      />

      {/* Tab 2: Savdo — stack bilan (Smena, Tarix, Nasiya nested) */}
      <Tab.Screen
        name="Savdo"
        component={SavdoNavigator}
        options={{
          tabBarLabel: 'Savdo',
          tabBarIcon: ({ focused, color }) =>
            TabIcon(focused, 'cart-outline', 'cart', color),
        }}
      />

      {/* Tab 3: Katalog — placeholder */}
      <Tab.Screen
        name="Katalog"
        component={CatalogPlaceholder}
        options={{
          tabBarLabel: 'Katalog',
          tabBarIcon: ({ focused, color }) =>
            TabIcon(focused, 'grid-outline', 'grid', color),
        }}
      />

      {/* Tab 4: Moliya — placeholder */}
      <Tab.Screen
        name="Moliya"
        component={FinancePlaceholder}
        options={{
          tabBarLabel: 'Moliya',
          tabBarIcon: ({ focused, color }) =>
            TabIcon(focused, 'trending-up-outline', 'trending-up', color),
        }}
      />

      {/* Tab 5: Ko'proq — stack bilan (Kirim, Ombor, Settings nested) */}
      <Tab.Screen
        name="Koproq"
        component={MoreNavigator}
        options={{
          tabBarLabel: "Ko'proq",
          tabBarIcon: ({ focused, color }) =>
            TabIcon(focused, 'menu-outline', 'menu', color),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: TAB_HEIGHT,
    paddingBottom: SPACING_8,
    paddingTop: SPACING_6,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  tabBarLabel: {
    fontSize: FONT_SM,
    fontWeight: '600',
    marginBottom: SPACING_4,
  },
});
