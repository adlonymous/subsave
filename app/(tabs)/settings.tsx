import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Modal, TouchableOpacity } from 'react-native';
import { Text, Title, Paragraph, List, Switch, Divider, IconButton, TextInput, Portal } from 'react-native-paper';
import { Card, Button, GradientButton } from '@/components';
import { useTheme } from '@/utils/theme-context';
import { useAuth } from '@/utils/auth-context';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode, isDark } = useTheme();
  const { user, logout, updateDisplayName } = useAuth();
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || 'User');
  const [tempName, setTempName] = useState(user?.name || 'User');

  const handleThemeChange = (mode: 'light' | 'dark' | 'auto') => {
    setThemeMode(mode);
  };

  const handleEditName = () => {
    setTempName(displayName);
    setShowEditNameModal(true);
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      const newName = tempName.trim();
      setDisplayName(newName);
      updateDisplayName(newName);
      setShowEditNameModal(false);
      Alert.alert('Success', 'Name updated successfully!');
    } else {
      Alert.alert('Error', 'Please enter a valid name');
    }
  };

  const handleCancelEdit = () => {
    setTempName(displayName);
    setShowEditNameModal(false);
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
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    avatar: {
      marginRight: 16,
    },
    userDetails: {
      flex: 1,
    },
    userName: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 4,
      color: theme.colors.onSurface,
    },
    userEmail: {
      opacity: 0.7,
      marginBottom: 4,
      color: theme.colors.onSurfaceVariant,
    },
    editHint: {
      fontSize: 12,
      color: theme.colors.primary,
      fontStyle: 'italic',
    },
    editIcon: {
      marginLeft: 8,
    },
    // Modal Styles
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
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    modalDescription: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 20,
    },
    nameInput: {
      marginBottom: 24,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
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
          <TouchableOpacity onPress={handleEditName} style={styles.userInfo}>
            <IconButton
              icon="account-circle"
              size={64}
              iconColor={theme.colors.primary}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{displayName}</Text>
              <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
              <Text style={styles.editHint}>Tap to edit name</Text>
            </View>
            <IconButton
              icon="pencil"
              size={20}
              iconColor={theme.colors.primary}
              style={styles.editIcon}
            />
          </TouchableOpacity>
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

        <GradientButton
          title="Logout"
          onPress={handleLogout}
          variant="primary"
          size="large"
          style={styles.logoutButton}
        />
      </ScrollView>

      {/* Edit Name Modal */}
      <Portal>
        <Modal
          visible={showEditNameModal}
          onDismiss={handleCancelEdit}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Name</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={handleCancelEdit}
                />
              </View>
              
              <Text style={styles.modalDescription}>
                Update your display name
              </Text>
              
              <TextInput
                label="Name"
                value={tempName}
                onChangeText={setTempName}
                mode="outlined"
                style={styles.nameInput}
                autoFocus
                maxLength={50}
              />
              
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={handleCancelEdit}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveName}
                  style={styles.modalButton}
                >
                  Save
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}
