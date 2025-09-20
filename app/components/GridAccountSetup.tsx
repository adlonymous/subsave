/**
 * Grid Account Setup Component
 * Handles the complete flow of creating a Grid account after Auth0 login
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Title, Paragraph, Button, TextInput, ProgressBar, Card } from 'react-native-paper';
import { useTheme } from '@/utils/theme-context';
import { useAuth } from '@/utils/auth-context';
import { createUserAccount, verifyUserOtp, isGridServiceHealthy } from '@/utils/grid-integration';
import { GridError } from '../../lib/errors';

interface GridAccountSetupProps {
  onComplete: (success: boolean) => void;
}

type SetupStep = 'checking' | 'creating' | 'verifying' | 'complete' | 'error';

export function GridAccountSetup({ onComplete }: GridAccountSetupProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<SetupStep>('checking');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [accountData, setAccountData] = useState<any>(null);

  useEffect(() => {
    initializeGridAccount();
  }, []);

  const initializeGridAccount = async () => {
    try {
      setCurrentStep('checking');
      setError(null);

      // Check if Grid service is healthy
      const isHealthy = await isGridServiceHealthy();
      if (!isHealthy) {
        throw new Error('Grid service is not available. Please check your GRID_API_KEY in .env file.');
      }

      if (!user?.email) {
        throw new Error('User email not available');
      }

      // Create Grid account
      setCurrentStep('creating');
      const account = await createUserAccount(user.email, `SubSave account for ${user.name || user.email}`);
      
      setAccountData(account);
      
      if (account.data.status === 'pending_verification') {
        setCurrentStep('verifying');
      } else {
        setCurrentStep('complete');
        onComplete(true);
      }
    } catch (error) {
      console.error('Grid account setup failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to setup Grid account';
      setError(errorMessage);
      setCurrentStep('error');
    }
  };

  const handleOtpVerification = async () => {
    try {
      if (!user?.email || !otp.trim()) {
        Alert.alert('Error', 'Please enter the OTP code');
        return;
      }

      setError(null);
      const verification = await verifyUserOtp(user.email, otp.trim());
      
      if (verification.data.status === 'verified') {
        setCurrentStep('complete');
        onComplete(true);
      } else {
        setError('Invalid OTP code. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      setError(error instanceof Error ? error.message : 'OTP verification failed');
    }
  };

  const handleRetry = () => {
    setError(null);
    setOtp('');
    setAccountData(null);
    initializeGridAccount();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 24,
      backgroundColor: theme.colors.background,
    },
    card: {
      padding: 24,
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
      textAlign: 'center',
      color: theme.colors.onBackground,
    },
    description: {
      fontSize: 16,
      marginBottom: 24,
      textAlign: 'center',
      color: theme.colors.onBackground,
      opacity: 0.7,
    },
    stepContainer: {
      marginBottom: 24,
    },
    stepTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
      color: theme.colors.onBackground,
    },
    stepDescription: {
      fontSize: 14,
      color: theme.colors.onBackground,
      opacity: 0.7,
      marginBottom: 16,
    },
    progressContainer: {
      marginBottom: 24,
    },
    inputContainer: {
      marginBottom: 16,
    },
    input: {
      backgroundColor: theme.colors.surface,
    },
    button: {
      marginTop: 8,
    },
    errorContainer: {
      backgroundColor: theme.colors.errorContainer,
      padding: 16,
      borderRadius: 8,
      marginBottom: 16,
    },
    errorText: {
      color: theme.colors.onErrorContainer,
      fontSize: 14,
    },
    successContainer: {
      backgroundColor: theme.colors.primaryContainer,
      padding: 16,
      borderRadius: 8,
      marginBottom: 16,
    },
    successText: {
      color: theme.colors.onPrimaryContainer,
      fontSize: 14,
    },
  });

  const renderStepContent = () => {
    switch (currentStep) {
      case 'checking':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Checking Grid Service</Text>
            <Text style={styles.stepDescription}>
              Verifying connection to Grid payment service...
            </Text>
            <ProgressBar indeterminate color={theme.colors.primary} />
          </View>
        );

      case 'creating':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Creating Grid Account</Text>
            <Text style={styles.stepDescription}>
              Setting up your payment account with Grid...
            </Text>
            <ProgressBar indeterminate color={theme.colors.primary} />
          </View>
        );

      case 'verifying':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Verify Your Email</Text>
            <Text style={styles.stepDescription}>
              We've sent a verification code to {user?.email}. Please enter it below.
            </Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                label="Verification Code"
                value={otp}
                onChangeText={setOtp}
                placeholder="Enter 6-digit code"
                keyboardType="numeric"
                maxLength={6}
                style={styles.input}
                autoFocus
              />
            </View>

            <Button
              mode="contained"
              onPress={handleOtpVerification}
              disabled={!otp.trim()}
              style={styles.button}
            >
              Verify Account
            </Button>
          </View>
        );

      case 'complete':
        return (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>
              ✅ Grid account created successfully! You can now manage subscriptions and payments.
            </Text>
          </View>
        );

      case 'error':
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              ❌ {error || 'Failed to setup Grid account'}
            </Text>
            <Button
              mode="outlined"
              onPress={handleRetry}
              style={styles.button}
            >
              Try Again
            </Button>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Title style={styles.title}>Setting Up Payment Account</Title>
        <Paragraph style={styles.description}>
          We're setting up your Grid payment account to enable subscription management and payments.
        </Paragraph>

        {renderStepContent()}
      </Card>
    </View>
  );
}
