import {supabase} from './supabase';
import {UserProfile} from './auth';

export interface FullUserProfile extends UserProfile {
  phone?: string;
  specialization?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileUpdateData {
  firstName: string;
  lastName: string;
  phone?: string | null;
  specialization?: string | null;
  avatarUrl?: string | null;
}

class ProfileService {
  /**
   * Get full profile information including additional fields
   */
  async getFullProfile(userId: string): Promise<FullUserProfile | null> {
    try {
      const {data, error} = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          avatar_url,
          phone,
          specialization,
          is_admin,
          created_at,
          updated_at,
          technicians!inner(id)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Error fetching full profile:', error.message);
        return null;
      }

      const {data: {user}} = await supabase.auth.getUser();
      if (!user) return null;

      return {
        id: data.id,
        email: user.email || '',
        firstName: data.first_name,
        lastName: data.last_name,
        avatarUrl: data.avatar_url,
        phone: data.phone,
        specialization: data.specialization,
        isAdmin: data.is_admin,
        technicianId: data.technicians?.[0]?.id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error getting full profile:', error);
      return null;
    }
  }

  /**
   * Update user profile information
   */
  async updateProfile(userId: string, updateData: ProfileUpdateData): Promise<void> {
    try {
      const {error} = await supabase
        .from('profiles')
        .update({
          first_name: updateData.firstName,
          last_name: updateData.lastName,
          phone: updateData.phone,
          specialization: updateData.specialization,
          avatar_url: updateData.avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        throw new Error(`Failed to update profile: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Upload avatar image to Supabase storage
   */
  async uploadAvatar(imageUri: string): Promise<string> {
    try {
      // Get current user
      const {data: {user}} = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create file name
      const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Convert image URI to blob for upload
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Upload to Supabase storage
      const {data, error} = await supabase.storage
        .from('profiles')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (error) {
        throw new Error(`Failed to upload image: ${error.message}`);
      }

      // Get public URL
      const {data: {publicUrl}} = supabase.storage
        .from('profiles')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }

  /**
   * Delete avatar image from storage
   */
  async deleteAvatar(avatarUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const urlParts = avatarUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `avatars/${fileName}`;

      const {error} = await supabase.storage
        .from('profiles')
        .remove([filePath]);

      if (error) {
        console.warn('Error deleting avatar:', error.message);
        // Don't throw error for deletion failures
      }
    } catch (error) {
      console.warn('Error deleting avatar:', error);
    }
  }

  /**
   * Get technician contact information
   */
  async getTechnicianContacts(technicianId: string): Promise<{
    phone?: string;
    email?: string;
    emergencyContact?: string;
  } | null> {
    try {
      const {data, error} = await supabase
        .from('technicians')
        .select(`
          phone,
          emergency_contact,
          profiles!inner(id, first_name, last_name)
        `)
        .eq('id', technicianId)
        .single();

      if (error) {
        console.warn('Error fetching technician contacts:', error.message);
        return null;
      }

      const {data: {user}} = await supabase.auth.getUser();

      return {
        phone: data.phone,
        email: user?.email,
        emergencyContact: data.emergency_contact,
      };
    } catch (error) {
      console.error('Error getting technician contacts:', error);
      return null;
    }
  }

  /**
   * Update technician-specific information
   */
  async updateTechnicianInfo(technicianId: string, updateData: {
    phone?: string;
    emergencyContact?: string;
  }): Promise<void> {
    try {
      const {error} = await supabase
        .from('technicians')
        .update({
          phone: updateData.phone,
          emergency_contact: updateData.emergencyContact,
          updated_at: new Date().toISOString(),
        })
        .eq('id', technicianId);

      if (error) {
        throw new Error(`Failed to update technician info: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating technician info:', error);
      throw error;
    }
  }

  /**
   * Get profile statistics for performance display
   */
  async getProfileStats(userId: string): Promise<{
    totalWorkOrders: number;
    completedWorkOrders: number;
    averageCompletionTime: number;
    customerRating: number;
  } | null> {
    try {
      // Get technician ID first
      const profile = await this.getFullProfile(userId);
      if (!profile?.technicianId) return null;

      // Get work order statistics
      const {data: workOrderStats, error: statsError} = await supabase
        .rpc('get_technician_stats', {
          technician_id: profile.technicianId
        });

      if (statsError) {
        console.warn('Error fetching profile stats:', statsError.message);
        return null;
      }

      return workOrderStats || {
        totalWorkOrders: 0,
        completedWorkOrders: 0,
        averageCompletionTime: 0,
        customerRating: 0,
      };
    } catch (error) {
      console.error('Error getting profile stats:', error);
      return null;
    }
  }
}

export const profileService = new ProfileService();