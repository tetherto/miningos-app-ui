/**
 * Card Component for MiningOS Android App
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

import { COLOR } from '@/theme/colors';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  headerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  contentStyle?: ViewStyle;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  style,
  headerStyle,
  titleStyle,
  subtitleStyle,
  contentStyle,
  noPadding = false,
}) => {
  return (
    <View style={[styles.container, style]}>
      {(title || subtitle) && (
        <View style={[styles.header, headerStyle]}>
          {title && (
            <Text style={[styles.title, titleStyle]}>{title}</Text>
          )}
          {subtitle && (
            <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
          )}
        </View>
      )}
      <View style={[styles.content, noPadding && styles.noPadding, contentStyle]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLOR.OBSIDIAN,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.WHITE_ALPHA_01,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.WHITE_ALPHA_01,
  },
  title: {
    color: COLOR.WHITE,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  subtitle: {
    color: COLOR.CARD_SUBTITLE_TEXT,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  noPadding: {
    padding: 0,
  },
});
