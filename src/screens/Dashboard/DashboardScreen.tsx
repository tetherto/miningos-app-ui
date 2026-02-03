/**
 * Dashboard Screen - Main overview of mining operations
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, StatCard, Spinner } from '@/components';
import { LineChart } from '@/components/Charts/LineChart';
import { COLOR, CHART_COLORS } from '@/theme/colors';

const { width } = Dimensions.get('window');

export const DashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  // Mock data for demonstration
  const hashrateData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [
      {
        data: [245, 248, 252, 250, 255, 258],
        color: () => CHART_COLORS.secondaryOrange,
        strokeWidth: 2,
      },
    ],
  };

  const powerData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [
      {
        data: [4.2, 4.3, 4.4, 4.3, 4.5, 4.4],
        color: () => CHART_COLORS.green,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + 20 },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLOR.COLD_ORANGE}
          colors={[COLOR.COLD_ORANGE]}
        />
      }
    >
      <Text style={styles.title}>Dashboard</Text>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Hashrate"
          value="258.5"
          unit="PH/s"
          change={2.34}
          icon="chart-line"
          iconColor={COLOR.COLD_ORANGE}
          style={styles.statCard}
        />
        <StatCard
          title="Power Consumption"
          value="4.4"
          unit="MW"
          change={-1.2}
          icon="flash"
          iconColor={COLOR.GRASS_GREEN}
          style={styles.statCard}
        />
        <StatCard
          title="Active Miners"
          value="12,845"
          unit=""
          change={0.5}
          icon="chip"
          iconColor={COLOR.LIGHT_BLUE}
          style={styles.statCard}
        />
        <StatCard
          title="Efficiency"
          value="28.5"
          unit="J/TH"
          change={-0.8}
          icon="speedometer"
          iconColor={COLOR.YELLOW}
          style={styles.statCard}
        />
      </View>

      {/* Hashrate Chart */}
      <Card title="Hashrate (24h)" style={styles.chartCard}>
        <LineChart
          data={hashrateData}
          width={width - 64}
          height={200}
          yAxisSuffix=" PH/s"
          chartConfig={{
            backgroundColor: COLOR.OBSIDIAN,
            backgroundGradientFrom: COLOR.OBSIDIAN,
            backgroundGradientTo: COLOR.OBSIDIAN,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(247, 147, 26, ${opacity})`,
            labelColor: () => COLOR.DARK_GREY,
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: COLOR.COLD_ORANGE,
            },
          }}
        />
      </Card>

      {/* Power Consumption Chart */}
      <Card title="Power Consumption (24h)" style={styles.chartCard}>
        <LineChart
          data={powerData}
          width={width - 64}
          height={200}
          yAxisSuffix=" MW"
          chartConfig={{
            backgroundColor: COLOR.OBSIDIAN,
            backgroundGradientFrom: COLOR.OBSIDIAN,
            backgroundGradientTo: COLOR.OBSIDIAN,
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
            labelColor: () => COLOR.DARK_GREY,
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: COLOR.GRASS_GREEN,
            },
          }}
        />
      </Card>

      {/* Active Incidents Card */}
      <Card title="Active Incidents" style={styles.incidentsCard}>
        <View style={styles.incidentRow}>
          <View style={[styles.incidentDot, { backgroundColor: COLOR.BRICK_RED }]} />
          <Text style={styles.incidentText}>High Temperature Alert - Container A3</Text>
          <Text style={styles.incidentTime}>2m ago</Text>
        </View>
        <View style={styles.incidentRow}>
          <View style={[styles.incidentDot, { backgroundColor: COLOR.YELLOW }]} />
          <Text style={styles.incidentText}>Low Hashrate - Miner #4521</Text>
          <Text style={styles.incidentTime}>15m ago</Text>
        </View>
        <View style={styles.incidentRow}>
          <View style={[styles.incidentDot, { backgroundColor: COLOR.YELLOW }]} />
          <Text style={styles.incidentText}>Network Latency - Pool 2</Text>
          <Text style={styles.incidentTime}>32m ago</Text>
        </View>
      </Card>

      {/* Miner Status Summary */}
      <Card title="Miner Status" style={styles.statusCard}>
        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Text style={[styles.statusValue, { color: COLOR.GRASS_GREEN }]}>
              12,592
            </Text>
            <Text style={styles.statusLabel}>Online</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={[styles.statusValue, { color: COLOR.YELLOW }]}>
              183
            </Text>
            <Text style={styles.statusLabel}>Warning</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={[styles.statusValue, { color: COLOR.BRICK_RED }]}>
              70
            </Text>
            <Text style={styles.statusLabel}>Offline</Text>
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
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 16,
  },
  statCard: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  chartCard: {
    marginBottom: 16,
  },
  incidentsCard: {
    marginBottom: 16,
  },
  incidentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.WHITE_ALPHA_01,
  },
  incidentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  incidentText: {
    flex: 1,
    color: COLOR.WHITE,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  incidentTime: {
    color: COLOR.DARK_GREY,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  statusCard: {
    marginBottom: 16,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusValue: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'JetBrainsMono-Bold',
  },
  statusLabel: {
    color: COLOR.DARK_GREY,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
});
