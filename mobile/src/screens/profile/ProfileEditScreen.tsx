import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Card,
  Text,
  TextInput,
  Button,
  Avatar,
  IconButton,
  Chip,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
// import {launchImageLibrary, ImagePickerResponse} from 'react-native-image-picker';

import {ScreenWrapper} from '@/components/common';
import {useAuth} from '@/hooks/useAuth';
import {theme} from '@/theme/theme';
import {profileService} from '@/services/profileService';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  specialization: string;
  avatarUrl?: string;
}

export const ProfileEditScreen: React.FC = () => {
  const navigation = useNavigation();
  const {user, profile, refreshProfile} = useAuth();
  
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    phone: '',
    specialization: '',
    avatarUrl: profile?.avatarUrl,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [errors, setErrors] = useState<Partial<ProfileFormData>>({});

  useEffect(() => {
    loadProfileData();
  }, [profile]);

  const loadProfileData = async () => {
    if (!profile?.id) return;
    
    try {
      const fullProfile = await profileService.getFullProfile(profile.id);
      if (fullProfile) {
        setFormData({
          firstName: fullProfile.firstName || '',
          lastName: fullProfile.lastName || '',
          phone: fullProfile.phone || '',
          specialization: fullProfile.specialization || '',
          avatarUrl: fullProfile.avatarUrl,
        });
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!profile?.id) return;

    setIsLoading(true);
    try {
      await profileService.updateProfile(profile.id, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || null,
        specialization: formData.specialization.trim() || null,
        avatarUrl: formData.avatarUrl || null,
      });

      await refreshProfile();
      
      Alert.alert(
        'Success',
        'Your profile has been updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(
        'Error',
        'Failed to update profile. Please try again.',
        [{text: 'OK'}]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePicker = () => {
    Alert.alert(
      'Update Profile Photo',
      'Choose an option',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Choose from Library', onPress: selectFromLibrary},
        {text: 'Remove Photo', onPress: removePhoto, style: 'destructive'},
      ]
    );
  };

  const selectFromLibrary = () => {
    // TODO: Implement image picker when react-native-image-picker is properly configured
    Alert.alert(
      'Image Upload',
      'Photo upload functionality will be available once the image picker is configured.',
      [{text: 'OK'}]
    );
    
    // Placeholder implementation for now
    // launchImageLibrary(
    //   {
    //     mediaType: 'photo',
    //     quality: 0.8,
    //     maxWidth: 400,
    //     maxHeight: 400,
    //   },
    //   handleImageResponse
    // );
  };

  const handleImageResponse = async (response: any) => {
    // TODO: Implement when image picker is available
    // if (response.didCancel || response.errorMessage) return;
    
    // const asset = response.assets?.[0];
    // if (!asset?.uri) return;

    // setIsUploadingImage(true);
    // try {
    //   const avatarUrl = await profileService.uploadAvatar(asset.uri);
    //   setFormData(prev => ({...prev, avatarUrl}));
    // } catch (error) {
    //   console.error('Error uploading image:', error);
    //   Alert.alert('Error', 'Failed to upload image. Please try again.');
    // } finally {
    //   setIsUploadingImage(false);
    // }
  };

  const removePhoto = () => {
    setFormData(prev => ({...prev, avatarUrl: undefined}));
  };

  const getUserInitials = () => {
    const firstName = formData.firstName || profile?.firstName || '';
    const lastName = formData.lastName || profile?.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'T';
  };

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Photo Section */}
        <Card style={styles.photoCard}>
          <Card.Content style={styles.photoContent}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Profile Photo
            </Text>
            
            <View style={styles.avatarSection}>
              <TouchableOpacity onPress={handleImagePicker} disabled={isUploadingImage}>
                {formData.avatarUrl ? (
                  <Avatar.Image
                    size={100}
                    source={{uri: formData.avatarUrl}}
                  />
                ) : (
                  <Avatar.Text
                    size={100}
                    label={getUserInitials()}
                    style={{backgroundColor: theme.colors.primary}}
                  />
                )}
                
                <View style={styles.cameraOverlay}>
                  <IconButton
                    icon="camera"
                    size={24}
                    iconColor={theme.colors.onPrimary}
                    style={styles.cameraButton}
                    loading={isUploadingImage}
                  />
                </View>
              </TouchableOpacity>
            </View>
            
            <Text variant="bodySmall" style={styles.photoHint}>
              Tap to change your profile photo
            </Text>
          </Card.Content>
        </Card>

        {/* Personal Information */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Personal Information
            </Text>
            
            <TextInput
              label="First Name *"
              value={formData.firstName}
              onChangeText={(text) => {
                setFormData(prev => ({...prev, firstName: text}));
                if (errors.firstName) {
                  setErrors(prev => ({...prev, firstName: undefined}));
                }
              }}
              error={!!errors.firstName}
              style={styles.input}
              mode="outlined"
            />
            {errors.firstName && (
              <Text variant="bodySmall" style={styles.errorText}>
                {errors.firstName}
              </Text>
            )}
            
            <TextInput
              label="Last Name *"
              value={formData.lastName}
              onChangeText={(text) => {
                setFormData(prev => ({...prev, lastName: text}));
                if (errors.lastName) {
                  setErrors(prev => ({...prev, lastName: undefined}));
                }
              }}
              error={!!errors.lastName}
              style={styles.input}
              mode="outlined"
            />
            {errors.lastName && (
              <Text variant="bodySmall" style={styles.errorText}>
                {errors.lastName}
              </Text>
            )}
            
            <TextInput
              label="Phone Number"
              value={formData.phone}
              onChangeText={(text) => {
                setFormData(prev => ({...prev, phone: text}));
                if (errors.phone) {
                  setErrors(prev => ({...prev, phone: undefined}));
                }
              }}
              error={!!errors.phone}
              style={styles.input}
              mode="outlined"
              keyboardType="phone-pad"
            />
            {errors.phone && (
              <Text variant="bodySmall" style={styles.errorText}>
                {errors.phone}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Professional Information */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Professional Information
            </Text>
            
            <TextInput
              label="Specialization"
              value={formData.specialization}
              onChangeText={(text) => setFormData(prev => ({...prev, specialization: text}))}
              style={styles.input}
              mode="outlined"
              placeholder="e.g., Engine Repair, Electrical Systems, etc."
            />
            
            {/* Read-only fields */}
            <View style={styles.readOnlySection}>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.infoLabel}>
                  Email:
                </Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {user?.email}
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
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={isLoading}
            disabled={isLoading || isUploadingImage}
            style={styles.saveButton}
          >
            Save Changes
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            disabled={isLoading || isUploadingImage}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  photoCard: {
    margin: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  photoContent: {
    alignItems: 'center',
  },
  formCard: {
    margin: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.onSurface,
  },
  avatarSection: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  cameraButton: {
    backgroundColor: theme.colors.primary,
    margin: 0,
  },
  photoHint: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  input: {
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.error,
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.md,
  },
  readOnlySection: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.spacing.sm,
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
  buttonSection: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  saveButton: {
    marginBottom: theme.spacing.sm,
  },
  cancelButton: {
    borderColor: theme.colors.outline,
  },
});