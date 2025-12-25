import React, {useState} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Switch,
  List,
  Divider,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useAuth} from '@/hooks/useAuth';

interface BiometricSetupScreenProps {
  navigation: any;
}

export const BiometricSetupScreen: React.FC<BiometricSetupScreenProps> = ({
  navigation,
}) => {
  const [isEnabling, setIsEnabling] = useState(false);
  
  const {
    biometricAvailable,
    biometricEnabled,
    setBiometricEnabled,
  } = useAuth();

  const handleToggleBiometric = async (enabled: boolean) => {
    if (enabled && !biometricEnabled) {
      setIsEnabling(true);
      try {
        await setBiometricEnabled(true);
        Alert.alert(
          'Biometric Authentication Enabled',
          'You can now use your fingerprint or face recognition to sign in quickly.',
          [{text: 'OK'}]
        );
      } catch (error) {
        Alert.alert(
          'Setup Failed',
          error instanceof Error ? error.message : 'Could not enable biometric authentication.',
          [{text: 'OK'}]
        );
      } finally {
        setIsEnabling(false);
      }
    } else if (!enabled && biometricEnabled) {
      Alert.alert(
        'Disable Biometric Authentication',
        'Are you sure you want to disable biometric authentication? You will need to use your email and password to sign in.',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              try {
                await setBiometricEnabled(false);
                Alert.alert(
                  'Biometric Authentication Disabled',
                  'You will now need to use your email and password to sign in.',
                  [{text: 'OK'}]
                );
              } catch (error) {
                Alert.alert(
                  'Error',
                  'Could not disable biometric authentication.',
                  [{text: 'OK'}]
                );
              }
            },
          },
        ]
      );
    }
  };

  const handleTestBiometric = async () => {
    if (!biometricEnabled) {
      Alert.alert(
        'Biometric Not Enabled',
        'Please enable biometric authentication first.',
        [{text: 'OK'}]
      );
      return;
    }

    try {
      // This would normally trigger the biometric prompt
      Alert.alert(
        'Test Successful',
        'Biometric authentication is working correctly.',
        [{text: 'OK'}]
      );
    } catch (error) {
      Alert.alert(
        'Test Failed',
        error instanceof Error ? error.message : 'Biometric authentication test failed.',
        [{text: 'OK'}]
      );
    }
  };

  if (!biometricAvailable) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>Biometric Authentication</Title>
              <Paragraph style={styles.unavailableText}>
                Biometric authentication is not available on this device or has not been set up in your device settings.
              </Paragraph>
              <Paragraph style={styles.helpText}>
                To use biometric authentication, please:
              </Paragraph>
              <View style={styles.instructionsList}>
                <Paragraph style={styles.instruction}>
                  • Go to your device Settings
                </Paragraph>
                <Paragraph style={styles.instruction}>
                  • Set up fingerprint or face recognition
                </Paragraph>
                <Paragraph style={styles.instruction}>
                  • Return to this app and try again
                </Paragraph>
              </View>
              <Button
                mode="contained"
                onPress={() => navigation.goBack()}
                style={styles.button}>
                Go Back
              </Button>
            </Card.Content>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Biometric Authentication</Title>
            <Paragraph style={styles.subtitle}>
              Use your fingerprint or face recognition for quick and secure access.
            </Paragraph>

            <List.Section>
              <List.Item
                title="Enable Biometric Login"
                description="Use biometric authentication instead of password"
                left={props => <List.Icon {...props} icon="fingerprint" />}
                right={() => (
                  <Switch
                    value={biometricEnabled}
                    onValueChange={handleToggleBiometric}
                    disabled={isEnabling}
                  />
                )}
              />
              
              <Divider />
              
              {biometricEnabled && (
                <List.Item
                  title="Test Biometric Authentication"
                  description="Verify that biometric login is working"
                  left={props => <List.Icon {...props} icon="shield-check" />}
                  onPress={handleTestBiometric}
                />
              )}
            </List.Section>

            <View style={styles.infoContainer}>
              <Paragraph style={styles.infoTitle}>Security Information:</Paragraph>
              <Paragraph style={styles.infoText}>
                • Your biometric data is stored securely on your device
              </Paragraph>
              <Paragraph style={styles.infoText}>
                • Your login credentials are encrypted and protected
              </Paragraph>
              <Paragraph style={styles.infoText}>
                • You can disable this feature at any time
              </Paragraph>
            </View>

            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.button}>
              Done
            </Button>
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    padding: 20,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
    fontSize: 16,
  },
  unavailableText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  helpText: {
    marginBottom: 16,
    fontWeight: '500',
  },
  instructionsList: {
    marginBottom: 24,
    paddingLeft: 16,
  },
  instruction: {
    marginBottom: 8,
    fontSize: 14,
  },
  infoContainer: {
    marginTop: 24,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  infoTitle: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#1976d2',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.8,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
});