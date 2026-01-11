export interface Podcast {
  id: string;
  title: string;
  description?: string;
  knowledgeBase: string;
  length: 'Short' | 'Medium' | 'Long';
  script?: string;
  audioPath?: string;
  videoPath?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePodcastRequest {
  title: string;
  description?: string;
  length: 'Short' | 'Medium' | 'Long';
  knowledgeText?: string;
  knowledgeFile?: File;
}