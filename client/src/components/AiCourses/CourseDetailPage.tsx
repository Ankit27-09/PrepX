import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    BookOpen,
    Brain,
    Layers,
    CheckCircle,
    Loader2,
    RefreshCw,
    ChevronRight,
    HelpCircle,
} from 'lucide-react';
import { aiCoursesApi } from './api';
import type { AiCourse, AiSectionWithContent } from './api';
import type { ViewMode, ContentType } from './types';
import { CourseSidebar } from './CourseSidebar';
import { CourseHomeView } from './CourseHomeView';
import { EagleView } from './EagleView';
import { MindMapView } from './MindMapView';
import { ArticleView } from './ArticleView';
import { FlashcardViewer } from './FlashcardViewer';
import { QuizView } from './QuizView';

export function CourseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [course, setCourse] = useState<AiCourse | null>(null);
    const [currentSection, setCurrentSection] = useState<AiSectionWithContent | null>(null);
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('home');
    const [contentType, setContentType] = useState<ContentType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadCourse(id);
        }
    }, [id]);

    useEffect(() => {
        if (selectedSectionId && viewMode !== 'home' && viewMode !== 'eagle') {
            loadSection(selectedSectionId);
        }
    }, [selectedSectionId, viewMode]);

    const loadCourse = async (courseId: string) => {
        try {
            setIsLoading(true);
            const data = await aiCoursesApi.getCourse(courseId);
            setCourse(data);

            // Auto-select first section if available
            if (data.sections && data.sections.length > 0) {
                setSelectedSectionId(data.sections[0].id);
            }
        } catch (err: any) {
            console.error('Failed to load course:', err);
            setError(err.response?.data?.error || 'Failed to load course');
        } finally {
            setIsLoading(false);
        }
    };

    const loadSection = async (sectionId: string) => {
        try {
            const data = await aiCoursesApi.getSectionWithContent(sectionId);
            setCurrentSection(data);
        } catch (err: any) {
            console.error('Failed to load section:', err);
        }
    };

    const handleGenerateNextSection = async () => {
        if (!course) return;

        const nextSectionNumber = (course.sections?.length || 0) + 1;
        if (nextSectionNumber > course.sectionCount) return;

        try {
            setIsGenerating(true);
            const result = await aiCoursesApi.generateSection(course.id, nextSectionNumber);
            await loadCourse(course.id);
            if (result.sectionId) {
                setSelectedSectionId(result.sectionId);
            }
        } catch (err: any) {
            console.error('Failed to generate section:', err);
            alert(err.response?.data?.error || 'Failed to generate section');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleMarkSectionComplete = async () => {
        if (!currentSection) return;

        try {
            await aiCoursesApi.markSectionComplete(currentSection.id);
            if (id) await loadCourse(id);
            await loadSection(currentSection.id);
        } catch (err: any) {
            console.error('Failed to mark section complete:', err);
        }
    };

    const handleViewChange = (view: ViewMode) => {
        setViewMode(view);
        setContentType(null);
    };

    const handleSectionSelect = (sectionId: string, type?: ContentType) => {
        setSelectedSectionId(sectionId);
        if (type) {
            setContentType(type);
            // Map content type to view mode
            switch (type) {
                case 'article':
                    setViewMode('article');
                    break;
                case 'mindMap':
                    setViewMode('mindmap');
                    break;
                case 'flashcards':
                    setViewMode('flashcards');
                    break;
                case 'mcq':
                case 'trueFalse':
                case 'fillUp':
                case 'quiz':
                    setViewMode('quiz');
                    setContentType(type);
                    break;
                default:
                    setViewMode('article');
            }
        }
    };

    const handleEagleNodeClick = (sectionId: string, nodeType: string) => {
        setSelectedSectionId(sectionId);
        switch (nodeType) {
            case 'article':
                setViewMode('article');
                break;
            case 'studyMaterial':
                setViewMode('flashcards');
                break;
            case 'quiz':
                setViewMode('quiz');
                break;
            default:
                setViewMode('article');
        }
    };

    // Get breadcrumb path
    const getBreadcrumb = () => {
        const parts = [course?.title || 'Course'];

        if (viewMode === 'home') {
            parts.push('Course Home');
        } else if (viewMode === 'eagle') {
            parts.push('Network');
        } else if (currentSection) {
            parts.push(currentSection.title);
            if (viewMode === 'article') parts.push('Article');
            else if (viewMode === 'mindmap') parts.push('Mindmap');
            else if (viewMode === 'flashcards') parts.push('Flashcards');
            else if (viewMode === 'quiz') parts.push('Quiz');
        }

        return parts;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9F6EE]">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[#335441] mx-auto mb-4" />
                    <p className="text-[#335441] font-medium">Loading course...</p>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9F6EE]">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error || 'Course not found'}</p>
                    <button
                        onClick={() => navigate('/ai-courses')}
                        className="text-[#335441] hover:underline"
                    >
                        Back to Courses
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen overflow-hidden bg-[#F9F6EE] flex">
            {/* Sidebar */}
            <CourseSidebar
                course={course}
                selectedSectionId={selectedSectionId}
                currentView={viewMode}
                onViewChange={handleViewChange}
                onSectionSelect={handleSectionSelect}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Breadcrumb Header */}
                <div className="bg-white border-b border-[#E4D7B4] px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                        <button
                            onClick={() => navigate('/ai-courses')}
                            className="text-gray-500 hover:text-[#335441] transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        {getBreadcrumb().map((part, index, arr) => (
                            <span key={index} className="flex items-center gap-2">
                                {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                                <span className={index === arr.length - 1 ? 'text-[#335441] font-medium' : 'text-gray-500'}>
                                    {part}
                                </span>
                            </span>
                        ))}
                    </div>

                    {/* Generate Next Section Button (when not all sections generated) */}
                    {course.sections && course.sections.length < course.sectionCount && (
                        <button
                            onClick={handleGenerateNextSection}
                            disabled={isGenerating}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#335441] to-[#46704A] text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                        >
                            {isGenerating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                            {isGenerating ? 'Generating...' : 'Generate Next Section'}
                        </button>
                    )}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {/* Course Home View */}
                    {viewMode === 'home' && (
                        <CourseHomeView
                            course={course}
                            onSectionClick={(sectionId) => {
                                setSelectedSectionId(sectionId);
                                setViewMode('article');
                            }}
                        />
                    )}

                    {/* Eagle View (Knowledge Graph) */}
                    {viewMode === 'eagle' && (
                        <EagleView
                            course={course}
                            onNodeClick={handleEagleNodeClick}
                        />
                    )}

                    {/* Section Content Views */}
                    {viewMode !== 'home' && viewMode !== 'eagle' && currentSection && (
                        <>
                            {/* Section Header with tabs */}
                            <div className="bg-white border-b border-[#E4D7B4] px-6 py-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h1 className="text-xl font-bold text-[#335441]">
                                            {currentSection.title}
                                        </h1>
                                        <p className="text-sm text-gray-500">
                                            Section {currentSection.sectionNumber} of {course.sectionCount}
                                        </p>
                                    </div>
                                    {!currentSection.isCompleted && (
                                        <button
                                            onClick={handleMarkSectionComplete}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Mark Complete
                                        </button>
                                    )}
                                    {currentSection.isCompleted && (
                                        <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium text-sm">
                                            <CheckCircle className="w-4 h-4" />
                                            Completed
                                        </span>
                                    )}
                                </div>

                                {/* Content Tabs */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setViewMode('article')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'article'
                                            ? 'bg-[#335441] text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <BookOpen className="w-4 h-4" />
                                        Article
                                    </button>
                                    <button
                                        onClick={() => setViewMode('mindmap')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'mindmap'
                                            ? 'bg-[#335441] text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Brain className="w-4 h-4" />
                                        Mind Map
                                    </button>
                                    <button
                                        onClick={() => setViewMode('flashcards')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'flashcards'
                                            ? 'bg-[#335441] text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Layers className="w-4 h-4" />
                                        Flashcards ({currentSection.flashcards?.length || 0})
                                    </button>
                                    <button
                                        onClick={() => setViewMode('quiz')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'quiz'
                                            ? 'bg-[#335441] text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <HelpCircle className="w-4 h-4" />
                                        Quiz
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto">
                                {viewMode === 'article' && currentSection.articlePages && (
                                    <ArticleView
                                        pages={currentSection.articlePages}
                                        onMarkRead={(pageId: string) => aiCoursesApi.markArticleRead(pageId)}
                                    />
                                )}

                                {viewMode === 'mindmap' && (
                                    <MindMapView
                                        section={currentSection}
                                    />
                                )}

                                {viewMode === 'flashcards' && currentSection.flashcards && (
                                    <FlashcardViewer
                                        flashcards={currentSection.flashcards}
                                        onReview={(id: string, correct: boolean) => aiCoursesApi.reviewFlashcard(id, correct)}
                                    />
                                )}

                                {viewMode === 'quiz' && (
                                    <QuizView
                                        mcqs={currentSection.mcqQuestions || []}
                                        trueFalse={currentSection.trueFalseQuestions || []}
                                        fillUps={currentSection.fillUpQuestions || []}
                                    />
                                )}
                            </div>
                        </>
                    )}

                    {/* No section selected state */}
                    {viewMode !== 'home' && viewMode !== 'eagle' && !currentSection && (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Select a section to start learning</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CourseDetailPage;
