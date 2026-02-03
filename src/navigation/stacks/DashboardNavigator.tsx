/**
 * Dashboard Stack Navigator
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DashboardScreen } from '@/screens/Dashboard/DashboardScreen';
import { Header } from '@/components/Header/Header';
import type { DashboardTabParamList } from '../types';
import { COLOR } from '@/theme/colors';

const Stack = createNativeStackNavigator<DashboardTabParamList>();

export const DashboardNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <Header {...props} />,
        contentStyle: { backgroundColor: COLOR.BLACK },
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
    </Stack.Navigator>
  );
};
