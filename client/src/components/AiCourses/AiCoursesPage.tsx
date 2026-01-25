import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Plus,
    Clock,
    Trash2,
    ChevronRight,
    Loader2,
    Sparkles,
    GraduationCap
} from 'lucide-react';
import { aiCoursesApi } from './api';
import type { AiCourse } from './api';
import { CreateCourseDialog } from './CreateCourseDialog';
import Navbar from '@/components/Navbar/Navbar';

export function AiCoursesPage() {
    const [courses, setCourses] = useState<AiCourse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            setIsLoading(true);
            const data = await aiCoursesApi.getAllCourses();
            setCourses(data);
        } catch (err: any) {
            console.error('Failed to load courses:', err);
            setError(err.response?.data?.error || 'Failed to load courses');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCourse = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this course?')) return;

        try {
            await aiCoursesApi.deleteCourse(id);
            setCourses(prev => prev.filter(c => c.id !== id));
        } catch (err: any) {
            console.error('Failed to delete course:', err);
            alert('Failed to delete course');
        }
    };

    const handleCourseCreated = (courseId: string) => {
        loadCourses();
        navigate(`/ai-courses/${courseId}`);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { color: string; label: string }> = {
            draft: { color: 'bg-gray-100 text-gray-700', label: 'Draft' },
            generating: { color: 'bg-yellow-100 text-yellow-700', label: 'Generating...' },
            active: { color: 'bg-blue-100 text-blue-700', label: 'In Progress' },
            completed: { color: 'bg-green-100 text-green-700', label: 'Completed' },
        };
        const config = statusConfig[status] || statusConfig.draft;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const getProgressPercentage = (course: AiCourse) => {
        if (course.sectionCount === 0) return 0;
        return Math.round((course.completedSections / course.sectionCount) * 100);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#335441]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9F6EE] dark:bg-gray-900">
            <Navbar />
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-[#E4D7B4] dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-[#335441] dark:text-white flex items-center gap-3">
                                <GraduationCap className="w-8 h-8 text-[#335441]" />
                                AI Courses
                            </h1>
                            <p className="text-gray-500 mt-2">
                                AI-generated personalized courses with articles, quizzes, and flashcards
                            </p>
                        </div>
                        <button
                            onClick={() => setIsCreateDialogOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-[#335441] text-white rounded-lg hover:bg-[#46704A] transition-colors font-medium shadow-md"
                        >
                            <Plus className="w-5 h-5" />
                            Create Course
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {courses.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-[#335441]/10 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-[#335441]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#335441] dark:text-white mb-2">
                            No Courses Yet
                        </h2>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Create your first AI-generated course to start learning. Each course includes
                            articles, flashcards, mind maps, and quizzes.
                        </p>
                        <button
                            onClick={() => setIsCreateDialogOpen(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#335441] text-white rounded-lg hover:bg-[#46704A] transition-colors font-medium shadow-md"
                        >
                            <Sparkles className="w-5 h-5" />
                            Create Your First Course
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                onClick={() => navigate(`/ai-courses/${course.id}`)}
                                className="bg-white dark:bg-gray-800 rounded-xl border border-[#E4D7B4] dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 group"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-[#335441] dark:text-white line-clamp-2 group-hover:text-[#46704A] transition-colors">
                                            {course.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                            {course.description}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteCourse(course.id, e)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <BookOpen className="w-4 h-4 text-[#335441]" />
                                        <span>{course.sections?.length || 0}/{course.sectionCount} sections</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4 text-[#335441]" />
                                        <span>{course.timeCommitment} min/day</span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-gray-500">Progress</span>
                                        <span className="font-medium text-[#335441]">
                                            {getProgressPercentage(course)}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-[#F9F6EE] dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#335441] rounded-full transition-all"
                                            style={{ width: `${getProgressPercentage(course)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between">
                                    {getStatusBadge(course.status)}
                                    <div className="flex items-center gap-1 text-[#335441] text-sm font-medium group-hover:translate-x-1 transition-transform">
                                        <span>Continue</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Course Dialog */}
            <CreateCourseDialog
                open={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onCourseCreated={handleCourseCreated}
            />
        </div>
    );
}

export default AiCoursesPage;
