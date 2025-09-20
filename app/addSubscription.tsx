import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Title, Paragraph, IconButton } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card, TextInput } from '@/components';
import { useTheme } from '@/utils/theme-context';

export default function AddSubscriptionScreen() {
  const { theme } = useTheme();
  const { vaultId } = useLocalSearchParams<{ vaultId?: string }>();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    currency: 'USD',
    billingCycle: 'monthly',
    category: '',
    nextBillingDate: '',
  });
  const [loading, setLoading] = useState(false);

  const billingCycles = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
  ];

  const categories = [
    'Entertainment',
    'Music',
    'Software',
    'Productivity',
    'News',
    'Fitness',
    'Education',
    'Other',
  ];

  const handleSave = async () => {
    if (!formData.name || !formData.amount) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    setLoading(true);
    // Simulate save process
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Subscription added successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }, 1000);
  };

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
    title: {
      flex: 1,
    },
    content: {
      flex: 1,
      padding: 24,
    },
    form: {
      gap: 16,
    },
    row: {
      flexDirection: 'row',
      gap: 16,
    },
    halfWidth: {
      flex: 1,
    },
    button: {
      marginTop: 24,
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
        <Title style={styles.title}>Add Subscription</Title>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.form}>
          <TextInput
            label="Subscription Name *"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="e.g., Netflix"
          />

          <TextInput
            label="Description"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Optional description"
            multiline
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <TextInput
                label="Amount *"
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfWidth}>
              <TextInput
                label="Currency"
                value={formData.currency}
                onChangeText={(text) => setFormData({ ...formData, currency: text })}
                placeholder="USD"
              />
            </View>
          </View>

          <TextInput
            label="Billing Cycle"
            value={formData.billingCycle}
            onChangeText={(text) => setFormData({ ...formData, billingCycle: text })}
            placeholder="monthly"
          />

          <TextInput
            label="Category"
            value={formData.category}
            onChangeText={(text) => setFormData({ ...formData, category: text })}
            placeholder="e.g., Entertainment"
          />

          <TextInput
            label="Next Billing Date"
            value={formData.nextBillingDate}
            onChangeText={(text) => setFormData({ ...formData, nextBillingDate: text })}
            placeholder="YYYY-MM-DD"
          />

          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Save Subscription
          </Button>
        </Card>
      </ScrollView>
    </View>
  );
}
