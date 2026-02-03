/**
 * Operations Stack Navigator
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { OperationsHomeScreen } from '@/screens/Operations/OperationsHomeScreen';
import { MiningExplorerScreen } from '@/screens/Operations/MiningExplorerScreen';
import { EnergyOperationsScreen } from '@/screens/Operations/EnergyOperationsScreen';
import { ContainerWidgetsScreen } from '@/screens/Operations/ContainerWidgetsScreen';
import { ContainerChartsScreen } from '@/screens/Operations/ContainerChartsScreen';
import { CabinetScreen } from '@/screens/Operations/CabinetScreen';
import { ThingScreen } from '@/screens/Operations/ThingScreen';
import { ThingsScreen } from '@/screens/Operations/ThingsScreen';
import { Header } from '@/components/Header/Header';
import type { OperationsTabParamList } from '../types';
import { COLOR } from '@/theme/colors';

const Stack = createNativeStackNavigator<OperationsTabParamList>();

export const OperationsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <Header {...props} />,
        contentStyle: { backgroundColor: COLOR.BLACK },
      }}
    >
      <Stack.Screen
        name="OperationsHome"
        component={OperationsHomeScreen}
        options={{ title: 'Operations' }}
      />
      <Stack.Screen
        name="MiningExplorer"
        component={MiningExplorerScreen}
        options={{ title: 'Mining Explorer' }}
      />
      <Stack.Screen
        name="EnergyOperations"
        component={EnergyOperationsScreen}
        options={{ title: 'Energy Operations' }}
      />
      <Stack.Screen
        name="ContainerWidgets"
        component={ContainerWidgetsScreen}
        options={{ title: 'Container Widgets' }}
      />
      <Stack.Screen
        name="ContainerCharts"
        component={ContainerChartsScreen}
        options={{ title: 'Container Charts' }}
      />
      <Stack.Screen
        name="Cabinet"
        component={CabinetScreen}
        options={{ title: 'Cabinet Details' }}
      />
      <Stack.Screen
        name="Thing"
        component={ThingScreen}
        options={{ title: 'Device Details' }}
      />
      <Stack.Screen
        name="Things"
        component={ThingsScreen}
        options={{ title: 'Devices' }}
      />
    </Stack.Navigator>
  );
};
