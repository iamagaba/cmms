import React, {useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {
  Modal,
  Portal,
  Card,
  Title,
  Paragraph,
  Button,
  ProgressBar,
} from 'react-native-paper';

interface SessionWarningModalProps {
  visible: boolean;
  timeRemaining: number; // in milliseconds
  onExtendSession: () => void;
  onLogout: () => void;
}

export const SessionWarningModal: React.FC<SessionWarningModalProps> = ({
  visible,
  timeRemaining,
  onExtendSession,
  onLogout,
}) => {
  const [countdown, setCountdown] = useState(timeRemaining);

  useEffect(() => {
    if (!visible) return;

    setCountdown(timeRemaining);

    const interval = setInterval(() => {
      setCountdown(prev => {
        const newValue = prev - 1000;
        if (newValue <= 0) {
          clearInterval(interval);
          onLogout();
          return 0;
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, timeRemaining, onLogout]);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = Math.max(0, countdown / timeRemaining);

  return (
    <Portal>
      <Modal
        visible={visible}
        dismissable={false}
        contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Session Expiring</Title>
            
            <Paragraph style={styles.message}>
              Your session will expire in {formatTime(countdown)} due to inactivity.
            </Paragraph>

            <View style={styles.progressContainer}>
              <ProgressBar
                progress={progress}
                color="#ff6b6b"
                style={styles.progressBar}
              />
            </View>

            <Paragraph style={styles.subMessage}>
              Would you like to extend your session?
            </Paragraph>

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={onLogout}
                style={[styles.button, styles.logoutButton]}
                labelStyle={styles.logoutButtonText}>
                Logout Now
              </Button>
              
              <Button
                mode="contained"
                onPress={onExtendSession}
                style={[styles.button, styles.extendButton]}>
                Stay Signed In
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  message: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  subMessage: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 14,
    opacity: 0.8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
  },
  extendButton: {
    backgroundColor: '#4CAF50',
  },
  logoutButton: {
    borderColor: '#ff6b6b',
  },
  logoutButtonText: {
    color: '#ff6b6b',
  },
});