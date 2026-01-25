import {
    Zap,
    BookOpen,
    Layers,
    HelpCircle,
    Clock,
    FileText
} from 'lucide-react';
import type { AiCourse } from './api';

interface CourseHomeViewProps {
    course: AiCourse;
    onSectionClick: (sectionId: string) => void;
}

export function CourseHomeView({ course, onSectionClick }: CourseHomeViewProps) {
    // Calculate stats
    const totalSections = course.sectionCount;
    const completedSections = course.completedSections || 0;

    // Estimate total content (will be refined with real data)
    const estimatedArticles = (course.sections?.length || 0) * 3; // ~3 pages per section
    const estimatedFlashcards = (course.sections?.length || 0) * 10; // ~10 flashcards per section
    const estimatedQuizzes = (course.sections?.length || 0) * 12; // ~12 questions per section

    const courseProgress = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

    // Progress card data
    // Use real stats if available, otherwise fall back to estimation (though stats should be there)
    const stats = course.stats || {
        articles: { read: 0, total: estimatedArticles },
        flashcards: { reviewed: 0, total: estimatedFlashcards },
        quizzes: { attempted: 0, total: estimatedQuizzes }
    };

    const progressCards = [
        {
            title: 'Total XP Earned',
            value: completedSections * 100, // Keep this estimate for now or add XP to backend
            subtitle: 'Experience points',
            icon: Zap,
            bgColor: 'bg-[#335441]',
            iconBg: 'bg-white/20'
        },
        {
            title: 'Articles Read',
            value: `${stats.articles.read}/${stats.articles.total}`,
            subtitle: `${stats.articles.total > 0 ? Math.round((stats.articles.read / stats.articles.total) * 100) : 0}% complete`,
            icon: FileText,
            bgColor: 'bg-[#46704A]',
            iconBg: 'bg-white/20'
        },
        {
            title: 'Flashcards Reviewed',
            value: `${stats.flashcards.reviewed}/${stats.flashcards.total}`,
            subtitle: `${stats.flashcards.total > 0 ? Math.round((stats.flashcards.reviewed / stats.flashcards.total) * 100) : 0}% reviewed`,
            icon: Layers,
            bgColor: 'bg-[#5D8B6E]', // Muted green
            iconBg: 'bg-white/20'
        },
        {
            title: 'Quizzes Completed',
            value: `${stats.quizzes.attempted}/${stats.quizzes.total}`,
            subtitle: `${stats.quizzes.total > 0 ? Math.round((stats.quizzes.attempted / stats.quizzes.total) * 100) : 0}% done`,
            icon: HelpCircle,
            bgColor: 'bg-[#7EA588]', // Sage green
            iconBg: 'bg-white/20'
        }
    ];

    // Progress bar data
    const progressBars = [
        { label: 'Articles', current: stats.articles.read, total: stats.articles.total, color: 'bg-[#335441]' },
        { label: 'Flashcards', current: stats.flashcards.reviewed, total: stats.flashcards.total, color: 'bg-[#46704A]' },
        { label: 'Mind Maps', current: course.sections?.length || 0, total: course.sections?.length || 0, color: 'bg-[#5D8B6E]' }, // Placeholder for mindmaps
        { label: 'MCQ Questions', current: course.stats?.breakdown?.mcq.attempted || 0, total: course.stats?.breakdown?.mcq.total || 0, color: 'bg-[#7EA588]' },
        { label: 'True/False', current: course.stats?.breakdown?.tf.attempted || 0, total: course.stats?.breakdown?.tf.total || 0, color: 'bg-[#8DA994]' },
        { label: 'Fill in Blanks', current: course.stats?.breakdown?.fill.attempted || 0, total: course.stats?.breakdown?.fill.total || 0, color: 'bg-[#A3C4AC]' }
    ];

    const getSectionStatus = (section: { isCompleted: boolean }): 'completed' | 'in-progress' | 'not-started' => {
        if (section.isCompleted) return 'completed';
        // For now, first incomplete section is in-progress
        return 'not-started';
    };

    return (
        <div className="flex-1 bg-[#F9F6EE] overflow-y-auto">
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                {/* Course Header */}
                <div className="bg-gradient-to-r from-[#335441] to-[#46704A] rounded-2xl p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                    <div className="relative flex justify-between items-start">
                        <div className="flex-1">
                            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-medium mb-3 capitalize">
                                {course.level} Course
                            </span>
                            <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
                            <p className="text-white/80 text-sm mb-4 max-w-lg">
                                A {course.level} level course on {course.topic} designed to help you {course.goal}.
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm text-white/80">
                                <span className="flex items-center gap-1">
                                    <BookOpen className="w-4 h-4" />
                                    {course.sectionCount} Sections
                                </span>
                                <span className="flex items-center gap-1">
                                    <FileText className="w-4 h-4" />
                                    {estimatedArticles} Articles
                                </span>
                                <span className="flex items-center gap-1">
                                    <Layers className="w-4 h-4" />
                                    {estimatedFlashcards} Flashcards
                                </span>
                                <span className="flex items-center gap-1">
                                    <HelpCircle className="w-4 h-4" />
                                    {estimatedQuizzes} Quiz Questions
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    ~{course.timeCommitment * course.sectionCount} min total
                                </span>
                            </div>
                        </div>

                        {/* Circular Progress */}
                        <div className="relative w-24 h-24 flex-shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke="rgba(255,255,255,0.2)"
                                    strokeWidth="8"
                                    fill="none"
                                />
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke="white"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={`${courseProgress * 2.51} 251`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold">{courseProgress}%</span>
                                <span className="text-xs text-white/60">Complete</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {progressCards.map((card, index) => (
                        <div
                            key={index}
                            className={`${card.bgColor} rounded-xl p-4 text-white relative overflow-hidden`}
                        >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-8 h-8 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                                        <card.icon className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold">{card.value}</div>
                                <div className="text-xs text-white/80">{card.subtitle}</div>
                                <div className="text-xs text-white/60 mt-1">{card.title}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Your Progress & Section Progress */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Your Progress */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E4D7B4]">
                        <h3 className="text-lg font-bold text-[#335441] mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            Your Progress
                        </h3>
                        <div className="space-y-3">
                            {progressBars.map((bar, index) => (
                                <div key={index}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-700">{bar.label}</span>
                                        <span className="text-gray-500">{bar.current}/{bar.total}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${bar.color} rounded-full transition-all`}
                                            style={{ width: bar.total > 0 ? `${(bar.current / bar.total) * 100}%` : '0%' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section Progress */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E4D7B4]">
                        <h3 className="text-lg font-bold text-[#335441] mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5" />
                            Section Progress
                        </h3>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {course.sections?.map((section, index) => {
                                const status = getSectionStatus(section);
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => onSectionClick(section.id)}
                                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#F9F6EE] transition-colors text-left border border-transparent hover:border-[#E4D7B4]"
                                    >
                                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-[#335441] to-[#46704A] text-white flex items-center justify-center text-sm font-bold">
                                            {index + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-[#335441] truncate">{section.title}</p>
                                            <p className="text-xs text-gray-500">
                                                ~3 pages • ~10 cards • ~12 quizzes
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === 'completed'
                                            ? 'bg-green-100 text-green-700'
                                            : status === 'in-progress'
                                                ? 'bg-orange-100 text-orange-700'
                                                : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {status === 'completed' ? 'Completed' : status === 'in-progress' ? 'In Progress' : 'Not Started'}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CourseHomeView;
