/**
 * Reports Home Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Card } from '@/components';
import { COLOR } from '@/theme/colors';

interface ReportItemProps {
  icon: string;
  title: string;
  onPress: () => void;
  color?: string;
}

const ReportItem: React.FC<ReportItemProps> = ({ icon, title, onPress, color = COLOR.COLD_ORANGE }) => (
  <TouchableOpacity style={styles.reportItem} onPress={onPress}>
    <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
      <Icon name={icon} size={20} color={color} />
    </View>
    <Text style={styles.reportTitle}>{title}</Text>
    <Icon name="chevron-right" size={20} color={COLOR.DARK_GREY} />
  </TouchableOpacity>
);

export const ReportsHomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Reports</Text>

      <Card title="Operations Reports" style={styles.card}>
        <ReportItem icon="view-dashboard" title="Operations Dashboard" onPress={() => navigation.navigate('OperationsDashboard')} />
        <ReportItem icon="chart-line" title="Hashrate Report" onPress={() => navigation.navigate('HashrateReport')} color={COLOR.LIGHT_BLUE} />
        <ReportItem icon="flash" title="Energy Report" onPress={() => navigation.navigate('EnergyReport')} color={COLOR.GRASS_GREEN} />
        <ReportItem icon="chip" title="Miners Report" onPress={() => navigation.navigate('MinersReport')} color={COLOR.YELLOW} />
        <ReportItem icon="speedometer" title="Efficiency Report" onPress={() => navigation.navigate('EfficiencyReport')} color={COLOR.PURPLE_HIGH} />
      </Card>

      <Card title="Financial Reports" style={styles.card}>
        <ReportItem icon="currency-usd" title="Revenue Summary" onPress={() => navigation.navigate('RevenueSummary')} color={COLOR.GRASS_GREEN} />
        <ReportItem icon="cash-minus" title="Cost Summary" onPress={() => navigation.navigate('CostSummary')} color={COLOR.BRICK_RED} />
        <ReportItem icon="chart-bar" title="EBITDA" onPress={() => navigation.navigate('EBITDA')} color={COLOR.COLD_ORANGE} />
        <ReportItem icon="file-document" title="Subsidy Fee" onPress={() => navigation.navigate('SubsidyFee')} />
        <ReportItem icon="lightning-bolt" title="Energy Revenue" onPress={() => navigation.navigate('EnergyRevenue')} color={COLOR.LIGHT_BLUE} />
        <ReportItem icon="scale-balance" title="Hash Balance" onPress={() => navigation.navigate('HashBalance')} color={COLOR.YELLOW} />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLOR.BLACK },
  scrollContent: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLOR.WHITE, fontFamily: 'Inter-Bold', marginBottom: 20 },
  card: { marginBottom: 16 },
  reportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.WHITE_ALPHA_01,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reportTitle: {
    flex: 1,
    color: COLOR.WHITE,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});
