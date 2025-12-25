import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  maxWidth?: number;
  centered?: boolean;
  spacing?: 'none' | 'small' | 'medium' | 'large';
}

const SPACING_VALUES = {
  none: 0,
  small: 8,
  medium: 16,
  large: 24,
};

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  maxWidth = 600,
  centered = true,
  spacing = 'medium',
}) => {
  const {width: screenWidth} = Dimensions.get('window');
  
  const isTablet = screenWidth >= 768;
  const spacingValue = SPACING_VALUES[spacing];

  const containerStyle = [
    styles.container,
    {
      maxWidth: isTablet ? maxWidth : '100%',
      padding: spacingValue,
    },
    centered && styles.centered,
  ];

  return <View style={containerStyle}>{children}</View>;
};

export const ResponsiveGrid: React.FC<{
  children: React.ReactNode;
  columns?: number;
  spacing?: number;
}> = ({children, columns = 2, spacing = 16}) => {
  const {width: screenWidth} = Dimensions.get('window');
  
  // Adjust columns based on screen size
  const responsiveColumns = screenWidth < 480 ? 1 : columns;
  
  return (
    <View style={[styles.grid, {gap: spacing}]}>
      {React.Children.map(children, (child, _index) => (
        <View
          style={[
            styles.gridItem,
            {
              width: `${100 / responsiveColumns}%`,
              marginBottom: spacing,
            },
          ]}>
          {child}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  centered: {
    alignSelf: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    paddingHorizontal: 4,
  },
});