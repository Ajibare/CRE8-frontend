import api from './api';

export interface DashboardStats {
  stats: {
    users: {
      total: number;
      verified: number;
      pending: number;
    };
    contests: {
      total: number;
      active: number;
      completed: number;
    };
    submissions: {
      total: number;
      pending: number;
      approved: number;
    };
    voting: {
      totalVotes: number;
      totalRevenue: number;
    };
  };
  recent: {
    users: any[];
    submissions: any[];
    votes: any[];
  };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  creativeId?: string;
  category?: string;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Contest {
  _id: string;
  title: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  registrationFee: number;
  prizes: {
    first: number;
    second: number;
    third: number;
  };
  categories: string[];
  currentWeek?: number;
  totalWeeks: number;
  settings: {
    allowVoting: boolean;
    votingCost: number;
    maxVotesPerUser: number;
    requireApprovalForSubmissions: boolean;
  };
  createdAt: string;
  updatedAt: string;
  stats?: {
    participants: number;
    submissions: number;
    votes: number;
  };
}

export interface Submission {
  _id: string;
  userId: string;
  contestId: string;
  week: number;
  title: string;
  description: string;
  fileUrl: string;
  fileType: 'image' | 'video' | 'audio' | 'document';
  fileSize: number;
  thumbnailUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  votes: number;
  averageRating?: number;
  tags: string[];
  submittedAt: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    creativeId: string;
    category: string;
    profileImage: string;
  };
  contest?: {
    title: string;
    status: string;
  };
}

export interface VotingAnalytics {
  totalVotes: number;
  totalRevenue: number;
  votesByDay: Array<{
    _id: string;
    votes: number;
    revenue: number;
  }>;
  topVoters: Array<{
    userName: string;
    userEmail: string;
    totalVotes: number;
    totalAmount: number;
  }>;
  topContestants: Array<{
    contestantName: string;
    contestantId: string;
    totalVotes: number;
    totalAmount: number;
  }>;
  voteBundles: Array<{
    _id: string;
    count: number;
    totalVotes: number;
    totalRevenue: number;
  }>;
}

export interface FinancialReports {
  totalRevenue: number;
  revenueByType: Array<{
    _id: string;
    total: number;
    count: number;
  }>;
  revenueByDay: Array<{
    _id: string;
    revenue: number;
    count: number;
  }>;
  registrations: {
    total: number;
    count: number;
  };
  voting: {
    total: number;
    count: number;
  };
  paymentMethods: Array<{
    _id: string;
    total: number;
    count: number;
  }>;
}

export const adminService = {
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // User Management
  async getUsers(page: number = 1, limit: number = 20, status?: string, role?: string, search?: string) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);
    if (role) params.append('role', role);
    if (search) params.append('search', search);

    const response = await api.get(`/admin/users?${params}`);
    return response.data;
  },

  async getUserById(userId: string) {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  async getUserSubmissions(userId: string) {
    const response = await api.get(`/admin/users/${userId}/submissions`);
    return response.data;
  },

  async getUserActivity(userId: string) {
    const response = await api.get(`/admin/users/${userId}/activity`);
    return response.data;
  },

  async updateUserStatus(userId: string, status: 'approved' | 'rejected' | 'suspended', reason?: string) {
    const response = await api.patch(`/admin/users/${userId}/status`, { status, reason });
    return response.data;
  },

  async updateAuditionStatus(userId: string, status: 'approved' | 'rejected', feedback?: string) {
    const response = await api.post('/admin/users/audition-status', { userId, status, feedback });
    return response.data;
  },

  async updateContestStatus(userId: string, status: 'approved' | 'rejected', feedback?: string) {
    const response = await api.post('/admin/users/contest-status', { userId, status, feedback });
    return response.data;
  },

  // Contest Management
  async getContests(page: number = 1, limit: number = 20, status?: string) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);

    const response = await api.get(`/admin/contests?${params}`);
    return response.data;
  },

  // Submission Management
  async getSubmissions(page: number = 1, limit: number = 20, status?: string, contestId?: string) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);
    if (contestId) params.append('contestId', contestId);

    const response = await api.get(`/admin/submissions?${params}`);
    return response.data;
  },

  async getAllSubmissions(status?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    const response = await api.get(`/admin/submissions?${params}`);
    return response.data;
  },

  async reviewSubmission(submissionId: string, status: 'approved' | 'rejected', feedback?: string) {
    const response = await api.patch(`/admin/submissions/${submissionId}/review`, { status, feedback });
    return response.data;
  },

  // Analytics
  async getVotingAnalytics(contestId?: string, startDate?: string, endDate?: string): Promise<VotingAnalytics> {
    const params = new URLSearchParams();
    if (contestId) params.append('contestId', contestId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/admin/analytics/voting?${params}`);
    return response.data.analytics;
  },

  async getFinancialReports(startDate?: string, endDate?: string, type?: string): Promise<FinancialReports> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (type) params.append('type', type);

    const response = await api.get(`/admin/analytics/financial?${params}`);
    return response.data.financial;
  },

  // Data Export
  async exportData(type: 'users' | 'submissions' | 'votes' | 'payments', startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/admin/export/${type}?${params}`, {
      responseType: 'blob'
    });

    // Create download link
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return response.data;
  },
};
