/**
 * Header Component for MiningOS Android App
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';

import { COLOR } from '@/theme/colors';

interface HeaderProps extends Partial<NativeStackHeaderProps> {
  title?: string;
  showBack?: boolean;
  showMenu?: boolean;
  rightActions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  options,
  navigation,
  route,
  showBack,
  showMenu = true,
  rightActions,
}) => {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const title = options?.title || route?.name || 'MiningOS';

  const canGoBack = navigation?.canGoBack() ?? false;
  const shouldShowBack = showBack ?? canGoBack;

  const handleMenuPress = () => {
    nav.dispatch(DrawerActions.toggleDrawer());
  };

  const handleBackPress = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLOR.BLACK} />
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {shouldShowBack ? (
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="arrow-left" size={24} color={COLOR.WHITE} />
            </TouchableOpacity>
          ) : showMenu ? (
            <TouchableOpacity
              onPress={handleMenuPress}
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="menu" size={24} color={COLOR.WHITE} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <View style={styles.rightSection}>
          {rightActions || (
            <>
              <TouchableOpacity style={styles.iconButton}>
                <Icon name="bell-outline" size={22} color={COLOR.WHITE} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Icon name="account-circle" size={24} color={COLOR.WHITE} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLOR.BLACK,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.WHITE_ALPHA_01,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 8,
  },
  leftSection: {
    width: 48,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  titleSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 48,
  },
  iconButton: {
    padding: 8,
  },
  title: {
    color: COLOR.WHITE,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});
