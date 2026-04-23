import api from './api';

export interface Profile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  creativeId?: string;
  category?: string;
  profileImage?: string;
  bio?: string;
  country?: string;
  state?: string;
  city?: string;
  dateOfBirth?: string;
  gender?: string;
  experience?: string;
  education?: string;
  skills?: string[];
  portfolio?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    portfolio?: string;
  };
  isVerified: boolean;
  isApproved: boolean;
  auditionStatus?: string;
  // Business Support Program fields
  businessName?: string;
  businessLocation?: string;
  businessType?: string;
  businessMedia?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  bio?: string;
  country?: string;
  state?: string;
  city?: string;
  dateOfBirth?: string;
  gender?: string;
  experience?: string;
  education?: string;
  skills?: string[];
  portfolio?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    portfolio?: string;
  };
  // Business Support Program fields
  businessName?: string;
  businessLocation?: string;
  businessType?: string;
  businessMedia?: string;
}

export const profileService = {
  // Get current user profile
  async getProfile(): Promise<Profile> {
    const response = await api.get('/profile/me');
    return response.data.user;
  },

  // Update profile
  async updateProfile(data: UpdateProfileData): Promise<Profile> {
    const response = await api.put('/profile/me', data);
    return response.data.user;
  },

  // Update profile image
  async updateProfileImage(imageFile: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post('/profile/me/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.profileImage;
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/profile/me/change-password', {
      currentPassword,
      newPassword,
    });
  },

  // Delete account
  async deleteAccount(password: string): Promise<void> {
    await api.delete('/profile/me', {
      data: { password },
    });
  },

  // Get public profile
  async getPublicProfile(userId: string): Promise<Profile> {
    const response = await api.get(`/profile/${userId}`);
    return response.data.user;
  },
};
