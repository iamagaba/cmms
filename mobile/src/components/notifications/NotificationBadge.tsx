import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Badge } from 'react-native-paper';
import { useNotificationHandler } from '../../hooks/useNotificationHandler';

export interface NotificationBadgeProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  textColor?: string;
  showZero?: boolean;
  maxCount?: number;
  style?: any;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  size = 'medium',
  color = '#F44336',
  textColor = '#FFFFFF',
  showZero = false,
  maxCount = 99,
  style,
}) => {
  const { unreadCount, isLoading } = useNotificationHandler();

  if (isLoading || (!showZero && unreadCount === 0)) {
    return null;
  }

  const displayCount = unreadCount > maxCount ? `${maxCount}+` : unreadCount.toString();
  const badgeSize = getBadgeSize(size);

  return (
    <View style={[styles.container, style]}>
      <Badge
        size={badgeSize}
        style={[styles.badge, { backgroundColor: color }]}
      >
        <Text style={[styles.text, { color: textColor }, getTextStyle(size)]}>
          {displayCount}
        </Text>
      </Badge>
    </View>
  );
};

const getBadgeSize = (size: 'small' | 'medium' | 'large'): number => {
  switch (size) {
    case 'small': return 16;
    case 'medium': return 20;
    case 'large': return 24;
    default: return 20;
  }
};

const getTextStyle = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return { fontSize: 10, fontWeight: '600' as const };
    case 'medium':
      return { fontSize: 12, fontWeight: '600' as const };
    case 'large':
      return { fontSize: 14, fontWeight: '600' as const };
    default:
      return { fontSize: 12, fontWeight: '600' as const };
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 1,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    includeFontPadding: false,
  },
});

export default NotificationBadge;