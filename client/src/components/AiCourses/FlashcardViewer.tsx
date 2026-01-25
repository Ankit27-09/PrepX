import { useState } from 'react';
import { RotateCcw, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import type { AiFlashcard } from './api';

interface FlashcardViewerProps {
    flashcards: AiFlashcard[];
    onReview: (flashcardId: string, isCorrect: boolean) => Promise<any>;
}

export function FlashcardViewer({ flashcards, onReview }: FlashcardViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [reviewedCards, setReviewedCards] = useState<Set<string>>(new Set());
    const [correctCount, setCorrectCount] = useState(0);

    const currentCard = flashcards[currentIndex];

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleReview = async (isCorrect: boolean) => {
        if (!currentCard) return;

        try {
            await onReview(currentCard.id, isCorrect);
            setReviewedCards(prev => new Set([...prev, currentCard.id]));
            if (isCorrect) {
                setCorrectCount(prev => prev + 1);
            }

            // Move to next card
            if (currentIndex < flashcards.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setIsFlipped(false);
            }
        } catch (err) {
            console.error('Failed to review flashcard:', err);
        }
    };

    const goToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setIsFlipped(false);
        }
    };

    const goToNext = () => {
        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
        }
    };

    const resetDeck = () => {
        setCurrentIndex(0);
        setIsFlipped(false);
        setReviewedCards(new Set());
        setCorrectCount(0);
    };

    if (flashcards.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                No flashcards available
            </div>
        );
    }

    const isComplete = reviewedCards.size === flashcards.length;

    return (
        <div className="p-8 max-w-3xl mx-auto">
            {/* Progress */}
            <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-gray-500">
                    Card {currentIndex + 1} of {flashcards.length}
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-green-600">
                        {correctCount} correct
                    </span>
                    <span className="text-sm text-gray-400">|</span>
                    <span className="text-sm text-gray-500">
                        {reviewedCards.size} reviewed
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-gray-200 rounded-full mb-8 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-[#335441] to-[#46704A] rounded-full transition-all"
                    style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                />
            </div>

            {/* Flashcard */}
            <div
                onClick={handleFlip}
                className="relative w-full h-80 cursor-pointer perspective-1000"
            >
                <div
                    className={`absolute inset-0 transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''
                        }`}
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                >
                    {/* Front */}
                    <div
                        className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center justify-center backface-hidden"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <div className="text-sm text-[#335441] font-medium mb-4 uppercase tracking-wider">Question</div>
                        <p className="text-xl font-medium text-gray-900 dark:text-white text-center">
                            {currentCard?.front}
                        </p>
                        <p className="text-sm text-gray-400 mt-8 flex items-center gap-1">
                            <RotateCcw className="w-3 h-3" /> Click to flip
                        </p>
                    </div>

                    {/* Back */}
                    <div
                        className="absolute inset-0 bg-[#F9F6EE] dark:bg-gray-800 rounded-2xl shadow-lg border border-[#E4D7B4] dark:border-gray-700 p-8 flex flex-col items-center justify-center"
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                        }}
                    >
                        <div className="text-sm text-[#335441] font-medium mb-4 uppercase tracking-wider">Answer</div>
                        <p className="text-xl font-medium text-gray-900 dark:text-white text-center">
                            {currentCard?.back}
                        </p>
                    </div>
                </div>
            </div>

            {/* Review Buttons (show when flipped) */}
            {isFlipped && !reviewedCards.has(currentCard?.id || '') && (
                <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                        onClick={() => handleReview(false)}
                        className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors"
                    >
                        <X className="w-5 h-5" />
                        Didn't Know
                    </button>
                    <button
                        onClick={() => handleReview(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-[#335441] text-white rounded-lg hover:bg-[#2a4536] font-medium transition-colors shadow-md"
                    >
                        <Check className="w-5 h-5" />
                        Got It!
                    </button>
                </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
                <button
                    onClick={goToPrevious}
                    disabled={currentIndex === 0}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${currentIndex === 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-[#335441] hover:bg-[#F9F6EE]'
                        }`}
                >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                </button>

                <button
                    onClick={resetDeck}
                    className="flex items-center gap-2 px-4 py-2 text-[#335441] hover:bg-[#F9F6EE] rounded-lg font-medium transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Reset Deck
                </button>

                <button
                    onClick={goToNext}
                    disabled={currentIndex === flashcards.length - 1}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${currentIndex === flashcards.length - 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-[#335441] hover:bg-[#F9F6EE]'
                        }`}
                >
                    Next
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Completion State */}
            {isComplete && (
                <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-xl text-center border border-green-100">
                    <div className="text-4xl mb-4">🎉</div>
                    <h3 className="text-xl font-bold text-[#335441] mb-2">
                        Deck Complete!
                    </h3>
                    <p className="text-[#46704A]">
                        You got {correctCount} out of {flashcards.length} correct
                    </p>
                    <button
                        onClick={resetDeck}
                        className="mt-4 px-6 py-2 bg-[#335441] text-white rounded-lg hover:bg-[#2a4536] font-medium transition-colors shadow-md"
                    >
                        Review Again
                    </button>
                </div>
            )}
        </div>
    );
}

export default FlashcardViewer;
