import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView, Alert} from 'react-native';
import {
  Card,
  Text,
  Switch,
  List,
  Divider,
  Button,
  RadioButton,
  Dialog,
  Portal,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

import {ScreenWrapper} from '@/components/common';
import {useAuth} from '@/hooks/useAuth';
import {theme} from '@/theme/theme';
import {settingsService, AppSettings, ThemeMode, Language} from '@/services/settingsService';
import {useTheme} from '@/hooks/useTheme';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const {user, profile} = useAuth();
  const {currentTheme, setTheme} = useTheme();
  
  const [settings, setSettings] = useState<AppSettings>({
    notifications: {
      workOrderUpdates: true,
      emergencyAlerts: true,
      systemNotifications: true,
      soundEnabled: true,
      vibrationEnabled: true,
    },
    theme: 'system',
    language: 'en',
    privacy: {
      locationTracking: true,
      analyticsEnabled: true,
      crashReporting: true,
    },
    performance: {
      offlineMode: true,
      autoSync: true,
      imageQuality: 'medium',
    },
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [themeDialogVisible, setThemeDialogVisible] = useState(false);
  const [languageDialogVisible, setLanguageDialogVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>('system');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const userSettings = await settingsService.getSettings();
      setSettings(userSettings);
      setSelectedTheme(userSettings.theme);
      setSelectedLanguage(userSettings.language);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      setIsLoading(true);
      const updatedSettings = {...settings, ...newSettings};
      await settingsService.updateSettings(updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      Alert.alert('Error', 'Failed to update settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationToggle = (key: keyof AppSettings['notifications'], value: boolean) => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    });
  };

  const handlePrivacyToggle = (key: keyof AppSettings['privacy'], value: boolean) => {
    updateSettings({
      privacy: {
        ...settings.privacy,
        [key]: value,
      },
    });
  };

  const handlePerformanceToggle = (key: keyof AppSettings['performance'], value: boolean) => {
    updateSettings({
      performance: {
        ...settings.performance,
        [key]: value,
      },
    });
  };

  const handleThemeChange = async () => {
    await updateSettings({theme: selectedTheme});
    setTheme(selectedTheme);
    setThemeDialogVisible(false);
  };

  const handleLanguageChange = async () => {
    await updateSettings({language: selectedLanguage});
    setLanguageDialogVisible(false);
    // TODO: Implement language change logic
    Alert.alert(
      'Language Changed',
      'Language settings have been saved. Restart the app to apply changes.',
      [{text: 'OK'}]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data including offline work orders and images. Are you sure?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await settingsService.clearCache();
              Alert.alert('Success', 'Cache cleared successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache.');
            }
          },
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to their default values. Are you sure?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await settingsService.resetSettings();
              await loadSettings();
              Alert.alert('Success', 'Settings reset to defaults.');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset settings.');
            }
          },
        },
      ]
    );
  };

  const getThemeLabel = (theme: ThemeMode) => {
    switch (theme) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'system': return 'System Default';
      default: return 'System Default';
    }
  };

  const getLanguageLabel = (language: Language) => {
    switch (language) {
      case 'en': return 'English';
      case 'es': return 'Español';
      case 'fr': return 'Français';
      default: return 'English';
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Notifications Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Notifications
            </Text>
            
            <List.Item
              title="Work Order Updates"
              description="Receive notifications when work orders are assigned or updated"
              right={() => (
                <Switch
                  value={settings.notifications.workOrderUpdates}
                  onValueChange={(value) => handleNotificationToggle('workOrderUpdates', value)}
                  disabled={isLoading}
                />
              )}
            />
            
            <List.Item
              title="Emergency Alerts"
              description="Receive high-priority notifications for emergency work orders"
              right={() => (
                <Switch
                  value={settings.notifications.emergencyAlerts}
                  onValueChange={(value) => handleNotificationToggle('emergencyAlerts', value)}
                  disabled={isLoading}
                />
              )}
            />
            
            <List.Item
              title="System Notifications"
              description="Receive app updates and system maintenance notifications"
              right={() => (
                <Switch
                  value={settings.notifications.systemNotifications}
                  onValueChange={(value) => handleNotificationToggle('systemNotifications', value)}
                  disabled={isLoading}
                />
              )}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Sound"
              description="Play sound for notifications"
              right={() => (
                <Switch
                  value={settings.notifications.soundEnabled}
                  onValueChange={(value) => handleNotificationToggle('soundEnabled', value)}
                  disabled={isLoading}
                />
              )}
            />
            
            <List.Item
              title="Vibration"
              description="Vibrate for notifications"
              right={() => (
                <Switch
                  value={settings.notifications.vibrationEnabled}
                  onValueChange={(value) => handleNotificationToggle('vibrationEnabled', value)}
                  disabled={isLoading}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Appearance Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Appearance
            </Text>
            
            <List.Item
              title="Theme"
              description={getThemeLabel(settings.theme)}
              left={(props) => <List.Icon {...props} icon="palette" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => setThemeDialogVisible(true)}
            />
            
            <List.Item
              title="Language"
              description={getLanguageLabel(settings.language)}
              left={(props) => <List.Icon {...props} icon="translate" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => setLanguageDialogVisible(true)}
            />
          </Card.Content>
        </Card>

        {/* Privacy Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Privacy & Data
            </Text>
            
            <List.Item
              title="Location Tracking"
              description="Allow the app to track your location for work order management"
              right={() => (
                <Switch
                  value={settings.privacy.locationTracking}
                  onValueChange={(value) => handlePrivacyToggle('locationTracking', value)}
                  disabled={isLoading}
                />
              )}
            />
            
            <List.Item
              title="Analytics"
              description="Help improve the app by sharing anonymous usage data"
              right={() => (
                <Switch
                  value={settings.privacy.analyticsEnabled}
                  onValueChange={(value) => handlePrivacyToggle('analyticsEnabled', value)}
                  disabled={isLoading}
                />
              )}
            />
            
            <List.Item
              title="Crash Reporting"
              description="Automatically send crash reports to help fix issues"
              right={() => (
                <Switch
                  value={settings.privacy.crashReporting}
                  onValueChange={(value) => handlePrivacyToggle('crashReporting', value)}
                  disabled={isLoading}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Performance Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Performance
            </Text>
            
            <List.Item
              title="Offline Mode"
              description="Cache data for offline access"
              right={() => (
                <Switch
                  value={settings.performance.offlineMode}
                  onValueChange={(value) => handlePerformanceToggle('offlineMode', value)}
                  disabled={isLoading}
                />
              )}
            />
            
            <List.Item
              title="Auto Sync"
              description="Automatically sync data when online"
              right={() => (
                <Switch
                  value={settings.performance.autoSync}
                  onValueChange={(value) => handlePerformanceToggle('autoSync', value)}
                  disabled={isLoading}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Data Management */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Data Management
            </Text>
            
            <List.Item
              title="Clear Cache"
              description="Clear all cached data and images"
              left={(props) => <List.Icon {...props} icon="delete-sweep" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleClearCache}
            />
            
            <List.Item
              title="Reset Settings"
              description="Reset all settings to default values"
              left={(props) => <List.Icon {...props} icon="restore" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleResetSettings}
            />
          </Card.Content>
        </Card>

        {/* App Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              About
            </Text>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                Version:
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                1.0.0
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                User ID:
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                {user?.id?.substring(0, 8)}...
              </Text>
            </View>
            
            {profile?.technicianId && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.infoLabel}>
                  Technician ID:
                </Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {profile.technicianId}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Theme Selection Dialog */}
      <Portal>
        <Dialog visible={themeDialogVisible} onDismiss={() => setThemeDialogVisible(false)}>
          <Dialog.Title>Select Theme</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => setSelectedTheme(value as ThemeMode)}
              value={selectedTheme}
            >
              <RadioButton.Item label="Light" value="light" />
              <RadioButton.Item label="Dark" value="dark" />
              <RadioButton.Item label="System Default" value="system" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setThemeDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleThemeChange}>Apply</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Language Selection Dialog */}
      <Portal>
        <Dialog visible={languageDialogVisible} onDismiss={() => setLanguageDialogVisible(false)}>
          <Dialog.Title>Select Language</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => setSelectedLanguage(value as Language)}
              value={selectedLanguage}
            >
              <RadioButton.Item label="English" value="en" />
              <RadioButton.Item label="Español" value="es" />
              <RadioButton.Item label="Français" value="fr" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLanguageDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleLanguageChange}>Apply</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  card: {
    margin: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.onSurface,
  },
  divider: {
    marginVertical: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  infoLabel: {
    fontWeight: '500',
    color: theme.colors.onSurfaceVariant,
  },
  infoValue: {
    color: theme.colors.onSurface,
  },
});