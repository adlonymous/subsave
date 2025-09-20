import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Text, Title, Paragraph, Chip, IconButton } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { Card, Button } from '@/components';
import { useTheme } from '@/utils/theme-context';
import { Vault, Subscription } from '@/types';

// Mock data
const mockVault: Vault = {
  id: '1',
  name: 'Personal Subscriptions',
  description: 'My personal subscriptions',
  subscriptions: [
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
  ],
  totalAmount: 78.97,
  currency: 'USD',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

export default function VaultDetailScreen() {
  const { theme } = useTheme();
  const { vaultId } = useLocalSearchParams<{ vaultId: string }>();
  const [vault] = useState<Vault>(mockVault);

  const renderSubscriptionCard = ({ item }: { item: Subscription }) => (
    <Card style={styles.subscriptionCard}>
      <View style={styles.subscriptionHeader}>
        <View style={styles.subscriptionInfo}>
          <Title style={styles.subscriptionName}>{item.name}</Title>
          <Paragraph style={styles.subscriptionDescription}>
            {item.description}
          </Paragraph>
        </View>
        <Text style={[styles.subscriptionAmount, { color: theme.colors.primary }]}>
          ${item.amount.toFixed(2)}
        </Text>
      </View>
      
      <View style={styles.subscriptionDetails}>
        <Chip mode="outlined" compact style={styles.categoryChip}>
          {item.category}
        </Chip>
        <Chip mode="outlined" compact>
          {item.billingCycle}
        </Chip>
      </View>
      
      <View style={styles.subscriptionFooter}>
        <Text style={styles.nextBilling}>
          Next billing: {item.nextBillingDate}
        </Text>
        <View style={styles.subscriptionActions}>
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => {/* Edit subscription */}}
          />
          <IconButton
            icon="delete"
            size={20}
            onPress={() => {/* Delete subscription */}}
          />
        </View>
      </View>
    </Card>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 24,
      paddingTop: 60,
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      marginRight: 16,
    },
    headerContent: {
      flex: 1,
    },
    title: {
      marginBottom: 4,
    },
    subtitle: {
      opacity: 0.7,
    },
    totalAmount: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
      textAlign: 'center',
      marginVertical: 16,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
    },
    subscriptionCard: {
      marginBottom: 16,
    },
    subscriptionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    subscriptionInfo: {
      flex: 1,
      marginRight: 16,
    },
    subscriptionName: {
      fontSize: 16,
      marginBottom: 4,
    },
    subscriptionDescription: {
      fontSize: 14,
      opacity: 0.7,
    },
    subscriptionAmount: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    subscriptionDetails: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
    },
    categoryChip: {
      marginRight: 8,
    },
    subscriptionFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    nextBilling: {
      fontSize: 12,
      opacity: 0.6,
    },
    subscriptionActions: {
      flexDirection: 'row',
    },
    addButton: {
      marginTop: 16,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <View style={styles.headerContent}>
          <Title style={styles.title}>{vault.name}</Title>
          <Paragraph style={styles.subtitle}>
            {vault.description}
          </Paragraph>
        </View>
      </View>

      <Text style={styles.totalAmount}>
        Total: ${vault.totalAmount.toFixed(2)} {vault.currency}
      </Text>

      <View style={styles.content}>
        <FlatList
          data={vault.subscriptions}
          renderItem={renderSubscriptionCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
        
        <Button
          mode="contained"
          onPress={() => router.push(`/addSubscription?vaultId=${vaultId}`)}
          style={styles.addButton}
        >
          Add Subscription
        </Button>
      </View>
    </View>
  );
}
