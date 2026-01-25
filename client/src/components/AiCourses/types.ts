// Shared types for AI Courses feature

export type ViewMode = 'home' | 'eagle' | 'article' | 'mindmap' | 'flashcards' | 'quiz';

export type ContentType = 'article' | 'studyMaterial' | 'mindMap' | 'flashcards' | 'quiz' | 'mcq' | 'trueFalse' | 'fillUp';

export interface SidebarItem {
    id: string;
    type: ContentType;
    label: string;
    icon?: string;
    children?: SidebarItem[];
    isCompleted?: boolean;
}

export interface CurriculumSection {
    id: string;
    sectionNumber: number;
    title: string;
    isCompleted: boolean;
    items: SidebarItem[];
}

// Knowledge Graph types
export interface GraphNode {
    id: string;
    type: 'course' | 'section' | 'article' | 'studyMaterial' | 'quiz';
    label: string;
    data?: any;
}

export interface GraphEdge {
    id: string;
    source: string;
    target: string;
    type?: string;
}

export interface KnowledgeGraphData {
    nodes: GraphNode[];
    edges: GraphEdge[];
    stats: {
        sections: number;
        nodes: number;
        connections: number;
    };
}

// Mind Map types
export interface MindMapNode {
    id: string;
    label: string;
    children?: MindMapNode[];
    level: number;
}

export interface MindMapData {
    rootNode: MindMapNode;
    totalNodes: number;
}

// Progress types
export interface ProgressStats {
    totalXp: number;
    articlesRead: number;
    totalArticles: number;
    flashcardsReviewed: number;
    totalFlashcards: number;
    quizzesCompleted: number;
    totalQuizzes: number;
}

export interface SectionProgress {
    id: string;
    sectionNumber: number;
    title: string;
    pagesCount: number;
    cardsCount: number;
    quizzesCount: number;
    status: 'not-started' | 'in-progress' | 'completed';
}
