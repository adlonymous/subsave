import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, FlatList, RefreshControl } from 'react-native';
import { Text, Title, Paragraph, FAB, Chip, Appbar, Avatar, List, Divider, Card } from 'react-native-paper';
import { router } from 'expo-router';
import { Button } from '@/components';
import { useTheme } from '@/utils/theme-context';
import { useAuth } from '@/utils/auth-context';
import { Vault, Subscription } from '@/types';

// Mock data
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
    name: 'Microsoft 365',
    description: 'Productivity suite',
    amount: 6.99,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBillingDate: '2024-02-25',
    category: 'Productivity',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '5',
    name: 'Gym Membership',
    description: 'Fitness center access',
    amount: 29.99,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBillingDate: '2024-02-28',
    category: 'Fitness',
    isActive: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

const mockData = {
  totalMonthlyCost: 95.95, // Total of all active subscriptions
  projectedYield: 7.0, // 7% APY as requested
  monthlyEarnings: 6.72, // 7% of total monthly cost
  netSavings: -89.23, // What you're actually paying (cost - earnings)
  activeSubscriptions: 4,
  pausedSubscriptions: 1,
  nextCharges: [
    { service: 'Adobe Creative Cloud', date: '2024-02-10', amount: 52.99 },
    { service: 'Netflix', date: '2024-02-15', amount: 15.99 },
    { service: 'Spotify', date: '2024-02-20', amount: 9.99 },
  ],
};

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setSubscriptions([...mockSubscriptions]);
      setRefreshing(false);
    }, 1000);
  }, []);

  const getServiceIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'entertainment':
        return 'television';
      case 'music':
        return 'music';
      case 'software':
        return 'laptop';
      case 'productivity':
        return 'briefcase';
      case 'fitness':
        return 'dumbbell';
      default:
        return 'package-variant';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderSummaryCard = (title: string, value: string, subtitle: string, color?: string) => (
    <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.summaryCardContent}>
        <Text style={[styles.summaryValue, { color: color || theme.colors.primary }]}>
          {value}
        </Text>
        <Text style={[styles.summaryTitle, { color: theme.colors.onSurface }]}>{title}</Text>
        <Text style={[styles.summarySubtitle, { color: theme.colors.onSurface }]}>{subtitle}</Text>
      </View>
    </View>
  );

  const renderNextCharge = (charge: any, index: number) => (
    <List.Item
      key={index}
      title={charge.service}
      description={`${formatDate(charge.date)} • $${charge.amount.toFixed(2)}`}
      left={(props) => <List.Icon {...props} icon="calendar-clock" />}
      style={styles.nextChargeItem}
    />
  );

  const renderSubscription = ({ item }: { item: Subscription }) => (
    <Card 
      style={styles.subscriptionCard}
      onPress={() => router.push(`/vaultDetail?vaultId=1`)}
    >
      <Card.Content>
        <View style={styles.subscriptionHeader}>
          <View style={styles.subscriptionInfo}>
            <List.Icon icon={getServiceIcon(item.category)} size={24} />
            <View style={styles.subscriptionDetails}>
              <Title style={styles.subscriptionName}>{item.name}</Title>
              <Paragraph style={styles.subscriptionDescription}>
                {item.description}
              </Paragraph>
            </View>
          </View>
          <View style={styles.subscriptionAmount}>
            <Text style={[styles.amount, { color: item.isActive ? theme.colors.error : theme.colors.outline }]}>
              ${item.amount.toFixed(2)}
            </Text>
            <Text style={styles.billingCycle}>per {item.billingCycle}</Text>
            {item.isActive && (
              <Text style={styles.yieldText}>
                +${(item.amount * 0.07).toFixed(2)} yield
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.subscriptionFooter}>
          <View style={styles.subscriptionMeta}>
            <Text style={styles.nextCharge}>
              Next: {formatDate(item.nextBillingDate)}
            </Text>
            <Chip 
              mode={item.isActive ? "contained" : "outlined"}
              compact
              style={[
                styles.statusChip,
                { 
                  backgroundColor: item.isActive 
                    ? theme.colors.primaryContainer 
                    : 'transparent'
                }
              ]}
            >
              {item.isActive ? 'Active' : 'Paused'}
            </Chip>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    summarySection: {
      padding: 20,
      gap: 20,
    },
    financialGrid: {
      flexDirection: 'row',
      gap: 16,
    },
    summaryCard: {
      flex: 1,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.outline + '20',
    },
    summaryCardContent: {
      padding: 20,
    },
    summaryValue: {
      fontSize: 32,
      fontWeight: '800',
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    summaryTitle: {
      fontSize: 16,
      marginBottom: 6,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    summarySubtitle: {
      fontSize: 13,
      opacity: 0.8,
      lineHeight: 18,
    },
    netCostCard: {
      marginTop: 12,
      borderRadius: 20,
      borderWidth: 1,
      padding: 20,
    },
    netCostContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    netCostLabel: {
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
    netCostAmount: {
      fontSize: 28,
      fontWeight: '900',
      marginTop: 6,
      letterSpacing: -0.8,
    },
    netCostSubtext: {
      fontSize: 13,
      opacity: 0.9,
      fontWeight: '500',
    },
    subscriptionsHeader: {
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    subscriptionsSubtitle: {
      fontSize: 15,
      opacity: 0.8,
      marginTop: 6,
      fontWeight: '500',
    },
    section: {
      paddingHorizontal: 20,
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: '800',
      marginBottom: 20,
      color: theme.colors.onBackground,
      letterSpacing: -0.5,
    },
    nextChargesCard: {
      marginTop: 12,
      borderRadius: 16,
    },
    nextChargeItem: {
      paddingVertical: 12,
    },
    subscriptionCard: {
      marginBottom: 16,
      borderRadius: 20,
    },
    subscriptionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    subscriptionInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    subscriptionDetails: {
      marginLeft: 16,
      flex: 1,
    },
    subscriptionName: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 6,
      letterSpacing: -0.2,
    },
    subscriptionDescription: {
      fontSize: 14,
      opacity: 0.7,
      lineHeight: 20,
    },
    subscriptionAmount: {
      alignItems: 'flex-end',
      minWidth: 100,
    },
    amount: {
      fontSize: 22,
      fontWeight: '800',
      letterSpacing: -0.5,
    },
    billingCycle: {
      fontSize: 13,
      opacity: 0.6,
      textTransform: 'capitalize',
      fontWeight: '500',
      marginTop: 2,
    },
    yieldText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '700',
      marginTop: 4,
      backgroundColor: theme.colors.primaryContainer,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
    },
    subscriptionFooter: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline + '20',
    },
    subscriptionMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    nextCharge: {
      fontSize: 13,
      opacity: 0.7,
      fontWeight: '500',
    },
    statusChip: {
      height: 28,
      borderRadius: 14,
    },
    fab: {
      position: 'absolute',
      margin: 24,
      right: 0,
      bottom: 0,
    },
  });

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content 
          title="Dashboard" 
          titleStyle={{ fontSize: 24, fontWeight: '700', letterSpacing: -0.5 }}
        />
        <Appbar.Action 
          icon="account-circle" 
          onPress={() => router.push('/settings')}
          iconColor={theme.colors.primary}
        />
      </Appbar.Header>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Financial Overview */}
        <View style={styles.summarySection}>
          <Title style={styles.sectionTitle}>Financial Overview</Title>
          
          {/* Main financial metrics */}
          <View style={styles.financialGrid}>
            {renderSummaryCard(
              'Monthly Subscriptions',
              `$${mockData.totalMonthlyCost.toFixed(2)}`,
              `${mockData.activeSubscriptions} active, ${mockData.pausedSubscriptions} paused`,
              theme.colors.error
            )}
            
            {renderSummaryCard(
              'Projected Yield',
              `${mockData.projectedYield}% APY`,
              `$${mockData.monthlyEarnings.toFixed(2)} earned this month`,
              theme.colors.primary
            )}
          </View>
          
          {/* Net cost card */}
          <View style={[styles.netCostCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline + '20' }]}>
            <View style={styles.netCostContent}>
              <View>
                <Text style={[styles.netCostLabel, { color: theme.colors.onSurfaceVariant }]}>
                  What you're actually paying:
                </Text>
                <Text style={[styles.netCostAmount, { color: theme.colors.onSurfaceVariant }]}>
                  ${Math.abs(mockData.netSavings).toFixed(2)}/month
                </Text>
              </View>
              <Text style={[styles.netCostSubtext, { color: theme.colors.onSurfaceVariant }]}>
                After ${mockData.monthlyEarnings.toFixed(2)} yield
              </Text>
            </View>
          </View>
        </View>

        {/* Next Charges */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Next Charges</Title>
          <Card style={styles.nextChargesCard}>
            <Card.Content>
              {mockData.nextCharges.map(renderNextCharge)}
            </Card.Content>
          </Card>
        </View>

        {/* Subscriptions List */}
        <View style={styles.section}>
          <View style={styles.subscriptionsHeader}>
            <Title style={styles.sectionTitle}>Your Subscriptions</Title>
            <Text style={styles.subscriptionsSubtitle}>
              Total: ${mockData.totalMonthlyCost.toFixed(2)}/month
            </Text>
          </View>
          <FlatList
            data={subscriptions}
            renderItem={renderSubscription}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/addSubscription')}
        label="Add Subscription"
      />
    </View>
  );
}
