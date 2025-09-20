import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Text, Title, Paragraph } from 'react-native-paper';
import { router } from 'expo-router';
import { Button, Card, GradientButton, GradientCard } from '@/components';
import { useTheme } from '@/utils/theme-context';
import { useAuth } from '@/utils/auth-context';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { login, isLoading, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
      router.replace('/(tabs)/dashboard');
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await login();
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      Alert.alert('Login Failed', 'Please try again');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: 20,
      paddingBottom: 20,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      padding: 24,
    },
    header: {
      alignItems: 'center',
      marginBottom: 48,
    },
    title: {
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      textAlign: 'center',
      opacity: 0.7,
    },
    form: {
      gap: 16,
    },
    button: {
      marginTop: 24,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
    },
    authDescription: {
      textAlign: 'center',
      marginBottom: 16,
      opacity: 0.7,
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Title style={styles.title}>Welcome to SubSave</Title>
          <Paragraph style={styles.subtitle}>
            Manage your subscriptions in one place
          </Paragraph>
        </View>

        <Card style={styles.form}>
          <Paragraph style={styles.authDescription}>
            Sign in with your Auth0 account to access your subscription vaults
          </Paragraph>

          <GradientButton
            title="Sign In with Auth0"
            onPress={handleLogin}
            disabled={loading}
            variant="primary"
            size="large"
            style={styles.button}
          />
        </Card>
      </ScrollView>
    </View>
  );
}
