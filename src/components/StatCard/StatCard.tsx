/**
 * StatCard Component - Displays a statistic with optional change indicator
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { COLOR } from '@/theme/colors';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeType?: 'percentage' | 'absolute';
  icon?: string;
  iconColor?: string;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  change,
  changeType = 'percentage',
  icon,
  iconColor = COLOR.COLD_ORANGE,
  style,
}) => {
  const isPositive = change !== undefined && change >= 0;
  const changeColor = isPositive ? COLOR.GRASS_GREEN : COLOR.BRICK_RED;
  const changeIcon = isPositive ? 'arrow-up' : 'arrow-down';

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        {icon && (
          <View style={[styles.iconWrapper, { backgroundColor: `${iconColor}20` }]}>
            <Icon name={icon} size={18} color={iconColor} />
          </View>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>

      {change !== undefined && (
        <View style={styles.changeContainer}>
          <Icon name={changeIcon} size={14} color={changeColor} />
          <Text style={[styles.changeText, { color: changeColor }]}>
            {Math.abs(change).toFixed(2)}
            {changeType === 'percentage' ? '%' : ''}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLOR.OBSIDIAN,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLOR.WHITE_ALPHA_01,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  title: {
    color: COLOR.CARD_SUBTITLE_TEXT,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    color: COLOR.WHITE,
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'JetBrainsMono-Bold',
  },
  unit: {
    color: COLOR.CARD_SUBTITLE_TEXT,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginLeft: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  changeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
});
