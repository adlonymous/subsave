import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList, RefreshControl, Alert, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Title, Paragraph, FAB, Chip, Appbar, Avatar, List, Divider, Card, IconButton, Portal, Icon, TextInput } from 'react-native-paper';
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || 'User');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelStep, setCancelStep] = useState<'reason' | 'feedback' | 'confirm' | 'success'>('reason');
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelFeedback, setCancelFeedback] = useState<string>('');
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
    setShowPaymentModal(true);
  };

  const handleDepositFromWallet = () => {
    setShowDepositModal(false);
    setShowWalletAddress(true);
  };

  const handlePaymentMethodSelect = (method: string) => {
    setShowPaymentModal(false);
    Alert.alert(
      'Payment Method Selected',
      `${method} selected. Payment integration coming soon!`,
      [{ text: 'OK' }]
    );
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
    setCancelStep('reason');
    setCancelReason('');
    setCancelFeedback('');
    setShowCancelModal(true);
  };

  const handleCancelReasonSelect = (reason: string) => {
    setCancelReason(reason);
    setCancelStep('feedback');
  };

  const handleCancelFeedbackSubmit = () => {
    setCancelStep('confirm');
  };

  const handleCancelConfirm = () => {
    if (selectedSubscription) {
      // Update the subscription to inactive
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === selectedSubscription.id 
            ? { 
                ...sub, 
                isActive: false, 
                status: 'cancelled',
                cancelledAt: new Date().toISOString(),
                cancelReason: cancelReason,
                cancelFeedback: cancelFeedback
              }
            : sub
        )
      );
      setCancelStep('success');
    }
  };

  const handleCancelComplete = () => {
    setShowCancelModal(false);
    setSelectedSubscription(null);
    setCancelStep('reason');
    setCancelReason('');
    setCancelFeedback('');
  };

  const handleCancelBack = () => {
    if (cancelStep === 'feedback') {
      setCancelStep('reason');
    } else if (cancelStep === 'confirm') {
      setCancelStep('feedback');
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
    // Cancel Subscription Modal Styles
    cancelModalCard: {
      width: '100%',
      maxWidth: 500,
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      padding: 0,
      maxHeight: '90%',
    },
    cancelModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 24,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline + '20',
    },
    cancelModalTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    cancelBackButton: {
      marginRight: 12,
      padding: 4,
    },
    cancelModalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.onSurface,
      flex: 1,
    },
    cancelStepIndicator: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 16,
      gap: 8,
    },
    cancelStepDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    cancelModalContent: {
      padding: 24,
      paddingTop: 0,
    },
    // Reason Step Styles
    cancelReasonStep: {
      gap: 20,
    },
    cancelStepDescription: {
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
    },
    cancelReasonOptions: {
      gap: 12,
    },
    cancelReasonOption: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
    },
    cancelReasonText: {
      fontSize: 16,
      fontWeight: '500',
      textAlign: 'center',
    },
    // Feedback Step Styles
    cancelFeedbackStep: {
      gap: 16,
    },
    cancelFeedbackInput: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    cancelStepNote: {
      fontSize: 14,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    // Confirm Step Styles
    cancelConfirmStep: {
      alignItems: 'center',
      gap: 20,
    },
    cancelConfirmIcon: {
      marginBottom: 8,
    },
    cancelConfirmTitle: {
      fontSize: 24,
      fontWeight: '700',
      textAlign: 'center',
    },
    cancelConfirmDescription: {
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 24,
    },
    cancelConfirmDetails: {
      width: '100%',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      padding: 16,
      gap: 12,
    },
    cancelConfirmRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    cancelConfirmLabel: {
      fontSize: 14,
      fontWeight: '500',
      flex: 1,
    },
    cancelConfirmValue: {
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'right',
      flex: 1,
    },
    cancelWarningBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.colors.primaryContainer,
      borderRadius: 12,
      padding: 16,
      gap: 12,
    },
    cancelWarningText: {
      fontSize: 14,
      lineHeight: 20,
      flex: 1,
    },
    // Success Step Styles
    cancelSuccessStep: {
      alignItems: 'center',
      gap: 20,
    },
    cancelSuccessIcon: {
      marginBottom: 8,
    },
    cancelSuccessTitle: {
      fontSize: 24,
      fontWeight: '700',
      textAlign: 'center',
    },
    cancelSuccessDescription: {
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 24,
    },
    cancelSuccessDetails: {
      width: '100%',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      padding: 16,
      gap: 12,
    },
    cancelSuccessRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cancelSuccessLabel: {
      fontSize: 14,
      fontWeight: '500',
      flex: 1,
    },
    cancelSuccessValue: {
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'right',
      flex: 1,
    },
    cancelSuccessNote: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primaryContainer,
      borderRadius: 12,
      padding: 16,
      gap: 12,
    },
    cancelSuccessNoteText: {
      fontSize: 14,
      lineHeight: 20,
      flex: 1,
    },
    // Actions Styles
    cancelModalActions: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 24,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline + '20',
    },
    cancelActionButton: {
      flex: 1,
    },
    cancelFeedbackActions: {
      flexDirection: 'row',
      gap: 12,
    },
    cancelConfirmActions: {
      flexDirection: 'row',
      gap: 12,
    },
    // Payment Modal Styles
    paymentModalCard: {
      width: '100%',
      maxWidth: 500,
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      padding: 0,
      maxHeight: '90%',
    },
    paymentModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 24,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline + '20',
    },
    paymentModalTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    paymentOptionsContainer: {
      padding: 24,
      gap: 12,
    },
    paymentOptionCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colors.outline + '20',
    },
    paymentOptionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    paymentOptionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primaryContainer,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      position: 'relative',
    },
    lightningIcon: {
      position: 'absolute',
      top: -2,
      right: -2,
    },
    paymentOptionText: {
      flex: 1,
    },
    recommendedBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 4,
      alignSelf: 'flex-start',
    },
    recommendedText: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.onPrimary,
      letterSpacing: 0.5,
    },
    paymentOptionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
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

      {/* Payment Method Modal */}
      <Portal>
        <Modal
          visible={showPaymentModal}
          onDismiss={() => setShowPaymentModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.paymentModalCard}>
              <View style={styles.paymentModalHeader}>
                <Text style={styles.paymentModalTitle}>Payment method</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowPaymentModal(false)}
                />
              </View>
              
              <View style={styles.paymentOptionsContainer}>
                {/* Instant Bank Transfer - Recommended */}
                <TouchableOpacity 
                  style={styles.paymentOptionCard}
                  onPress={() => handlePaymentMethodSelect('Instant Bank Transfer')}
                >
                  <View style={styles.paymentOptionLeft}>
                    <View style={styles.paymentOptionIcon}>
                      <Icon name="bank" size={24} color={theme.colors.primary} />
                      <Icon name="lightning-bolt" size={16} color={theme.colors.primary} style={styles.lightningIcon} />
                    </View>
                    <View style={styles.paymentOptionText}>
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>RECOMMENDED</Text>
                      </View>
                      <Text style={styles.paymentOptionTitle}>Instant Bank Transfer</Text>
                    </View>
                  </View>
                  <Icon name="chevron-right" size={20} color={theme.colors.outline} />
                </TouchableOpacity>

                {/* Credit or Debit */}
                <TouchableOpacity 
                  style={styles.paymentOptionCard}
                  onPress={() => handlePaymentMethodSelect('Credit or Debit')}
                >
                  <View style={styles.paymentOptionLeft}>
                    <View style={styles.paymentOptionIcon}>
                      <Icon name="credit-card" size={24} color={theme.colors.primary} />
                    </View>
                    <View style={styles.paymentOptionText}>
                      <Text style={styles.paymentOptionTitle}>Credit or Debit</Text>
                    </View>
                  </View>
                  <Icon name="chevron-right" size={20} color={theme.colors.outline} />
                </TouchableOpacity>

                {/* Apple Pay */}
                <TouchableOpacity 
                  style={styles.paymentOptionCard}
                  onPress={() => handlePaymentMethodSelect('Apple Pay')}
                >
                  <View style={styles.paymentOptionLeft}>
                    <View style={styles.paymentOptionIcon}>
                      <Icon name="apple" size={24} color={theme.colors.onSurface} />
                    </View>
                    <View style={styles.paymentOptionText}>
                      <Text style={styles.paymentOptionTitle}>Apple Pay</Text>
                    </View>
                  </View>
                  <Icon name="chevron-right" size={20} color={theme.colors.outline} />
                </TouchableOpacity>

                {/* Google Pay */}
                <TouchableOpacity 
                  style={styles.paymentOptionCard}
                  onPress={() => handlePaymentMethodSelect('Google Pay')}
                >
                  <View style={styles.paymentOptionLeft}>
                    <View style={styles.paymentOptionIcon}>
                      <Icon name="google" size={24} color={theme.colors.primary} />
                    </View>
                    <View style={styles.paymentOptionText}>
                      <Text style={styles.paymentOptionTitle}>Google Pay</Text>
                    </View>
                  </View>
                  <Icon name="chevron-right" size={20} color={theme.colors.outline} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </Portal>

      {/* Cancel Subscription Modal */}
      <Portal>
        <Modal
          visible={showCancelModal}
          onDismiss={handleCancelComplete}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.cancelModalCard}>
              {/* Header */}
              <View style={styles.cancelModalHeader}>
                <View style={styles.cancelModalTitleContainer}>
                  {cancelStep !== 'reason' && (
                    <TouchableOpacity 
                      onPress={handleCancelBack}
                      style={styles.cancelBackButton}
                    >
                      <Icon name="arrow-left" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                  )}
                  <Text style={styles.cancelModalTitle}>
                    {cancelStep === 'reason' && 'Why are you cancelling?'}
                    {cancelStep === 'feedback' && 'Tell us more'}
                    {cancelStep === 'confirm' && 'Confirm Cancellation'}
                    {cancelStep === 'success' && 'Subscription Cancelled'}
                  </Text>
                </View>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={handleCancelComplete}
                />
              </View>

              {/* Step Indicator */}
              <View style={styles.cancelStepIndicator}>
                {['reason', 'feedback', 'confirm', 'success'].map((step, index) => (
                  <View
                    key={step}
                    style={[
                      styles.cancelStepDot,
                      {
                        backgroundColor: 
                          ['reason', 'feedback', 'confirm', 'success'].indexOf(cancelStep) >= index
                            ? theme.colors.primary
                            : theme.colors.outline
                      }
                    ]}
                  />
                ))}
              </View>

              {/* Content */}
              <View style={styles.cancelModalContent}>
                {cancelStep === 'reason' && (
                  <View style={styles.cancelReasonStep}>
                    <Text style={[styles.cancelStepDescription, { color: theme.colors.onSurfaceVariant }]}>
                      Help us understand why you're cancelling {selectedSubscription?.name}
                    </Text>
                    <View style={styles.cancelReasonOptions}>
                      {[
                        'Too expensive',
                        'Not using it enough',
                        'Found a better alternative',
                        'Technical issues',
                        'Customer service problems',
                        'No longer needed',
                        'Other'
                      ].map((reason) => (
                        <TouchableOpacity
                          key={reason}
                          style={[
                            styles.cancelReasonOption,
                            {
                              backgroundColor: cancelReason === reason 
                                ? theme.colors.primaryContainer 
                                : theme.colors.surface,
                              borderColor: cancelReason === reason 
                                ? theme.colors.primary 
                                : theme.colors.outline,
                            }
                          ]}
                          onPress={() => handleCancelReasonSelect(reason)}
                        >
                          <Text
                            style={[
                              styles.cancelReasonText,
                              {
                                color: cancelReason === reason 
                                  ? theme.colors.primary 
                                  : theme.colors.onSurface,
                              }
                            ]}
                          >
                            {reason}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {cancelStep === 'feedback' && (
                  <View style={styles.cancelFeedbackStep}>
                    <Text style={[styles.cancelStepDescription, { color: theme.colors.onSurfaceVariant }]}>
                      Any additional feedback? (Optional)
                    </Text>
                    <TextInput
                      mode="outlined"
                      value={cancelFeedback}
                      onChangeText={setCancelFeedback}
                      placeholder="Tell us what we could improve..."
                      multiline
                      numberOfLines={4}
                      style={styles.cancelFeedbackInput}
                      outlineColor={theme.colors.outline}
                      activeOutlineColor={theme.colors.primary}
                    />
                    <Text style={[styles.cancelStepNote, { color: theme.colors.onSurfaceVariant }]}>
                      Your feedback helps us improve our service
                    </Text>
                  </View>
                )}

                {cancelStep === 'confirm' && (
                  <View style={styles.cancelConfirmStep}>
                    <View style={styles.cancelConfirmIcon}>
                      <Icon name="alert-circle" size={48} color={theme.colors.error} />
                    </View>
                    <Text style={[styles.cancelConfirmTitle, { color: theme.colors.onSurface }]}>
                      Are you sure?
                    </Text>
                    <Text style={[styles.cancelConfirmDescription, { color: theme.colors.onSurfaceVariant }]}>
                      You're about to cancel your {selectedSubscription?.name} subscription.
                    </Text>
                    
                    <View style={styles.cancelConfirmDetails}>
                      <View style={styles.cancelConfirmRow}>
                        <Text style={[styles.cancelConfirmLabel, { color: theme.colors.onSurfaceVariant }]}>
                          Reason:
                        </Text>
                        <Text style={[styles.cancelConfirmValue, { color: theme.colors.onSurface }]}>
                          {cancelReason}
                        </Text>
                      </View>
                      {cancelFeedback && (
                        <View style={styles.cancelConfirmRow}>
                          <Text style={[styles.cancelConfirmLabel, { color: theme.colors.onSurfaceVariant }]}>
                            Feedback:
                          </Text>
                          <Text style={[styles.cancelConfirmValue, { color: theme.colors.onSurface }]}>
                            {cancelFeedback}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.cancelWarningBox}>
                      <Icon name="information" size={20} color={theme.colors.primary} />
                      <Text style={[styles.cancelWarningText, { color: theme.colors.onSurfaceVariant }]}>
                        This action cannot be undone. You'll lose access to all premium features.
                      </Text>
                    </View>
                  </View>
                )}

                {cancelStep === 'success' && (
                  <View style={styles.cancelSuccessStep}>
                    <View style={styles.cancelSuccessIcon}>
                      <Icon name="check-circle" size={64} color={theme.colors.primary} />
                    </View>
                    <Text style={[styles.cancelSuccessTitle, { color: theme.colors.onSurface }]}>
                      Subscription Cancelled
                    </Text>
                    <Text style={[styles.cancelSuccessDescription, { color: theme.colors.onSurfaceVariant }]}>
                      Your {selectedSubscription?.name} subscription has been successfully cancelled.
                    </Text>
                    
                    <View style={styles.cancelSuccessDetails}>
                      <View style={styles.cancelSuccessRow}>
                        <Text style={[styles.cancelSuccessLabel, { color: theme.colors.onSurfaceVariant }]}>
                          Cancelled on:
                        </Text>
                        <Text style={[styles.cancelSuccessValue, { color: theme.colors.onSurface }]}>
                          {new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Text>
                      </View>
                      <View style={styles.cancelSuccessRow}>
                        <Text style={[styles.cancelSuccessLabel, { color: theme.colors.onSurfaceVariant }]}>
                          Access until:
                        </Text>
                        <Text style={[styles.cancelSuccessValue, { color: theme.colors.onSurface }]}>
                          {selectedSubscription?.nextBillingDate || 'End of current period'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cancelSuccessNote}>
                      <Icon name="information" size={16} color={theme.colors.primary} />
                      <Text style={[styles.cancelSuccessNoteText, { color: theme.colors.onSurfaceVariant }]}>
                        You can reactivate anytime from your dashboard
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Actions */}
              <View style={styles.cancelModalActions}>
                {cancelStep === 'reason' && (
                  <GradientButton
                    title="Continue"
                    onPress={() => setCancelStep('feedback')}
                    variant="primary"
                    size="large"
                    disabled={!cancelReason}
                    style={styles.cancelActionButton}
                  />
                )}

                {cancelStep === 'feedback' && (
                  <View style={styles.cancelFeedbackActions}>
                    <GradientButton
                      title="Skip"
                      onPress={handleCancelFeedbackSubmit}
                      variant="secondary"
                      size="medium"
                      style={styles.cancelActionButton}
                    />
                    <GradientButton
                      title="Continue"
                      onPress={handleCancelFeedbackSubmit}
                      variant="primary"
                      size="medium"
                      style={styles.cancelActionButton}
                    />
                  </View>
                )}

                {cancelStep === 'confirm' && (
                  <View style={styles.cancelConfirmActions}>
                    <GradientButton
                      title="Keep Subscription"
                      onPress={handleCancelComplete}
                      variant="secondary"
                      size="medium"
                      style={styles.cancelActionButton}
                    />
                    <GradientButton
                      title="Cancel Subscription"
                      onPress={handleCancelConfirm}
                      variant="primary"
                      size="medium"
                      style={[styles.cancelActionButton, { backgroundColor: theme.colors.error }]}
                    />
                  </View>
                )}

                {cancelStep === 'success' && (
                  <GradientButton
                    title="Done"
                    onPress={handleCancelComplete}
                    variant="primary"
                    size="large"
                    style={styles.cancelActionButton}
                  />
                )}
              </View>
            </View>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}