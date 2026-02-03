/**
 * Pool Manager Stack Navigator
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { PoolManagerDashboardScreen } from '@/screens/PoolManager/PoolManagerDashboardScreen';
import { PoolEndpointsScreen } from '@/screens/PoolManager/PoolEndpointsScreen';
import { SitesOverviewScreen } from '@/screens/PoolManager/SitesOverviewScreen';
import { SiteOverviewDetailsScreen } from '@/screens/PoolManager/SiteOverviewDetailsScreen';
import { MinerExplorerScreen } from '@/screens/PoolManager/MinerExplorerScreen';
import { Header } from '@/components/Header/Header';
import type { PoolManagerTabParamList } from '../types';
import { COLOR } from '@/theme/colors';

const Stack = createNativeStackNavigator<PoolManagerTabParamList>();

export const PoolManagerNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <Header {...props} />,
        contentStyle: { backgroundColor: COLOR.BLACK },
      }}
    >
      <Stack.Screen
        name="PoolManagerDashboard"
        component={PoolManagerDashboardScreen}
        options={{ title: 'Pool Manager' }}
      />
      <Stack.Screen
        name="PoolEndpoints"
        component={PoolEndpointsScreen}
        options={{ title: 'Pool Endpoints' }}
      />
      <Stack.Screen
        name="SitesOverview"
        component={SitesOverviewScreen}
        options={{ title: 'Sites Overview' }}
      />
      <Stack.Screen
        name="SiteOverviewDetails"
        component={SiteOverviewDetailsScreen}
        options={{ title: 'Site Details' }}
      />
      <Stack.Screen
        name="MinerExplorer"
        component={MinerExplorerScreen}
        options={{ title: 'Miner Explorer' }}
      />
    </Stack.Navigator>
  );
};
