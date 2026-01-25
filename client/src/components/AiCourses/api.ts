// API client for AI Courses
import api from '@/config/axiosInstance';

const API_BASE = '/ai-courses';

export interface CreateCourseInput {
    topic: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    goal: string;
    tone: 'professional' | 'casual' | 'technical';
    targetAudience?: string;
    prerequisites?: string;
    sectionCount: number;
    timeCommitment: number;
}

export interface AiCourse {
    id: string;
    userId: string;
    title: string;
    description: string | null;
    topic: string;
    level: string;
    goal: string;
    tone: string;
    targetAudience: string | null;
    prerequisites: string | null;
    sectionCount: number;
    timeCommitment: number;
    currentSectionIndex: number;
    completedSections: number;
    isComplete: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
    sections: AiCourseSection[];
    stats?: {
        articles: { read: number; total: number };
        flashcards: { reviewed: number; total: number };
        quizzes: { attempted: number; total: number };
        breakdown?: {
            mcq: { attempted: number; total: number };
            tf: { attempted: number; total: number };
            fill: { attempted: number; total: number };
        };
    };
}

export interface AiCourseSection {
    id: string;
    courseId: string;
    sectionNumber: number;
    title: string;
    isCompleted: boolean;
    completedAt: string | null;
    createdAt: string;
}

export interface AiSectionWithContent extends AiCourseSection {
    course: { userId: string; title: string; topic: string };
    articlePages: AiArticlePage[];
    flashcards: AiFlashcard[];
    mindMaps: AiMindMap[];
    mcqQuestions: AiMcqQuestion[];
    trueFalseQuestions: AiTrueFalseQuestion[];
    fillUpQuestions: AiFillUpQuestion[];
}

export interface AiArticlePage {
    id: string;
    sectionId: string;
    pageNumber: number;
    pageTitle: string;
    content: string;
    isRead: boolean;
    readAt: string | null;
}

export interface AiFlashcard {
    id: string;
    sectionId: string;
    front: string;
    back: string;
    difficulty: number;
    nextReviewAt: string | null;
    reviewCount: number;
    correctCount: number;
}

export interface AiMindMap {
    id: string;
    sectionId: string;
    data: string;
}

export interface AiMcqQuestion {
    id: string;
    sectionId: string;
    question: string;
    options: string;
    answer: string;
    isAttempted: boolean;
    isCorrect: boolean | null;
    userAnswer: string | null;
}

export interface AiTrueFalseQuestion {
    id: string;
    sectionId: string;
    question: string;
    answer: boolean;
    explanation: string;
    isAttempted: boolean;
    isCorrect: boolean | null;
    userAnswer: boolean | null;
}

export interface AiFillUpQuestion {
    id: string;
    sectionId: string;
    sentence: string;
    missingWord: string;
    isAttempted: boolean;
    isCorrect: boolean | null;
    userAnswer: string | null;
}

// API Functions
export const aiCoursesApi = {
    // Get all courses
    getAllCourses: async (): Promise<AiCourse[]> => {
        const response = await api.get(API_BASE);
        return response.data;
    },

    // Get single course
    getCourse: async (id: string): Promise<AiCourse> => {
        const response = await api.get(`${API_BASE}/${id}`);
        return response.data;
    },

    // Create new course (generates first section)
    createCourse: async (input: CreateCourseInput): Promise<{ courseId: string }> => {
        const response = await api.post(API_BASE, input);
        return response.data;
    },

    // Generate next section
    generateSection: async (courseId: string, sectionNumber: number): Promise<{ sectionId: string }> => {
        const response = await api.post(`${API_BASE}/${courseId}/generate-section`, { sectionNumber });
        return response.data;
    },

    // Delete course
    deleteCourse: async (id: string): Promise<{ success: boolean }> => {
        const response = await api.delete(`${API_BASE}/${id}`);
        return response.data;
    },

    // Get section with content
    getSectionWithContent: async (sectionId: string): Promise<AiSectionWithContent> => {
        const response = await api.get(`${API_BASE}/sections/${sectionId}`);
        return response.data;
    },

    // Mark section complete
    markSectionComplete: async (sectionId: string): Promise<AiCourseSection> => {
        const response = await api.post(`${API_BASE}/sections/${sectionId}/complete`);
        return response.data;
    },

    // Mark article as read
    markArticleRead: async (articleId: string): Promise<AiArticlePage> => {
        const response = await api.post(`${API_BASE}/articles/${articleId}/read`);
        return response.data;
    },

    // Submit MCQ answer
    submitMcqAnswer: async (questionId: string, answer: string): Promise<{ isCorrect: boolean; correctAnswer: string }> => {
        const response = await api.post(`${API_BASE}/mcq/${questionId}/answer`, { answer });
        return response.data;
    },

    // Submit True/False answer
    submitTrueFalseAnswer: async (questionId: string, answer: boolean): Promise<{ isCorrect: boolean; correctAnswer: boolean; explanation: string }> => {
        const response = await api.post(`${API_BASE}/truefalse/${questionId}/answer`, { answer });
        return response.data;
    },

    // Submit Fill-up answer
    submitFillUpAnswer: async (questionId: string, answer: string): Promise<{ isCorrect: boolean; correctAnswer: string }> => {
        const response = await api.post(`${API_BASE}/fillup/${questionId}/answer`, { answer });
        return response.data;
    },

    // Review flashcard
    reviewFlashcard: async (flashcardId: string, isCorrect: boolean): Promise<AiFlashcard> => {
        const response = await api.post(`${API_BASE}/flashcards/${flashcardId}/review`, { isCorrect });
        return response.data;
    },
};

export default aiCoursesApi;
