import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { aiCoursesApi } from './api';
import type { AiMcqQuestion, AiTrueFalseQuestion, AiFillUpQuestion } from './api';

interface QuizViewProps {
    mcqs: AiMcqQuestion[];
    trueFalse: AiTrueFalseQuestion[];
    fillUps: AiFillUpQuestion[];
}

type QuizTab = 'mcq' | 'truefalse' | 'fillup';

// Separate component for fill-up questions to properly use useState
function FillUpQuestionItem({
    question,
    index,
    answer,
    onSubmit
}: {
    question: AiFillUpQuestion;
    index: number;
    answer: { answer: string; isCorrect: boolean | null } | undefined;
    onSubmit: (questionId: string, answer: string) => void;
}) {
    const [inputValue, setInputValue] = useState(answer?.answer || '');

    return (
        <div
            className={`p-6 rounded-xl border ${answer?.isCorrect === true
                ? 'bg-green-50 border-green-200'
                : answer?.isCorrect === false
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
        >
            <div className="flex items-start gap-3 mb-4">
                <span className="bg-[#E4D7B4] text-[#335441] px-2 py-1 rounded text-sm font-medium">
                    Q{index + 1}
                </span>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {question.sentence.replace('______', '________')}
                </p>
            </div>
            <div className="flex gap-4 ml-10">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={!!answer}
                    placeholder="Type your answer..."
                    className={`flex-1 px-4 py-3 border-2 rounded-lg ${answer?.isCorrect === true
                        ? 'border-green-500 bg-green-50'
                        : answer?.isCorrect === false
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 focus:border-[#335441] focus:ring-[#335441]'
                        }`}
                />
                {!answer && (
                    <button
                        onClick={() => onSubmit(question.id, inputValue)}
                        disabled={!inputValue.trim()}
                        className="px-6 py-3 bg-[#335441] text-white rounded-lg hover:bg-[#2a4536] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Submit
                    </button>
                )}
            </div>
            {answer && !answer.isCorrect && (
                <p className="mt-3 ml-10 text-sm text-green-600">
                    Correct answer: <strong>{question.missingWord}</strong>
                </p>
            )}
        </div>
    );
}

export function QuizView({ mcqs, trueFalse, fillUps }: QuizViewProps) {
    const [activeTab, setActiveTab] = useState<QuizTab>('mcq');
    const [mcqAnswers, setMcqAnswers] = useState<Record<string, { selected: string; isCorrect: boolean | null }>>({});
    const [tfAnswers, setTfAnswers] = useState<Record<string, { selected: boolean; isCorrect: boolean | null }>>({});
    const [fillUpAnswers, setFillUpAnswers] = useState<Record<string, { answer: string; isCorrect: boolean | null }>>({});

    const handleMcqSubmit = async (questionId: string, answer: string) => {
        try {
            const result = await aiCoursesApi.submitMcqAnswer(questionId, answer);
            setMcqAnswers(prev => ({
                ...prev,
                [questionId]: { selected: answer, isCorrect: result.isCorrect }
            }));
        } catch (err) {
            console.error('Failed to submit MCQ answer:', err);
        }
    };

    const handleTfSubmit = async (questionId: string, answer: boolean) => {
        try {
            const result = await aiCoursesApi.submitTrueFalseAnswer(questionId, answer);
            setTfAnswers(prev => ({
                ...prev,
                [questionId]: { selected: answer, isCorrect: result.isCorrect }
            }));
        } catch (err) {
            console.error('Failed to submit T/F answer:', err);
        }
    };

    const handleFillUpSubmit = async (questionId: string, answer: string) => {
        try {
            const result = await aiCoursesApi.submitFillUpAnswer(questionId, answer);
            setFillUpAnswers(prev => ({
                ...prev,
                [questionId]: { answer, isCorrect: result.isCorrect }
            }));
        } catch (err) {
            console.error('Failed to submit fill-up answer:', err);
        }
    };

    const getScore = (tab: QuizTab) => {
        switch (tab) {
            case 'mcq':
                const mcqCorrect = Object.values(mcqAnswers).filter(a => a.isCorrect).length;
                return `${mcqCorrect}/${mcqs.length}`;
            case 'truefalse':
                const tfCorrect = Object.values(tfAnswers).filter(a => a.isCorrect).length;
                return `${tfCorrect}/${trueFalse.length}`;
            case 'fillup':
                const fillCorrect = Object.values(fillUpAnswers).filter(a => a.isCorrect).length;
                return `${fillCorrect}/${fillUps.length}`;
        }
    };

    return (
        <div className="p-6">
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('mcq')}
                    className={`px-4 py-3 font-medium border-b-2 transition-colors ${activeTab === 'mcq'
                        ? 'border-[#335441] text-[#335441]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Multiple Choice ({mcqs.length})
                </button>
                <button
                    onClick={() => setActiveTab('truefalse')}
                    className={`px-4 py-3 font-medium border-b-2 transition-colors ${activeTab === 'truefalse'
                        ? 'border-[#335441] text-[#335441]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    True/False ({trueFalse.length})
                </button>
                <button
                    onClick={() => setActiveTab('fillup')}
                    className={`px-4 py-3 font-medium border-b-2 transition-colors ${activeTab === 'fillup'
                        ? 'border-[#335441] text-[#335441]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Fill in the Blank ({fillUps.length})
                </button>
            </div>

            {/* Score */}
            <div className="mb-6 p-4 bg-[#F9F6EE] rounded-lg border border-[#E4D7B4] flex items-center justify-between">
                <span className="text-[#335441] font-medium">Score</span>
                <span className="text-2xl font-bold text-[#335441]">
                    {getScore(activeTab)}
                </span>
            </div>

            {/* MCQ Questions */}
            {activeTab === 'mcq' && (
                <div className="space-y-6">
                    {mcqs.map((q, index) => {
                        const answer = mcqAnswers[q.id];
                        const options = JSON.parse(q.options) as string[];

                        return (
                            <div
                                key={q.id}
                                className={`p-6 rounded-xl border ${answer?.isCorrect === true
                                    ? 'bg-green-50 border-green-200'
                                    : answer?.isCorrect === false
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <div className="flex items-start gap-3 mb-4">
                                    <span className="bg-[#E4D7B4] text-[#335441] px-2 py-1 rounded text-sm font-medium">
                                        Q{index + 1}
                                    </span>
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                                        {q.question}
                                    </p>
                                </div>
                                <div className="grid gap-3 ml-10">
                                    {options.map((option, optIndex) => {
                                        const isSelected = answer?.selected === option;
                                        const isCorrectOption = q.answer === option && answer;

                                        return (
                                            <button
                                                key={optIndex}
                                                onClick={() => !answer && handleMcqSubmit(q.id, option)}
                                                disabled={!!answer}
                                                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${isCorrectOption
                                                    ? 'bg-green-100 border-green-500 text-green-800'
                                                    : isSelected && !answer?.isCorrect
                                                        ? 'bg-red-100 border-red-500 text-red-800'
                                                        : answer
                                                            ? 'border-gray-200 opacity-60'
                                                            : 'border-gray-200 hover:border-[#335441] hover:bg-[#F9F6EE]'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                                                        {String.fromCharCode(65 + optIndex)}
                                                    </span>
                                                    <span>{option}</span>
                                                    {isCorrectOption && <Check className="w-5 h-5 text-green-600 ml-auto" />}
                                                    {isSelected && !answer?.isCorrect && <X className="w-5 h-5 text-red-600 ml-auto" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* True/False Questions */}
            {activeTab === 'truefalse' && (
                <div className="space-y-6">
                    {trueFalse.map((q, index) => {
                        const answer = tfAnswers[q.id];

                        return (
                            <div
                                key={q.id}
                                className={`p-6 rounded-xl border ${answer?.isCorrect === true
                                    ? 'bg-green-50 border-green-200'
                                    : answer?.isCorrect === false
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <div className="flex items-start gap-3 mb-4">
                                    <span className="bg-[#E4D7B4] text-[#335441] px-2 py-1 rounded text-sm font-medium">
                                        Q{index + 1}
                                    </span>
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                                        {q.question}
                                    </p>
                                </div>
                                <div className="flex gap-4 ml-10">
                                    {[true, false].map((value) => {
                                        const isSelected = answer?.selected === value;
                                        const isCorrectOption = q.answer === value && answer;

                                        return (
                                            <button
                                                key={String(value)}
                                                onClick={() => !answer && handleTfSubmit(q.id, value)}
                                                disabled={!!answer}
                                                className={`flex-1 p-4 text-center rounded-lg border-2 font-medium transition-all ${isCorrectOption
                                                    ? 'bg-green-100 border-green-500 text-green-800'
                                                    : isSelected && !answer?.isCorrect
                                                        ? 'bg-red-100 border-red-500 text-red-800'
                                                        : answer
                                                            ? 'border-gray-200 opacity-60'
                                                            : 'border-gray-200 hover:border-[#335441] hover:bg-[#F9F6EE]'
                                                    }`}
                                            >
                                                {value ? 'True' : 'False'}
                                            </button>
                                        );
                                    })}
                                </div>
                                {answer && (
                                    <p className="mt-4 ml-10 text-sm text-gray-600 dark:text-gray-400 italic">
                                        {q.explanation}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Fill-up Questions */}
            {activeTab === 'fillup' && (
                <div className="space-y-6">
                    {fillUps.map((q, index) => (
                        <FillUpQuestionItem
                            key={q.id}
                            question={q}
                            index={index}
                            answer={fillUpAnswers[q.id]}
                            onSubmit={handleFillUpSubmit}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default QuizView;
