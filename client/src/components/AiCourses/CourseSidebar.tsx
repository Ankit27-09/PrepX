import { useState } from 'react';
import {
    BookOpen,
    Brain,
    Layers,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    FileText,
    HelpCircle,
    ListChecks,
    ToggleLeft,
    Home,
    Network
} from 'lucide-react';
import type { AiCourse } from './api';
import type { ViewMode, ContentType } from './types';

interface CourseSidebarProps {
    course: AiCourse;
    selectedSectionId: string | null;
    currentView: ViewMode;
    onViewChange: (view: ViewMode) => void;
    onSectionSelect: (sectionId: string, contentType?: ContentType) => void;
}

interface ExpandedState {
    [key: string]: boolean;
}

export function CourseSidebar({
    course,
    selectedSectionId,
    currentView,
    onViewChange,
    onSectionSelect
}: CourseSidebarProps) {
    const [expandedSections, setExpandedSections] = useState<ExpandedState>({});
    const [expandedStudyMaterial, setExpandedStudyMaterial] = useState<ExpandedState>({});
    const [expandedQuiz, setExpandedQuiz] = useState<ExpandedState>({});

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };

    const toggleStudyMaterial = (sectionId: string) => {
        setExpandedStudyMaterial(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };

    const toggleQuiz = (sectionId: string) => {
        setExpandedQuiz(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };

    const handleContentClick = (sectionId: string, contentType: ContentType) => {
        onSectionSelect(sectionId, contentType);
    };

    return (
        <div className="w-72 bg-gradient-to-b from-[#335441] to-[#2a4536] text-white flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-white/10">
                <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Current Course</div>
                <h2 className="font-bold text-lg leading-tight line-clamp-2">{course.title}</h2>
                <div className="text-xs text-white/60 mt-1 flex items-center gap-2">
                    <span className="capitalize">{course.level}</span>
                    <span>•</span>
                    <span>{course.status === 'completed' ? 'Completed' : 'Active'}</span>
                </div>
            </div>

            {/* View Toggle */}
            <div className="p-3 flex gap-2">
                <button
                    onClick={() => onViewChange('home')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'home'
                        ? 'bg-[#46704A] text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                        }`}
                >
                    <Home className="w-4 h-4" />
                    Course Home
                </button>
                <button
                    onClick={() => onViewChange('eagle')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'eagle'
                        ? 'bg-[#46704A] text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                        }`}
                >
                    <Network className="w-4 h-4" />
                    Eagle
                </button>
            </div>

            {/* Curriculum */}
            <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-2">
                    <h3 className="text-xs text-white/60 uppercase tracking-wider font-semibold">Curriculum</h3>
                </div>

                <div className="px-2 pb-4 space-y-1">
                    {course.sections?.map((section, index) => (
                        <div key={section.id} className="rounded-lg overflow-hidden">
                            {/* Section Header */}
                            <button
                                onClick={() => toggleSection(section.id)}
                                className={`w-full flex items-center gap-2 px-3 py-2.5 text-left rounded-lg transition-all ${selectedSectionId === section.id
                                    ? 'bg-white/20'
                                    : 'hover:bg-white/10'
                                    }`}
                            >
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#46704A] flex items-center justify-center text-xs font-bold">
                                    {index + 1}
                                </span>
                                <span className="flex-1 text-sm font-medium truncate">{section.title}</span>
                                {section.isCompleted ? (
                                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                ) : (
                                    expandedSections[section.id] ? (
                                        <ChevronDown className="w-4 h-4 text-white/60 flex-shrink-0" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 text-white/60 flex-shrink-0" />
                                    )
                                )}
                            </button>

                            {/* Section Contents */}
                            {expandedSections[section.id] && (
                                <div className="ml-6 mt-1 space-y-0.5">
                                    {/* Article */}
                                    <button
                                        onClick={() => handleContentClick(section.id, 'article')}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-lg transition-all"
                                    >
                                        <FileText className="w-4 h-4 text-orange-400" />
                                        <span>Article</span>
                                    </button>

                                    {/* Study Material */}
                                    <div>
                                        <button
                                            onClick={() => toggleStudyMaterial(section.id)}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-lg transition-all"
                                        >
                                            <BookOpen className="w-4 h-4 text-cyan-400" />
                                            <span className="flex-1 text-left">Study Material</span>
                                            {expandedStudyMaterial[section.id] ? (
                                                <ChevronDown className="w-3 h-3" />
                                            ) : (
                                                <ChevronRight className="w-3 h-3" />
                                            )}
                                        </button>
                                        {expandedStudyMaterial[section.id] && (
                                            <div className="ml-4 space-y-0.5">
                                                <button
                                                    onClick={() => handleContentClick(section.id, 'mindMap')}
                                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 rounded-lg transition-all"
                                                >
                                                    <Brain className="w-3 h-3 text-cyan-400" />
                                                    <span>Mind Map</span>
                                                </button>
                                                <button
                                                    onClick={() => handleContentClick(section.id, 'flashcards')}
                                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 rounded-lg transition-all"
                                                >
                                                    <Layers className="w-3 h-3 text-cyan-400" />
                                                    <span>Flashcards</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quiz */}
                                    <div>
                                        <button
                                            onClick={() => toggleQuiz(section.id)}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-lg transition-all"
                                        >
                                            <HelpCircle className="w-4 h-4 text-pink-400" />
                                            <span className="flex-1 text-left">Quiz</span>
                                            {expandedQuiz[section.id] ? (
                                                <ChevronDown className="w-3 h-3" />
                                            ) : (
                                                <ChevronRight className="w-3 h-3" />
                                            )}
                                        </button>
                                        {expandedQuiz[section.id] && (
                                            <div className="ml-4 space-y-0.5">
                                                <button
                                                    onClick={() => handleContentClick(section.id, 'mcq')}
                                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 rounded-lg transition-all"
                                                >
                                                    <ListChecks className="w-3 h-3 text-pink-400" />
                                                    <span>Multiple Choice</span>
                                                </button>
                                                <button
                                                    onClick={() => handleContentClick(section.id, 'trueFalse')}
                                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 rounded-lg transition-all"
                                                >
                                                    <ToggleLeft className="w-3 h-3 text-pink-400" />
                                                    <span>True / False</span>
                                                </button>
                                                <button
                                                    onClick={() => handleContentClick(section.id, 'fillUp')}
                                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 rounded-lg transition-all"
                                                >
                                                    <FileText className="w-3 h-3 text-pink-400" />
                                                    <span>Fill Ups</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-black/10">
                <div className="text-xs text-white/60">
                    Progress: {course.completedSections}/{course.sectionCount} sections
                </div>
                <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-green-400 rounded-full transition-all"
                        style={{ width: `${(course.completedSections / course.sectionCount) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

export default CourseSidebar;
