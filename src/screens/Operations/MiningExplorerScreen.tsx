/**
 * Mining Explorer Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Card, Spinner } from '@/components';
import { COLOR } from '@/theme/colors';

interface Container {
  id: string;
  name: string;
  status: 'online' | 'warning' | 'offline';
  miners: number;
  hashrate: string;
  power: string;
}

const mockContainers: Container[] = [
  { id: '1', name: 'Container A1', status: 'online', miners: 268, hashrate: '5.4 PH/s', power: '92 kW' },
  { id: '2', name: 'Container A2', status: 'online', miners: 265, hashrate: '5.3 PH/s', power: '90 kW' },
  { id: '3', name: 'Container A3', status: 'warning', miners: 260, hashrate: '5.0 PH/s', power: '88 kW' },
  { id: '4', name: 'Container B1', status: 'online', miners: 270, hashrate: '5.5 PH/s', power: '94 kW' },
  { id: '5', name: 'Container B2', status: 'offline', miners: 0, hashrate: '0 PH/s', power: '0 kW' },
  { id: '6', name: 'Container C1', status: 'online', miners: 268, hashrate: '5.4 PH/s', power: '91 kW' },
];

const getStatusColor = (status: Container['status']) => {
  switch (status) {
    case 'online':
      return COLOR.GRASS_GREEN;
    case 'warning':
      return COLOR.YELLOW;
    case 'offline':
      return COLOR.BRICK_RED;
    default:
      return COLOR.DARK_GREY;
  }
};

const ContainerItem: React.FC<{ container: Container; onPress: () => void }> = ({
  container,
  onPress,
}) => (
  <TouchableOpacity style={styles.containerItem} onPress={onPress}>
    <View style={styles.containerHeader}>
      <View style={[styles.statusDot, { backgroundColor: getStatusColor(container.status) }]} />
      <Text style={styles.containerName}>{container.name}</Text>
      <Text style={[styles.statusText, { color: getStatusColor(container.status) }]}>
        {container.status.charAt(0).toUpperCase() + container.status.slice(1)}
      </Text>
    </View>
    <View style={styles.containerStats}>
      <View style={styles.stat}>
        <Icon name="chip" size={16} color={COLOR.DARK_GREY} />
        <Text style={styles.statValue}>{container.miners}</Text>
      </View>
      <View style={styles.stat}>
        <Icon name="chart-line" size={16} color={COLOR.DARK_GREY} />
        <Text style={styles.statValue}>{container.hashrate}</Text>
      </View>
      <View style={styles.stat}>
        <Icon name="flash" size={16} color={COLOR.DARK_GREY} />
        <Text style={styles.statValue}>{container.power}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export const MiningExplorerScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'container' | 'miner'>('container');

  const filteredContainers = mockContainers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={COLOR.DARK_GREY} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search containers or miners..."
          placeholderTextColor={COLOR.DARK_GREY}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'container' && styles.activeTab]}
          onPress={() => setSelectedTab('container')}
        >
          <Text style={[styles.tabText, selectedTab === 'container' && styles.activeTabText]}>
            Containers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'miner' && styles.activeTab]}
          onPress={() => setSelectedTab('miner')}
        >
          <Text style={[styles.tabText, selectedTab === 'miner' && styles.activeTabText]}>
            Miners
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>48</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: COLOR.GRASS_GREEN }]}>45</Text>
          <Text style={styles.summaryLabel}>Online</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: COLOR.YELLOW }]}>2</Text>
          <Text style={styles.summaryLabel}>Warning</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: COLOR.BRICK_RED }]}>1</Text>
          <Text style={styles.summaryLabel}>Offline</Text>
        </View>
      </View>

      {/* Container List */}
      <FlatList
        data={filteredContainers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContainerItem container={item} onPress={() => {}} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR.BLACK,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOR.OBSIDIAN,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.WHITE_ALPHA_01,
  },
  searchInput: {
    flex: 1,
    color: COLOR.WHITE,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    paddingVertical: 12,
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: COLOR.OBSIDIAN,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: COLOR.COLD_ORANGE,
  },
  tabText: {
    color: COLOR.DARK_GREY,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  activeTabText: {
    color: COLOR.WHITE,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: COLOR.OBSIDIAN,
    borderRadius: 12,
    padding: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    color: COLOR.WHITE,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'JetBrainsMono-Bold',
  },
  summaryLabel: {
    color: COLOR.DARK_GREY,
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  containerItem: {
    backgroundColor: COLOR.OBSIDIAN,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLOR.WHITE_ALPHA_01,
  },
  containerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  containerName: {
    flex: 1,
    color: COLOR.WHITE,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  containerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    color: COLOR.WHITE,
    fontSize: 14,
    fontFamily: 'JetBrainsMono-Regular',
    marginLeft: 6,
  },
});
