import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Title, Paragraph, Chip, IconButton } from 'react-native-paper';
import { Card } from '@/components';
import { useTheme } from '@/utils/theme-context';
import { Notification } from '@/types';

// Mock data
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Netflix Billing Reminder',
    message: 'Your Netflix subscription will be charged $15.99 in 3 days',
    type: 'info',
    isRead: false,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    title: 'Spotify Payment Failed',
    message: 'Your Spotify payment could not be processed. Please update your payment method.',
    type: 'error',
    isRead: false,
    createdAt: '2024-01-14T14:20:00Z',
  },
  {
    id: '3',
    title: 'Adobe Creative Cloud Renewed',
    message: 'Your Adobe Creative Cloud subscription has been renewed for another month.',
    type: 'success',
    isRead: true,
    createdAt: '2024-01-10T09:15:00Z',
  },
  {
    id: '4',
    title: 'New Feature Available',
    message: 'You can now categorize your subscriptions for better organization.',
    type: 'info',
    isRead: true,
    createdAt: '2024-01-08T16:45:00Z',
  },
];

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const [notifications] = useState<Notification[]>(mockNotifications);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return 'information';
      case 'warning':
        return 'alert';
      case 'error':
        return 'alert-circle';
      case 'success':
        return 'check-circle';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return theme.colors.primary;
      case 'warning':
        return theme.colors.tertiary;
      case 'error':
        return theme.colors.error;
      case 'success':
        return theme.colors.primary;
      default:
        return theme.colors.onSurface;
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <Card style={[styles.notificationCard, !item.isRead && styles.unreadCard]}>
      <View style={styles.notificationHeader}>
        <View style={styles.notificationIcon}>
          <IconButton
            icon={getNotificationIcon(item.type)}
            size={20}
            iconColor={getNotificationColor(item.type)}
          />
        </View>
        <View style={styles.notificationContent}>
          <Title style={[styles.notificationTitle, !item.isRead && styles.unreadText]}>
            {item.title}
          </Title>
          <Paragraph style={styles.notificationMessage}>
            {item.message}
          </Paragraph>
          <View style={styles.notificationFooter}>
            <Chip
              mode="outlined"
              compact
              style={[styles.typeChip, { borderColor: getNotificationColor(item.type) }]}
            >
              {item.type}
            </Chip>
            <Text style={styles.notificationDate}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: 20,
      paddingBottom: 20,
    },
    header: {
      padding: 24,
      paddingTop: 60,
    },
    title: {
      marginBottom: 8,
    },
    subtitle: {
      opacity: 0.7,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
    },
    notificationCard: {
      marginBottom: 12,
    },
    unreadCard: {
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    notificationHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    notificationIcon: {
      marginRight: 12,
    },
    notificationContent: {
      flex: 1,
    },
    notificationTitle: {
      fontSize: 16,
      marginBottom: 4,
    },
    unreadText: {
      fontWeight: 'bold',
    },
    notificationMessage: {
      fontSize: 14,
      opacity: 0.8,
      marginBottom: 8,
    },
    notificationFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    typeChip: {
      height: 24,
    },
    notificationDate: {
      fontSize: 12,
      opacity: 0.6,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>
          Notifications {unreadCount > 0 && `(${unreadCount})`}
        </Title>
        <Paragraph style={styles.subtitle}>
          Stay updated with your subscriptions
        </Paragraph>
      </View>

      <View style={styles.content}>
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}
