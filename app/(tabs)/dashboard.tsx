import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList, RefreshControl, Alert, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Title, Paragraph, FAB, Chip, Appbar, Avatar, List, Divider, Card, IconButton, Portal } from 'react-native-paper';
import { router } from 'expo-router';
import { Button, GridAccountSetup, GradientCard, GradientButton } from '@/components';
import { useTheme } from '@/utils/theme-context';
import { useAuth } from '@/utils/auth-context';
import { Vault, Subscription } from '@/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { isGridServiceHealthy } from '@/utils/grid-integration';
import * as Clipboard from 'expo-clipboard';

const { width } = Dimensions.get('window');

// Mock data
const mockVault = {
  address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  balance: 2500.75,
  currency: 'USD',
  apy: 7.0,
};

const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    name: 'Netflix',
    description: 'Streaming service',
    amount: 15.99,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBillingDate: '2024-02-15',
    category: 'Entertainment',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Spotify',
    description: 'Music streaming',
    amount: 9.99,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBillingDate: '2024-02-20',
    category: 'Music',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '3',
    name: 'Adobe Creative Cloud',
    description: 'Design software suite',
    amount: 52.99,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBillingDate: '2024-02-10',
    category: 'Software',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '4',
    name: 'Gym Membership',
    description: 'Fitness center access',
    amount: 30.00,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBillingDate: '2024-03-01',
    category: 'Fitness',
    isActive: false,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-20',
  },
  {
    id: '5',
    name: 'Amazon Prime',
    description: 'Shipping, streaming, etc.',
    amount: 14.99,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBillingDate: '2024-02-25',
    category: 'Shopping',
    isActive: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10',
  },
];

const mockData = {
  totalVaultBalance: 2500.75,
  totalMonthlyCost: mockSubscriptions
    .filter(sub => sub.isActive && sub.billingCycle === 'monthly')
    .reduce((sum, sub) => sum + sub.amount, 0),
  projectedYield: 7.0,
  monthlyEarnings: (2500.75 * (7.0 / 100)) / 12,
  nextCharges: [
    { service: 'Adobe Creative Cloud', date: '2024-02-10', amount: 52.99 },
    { service: 'Netflix', date: '2024-02-15', amount: 15.99 },
    { service: 'Spotify', date: '2024-02-20', amount: 9.99 },
    { service: 'Amazon Prime', date: '2024-02-25', amount: 14.99 },
  ],
  activeSubscriptions: mockSubscriptions.filter(sub => sub.isActive).length,
  pausedSubscriptions: mockSubscriptions.filter(sub => !sub.isActive).length,
  netSavings: 78.97 - ((2500.75 * (7.0 / 100)) / 12),
};

// Helper functions
const getServiceIcon = (serviceName: string) => {
  const lowerCaseName = serviceName.toLowerCase();
  if (lowerCaseName.includes('netflix')) return 'netflix';
  if (lowerCaseName.includes('spotify')) return 'spotify';
  if (lowerCaseName.includes('adobe')) return 'palette';
  if (lowerCaseName.includes('gym')) return 'dumbbell';
  if (lowerCaseName.includes('amazon')) return 'shopping';
  return 'credit-card-settings-outline';
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [refreshing, setRefreshing] = useState(false);
  const [showGridSetup, setShowGridSetup] = useState(false);
  const [gridAccountReady, setGridAccountReady] = useState(false);
  const [gridSetupChecked, setGridSetupChecked] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWalletAddress, setShowWalletAddress] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || 'User');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setSubscriptions([...mockSubscriptions]);
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleGridSetupComplete = (success: boolean) => {
    setShowGridSetup(false);
    setGridAccountReady(success);
    if (success) {
      console.log('Grid account setup completed successfully');
    }
  };

  const handleSetupGridAccount = () => {
    setShowGridSetup(true);
  };

  const handleDepositToVault = () => {
    setShowDepositModal(true);
  };

  const handleDepositFromBank = () => {
    setShowDepositModal(false);
    Alert.alert(
      'Bank Deposit',
      'Bank account deposit feature coming soon!',
      [{ text: 'OK' }]
    );
  };

  const handleDepositFromWallet = () => {
    setShowDepositModal(false);
    setShowWalletAddress(true);
  };

  const copyWalletAddress = async () => {
    try {
      await Clipboard.setStringAsync(mockVault.address);
      Alert.alert('Copied!', 'Wallet address copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy wallet address');
    }
  };

  const handleSubscriptionPress = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowCancelModal(true);
  };

  const handleCancelSubscription = () => {
    if (selectedSubscription) {
      Alert.alert(
        'Cancel Subscription',
        `Are you sure you want to cancel your ${selectedSubscription.name} subscription?`,
        [
          {
            text: 'Keep Subscription',
            style: 'cancel',
          },
          {
            text: 'Cancel Subscription',
            style: 'destructive',
            onPress: () => {
              // Update the subscription to inactive
              setSubscriptions(prev => 
                prev.map(sub => 
                  sub.id === selectedSubscription.id 
                    ? { ...sub, isActive: false, status: 'cancelled' }
                    : sub
                )
              );
              setShowCancelModal(false);
              setSelectedSubscription(null);
              Alert.alert('Success', 'Subscription cancelled successfully');
            },
          },
        ]
      );
    }
  };

  useEffect(() => {
    const checkGridStatus = async () => {
      try {
        const isHealthy = await isGridServiceHealthy();
        setGridAccountReady(isHealthy);
      } catch (error) {
        console.log('Grid service not available:', error);
        setGridAccountReady(false);
      } finally {
        setGridSetupChecked(true);
      }
    };

    checkGridStatus();
  }, []);

  // Update display name when user changes
  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
    }
  }, [user?.name]);


  const renderMetricCard = (title: string, value: string, subtitle: string, icon: string, color: string) => (
    <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
          <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
        <Text style={[styles.metricTitle, { color: theme.colors.onSurfaceVariant }]}>{title}</Text>
      </View>
      <Text style={[styles.metricValue, { color: theme.colors.onSurface }]}>{value}</Text>
      <Text style={[styles.metricSubtitle, { color: theme.colors.onSurfaceVariant }]}>{subtitle}</Text>
    </View>
  );

  const renderSubscriptionCard = ({ item }: { item: Subscription }) => (
    <TouchableOpacity 
      style={[styles.subscriptionCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleSubscriptionPress(item)}
    >
      <View style={styles.subscriptionHeader}>
        <Avatar.Icon
          size={48}
          icon={getServiceIcon(item.name)}
          color={theme.colors.onSurface}
          style={{ backgroundColor: theme.colors.surfaceVariant }}
        />
        <View style={styles.subscriptionInfo}>
          <Text style={[styles.subscriptionName, { color: theme.colors.onSurface }]}>{item.name}</Text>
          <Text style={[styles.subscriptionDescription, { color: theme.colors.onSurfaceVariant }]}>
            {item.description}
          </Text>
          <View style={styles.subscriptionMeta}>
            <Text style={[styles.billingCycle, { color: theme.colors.onSurfaceVariant }]}>
              {item.billingCycle}
            </Text>
            <Text style={[styles.nextBilling, { color: theme.colors.onSurfaceVariant }]}>
              Next: {formatDate(item.nextBillingDate)}
            </Text>
          </View>
        </View>
        <View style={styles.subscriptionAmount}>
          <Text style={[styles.amount, { color: theme.colors.onSurface }]}>
            {formatCurrency(item.amount)}
          </Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.isActive ? theme.colors.primaryContainer : theme.colors.surfaceVariant }
          ]}>
            <Text style={[
              styles.statusText,
              { color: item.isActive ? theme.colors.primary : theme.colors.onSurfaceVariant }
            ]}>
              {item.isActive ? 'Active' : 'Paused'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderNextCharge = (charge: any, index: number) => (
    <View key={index} style={[styles.nextChargeItem, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.nextChargeInfo}>
        <MaterialCommunityIcons 
          name={getServiceIcon(charge.service)} 
          size={20} 
          color={theme.colors.primary} 
        />
        <View style={styles.nextChargeDetails}>
          <Text style={[styles.nextChargeService, { color: theme.colors.onSurface }]}>
            {charge.service}
          </Text>
          <Text style={[styles.nextChargeDate, { color: theme.colors.onSurfaceVariant }]}>
            {formatDate(charge.date)}
          </Text>
        </View>
      </View>
      <Text style={[styles.nextChargeAmount, { color: theme.colors.primary }]}>
        {formatCurrency(charge.amount)}
      </Text>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: 20,
      paddingBottom: 20,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 16,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.colors.onBackground,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    // Action Buttons
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    actionButton: {
      flex: 1,
      height: 56,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    actionButtonSubtext: {
      fontSize: 12,
      color: '#FFFFFF',
      opacity: 0.8,
      marginTop: 2,
    },
    // Metrics Grid
    metricsGrid: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    metricCard: {
      flex: 1,
      padding: 16,
      borderRadius: 16,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    metricHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    metricIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    metricTitle: {
      fontSize: 12,
      fontWeight: '500',
      flex: 1,
    },
    metricValue: {
      fontSize: 24,
      fontWeight: '800',
      marginBottom: 4,
    },
    metricSubtitle: {
      fontSize: 11,
      opacity: 0.7,
    },
    // Yield Card
    yieldCard: {
      backgroundColor: theme.colors.surface,
      padding: 20,
      borderRadius: 16,
      marginBottom: 24,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    yieldHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    yieldIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primaryContainer,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    yieldTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    yieldValue: {
      fontSize: 32,
      fontWeight: '900',
      color: theme.colors.primary,
      marginBottom: 4,
    },
    yieldSubtitle: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    // Section Headers
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.onBackground,
    },
    sectionAction: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.primary,
    },
    // Next Charges
    nextChargesCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      marginBottom: 24,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    nextChargeItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    nextChargeInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    nextChargeDetails: {
      marginLeft: 12,
      flex: 1,
    },
    nextChargeService: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 2,
    },
    nextChargeDate: {
      fontSize: 12,
    },
    nextChargeAmount: {
      fontSize: 16,
      fontWeight: '700',
    },
    // Subscriptions
    subscriptionsList: {
      marginBottom: 24,
    },
    subscriptionCard: {
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    subscriptionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    subscriptionInfo: {
      flex: 1,
      marginLeft: 12,
    },
    subscriptionName: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 4,
    },
    subscriptionDescription: {
      fontSize: 12,
      marginBottom: 8,
    },
    subscriptionMeta: {
      flexDirection: 'row',
      gap: 12,
    },
    billingCycle: {
      fontSize: 11,
      textTransform: 'capitalize',
    },
    nextBilling: {
      fontSize: 11,
    },
    subscriptionAmount: {
      alignItems: 'flex-end',
    },
    amount: {
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 8,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '600',
    },
    // Modals
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalCard: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 24,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    modalDescription: {
      fontSize: 16,
      color: theme.colors.onSurface,
      marginBottom: 24,
      lineHeight: 24,
      textAlign: 'center',
    },
    modalActions: {
      gap: 12,
    },
    modalButton: {
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    walletAddressContainer: {
      backgroundColor: theme.colors.surfaceVariant,
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
    },
    walletAddress: {
      fontSize: 12,
      fontFamily: 'monospace',
      color: theme.colors.primary,
      marginBottom: 8,
    },
    copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    copyButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
    },
    warningText: {
      fontSize: 12,
      color: theme.colors.error,
      textAlign: 'center',
    },
  });

  // Show Grid setup if needed
  if (showGridSetup) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => setShowGridSetup(false)} />
          <Appbar.Content title="Setup Payment Account" />
        </Appbar.Header>
        <GridAccountSetup onComplete={handleGridSetupComplete} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Welcome back, {displayName}</Text>
      </View>

      {/* Grid Account Setup Prompt */}
      {!gridSetupChecked ? (
        <View style={styles.content}>
          <Card style={{ padding: 16, backgroundColor: theme.colors.surfaceVariant }}>
            <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              Checking Grid service...
            </Text>
          </Card>
        </View>
      ) : !gridAccountReady ? (
        <View style={styles.content}>
          <Card style={{ padding: 16, backgroundColor: theme.colors.primaryContainer }}>
            <Text style={{ color: theme.colors.onPrimaryContainer, marginBottom: 12, fontWeight: '600' }}>
              💳 Setup Payment Account
            </Text>
            <Text style={{ color: theme.colors.onPrimaryContainer, marginBottom: 16, fontSize: 14 }}>
              Set up your Grid payment account to start managing subscriptions and payments.
            </Text>
            <Button 
              mode="contained" 
              onPress={handleSetupGridAccount}
              style={{ alignSelf: 'flex-start' }}
            >
              Setup Now
            </Button>
          </Card>
        </View>
      ) : null}

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleDepositToVault}
            >
              <Text style={styles.actionButtonText}>Add Funds</Text>
              <Text style={styles.actionButtonSubtext}>Deposit to vault</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
              onPress={() => router.push('/add-subscription')}
            >
              <Text style={styles.actionButtonText}>Add Subscription</Text>
              <Text style={styles.actionButtonSubtext}>Track new services</Text>
            </TouchableOpacity>
          </View>

          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            {renderMetricCard(
              'Balance',
              formatCurrency(mockVault.balance),
              'Vault balance',
              'wallet',
              theme.colors.primary
            )}
            {renderMetricCard(
              'Monthly',
              formatCurrency(mockData.totalMonthlyCost),
              'Subscriptions',
              'credit-card',
              theme.colors.secondary
            )}
          </View>

          {/* Yield Card */}
          <View style={styles.yieldCard}>
            <View style={styles.yieldHeader}>
              <View style={styles.yieldIcon}>
                <MaterialCommunityIcons name="trending-up" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.yieldTitle}>Projected Monthly Yield</Text>
            </View>
            <Text style={styles.yieldValue}>{formatCurrency(mockData.monthlyEarnings)}</Text>
            <Text style={styles.yieldSubtitle}>From {mockVault.apy}% APY vault</Text>
          </View>

          {/* Next Charges */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Next Charges</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.nextChargesCard}>
            {mockData.nextCharges.map(renderNextCharge)}
          </View>

          {/* Subscriptions */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Subscriptions</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>Manage</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={subscriptions}
            renderItem={renderSubscriptionCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            style={styles.subscriptionsList}
          />
        </View>
      </ScrollView>

      {/* Deposit Modal */}
      <Portal>
        <Modal
          visible={showDepositModal}
          onDismiss={() => setShowDepositModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Deposit to Vault</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowDepositModal(false)}
                />
              </View>
              <Text style={styles.modalDescription}>
                Choose how you'd like to add funds to your vault
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleDepositFromBank}
                >
                  <Text style={styles.modalButtonText}>Bank Account</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: theme.colors.secondary }]}
                  onPress={handleDepositFromWallet}
                >
                  <Text style={styles.modalButtonText}>Wallet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </Portal>

      {/* Wallet Address Modal */}
      <Portal>
        <Modal
          visible={showWalletAddress}
          onDismiss={() => setShowWalletAddress(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Deposit from Wallet</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowWalletAddress(false)}
                />
              </View>
              <Text style={styles.modalDescription}>
                Send funds to this address
              </Text>
              <View style={styles.walletAddressContainer}>
                <Text style={styles.walletAddress}>{mockVault.address}</Text>
                <TouchableOpacity style={styles.copyButton} onPress={copyWalletAddress}>
                  <MaterialCommunityIcons name="content-copy" size={16} color="#FFFFFF" />
                  <Text style={styles.copyButtonText}>Copy</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.warningText}>
                Only send USDC to this address. Other tokens may be lost.
              </Text>
            </View>
          </View>
        </Modal>
      </Portal>

      {/* Cancel Subscription Modal */}
      <Portal>
        <Modal
          visible={showCancelModal}
          onDismiss={() => setShowCancelModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Cancel Subscription</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowCancelModal(false)}
                />
              </View>
              <Text style={styles.modalDescription}>
                Are you sure you want to cancel this subscription? This action cannot be undone.
              </Text>
              <View style={styles.modalActions}>
                <GradientButton
                  title="Keep Subscription"
                  onPress={() => setShowCancelModal(false)}
                  variant="secondary"
                  size="medium"
                  style={styles.modalButton}
                />
                <GradientButton
                  title="Cancel Subscription"
                  onPress={handleCancelSubscription}
                  variant="primary"
                  size="medium"
                  style={[styles.modalButton, { backgroundColor: theme.colors.error }]}
                />
              </View>
            </View>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}