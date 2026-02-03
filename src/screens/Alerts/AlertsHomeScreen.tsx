/**
 * Alerts Home Screen
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Card } from '@/components';
import { COLOR } from '@/theme/colors';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  device: string;
}

const mockAlerts: Alert[] = [
  { id: '1', type: 'critical', title: 'High Temperature', description: 'Temperature exceeded 95°C', timestamp: '2 min ago', device: 'Container A3' },
  { id: '2', type: 'warning', title: 'Low Hashrate', description: 'Hashrate dropped below threshold', timestamp: '15 min ago', device: 'Miner #4521' },
  { id: '3', type: 'warning', title: 'Network Latency', description: 'Pool connection latency high', timestamp: '32 min ago', device: 'Pool 2' },
  { id: '4', type: 'info', title: 'Maintenance Complete', description: 'Scheduled maintenance finished', timestamp: '1 hr ago', device: 'Container B1' },
  { id: '5', type: 'critical', title: 'Power Fluctuation', description: 'Voltage spike detected', timestamp: '2 hr ago', device: 'LV Cabinet A1' },
];

const getAlertColor = (type: Alert['type']) => {
  switch (type) {
    case 'critical': return COLOR.BRICK_RED;
    case 'warning': return COLOR.YELLOW;
    case 'info': return COLOR.LIGHT_BLUE;
    default: return COLOR.DARK_GREY;
  }
};

const getAlertIcon = (type: Alert['type']) => {
  switch (type) {
    case 'critical': return 'alert-circle';
    case 'warning': return 'alert';
    case 'info': return 'information';
    default: return 'bell';
  }
};

export const AlertsHomeScreen: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'current' | 'historical'>('current');

  const renderAlert = ({ item }: { item: Alert }) => (
    <TouchableOpacity style={styles.alertItem}>
      <View style={[styles.alertIcon, { backgroundColor: `${getAlertColor(item.type)}20` }]}>
        <Icon name={getAlertIcon(item.type)} size={20} color={getAlertColor(item.type)} />
      </View>
      <View style={styles.alertContent}>
        <View style={styles.alertHeader}>
          <Text style={styles.alertTitle}>{item.title}</Text>
          <Text style={styles.alertTime}>{item.timestamp}</Text>
        </View>
        <Text style={styles.alertDescription}>{item.description}</Text>
        <Text style={styles.alertDevice}>{item.device}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alerts</Text>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'current' && styles.activeTab]}
          onPress={() => setSelectedTab('current')}
        >
          <Text style={[styles.tabText, selectedTab === 'current' && styles.activeTabText]}>
            Current ({mockAlerts.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'historical' && styles.activeTab]}
          onPress={() => setSelectedTab('historical')}
        >
          <Text style={[styles.tabText, selectedTab === 'historical' && styles.activeTabText]}>
            Historical
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={mockAlerts}
        keyExtractor={(item) => item.id}
        renderItem={renderAlert}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLOR.BLACK, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLOR.WHITE, fontFamily: 'Inter-Bold', marginBottom: 20 },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: COLOR.OBSIDIAN,
    borderRadius: 8,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  activeTab: { backgroundColor: COLOR.COLD_ORANGE },
  tabText: { color: COLOR.DARK_GREY, fontSize: 14, fontFamily: 'Inter-Medium' },
  activeTabText: { color: COLOR.WHITE },
  listContent: { paddingBottom: 20 },
  alertItem: {
    flexDirection: 'row',
    backgroundColor: COLOR.OBSIDIAN,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLOR.WHITE_ALPHA_01,
  },
  alertIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  alertContent: { flex: 1 },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  alertTitle: { color: COLOR.WHITE, fontSize: 14, fontWeight: '600', fontFamily: 'Inter-SemiBold' },
  alertTime: { color: COLOR.DARK_GREY, fontSize: 11, fontFamily: 'Inter-Regular' },
  alertDescription: { color: COLOR.CARD_SUBTITLE_TEXT, fontSize: 12, fontFamily: 'Inter-Regular', marginBottom: 4 },
  alertDevice: { color: COLOR.COLD_ORANGE, fontSize: 11, fontFamily: 'Inter-Medium' },
});
