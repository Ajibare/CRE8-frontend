import api from './api';

export interface PaymentData {
  type: 'registration' | 'voting' | 'live_show' | 'premium_access';
  amount: number;
  metadata?: any;
}

export interface VotingPaymentData {
  contestantId: string;
  bundleType: 'single' | 'bundle_5' | 'bundle_10' | 'bundle_25';
}

export interface RegistrationPaymentData {
  email: string;
  name?: string;
  phone?: string;
  referralCode?: string;
}

export const paymentService = {
  async initiatePayment(data: PaymentData) {
    const response = await api.post('/payments/initiate', data);
    return response.data;
  },

  async initializeRegistrationPayment(data: RegistrationPaymentData) {
    const response = await api.post('/payments/initiate-registration', data);
    return response.data;
  },

  async verifyPayment(reference: string) {
    const response = await api.get(`/payments/verify/${reference}`);
    return response.data;
  },

  async getPaymentHistory() {
    const response = await api.get('/payments/history');
    return response.data;
  },

  async initiateVotingPayment(data: VotingPaymentData) {
    const response = await api.post('/payments/vote', data);
    return response.data;
  },
};
