import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Title, Paragraph, List, Switch, Divider, IconButton } from 'react-native-paper';
import { Card, Button } from '@/components';
import { useTheme } from '@/utils/theme-context';
import { useAuth } from '@/utils/auth-context';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode, isDark } = useTheme();
  const { user, logout } = useAuth();

  const handleThemeChange = (mode: 'light' | 'dark' | 'auto') => {
    setThemeMode(mode);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
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
      padding: 24,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
      color: theme.colors.primary,
    },
    listItem: {
      paddingVertical: 8,
    },
    logoutButton: {
      marginTop: 24,
    },
    userInfo: {
      alignItems: 'center',
      marginBottom: 24,
    },
    avatar: {
      marginBottom: 12,
    },
    userName: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    userEmail: {
      opacity: 0.7,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Settings</Title>
        <Paragraph style={styles.subtitle}>
          Customize your app experience
        </Paragraph>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.section}>
          <View style={styles.userInfo}>
            <IconButton
              icon="account-circle"
              size={64}
              iconColor={theme.colors.primary}
              style={styles.avatar}
            />
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <Card>
            <List.Item
              title="Theme"
              description="Choose your preferred theme"
              left={(props) => <List.Icon {...props} icon="palette" />}
              right={() => (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <IconButton
                    icon="weather-sunny"
                    size={20}
                    iconColor={themeMode === 'light' ? theme.colors.primary : theme.colors.onSurfaceVariant}
                    onPress={() => handleThemeChange('light')}
                  />
                  <IconButton
                    icon="weather-night"
                    size={20}
                    iconColor={themeMode === 'dark' ? theme.colors.primary : theme.colors.onSurfaceVariant}
                    onPress={() => handleThemeChange('dark')}
                  />
                  <IconButton
                    icon="theme-light-dark"
                    size={20}
                    iconColor={themeMode === 'auto' ? theme.colors.primary : theme.colors.onSurfaceVariant}
                    onPress={() => handleThemeChange('auto')}
                  />
                </View>
              )}
            />
            <Divider />
            <List.Item
              title="Dark Mode"
              description={isDark ? 'Enabled' : 'Disabled'}
              left={(props) => <List.Icon {...props} icon="brightness-6" />}
              right={() => (
                <Switch
                  value={isDark}
                  onValueChange={(value) => setThemeMode(value ? 'dark' : 'light')}
                />
              )}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <Card>
            <List.Item
              title="Push Notifications"
              description="Receive notifications about your subscriptions"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={() => <Switch value={true} />}
            />
            <Divider />
            <List.Item
              title="Email Notifications"
              description="Receive email updates"
              left={(props) => <List.Icon {...props} icon="email" />}
              right={() => <Switch value={true} />}
            />
            <Divider />
            <List.Item
              title="Billing Reminders"
              description="Get reminded before payments"
              left={(props) => <List.Icon {...props} icon="credit-card" />}
              right={() => <Switch value={true} />}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Card>
            <List.Item
              title="Profile"
              description="Edit your profile information"
              left={(props) => <List.Icon {...props} icon="account" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {/* Navigate to profile */}}
            />
            <Divider />
            <List.Item
              title="Privacy & Security"
              description="Manage your privacy settings"
              left={(props) => <List.Icon {...props} icon="shield-account" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {/* Navigate to privacy */}}
            />
            <Divider />
            <List.Item
              title="Data & Storage"
              description="Manage your data and storage"
              left={(props) => <List.Icon {...props} icon="database" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {/* Navigate to data */}}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <Card>
            <List.Item
              title="Help Center"
              description="Get help and support"
              left={(props) => <List.Icon {...props} icon="help-circle" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {/* Navigate to help */}}
            />
            <Divider />
            <List.Item
              title="Contact Us"
              description="Send us feedback"
              left={(props) => <List.Icon {...props} icon="message" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {/* Navigate to contact */}}
            />
            <Divider />
            <List.Item
              title="About"
              description="App version and information"
              left={(props) => <List.Icon {...props} icon="information" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {/* Navigate to about */}}
            />
          </Card>
        </View>

        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor="transparent"
          textColor={theme.colors.error}
        >
          Logout
        </Button>
      </ScrollView>
    </View>
  );
}
