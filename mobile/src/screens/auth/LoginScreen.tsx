import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Alert, Keyboard} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  HelperText,
  Divider,
  Chip,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useAuth} from '@/hooks/useAuth';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);

  const {
    signIn,
    authenticateWithBiometrics,
    setBiometricEnabled,
    isLoading,
    biometricAvailable,
    biometricEnabled,
  } = useAuth();

  useEffect(() => {
    // Show biometric setup option after successful login if available but not enabled
    if (biometricAvailable && !biometricEnabled) {
      setShowBiometricSetup(true);
    }
  }, [biometricAvailable, biometricEnabled]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  const handleSignIn = async () => {
    // Dismiss keyboard
    Keyboard.dismiss();
    
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setEmailError(emailErr);
    setPasswordError(passwordErr);

    if (emailErr || passwordErr) {
      return;
    }

    try {
      await signIn(email.trim(), password);
      
      // After successful login, offer biometric setup if available
      if (biometricAvailable && !biometricEnabled) {
        setTimeout(() => {
          Alert.alert(
            'Enable Biometric Authentication?',
            'Would you like to enable fingerprint or face recognition for faster login?',
            [
              {text: 'Not Now', style: 'cancel'},
              {
                text: 'Enable',
                onPress: handleEnableBiometrics,
              },
            ]
          );
        }, 1000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      // Provide more specific error messages
      let userMessage = errorMessage;
      if (errorMessage.includes('Invalid login credentials')) {
        userMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (errorMessage.includes('Email not confirmed')) {
        userMessage = 'Please check your email and confirm your account before signing in.';
      } else if (errorMessage.includes('Too many requests')) {
        userMessage = 'Too many login attempts. Please wait a moment before trying again.';
      }
      
      Alert.alert('Login Failed', userMessage);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      await authenticateWithBiometrics();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Biometric authentication failed';
      
      // Provide helpful error messages for biometric failures
      let userMessage = errorMessage;
      if (errorMessage.includes('No stored credentials')) {
        userMessage = 'Please sign in with email and password first to enable biometric authentication.';
      } else if (errorMessage.includes('cancelled') || errorMessage.includes('canceled')) {
        return; // Don't show error for user cancellation
      }
      
      Alert.alert('Biometric Authentication Failed', userMessage);
    }
  };

  const handleEnableBiometrics = async () => {
    try {
      await setBiometricEnabled(true);
      setShowBiometricSetup(false);
      Alert.alert(
        'Biometric Authentication Enabled',
        'You can now use your fingerprint or face recognition to sign in quickly.'
      );
    } catch (error) {
      Alert.alert(
        'Setup Failed',
        'Could not enable biometric authentication. You can enable it later in settings.'
      );
    }
  };

  const handleKeyPress = (key: string) => {
    if (key === 'Enter') {
      handleSignIn();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>CMMS Mobile</Title>
            <Paragraph style={styles.subtitle}>
              Sign in to access your work orders
            </Paragraph>

            {showBiometricSetup && (
              <View style={styles.biometricSetupContainer}>
                <Chip
                  icon="fingerprint"
                  onPress={handleEnableBiometrics}
                  style={styles.biometricSetupChip}>
                  Enable Biometric Login
                </Chip>
              </View>
            )}

            <TextInput
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
              }}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              error={!!emailError}
              style={styles.input}
              onSubmitEditing={() => handleSignIn()}
              returnKeyType="next"
            />
            <HelperText type="error" visible={!!emailError}>
              {emailError}
            </HelperText>

            <TextInput
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError('');
              }}
              mode="outlined"
              secureTextEntry={!showPassword}
              autoComplete="password"
              autoCorrect={false}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              error={!!passwordError}
              style={styles.input}
              onSubmitEditing={handleSignIn}
              returnKeyType="done"
            />
            <HelperText type="error" visible={!!passwordError}>
              {passwordError}
            </HelperText>

            <Button
              mode="contained"
              onPress={handleSignIn}
              loading={isLoading}
              disabled={isLoading || !email.trim() || !password}
              style={styles.button}>
              Sign In
            </Button>

            {biometricAvailable && biometricEnabled && (
              <>
                <View style={styles.dividerContainer}>
                  <Divider style={styles.divider} />
                  <Paragraph style={styles.dividerText}>or</Paragraph>
                  <Divider style={styles.divider} />
                </View>

                <Button
                  mode="outlined"
                  onPress={handleBiometricAuth}
                  disabled={isLoading}
                  style={styles.biometricButton}
                  icon="fingerprint">
                  Use Biometric Authentication
                </Button>
              </>
            )}

            <View style={styles.helpContainer}>
              <Paragraph style={styles.helpText}>
                Need help? Contact your system administrator.
              </Paragraph>
            </View>
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
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    padding: 20,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
    fontSize: 16,
  },
  biometricSetupContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  biometricSetupChip: {
    backgroundColor: '#e3f2fd',
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    opacity: 0.6,
    fontSize: 14,
  },
  biometricButton: {
    paddingVertical: 8,
  },
  helpContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  helpText: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
});