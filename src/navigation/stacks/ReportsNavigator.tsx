/**
 * Reports Stack Navigator
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ReportsHomeScreen } from '@/screens/Reports/ReportsHomeScreen';
import { OperationsDashboardScreen } from '@/screens/Reports/OperationsDashboardScreen';
import { HashrateReportScreen } from '@/screens/Reports/HashrateReportScreen';
import { EnergyReportScreen } from '@/screens/Reports/EnergyReportScreen';
import { MinersReportScreen } from '@/screens/Reports/MinersReportScreen';
import { EfficiencyReportScreen } from '@/screens/Reports/EfficiencyReportScreen';
import { RevenueSummaryScreen } from '@/screens/Reports/RevenueSummaryScreen';
import { CostSummaryScreen } from '@/screens/Reports/CostSummaryScreen';
import { EBITDAScreen } from '@/screens/Reports/EBITDAScreen';
import { SubsidyFeeScreen } from '@/screens/Reports/SubsidyFeeScreen';
import { EnergyRevenueScreen } from '@/screens/Reports/EnergyRevenueScreen';
import { HashBalanceScreen } from '@/screens/Reports/HashBalanceScreen';
import { CostInputScreen } from '@/screens/Reports/CostInputScreen';
import { EnergyBalanceScreen } from '@/screens/Reports/EnergyBalanceScreen';
import { Header } from '@/components/Header/Header';
import type { ReportsTabParamList } from '../types';
import { COLOR } from '@/theme/colors';

const Stack = createNativeStackNavigator<ReportsTabParamList>();

export const ReportsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <Header {...props} />,
        contentStyle: { backgroundColor: COLOR.BLACK },
      }}
    >
      <Stack.Screen
        name="ReportsHome"
        component={ReportsHomeScreen}
        options={{ title: 'Reports' }}
      />
      <Stack.Screen
        name="OperationsDashboard"
        component={OperationsDashboardScreen}
        options={{ title: 'Operations Dashboard' }}
      />
      <Stack.Screen
        name="HashrateReport"
        component={HashrateReportScreen}
        options={{ title: 'Hashrate Report' }}
      />
      <Stack.Screen
        name="EnergyReport"
        component={EnergyReportScreen}
        options={{ title: 'Energy Report' }}
      />
      <Stack.Screen
        name="MinersReport"
        component={MinersReportScreen}
        options={{ title: 'Miners Report' }}
      />
      <Stack.Screen
        name="EfficiencyReport"
        component={EfficiencyReportScreen}
        options={{ title: 'Efficiency Report' }}
      />
      <Stack.Screen
        name="RevenueSummary"
        component={RevenueSummaryScreen}
        options={{ title: 'Revenue Summary' }}
      />
      <Stack.Screen
        name="CostSummary"
        component={CostSummaryScreen}
        options={{ title: 'Cost Summary' }}
      />
      <Stack.Screen
        name="EBITDA"
        component={EBITDAScreen}
        options={{ title: 'EBITDA' }}
      />
      <Stack.Screen
        name="SubsidyFee"
        component={SubsidyFeeScreen}
        options={{ title: 'Subsidy Fee' }}
      />
      <Stack.Screen
        name="EnergyRevenue"
        component={EnergyRevenueScreen}
        options={{ title: 'Energy Revenue' }}
      />
      <Stack.Screen
        name="HashBalance"
        component={HashBalanceScreen}
        options={{ title: 'Hash Balance' }}
      />
      <Stack.Screen
        name="CostInput"
        component={CostInputScreen}
        options={{ title: 'Cost Input' }}
      />
      <Stack.Screen
        name="EnergyBalance"
        component={EnergyBalanceScreen}
        options={{ title: 'Energy Balance' }}
      />
    </Stack.Navigator>
  );
};
