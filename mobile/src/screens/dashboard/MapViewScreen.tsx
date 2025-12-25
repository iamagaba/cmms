import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, Card, Button} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

import {ScreenWrapper} from '@/components/common';

export const MapViewScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Card style={styles.placeholderCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              Map View
            </Text>
            <Text style={styles.description}>
              Interactive map showing work order locations and navigation will be implemented in task 6.2.
            </Text>
            <Text style={styles.features}>
              Features to be implemented:
              {'\n'}• Work order location markers
              {'\n'}• Technician current location
              {'\n'}• Navigation to customer locations
              {'\n'}• Proximity-based check-in
              {'\n'}• Distance and travel time calculations
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              Back to Dashboard
            </Button>
          </Card.Content>
        </Card>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  placeholderCard: {
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  features: {
    marginBottom: 24,
    lineHeight: 24,
  },
  backButton: {
    alignSelf: 'center',
  },
});