import React from 'react';
import {StyleSheet} from 'react-native';
import {FAB} from 'react-native-paper';

interface FloatingActionButtonProps {
  icon: string;
  onPress: () => void;
  label?: string;
  visible?: boolean;
  style?: any;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onPress,
  label,
  visible = true,
  style,
}) => {
  if (!visible) return null;

  return (
    <FAB
      icon={icon}
      label={label}
      onPress={onPress}
      style={[styles.fab, style]}
    />
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});