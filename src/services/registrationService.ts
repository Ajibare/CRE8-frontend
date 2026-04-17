import api from './api';

export interface BiodataFormData {
  name: string;
  email: string;
  phone: string;
  category: string;
  country: string;
  state: string;
  city: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  bio?: string;
  experience?: string;
  education?: string;
  skills?: string[];
  portfolio?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
    linkedin?: string;
  };
}

export interface ReferralValidationResponse {
  valid: boolean;
  referrer?: string;
  message?: string;
}

export interface RegistrationResponse {
  message: string;
  userId: string;
  paymentReference: string;
  amount: number;
  referralCode?: string;
  referrer?: string;
}

export const registrationService = {
  // Validate referral code
  async validateReferralCode(code: string): Promise<ReferralValidationResponse> {
    const response = await api.post('/referrals/validate', { code });
    return response.data;
  },

  // Register user with biodata
  async register(data: BiodataFormData & { referralCode?: string; socialFollowStatus?: any }): Promise<RegistrationResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Initiate payment
  async initiatePayment(reference: string, amount: number): Promise<any> {
    const response = await api.post('/payments/initiate', {
      reference,
      amount,
      type: 'REGISTRATION'
    });
    return response.data;
  },

  // Verify payment
  async verifyPayment(reference: string): Promise<any> {
    const response = await api.get(`/payments/verify/${reference}`);
    return response.data;
  }
};
