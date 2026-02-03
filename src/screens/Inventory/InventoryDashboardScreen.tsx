/**
 * Inventory Dashboard Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Card, StatCard } from '@/components';
import { COLOR } from '@/theme/colors';

export const InventoryDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Inventory</Text>

      <View style={styles.statsGrid}>
        <StatCard title="Total Miners" value="12,845" icon="chip" style={styles.statCard} />
        <StatCard title="Spare Parts" value="3,421" icon="package-variant" iconColor={COLOR.LIGHT_BLUE} style={styles.statCard} />
      </View>

      <Card title="Quick Access" style={styles.card}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('SpareParts')}>
          <Icon name="package-variant" size={24} color={COLOR.LIGHT_BLUE} />
          <Text style={styles.menuText}>Spare Parts</Text>
          <Icon name="chevron-right" size={20} color={COLOR.DARK_GREY} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Miners')}>
          <Icon name="chip" size={24} color={COLOR.COLD_ORANGE} />
          <Text style={styles.menuText}>Miners</Text>
          <Icon name="chevron-right" size={20} color={COLOR.DARK_GREY} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Repairs')}>
          <Icon name="wrench" size={24} color={COLOR.YELLOW} />
          <Text style={styles.menuText}>Repairs</Text>
          <Icon name="chevron-right" size={20} color={COLOR.DARK_GREY} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('HistoricalMovements', {})}>
          <Icon name="history" size={24} color={COLOR.GRASS_GREEN} />
          <Text style={styles.menuText}>Historical Movements</Text>
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
