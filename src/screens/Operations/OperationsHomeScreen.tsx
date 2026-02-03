/**
 * Operations Home Screen
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Card } from '@/components';
import { COLOR } from '@/theme/colors';
import type { OperationsTabScreenProps } from '@/navigation/types';

interface MenuItemProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  color?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  color = COLOR.COLD_ORANGE,
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
      <Icon name={icon} size={24} color={color} />
    </View>
    <View style={styles.menuTextContainer}>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuSubtitle}>{subtitle}</Text>
    </View>
    <Icon name="chevron-right" size={24} color={COLOR.DARK_GREY} />
  </TouchableOpacity>
);

export const OperationsHomeScreen: React.FC = () => {
  const navigation = useNavigation<OperationsTabScreenProps<'OperationsHome'>['navigation']>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Operations</Text>

      {/* Mining Section */}
      <Card title="Mining" style={styles.card}>
        <MenuItem
          icon="cube-scan"
          title="Mining Explorer"
          subtitle="Browse devices and containers"
          onPress={() => navigation.navigate('MiningExplorer', { tab: 'container' })}
        />
        <MenuItem
          icon="view-grid"
          title="Container Widgets"
          subtitle="Overview of all containers"
          onPress={() => navigation.navigate('ContainerWidgets')}
        />
        <MenuItem
          icon="chart-timeline-variant"
          title="Container Charts"
          subtitle="Historical container data"
          onPress={() => navigation.navigate('ContainerCharts')}
          color={COLOR.LIGHT_BLUE}
        />
      </Card>

      {/* Energy Section */}
      <Card title="Energy" style={styles.card}>
        <MenuItem
          icon="flash"
          title="Energy Operations"
          subtitle="Power distribution and cabinets"
          onPress={() => navigation.navigate('EnergyOperations')}
          color={COLOR.GRASS_GREEN}
        />
      </Card>

      {/* Quick Stats */}
      <Card title="Quick Stats" style={styles.card}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>48</Text>
            <Text style={styles.statLabel}>Containers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12,845</Text>
            <Text style={styles.statLabel}>Miners</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>98.2%</Text>
            <Text style={styles.statLabel}>Uptime</Text>
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
  card: {
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.WHITE_ALPHA_01,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    color: COLOR.WHITE,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  menuSubtitle: {
    color: COLOR.DARK_GREY,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: COLOR.COLD_ORANGE,
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'JetBrainsMono-Bold',
  },
  statLabel: {
    color: COLOR.DARK_GREY,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
});
