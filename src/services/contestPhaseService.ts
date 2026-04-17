import api from './api';

export interface PhaseInfo {
  phase: 'AUDITION' | 'CONTEST' | 'GRAND_FINAL' | 'ENDED';
  auditionStart: string;
  contestStart: string;
  contestEnd: string;
}

export interface ContestStats {
  auditionSubmissions: number;
  contestSubmissions: number;
  selectedContestants: number;
  grandFinalists: number;
}

export const contestPhaseService = {
  // Get current phase info
  getPhaseInfo: async (): Promise<PhaseInfo> => {
    const response = await api.get('/contest-admin/phase');
    return response.data.data;
  },

  // Get contest stats (admin only)
  getContestStats: async (): Promise<ContestStats> => {
    const response = await api.get('/contest-admin/stats');
    return response.data.data;
  },

  // Select top 100 for contest (admin only)
  selectTop100: async (): Promise<{ selectedCount: number }> => {
    const response = await api.post('/contest-admin/select-top-100');
    return response.data.data;
  },

  // Select top 10 for grand final (admin only)
  selectTop10: async (): Promise<{ selectedCount: number }> => {
    const response = await api.post('/contest-admin/select-top-10');
    return response.data.data;
  },

  // Get contestants list (admin only)
  getContestants: async () => {
    const response = await api.get('/contest-admin/contestants');
    return response.data.data;
  },
};

// Helper function to get phase display text
export const getPhaseDisplayText = (phase: string): string => {
  switch (phase) {
    case 'AUDITION':
      return 'Audition Phase - Submit your one video!';
    case 'CONTEST':
      return 'Contest Phase - One video per week!';
    case 'GRAND_FINAL':
      return 'Grand Final Phase - Top 10 competing!';
    case 'ENDED':
      return 'Contest Ended';
    default:
      return 'Unknown Phase';
  }
};

// Helper function to get phase color
export const getPhaseColor = (phase: string): string => {
  switch (phase) {
    case 'AUDITION':
      return 'bg-green-100 text-green-800';
    case 'CONTEST':
      return 'bg-purple-100 text-purple-800';
    case 'GRAND_FINAL':
      return 'bg-yellow-100 text-yellow-800';
    case 'ENDED':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
