/**
 * Settings Dashboard Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Card } from '@/components';
import { COLOR } from '@/theme/colors';
import { clearAuth } from '@/store/slices/authSlice';
import { setIsAlertEnabled } from '@/store/slices/themeSlice';
import type { RootState } from '@/store/types';

export const SettingsDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const isAlertEnabled = useSelector((state: RootState) => state.theme.isAlertEnabled);

  const handleSignOut = () => {
    dispatch(clearAuth());
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Settings</Text>

      {/* Account Settings */}
      <Card title="Account" style={styles.card}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('UserManagement')}>
          <Icon name="account-group" size={24} color={COLOR.COLD_ORANGE} />
          <Text style={styles.menuText}>User Management</Text>
          <Icon name="chevron-right" size={20} color={COLOR.DARK_GREY} />
        </TouchableOpacity>
      </Card>

      {/* Preferences */}
      <Card title="Preferences" style={styles.card}>
        <View style={styles.switchItem}>
          <Icon name="bell" size={24} color={COLOR.LIGHT_BLUE} />
          <Text style={styles.menuText}>Alert Notifications</Text>
          <Switch
            value={isAlertEnabled}
            onValueChange={(value) => dispatch(setIsAlertEnabled(value))}
            trackColor={{ false: COLOR.DARKER_GREY, true: COLOR.COLD_ORANGE }}
            thumbColor={COLOR.WHITE}
          />
        </View>
        <View style={styles.switchItem}>
          <Icon name="theme-light-dark" size={24} color={COLOR.YELLOW} />
          <Text style={styles.menuText}>Dark Mode</Text>
          <Switch
            value={true}
            disabled
            trackColor={{ false: COLOR.DARKER_GREY, true: COLOR.COLD_ORANGE }}
            thumbColor={COLOR.WHITE}
          />
        </View>
      </Card>

      {/* App Info */}
      <Card title="About" style={styles.card}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Build</Text>
          <Text style={styles.infoValue}>2024.01.15</Text>
        </View>
      </Card>

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Icon name="logout" size={20} color={COLOR.BRICK_RED} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLOR.BLACK },
  scrollContent: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLOR.WHITE, fontFamily: 'Inter-Bold', marginBottom: 20 },
  card: { marginBottom: 16 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.WHITE_ALPHA_01,
  },
  menuText: { flex: 1, color: COLOR.WHITE, fontSize: 16, fontFamily: 'Inter-Medium', marginLeft: 12 },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.WHITE_ALPHA_01,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.WHITE_ALPHA_01,
  },
  infoLabel: { color: COLOR.DARK_GREY, fontSize: 14, fontFamily: 'Inter-Regular' },
  infoValue: { color: COLOR.WHITE, fontSize: 14, fontFamily: 'JetBrainsMono-Regular' },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLOR.BRICK_RED}20`,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  signOutText: { color: COLOR.BRICK_RED, fontSize: 16, fontFamily: 'Inter-SemiBold', marginLeft: 8 },
});
