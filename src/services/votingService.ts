import api from './api';

export interface VotingBundle {
  votes: number;
  price: number;
  type: 'single' | 'bundle_5' | 'bundle_10' | 'bundle_25';
  available: boolean;
}

export interface VotePaymentData {
  contestantId: string;
  submissionId: string;
  voteBundleType: string;
  voterEmail: string;
  voterName: string;
  votesCount?: number;
  paymentMethod?: 'flutterwave' | 'paystack';
}

export interface Vote {
  _id: string;
  voterId: string;
  contestantId: string;
  submissionId?: string;
  votesCount: number;
  amount: number;
  paymentId: string;
  ipAddress: string;
  userAgent: string;
  isVerified: boolean;
  voteBundle: {
    votes: number;
    price: number;
    type: 'single' | 'bundle_5' | 'bundle_10' | 'bundle_25';
  };
  createdAt: string;
  updatedAt: string;
  voter?: {
    name: string;
    creativeId: string;
    category: string;
    profileImage: string;
  };
  contestant?: {
    name: string;
    creativeId: string;
    category: string;
    profileImage: string;
  };
  submission?: {
    title: string;
  };
  payment?: {
    amount: number;
    status: string;
  };
}

export interface LeaderboardEntry {
  contestantId: string;
  submissionId?: string;
  totalVotes: number;
  totalAmount: number;
  voteCount: number;
  contestant: {
    name: string;
    creativeId: string;
    category: string;
    profileImage: string;
  };
}

export const votingService = {
  async initiateVotingPayment(data: VotePaymentData) {
    const response = await api.post('/voting/initiate', data);
    return response.data;
  },

  async getVotingBundles(contestId?: string) {
    const params = contestId ? `?contestId=${contestId}` : '';
    const response = await api.get(`/voting/bundles${params}`);
    return response.data;
  },

  async getUserVotingHistory(contestId?: string, page: number = 1, limit: number = 20) {
    const params = new URLSearchParams();
    if (contestId) params.append('contestId', contestId);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get(`/voting/history?${params}`);
    return response.data;
  },

  async getSubmissionVotes(submissionId: string, page: number = 1, limit: number = 50) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get(`/voting/submission/${submissionId}/votes?${params}`);
    return response.data;
  },

  async getContestLeaderboard(contestId: string, category?: string, page: number = 1, limit: number = 20) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (category) params.append('category', category);

    const response = await api.get(`/voting/contest/${contestId}/leaderboard?${params}`);
    return response.data;
  },

  async getVotingStatistics(contestId: string) {
    const response = await api.get(`/voting/contest/${contestId}/statistics`);
    return response.data;
  },

  async checkVotingPatterns(contestantId: string, timeWindow: number = 3600) {
    const params = new URLSearchParams();
    params.append('contestantId', contestantId);
    params.append('timeWindow', timeWindow.toString());

    const response = await api.get(`/voting/patterns/check?${params}`);
    return response.data;
  },

  // Admin functions
  async getSuspiciousPatterns(contestantId: string, timeWindow: number = 3600) {
    const params = new URLSearchParams();
    params.append('contestantId', contestantId);
    params.append('timeWindow', timeWindow.toString());

    const response = await api.get(`/voting/patterns/check?${params}`);
    return response.data;
  },
};
