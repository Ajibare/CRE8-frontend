import api from './api';

export interface Learning {
  _id: string;
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  instructor: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const learningService = {
  // Get all learning resources
  async getAllLearnings(category?: string): Promise<Learning[]> {
    const params = category ? `?category=${encodeURIComponent(category)}` : '';
    const response = await api.get(`/learning${params}`);
    return response.data.learnings;
  },

  // Get single learning resource
  async getLearningById(id: string): Promise<Learning> {
    const response = await api.get(`/learning/${id}`);
    return response.data.learning;
  },

  // Get all categories
  async getCategories(): Promise<string[]> {
    const response = await api.get('/learning/categories');
    return response.data.categories;
  },
};

export default learningService;
