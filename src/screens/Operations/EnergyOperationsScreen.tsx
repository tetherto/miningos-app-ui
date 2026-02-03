/**
 * Energy Operations Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

import { Card, StatCard } from '@/components';
import { COLOR } from '@/theme/colors';

export const EnergyOperationsScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Energy Operations</Text>

      {/* Energy Stats */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Power"
          value="4.4"
          unit="MW"
          icon="flash"
          iconColor={COLOR.GRASS_GREEN}
          style={styles.statCard}
        />
        <StatCard
          title="PUE"
          value="1.08"
          unit=""
          icon="speedometer"
          iconColor={COLOR.LIGHT_BLUE}
          style={styles.statCard}
        />
      </View>

      {/* Cabinet Overview */}
      <Card title="LV Cabinets" subtitle="Power Distribution Units" style={styles.card}>
        {['LV-A1', 'LV-A2', 'LV-B1', 'LV-B2'].map((cabinet, index) => (
          <View key={cabinet} style={styles.cabinetRow}>
            <View style={styles.cabinetInfo}>
              <Text style={styles.cabinetName}>{cabinet}</Text>
              <Text style={styles.cabinetStatus}>Active</Text>
            </View>
            <View style={styles.cabinetStats}>
              <Text style={styles.cabinetValue}>1.1 MW</Text>
              <Text style={styles.cabinetVoltage}>480V</Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Energy Efficiency */}
      <Card title="Energy Efficiency" style={styles.card}>
        <View style={styles.efficiencyContainer}>
          <View style={styles.efficiencyItem}>
            <Text style={styles.efficiencyLabel}>Avg Efficiency</Text>
            <Text style={styles.efficiencyValue}>28.5 J/TH</Text>
          </View>
          <View style={styles.efficiencyItem}>
            <Text style={styles.efficiencyLabel}>Cost per kWh</Text>
            <Text style={styles.efficiencyValue}>$0.042</Text>
          </View>
          <View style={styles.efficiencyItem}>
            <Text style={styles.efficiencyLabel}>Daily Cost</Text>
            <Text style={styles.efficiencyValue}>$4,435</Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR.BLACK,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLOR.WHITE,
    fontFamily: 'Inter-Bold',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: -6,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
  },
  card: {
    marginBottom: 16,
  },
  cabinetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.WHITE_ALPHA_01,
  },
  cabinetInfo: {
    flex: 1,
  },
  cabinetName: {
    color: COLOR.WHITE,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  cabinetStatus: {
    color: COLOR.GRASS_GREEN,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  cabinetStats: {
    alignItems: 'flex-end',
  },
  cabinetValue: {
    color: COLOR.COLD_ORANGE,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'JetBrainsMono-SemiBold',
  },
  cabinetVoltage: {
    color: COLOR.DARK_GREY,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  efficiencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  efficiencyItem: {
    alignItems: 'center',
  },
  efficiencyLabel: {
    color: COLOR.DARK_GREY,
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  efficiencyValue: {
    color: COLOR.WHITE,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'JetBrainsMono-SemiBold',
  },
});
