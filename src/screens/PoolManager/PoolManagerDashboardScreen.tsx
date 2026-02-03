/**
 * Pool Manager Dashboard Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Card, StatCard } from '@/components';
import { COLOR } from '@/theme/colors';

export const PoolManagerDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Pool Manager</Text>

      <View style={styles.statsGrid}>
        <StatCard title="Active Pools" value="5" icon="water" iconColor={COLOR.LIGHT_BLUE} style={styles.statCard} />
        <StatCard title="Total Workers" value="12,845" icon="account-group" iconColor={COLOR.COLD_ORANGE} style={styles.statCard} />
      </View>

      <Card title="Pool Operations" style={styles.card}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PoolEndpoints')}>
          <Icon name="server-network" size={24} color={COLOR.COLD_ORANGE} />
          <Text style={styles.menuText}>Pool Endpoints</Text>
          <Icon name="chevron-right" size={20} color={COLOR.DARK_GREY} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('SitesOverview')}>
          <Icon name="office-building" size={24} color={COLOR.LIGHT_BLUE} />
          <Text style={styles.menuText}>Sites Overview</Text>
          <Icon name="chevron-right" size={20} color={COLOR.DARK_GREY} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MinerExplorer')}>
          <Icon name="chip" size={24} color={COLOR.GRASS_GREEN} />
          <Text style={styles.menuText}>Miner Explorer</Text>
          <Icon name="chevron-right" size={20} color={COLOR.DARK_GREY} />
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLOR.BLACK },
  scrollContent: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLOR.WHITE, fontFamily: 'Inter-Bold', marginBottom: 20 },
  statsGrid: { flexDirection: 'row', marginHorizontal: -6, marginBottom: 16 },
  statCard: { flex: 1, marginHorizontal: 6 },
  card: { marginBottom: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLOR.WHITE_ALPHA_01 },
  menuText: { flex: 1, color: COLOR.WHITE, fontSize: 16, fontFamily: 'Inter-Medium', marginLeft: 12 },
});
