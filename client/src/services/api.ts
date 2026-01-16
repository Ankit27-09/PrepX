import api from "@/config/axiosInstance";
import type { Podcast, CreatePodcastRequest } from "@/types/podcasts";

export const podcastService = {
  async getAllPodcasts(page = 1, limit = 10): Promise<Podcast[]> {
    // Note: GET /podcasts is public, no auth needed
    const response = await api.get(`/podcasts?page=${page}&limit=${limit}`, {
      baseURL: 'http://localhost:3000/api',  // Override for podcast API
    });
    return response.data.data;
  },

  async getPodcast(id: string): Promise<Podcast> {
    const response = await api.get(`/podcasts/${id}`, {
      baseURL: 'http://localhost:3000/api',
    });
    return response.data.data;
  },

  async createPodcast(data: CreatePodcastRequest): Promise<Podcast> {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("length", data.length);

    if (data.description) {
      formData.append("description", data.description);
    }

    if (data.knowledgeText) {
      formData.append("knowledgeText", data.knowledgeText);
    }

    if (data.knowledgeFile) {
      formData.append("knowledgeFile", data.knowledgeFile);
    }

    const response = await api.post("/podcasts", formData, {
      baseURL: 'http://localhost:3000/api',
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  },

  async deletePodcast(id: string): Promise<void> {
    await api.delete(`/podcasts/${id}`, {
      baseURL: 'http://localhost:3000/api',
    });
  },

  async checkHealth(): Promise<boolean> {
    try {
      await api.get("/health", {
        baseURL: 'http://localhost:3000/api',
      });
      return true;
    } catch {
      return false;
    }
  },
};
