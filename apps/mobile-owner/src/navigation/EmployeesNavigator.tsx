import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EmployeesStackParamList } from './types';
import HRScreen from '../screens/HR';
import EmployeeDetailScreen from '../screens/Employees/EmployeeDetailScreen';
import AddEmployeeScreen from '../screens/Employees/AddEmployeeScreen';

const Stack = createNativeStackNavigator<EmployeesStackParamList>();

export default function EmployeesNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EmployeeList" component={HRScreen} />
      <Stack.Screen name="EmployeeDetail" component={EmployeeDetailScreen} />
      <Stack.Screen name="AddEmployee" component={AddEmployeeScreen} />
    </Stack.Navigator>
  );
}
