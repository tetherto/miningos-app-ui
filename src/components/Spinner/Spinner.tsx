/**
 * Spinner/Loading Component for MiningOS Android App
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

import { COLOR } from '@/theme/colors';

interface SpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'large',
  color = COLOR.COLD_ORANGE,
  text,
  fullScreen = false,
}) => {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={size} color={color} />
        {text && <Text style={styles.text}>{text}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    backgroundColor: COLOR.BLACK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: COLOR.WHITE,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 12,
  },
});
