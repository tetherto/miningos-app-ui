/**
 * Inventory Stack Navigator
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { InventoryDashboardScreen } from '@/screens/Inventory/InventoryDashboardScreen';
import { SparePartsScreen } from '@/screens/Inventory/SparePartsScreen';
import { MinersScreen } from '@/screens/Inventory/MinersScreen';
import { RepairsScreen } from '@/screens/Inventory/RepairsScreen';
import { HistoricalMovementsScreen } from '@/screens/Inventory/HistoricalMovementsScreen';
import { Header } from '@/components/Header/Header';
import type { InventoryTabParamList } from '../types';
import { COLOR } from '@/theme/colors';

const Stack = createNativeStackNavigator<InventoryTabParamList>();

export const InventoryNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <Header {...props} />,
        contentStyle: { backgroundColor: COLOR.BLACK },
      }}
    >
      <Stack.Screen
        name="InventoryDashboard"
        component={InventoryDashboardScreen}
        options={{ title: 'Inventory' }}
      />
      <Stack.Screen
        name="SpareParts"
        component={SparePartsScreen}
        options={{ title: 'Spare Parts' }}
      />
      <Stack.Screen
        name="Miners"
        component={MinersScreen}
        options={{ title: 'Miners' }}
      />
      <Stack.Screen
        name="Repairs"
        component={RepairsScreen}
        options={{ title: 'Repairs' }}
      />
      <Stack.Screen
        name="HistoricalMovements"
        component={HistoricalMovementsScreen}
        options={{ title: 'Historical Movements' }}
      />
    </Stack.Navigator>
  );
};
