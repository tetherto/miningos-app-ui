/**
 * Alerts Stack Navigator
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AlertsHomeScreen } from '@/screens/Alerts/AlertsHomeScreen';
import { AlertDetailsScreen } from '@/screens/Alerts/AlertDetailsScreen';
import { Header } from '@/components/Header/Header';
import type { AlertsTabParamList } from '../types';
import { COLOR } from '@/theme/colors';

const Stack = createNativeStackNavigator<AlertsTabParamList>();

export const AlertsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <Header {...props} />,
        contentStyle: { backgroundColor: COLOR.BLACK },
      }}
    >
      <Stack.Screen
        name="AlertsHome"
        component={AlertsHomeScreen}
        options={{ title: 'Alerts' }}
      />
      <Stack.Screen
        name="AlertDetails"
        component={AlertDetailsScreen}
        options={{ title: 'Alert Details' }}
      />
    </Stack.Navigator>
  );
};
