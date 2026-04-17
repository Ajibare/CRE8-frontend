import api from './api';

export interface SubmissionData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  file?: File;
}

export interface Submission {
  _id: string;
  userId: string;
  contestId: string;
  week?: number;
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
  ratings: {
    userId: string;
    rating: number;
    comment?: string;
  }[];
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

export const submissionService = {
  async submitWork(data: SubmissionData) {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('tags', data.tags.join(','));
    if (data.file) {
      formData.append('file', data.file);
    }

    const response = await api.post('/submissions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getUserSubmissions(status?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);

    const response = await api.get(`/submissions/user/my-submissions?${params}`);
    return response.data;
  },

  async getContestSubmissions(
    contestId: string,
    week?: number,
    status?: string,
    page: number = 1,
    limit: number = 20
  ) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (week) params.append('week', week.toString());
    if (status) params.append('status', status);

    const response = await api.get(`/submissions/contest/${contestId}?${params}`);
    return response.data;
  },

  async getSubmissionById(id: string) {
    const response = await api.get(`/submissions/${id}`);
    return response.data;
  },

  async updateSubmission(id: string, data: Partial<SubmissionData>) {
    const response = await api.put(`/submissions/${id}`, data);
    return response.data;
  },

  async deleteSubmission(id: string) {
    const response = await api.delete(`/submissions/${id}`);
    return response.data;
  },

  async rateSubmission(id: string, rating: number, comment?: string) {
    const response = await api.post(`/submissions/${id}/rate`, { rating, comment });
    return response.data;
  },

  async getFeaturedSubmissions(contestId?: string, limit: number = 6) {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (contestId) params.append('contestId', contestId);

    const response = await api.get(`/submissions/featured?${params}`);
    return response.data;
  },

  // Admin functions
  async getPendingSubmissions(page: number = 1, limit: number = 20) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get(`/submissions/admin/pending?${params}`);
    return response.data;
  },

  async reviewSubmission(id: string, status: 'approved' | 'rejected', feedback?: string) {
    const response = await api.patch(`/submissions/${id}/review`, { status, feedback });
    return response.data;
  },

  // Submission editing methods
  async getSubmissionForEdit(submissionId: string) {
    const response = await api.get(`/submissions/${submissionId}/edit`);
    return response.data;
  },

  async replaceSubmissionFile(submissionId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/submissions/${submissionId}/replace-file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Social sharing
  getShareUrl(submissionId: string) {
    return `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/submissions/${submissionId}`;
  },

  shareOnTwitter(submission: Submission, contestTitle: string) {
    const text = `Check out my submission "${submission.title}" for ${contestTitle}! Vote for me in the FUNTECH Creative Challenge. 🎨✨`;
    const url = this.getShareUrl(submission._id);
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  },

  shareOnFacebook(submission: Submission) {
    const url = this.getShareUrl(submission._id);
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  },

  shareOnLinkedIn(submission: Submission, contestTitle: string) {
    const url = this.getShareUrl(submission._id);
    const title = `FUNTECH Creative Challenge - ${submission.title}`;
    const summary = `My submission for ${contestTitle}. Support creative talent!`;
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`;
  },

  shareOnWhatsApp(submission: Submission, contestTitle: string) {
    const text = `Check out my submission "${submission.title}" for ${contestTitle}! Vote here: ${this.getShareUrl(submission._id)}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  },

  copyShareLink(submissionId: string) {
    const url = this.getShareUrl(submissionId);
    if (navigator.clipboard) {
      return navigator.clipboard.writeText(url);
    }
    return Promise.reject('Clipboard not supported');
  },
};
