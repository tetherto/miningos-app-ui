/**
 * Sign In Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

import { Button, Input } from '@/components';
import { COLOR } from '@/theme/colors';
import { setCredentials } from '@/store/slices/authSlice';

export const SignInScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Implement actual authentication API call
      // For now, simulate a successful login
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Dispatch token to store
      dispatch(
        setCredentials({
          token: 'demo-token-' + Date.now(),
          refreshToken: 'demo-refresh-token',
        })
      );
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoIcon}>M</Text>
          </View>
          <Text style={styles.logoText}>MiningOS</Text>
          <Text style={styles.tagline}>Mining Operations Dashboard</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>
            Enter your credentials to access the dashboard
          </Text>

          {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="email-outline"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon="lock-outline"
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            onPress={handleSignIn}
            loading={loading}
            fullWidth
            size="large"
            style={styles.signInButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Sign in with Google"
            onPress={() => {}}
            variant="outline"
            fullWidth
            icon="google"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <Text style={styles.footerLink}>Contact Admin</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR.BLACK,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLOR.COLD_ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLOR.WHITE,
    fontFamily: 'Inter-Bold',
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLOR.COLD_ORANGE,
    fontFamily: 'Inter-Bold',
  },
  tagline: {
    fontSize: 14,
    color: COLOR.DARK_GREY,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  formContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLOR.WHITE,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLOR.DARK_GREY,
    fontFamily: 'Inter-Regular',
    marginBottom: 24,
  },
  errorMessage: {
    color: COLOR.BRICK_RED,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
    textAlign: 'center',
    padding: 12,
    backgroundColor: `${COLOR.BRICK_RED}20`,
    borderRadius: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: COLOR.COLD_ORANGE,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  signInButton: {
    marginBottom: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLOR.WHITE_ALPHA_01,
  },
  dividerText: {
    color: COLOR.DARK_GREY,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginHorizontal: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: COLOR.DARK_GREY,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  footerLink: {
    color: COLOR.COLD_ORANGE,
    fontFamily: 'Inter-Medium',
  },
});
