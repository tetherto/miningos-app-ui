/**
 * Main Navigator - Drawer navigation for authenticated users
 */

import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { DashboardNavigator } from './stacks/DashboardNavigator';
import { OperationsNavigator } from './stacks/OperationsNavigator';
import { ReportsNavigator } from './stacks/ReportsNavigator';
import { InventoryNavigator } from './stacks/InventoryNavigator';
import { PoolManagerNavigator } from './stacks/PoolManagerNavigator';
import { AlertsNavigator } from './stacks/AlertsNavigator';
import { SettingsNavigator } from './stacks/SettingsNavigator';
import type { DrawerParamList } from './types';
import { COLOR } from '@/theme/colors';

const Drawer = createDrawerNavigator<DrawerParamList>();

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  return (
    <DrawerContentScrollView {...props} style={styles.drawerContent}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>MiningOS</Text>
        <Text style={styles.logoSubtext}>Mining Operations</Text>
      </View>
      <DrawerItemList {...props} />
      <View style={styles.footer}>
        <TouchableOpacity style={styles.signOutButton}>
          <Icon name="logout" size={20} color={COLOR.BRICK_RED} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

export const MainNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      initialRouteName="DashboardTab"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: COLOR.BLACK,
          width: 280,
        },
        drawerActiveTintColor: COLOR.COLD_ORANGE,
        drawerInactiveTintColor: COLOR.SIDEBAR_ITEM,
        drawerActiveBackgroundColor: COLOR.WHITE_ALPHA_01,
        drawerLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 14,
          marginLeft: -16,
        },
      }}
    >
      <Drawer.Screen
        name="DashboardTab"
        component={DashboardNavigator}
        options={{
          title: 'Dashboard',
          drawerIcon: ({ color, size }) => (
            <Icon name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="OperationsTab"
        component={OperationsNavigator}
        options={{
          title: 'Operations',
          drawerIcon: ({ color, size }) => (
            <Icon name="cog-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="ReportsTab"
        component={ReportsNavigator}
        options={{
          title: 'Reports',
          drawerIcon: ({ color, size }) => (
            <Icon name="chart-line" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="InventoryTab"
        component={InventoryNavigator}
        options={{
          title: 'Inventory',
          drawerIcon: ({ color, size }) => (
            <Icon name="package-variant" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="PoolManagerTab"
        component={PoolManagerNavigator}
        options={{
          title: 'Pool Manager',
          drawerIcon: ({ color, size }) => (
            <Icon name="water" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="AlertsTab"
        component={AlertsNavigator}
        options={{
          title: 'Alerts',
          drawerIcon: ({ color, size }) => (
            <Icon name="bell-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="SettingsTab"
        component={SettingsNavigator}
        options={{
          title: 'Settings',
          drawerIcon: ({ color, size }) => (
            <Icon name="cog" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    backgroundColor: COLOR.BLACK,
  },
  logoContainer: {
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.WHITE_ALPHA_01,
    marginBottom: 10,
  },
  logoText: {
    color: COLOR.COLD_ORANGE,
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  logoSubtext: {
    color: COLOR.SIDEBAR_ITEM,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  footer: {
    marginTop: 'auto',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLOR.WHITE_ALPHA_01,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  signOutText: {
    color: COLOR.BRICK_RED,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 12,
  },
});
