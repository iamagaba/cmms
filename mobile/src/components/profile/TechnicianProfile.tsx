import React, {useState} from 'react';
import {View, StyleSheet, ScrollView, Alert} from 'react-native';
import {
  Card,
  Text,
  Avatar,
  Button,
  Chip,
  Divider,
  List,
  IconButton,
} from 'react-native-paper';
import {useAuth} from '@/hooks/useAuth';
import {usePermissions} from '@/hooks/usePermissions';
import {Permission, Role} from '@/services/permissions';
import {RoleGuard} from '@/components/auth/RoleGuard';
import {theme} from '@/theme/theme';
import {profileService, FullUserProfile} from '@/services/profileService';

interface TechnicianProfileProps {
  onEditProfile?: () => void;
  onViewPerformance?: () => void;
  onOpenSettings?: () => void;
}

export const TechnicianProfile: React.FC<TechnicianProfileProps> = ({
  onEditProfile,
  onViewPerformance,
  onOpenSettings,
}) => {
  const {user, profile, refreshProfile, signOut} = useAuth();
  const permissions = usePermissions();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fullProfile, setFullProfile] = useState<FullUserProfile | null>(null);

  const handleRefreshProfile = async () => {
    try {
      setIsRefreshing(true);
      await refreshProfile();
      if (profile?.id) {
        const updatedProfile = await profileService.getFullProfile(profile.id);
        setFullProfile(updatedProfile);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh profile information');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Load full profile data on mount and when profile changes
  React.useEffect(() => {
    if (profile?.id) {
      profileService.getFullProfile(profile.id).then(setFullProfile);
    }
  }, [profile?.id]);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const getUserInitials = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
    }
    if (profile?.firstName) {
      return profile.firstName[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'T';
  };

  const getDisplayName = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    if (profile?.firstName) {
      return profile.firstName;
    }
    return user?.email || 'Technician';
  };

  const getRoleChipColor = () => {
    const role = permissions.getUserRole();
    switch (role) {
      case Role.ADMIN:
        return theme.colors.error;
      case Role.TECHNICIAN:
        return theme.colors.primary;
      default:
        return theme.colors.outline;
    }
  };

  const getRoleLabel = () => {
    const role = permissions.getUserRole();
    switch (role) {
      case Role.ADMIN:
        return 'Administrator';
      case Role.TECHNICIAN:
        return 'Technician';
      default:
        return 'Unknown Role';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <View style={styles.avatarSection}>
            {profile?.avatarUrl ? (
              <Avatar.Image
                size={80}
                source={{uri: profile.avatarUrl}}
              />
            ) : (
              <Avatar.Text
                size={80}
                label={getUserInitials()}
                style={{backgroundColor: theme.colors.primary}}
              />
            )}
            <IconButton
              icon="refresh"
              size={20}
              onPress={handleRefreshProfile}
              loading={isRefreshing}
              style={styles.refreshButton}
            />
          </View>
          
          <View style={styles.profileInfo}>
            <Text variant="headlineSmall" style={styles.name}>
              {getDisplayName()}
            </Text>
            <Text variant="bodyMedium" style={styles.email}>
              {user?.email}
            </Text>
            
            <View style={styles.roleSection}>
              <Chip
                icon="account-circle"
                style={[styles.roleChip, {backgroundColor: getRoleChipColor()}]}
                textStyle={{color: theme.colors.onPrimary}}
              >
                {getRoleLabel()}
              </Chip>
              
              {profile?.technicianId && (
                <Chip
                  icon="wrench"
                  style={styles.technicianChip}
                  textStyle={{color: theme.colors.onSurfaceVariant}}
                >
                  ID: {profile.technicianId}
                </Chip>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Profile Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Profile Actions
          </Text>
          
          <RoleGuard requiredPermissions={[Permission.UPDATE_PROFILE]}>
            <List.Item
              title="Edit Profile"
              description="Update your personal information"
              left={(props) => <List.Icon {...props} icon="account-edit" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={onEditProfile}
              style={styles.listItem}
            />
          </RoleGuard>
          
          <RoleGuard requiredPermissions={[Permission.VIEW_PERFORMANCE]}>
            <List.Item
              title="Performance Metrics"
              description="View your work statistics"
              left={(props) => <List.Icon {...props} icon="chart-line" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={onViewPerformance}
              style={styles.listItem}
            />
          </RoleGuard>
          
          <List.Item
            title="Settings"
            description="App preferences and configuration"
            left={(props) => <List.Icon {...props} icon="cog" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={onOpenSettings}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      {/* Technician Information */}
      {permissions.isTechnician() && (
        <Card style={styles.technicianCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Technician Information
            </Text>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                Technician ID:
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                {profile?.technicianId || 'Not assigned'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                Role:
              </Text>
              <Text variant="bodyMedium" style={styles.infoValue}>
                Field Technician
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.infoLabel}>
                Status:
              </Text>
              <Text variant="bodyMedium" style={[styles.infoValue, styles.activeStatus]}>
                Active
              </Text>
            </View>

            {fullProfile?.specialization && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.infoLabel}>
                  Specialization:
                </Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {fullProfile.specialization}
                </Text>
              </View>
            )}

            {fullProfile?.phone && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.infoLabel}>
                  Phone:
                </Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {fullProfile.phone}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Permissions Information (Admin only) */}
      <RoleGuard allowedRoles={[Role.ADMIN]}>
        <Card style={styles.permissionsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Permissions
            </Text>
            <Text variant="bodySmall" style={styles.permissionsNote}>
              As an administrator, you have access to all features.
            </Text>
          </Card.Content>
        </Card>
      </RoleGuard>

      <Divider style={styles.divider} />

      {/* Sign Out */}
      <View style={styles.signOutSection}>
        <Button
          mode="outlined"
          onPress={handleSignOut}
          icon="logout"
          style={styles.signOutButton}
          textColor={theme.colors.error}
        >
          Sign Out
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  profileCard: {
    margin: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  profileContent: {
    alignItems: 'center',
  },
  avatarSection: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  refreshButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: theme.colors.surface,
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  name: {
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  email: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  roleSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  roleChip: {
    marginHorizontal: theme.spacing.xs,
  },
  technicianChip: {
    backgroundColor: theme.colors.surfaceVariant,
    marginHorizontal: theme.spacing.xs,
  },
  actionsCard: {
    margin: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  technicianCard: {
    margin: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  permissionsCard: {
    margin: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.onSurface,
  },
  listItem: {
    paddingHorizontal: 0,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  infoLabel: {
    fontWeight: '500',
    color: theme.colors.onSurfaceVariant,
  },
  infoValue: {
    color: theme.colors.onSurface,
  },
  activeStatus: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  permissionsNote: {
    color: theme.colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  divider: {
    marginVertical: theme.spacing.lg,
  },
  signOutSection: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  signOutButton: {
    borderColor: theme.colors.error,
  },
});