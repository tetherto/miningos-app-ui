/**
 * Sites Overview Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '@/components';
import { COLOR } from '@/theme/colors';

export const SitesOverviewScreen: React.FC = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
    <Text style={styles.title}>Sites Overview</Text>
    <Card title="All Sites" style={styles.card}>
      <Text style={styles.placeholder}>Sites overview</Text>
    </Card>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLOR.BLACK },
  scrollContent: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLOR.WHITE, fontFamily: 'Inter-Bold', marginBottom: 20 },
  card: { marginBottom: 16 },
  placeholder: { color: COLOR.DARK_GREY, fontSize: 14, fontFamily: 'Inter-Regular' },
});
