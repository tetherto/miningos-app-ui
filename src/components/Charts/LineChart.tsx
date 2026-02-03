/**
 * Line Chart Component wrapper for react-native-chart-kit
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {
  LineChart as RNLineChart,
  LineChartData,
} from 'react-native-chart-kit';
import { AbstractChartConfig } from 'react-native-chart-kit/dist/AbstractChart';

import { COLOR } from '@/theme/colors';

interface LineChartProps {
  data: LineChartData;
  width: number;
  height: number;
  yAxisSuffix?: string;
  yAxisLabel?: string;
  chartConfig?: Partial<AbstractChartConfig>;
  bezier?: boolean;
  withDots?: boolean;
  withShadow?: boolean;
  withInnerLines?: boolean;
  withOuterLines?: boolean;
  withVerticalLines?: boolean;
  withHorizontalLines?: boolean;
  withVerticalLabels?: boolean;
  withHorizontalLabels?: boolean;
  fromZero?: boolean;
  segments?: number;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  width,
  height,
  yAxisSuffix = '',
  yAxisLabel = '',
  chartConfig,
  bezier = true,
  withDots = true,
  withShadow = true,
  withInnerLines = true,
  withOuterLines = true,
  withVerticalLines = false,
  withHorizontalLines = true,
  withVerticalLabels = true,
  withHorizontalLabels = true,
  fromZero = false,
  segments = 4,
}) => {
  const defaultConfig: AbstractChartConfig = {
    backgroundColor: COLOR.OBSIDIAN,
    backgroundGradientFrom: COLOR.OBSIDIAN,
    backgroundGradientTo: COLOR.OBSIDIAN,
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(247, 147, 26, ${opacity})`,
    labelColor: () => COLOR.DARK_GREY,
    style: {
      borderRadius: 8,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: COLOR.COLD_ORANGE,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: COLOR.WHITE_ALPHA_01,
    },
    ...chartConfig,
  };

  // Check if data is valid
  if (!data || !data.datasets || data.datasets.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RNLineChart
        data={data}
        width={width}
        height={height}
        yAxisSuffix={yAxisSuffix}
        yAxisLabel={yAxisLabel}
        chartConfig={defaultConfig}
        bezier={bezier}
        withDots={withDots}
        withShadow={withShadow}
        withInnerLines={withInnerLines}
        withOuterLines={withOuterLines}
        withVerticalLines={withVerticalLines}
        withHorizontalLines={withHorizontalLines}
        withVerticalLabels={withVerticalLabels}
        withHorizontalLabels={withHorizontalLabels}
        fromZero={fromZero}
        segments={segments}
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    borderRadius: 8,
    marginVertical: 8,
  },
  noDataText: {
    color: COLOR.DARK_GREY,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});
