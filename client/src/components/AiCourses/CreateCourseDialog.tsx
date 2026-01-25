import React, { useState } from 'react';
import { X, BookOpen, Target, Users, Sparkles, Hash, Clock, Loader2, AlertCircle } from 'lucide-react';
import { aiCoursesApi } from './api';
import type { CreateCourseInput } from './api';

interface CreateCourseDialogProps {
    open: boolean;
    onClose: () => void;
    onCourseCreated?: (courseId: string) => void;
}

type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
type CourseTone = 'professional' | 'casual' | 'technical';

export function CreateCourseDialog({ open, onClose, onCourseCreated }: CreateCourseDialogProps) {
    const [formData, setFormData] = useState({
        topic: '',
        level: 'beginner' as CourseLevel,
        goal: '',
        tone: 'professional' as CourseTone,
        sectionCount: 5,
        targetAudience: '',
        prerequisites: '',
        timeCommitment: 30,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    if (!open) return null;

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.topic.trim()) newErrors.topic = 'Course topic is required';
        if (!formData.goal.trim()) newErrors.goal = 'Learning goal is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const input: CreateCourseInput = {
                topic: formData.topic,
                level: formData.level,
                goal: formData.goal,
                tone: formData.tone,
                sectionCount: formData.sectionCount,
                timeCommitment: formData.timeCommitment,
                targetAudience: formData.targetAudience || undefined,
                prerequisites: formData.prerequisites || undefined,
            };

            const result = await aiCoursesApi.createCourse(input);

            if (onCourseCreated) {
                onCourseCreated(result.courseId);
            }
            onClose();

            // Reset form
            setFormData({
                topic: '',
                level: 'beginner',
                goal: '',
                tone: 'professional',
                sectionCount: 5,
                targetAudience: '',
                prerequisites: '',
                timeCommitment: 30,
            });
        } catch (err: any) {
            console.error('Failed to create course:', err);
            setError(err.response?.data?.error || err.message || 'Failed to create course');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const levelOptions = [
        { value: 'beginner', label: 'Beginner', emoji: '🌱' },
        { value: 'intermediate', label: 'Intermediate', emoji: '🚀' },
        { value: 'advanced', label: 'Advanced', emoji: '⚡' },
        { value: 'expert', label: 'Expert', emoji: '🎯' },
    ];

    const toneOptions = [
        { value: 'professional', label: 'Professional', desc: 'Formal & structured' },
        { value: 'casual', label: 'Casual', desc: 'Friendly & relaxed' },
        { value: 'technical', label: 'Technical', desc: 'Detailed & precise' },
    ];

    const timeOptions = [
        { value: 15, label: '15 min', emoji: '⚡' },
        { value: 30, label: '30 min', emoji: '🎯' },
        { value: 60, label: '1 hour', emoji: '💪' },
        { value: 120, label: '2 hours', emoji: '🚀' },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={isSubmitting ? undefined : onClose}
            />

            {/* Dialog */}
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Loading Overlay */}
                    {isSubmitting && (
                        <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 z-10 flex flex-col items-center justify-center p-8">
                            <div className="w-20 h-20 rounded-full bg-[#335441]/10 dark:bg-green-900/30 flex items-center justify-center animate-pulse">
                                <Loader2 className="w-10 h-10 text-[#335441] animate-spin" />
                            </div>
                            <h3 className="text-xl font-bold mt-6 text-center">Creating Your Course</h3>
                            <p className="text-gray-500 text-center mt-2">
                                AI is generating your personalized course content...
                            </p>
                            <div className="flex items-center gap-2 mt-6 text-sm text-gray-500">
                                <Sparkles className="w-4 h-4 text-[#335441] animate-pulse" />
                                <span>This may take a minute...</span>
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 z-10 flex flex-col items-center justify-center p-8">
                            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <AlertCircle className="w-10 h-10 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold mt-6 text-center text-red-600">Generation Failed</h3>
                            <p className="text-gray-500 text-center mt-2 max-w-md">{error}</p>
                            <button
                                onClick={() => setError(null)}
                                className="mt-6 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Header */}
                    <div className="border-b border-gray-200 dark:border-gray-800 p-6 bg-gradient-to-r from-[#335441]/10 to-[#46704A]/10 dark:from-green-950/20 dark:to-emerald-950/20">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2 text-[#335441] dark:text-green-400">
                                    <Sparkles className="w-6 h-6 text-[#335441]" />
                                    Create AI Course
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Describe your course and AI will generate personalized content
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                        <div className="p-6 space-y-6">
                            {/* Topic */}
                            <div className="space-y-2">
                                <label className="text-base font-semibold flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-green-600" />
                                    Course Topic
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., React Fundamentals, Python for Data Science..."
                                    value={formData.topic}
                                    onChange={(e) => handleChange('topic', e.target.value)}
                                    className={`w-full h-12 px-4 border rounded-lg text-base ${errors.topic ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors.topic && (
                                    <p className="text-xs text-red-500">⚠️ {errors.topic}</p>
                                )}
                            </div>

                            {/* Level */}
                            <div className="space-y-2">
                                <label className="text-base font-semibold flex items-center gap-2">
                                    <Users className="w-4 h-4 text-blue-600" />
                                    Learning Level
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-4 gap-3">
                                    {levelOptions.map((level) => (
                                        <button
                                            key={level.value}
                                            type="button"
                                            onClick={() => handleChange('level', level.value)}
                                            className={`p-3 rounded-xl border-2 transition-all text-center hover:scale-105 ${formData.level === level.value
                                                ? 'border-[#335441] bg-[#335441]/10 dark:bg-green-950/20'
                                                : 'border-gray-200 hover:border-[#335441]/50'
                                                }`}
                                        >
                                            <div className="text-2xl mb-1">{level.emoji}</div>
                                            <div className="text-sm font-medium">{level.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Goal */}
                            <div className="space-y-2">
                                <label className="text-base font-semibold flex items-center gap-2">
                                    <Target className="w-4 h-4 text-orange-600" />
                                    Learning Goal
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Build a portfolio website, Pass certification exam..."
                                    value={formData.goal}
                                    onChange={(e) => handleChange('goal', e.target.value)}
                                    className={`w-full h-12 px-4 border rounded-lg text-base ${errors.goal ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors.goal && (
                                    <p className="text-xs text-red-500">⚠️ {errors.goal}</p>
                                )}
                            </div>

                            {/* Tone */}
                            <div className="space-y-2">
                                <label className="text-base font-semibold flex items-center gap-2">
                                    Teaching Tone
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {toneOptions.map((tone) => (
                                        <button
                                            key={tone.value}
                                            type="button"
                                            onClick={() => handleChange('tone', tone.value)}
                                            className={`p-4 rounded-xl border-2 transition-all text-left hover:scale-105 ${formData.tone === tone.value
                                                ? 'border-[#335441] bg-[#335441]/10 dark:bg-green-950/20'
                                                : 'border-gray-200 hover:border-[#335441]/50'
                                                }`}
                                        >
                                            <div className="font-medium text-sm mb-1">{tone.label}</div>
                                            <div className="text-xs text-gray-500">{tone.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Section Count */}
                            <div className="space-y-2">
                                <label className="text-base font-semibold flex items-center gap-2">
                                    <Hash className="w-4 h-4 text-yellow-600" />
                                    Number of Sections
                                </label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={formData.sectionCount}
                                        onChange={(e) => handleChange('sectionCount', Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                                        className="w-24 h-12 px-4 border border-gray-300 rounded-lg text-base"
                                    />
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={formData.sectionCount}
                                        onChange={(e) => handleChange('sectionCount', parseInt(e.target.value))}
                                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#335441]"
                                    />
                                </div>
                            </div>

                            {/* Time Commitment */}
                            <div className="space-y-2">
                                <label className="text-base font-semibold flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-emerald-600" />
                                    Daily Time Commitment
                                </label>
                                <div className="grid grid-cols-4 gap-3">
                                    {timeOptions.map((time) => (
                                        <button
                                            key={time.value}
                                            type="button"
                                            onClick={() => handleChange('timeCommitment', time.value)}
                                            className={`p-4 rounded-xl border-2 transition-all text-center hover:scale-105 ${formData.timeCommitment === time.value
                                                ? 'border-[#335441] bg-[#335441]/10 dark:bg-green-950/20'
                                                : 'border-gray-200 hover:border-[#335441]/50'
                                                }`}
                                        >
                                            <div className="text-2xl mb-1">{time.emoji}</div>
                                            <div className="text-sm font-medium">{time.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-gray-900/50">
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-3 bg-[#335441] text-white rounded-lg hover:bg-[#46704A] flex items-center gap-2 shadow-md transition-colors"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Generate Course
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default CreateCourseDialog;
