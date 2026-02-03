/**
 * Settings Stack Navigator
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SettingsDashboardScreen } from '@/screens/Settings/SettingsDashboardScreen';
import { UserManagementScreen } from '@/screens/Settings/UserManagementScreen';
import { Header } from '@/components/Header/Header';
import type { SettingsTabParamList } from '../types';
import { COLOR } from '@/theme/colors';

const Stack = createNativeStackNavigator<SettingsTabParamList>();

export const SettingsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <Header {...props} />,
        contentStyle: { backgroundColor: COLOR.BLACK },
      }}
    >
      <Stack.Screen
        name="SettingsDashboard"
        component={SettingsDashboardScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="UserManagement"
        component={UserManagementScreen}
        options={{ title: 'User Management' }}
      />
    </Stack.Navigator>
  );
};
