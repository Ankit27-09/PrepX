import { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import type { AiArticlePage } from './api';
import MarkdownRenderer from '../MarkdownRenderer';

interface ArticleViewProps {
    pages: AiArticlePage[];
    onMarkRead: (pageId: string) => Promise<any>;
}

export function ArticleView({ pages, onMarkRead }: ArticleViewProps) {
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [readPages, setReadPages] = useState<Set<string>>(
        new Set(pages.filter(p => p.isRead).map(p => p.id))
    );

    const currentPage = pages[currentPageIndex];

    const handlePageChange = async (newIndex: number) => {
        // Mark current page as read
        if (!readPages.has(currentPage.id)) {
            try {
                await onMarkRead(currentPage.id);
                setReadPages(prev => new Set([...prev, currentPage.id]));
            } catch (err) {
                console.error('Failed to mark page as read:', err);
            }
        }
        setCurrentPageIndex(newIndex);
    };

    const goToPrevious = () => {
        if (currentPageIndex > 0) {
            handlePageChange(currentPageIndex - 1);
        }
    };

    const goToNext = () => {
        if (currentPageIndex < pages.length - 1) {
            handlePageChange(currentPageIndex + 1);
        }
    };

    if (!currentPage) {
        return (
            <div className="p-8 text-center text-gray-500">
                No article content available
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#F9F6EE]">
            {/* Page Navigation */}
            <div className="bg-white border-b border-[#E4D7B4] px-6 py-4">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {pages.map((page, index) => (
                            <button
                                key={page.id}
                                onClick={() => handlePageChange(index)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${index === currentPageIndex
                                    ? 'bg-[#335441] text-white shadow-md'
                                    : readPages.has(page.id)
                                        ? 'bg-green-50 text-[#335441] border border-green-200'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-transparent'
                                    }`}
                            >
                                {readPages.has(page.id) && (
                                    <CheckCircle className={`w-3.5 h-3.5 ${index === currentPageIndex ? 'text-green-300' : 'text-green-600'}`} />
                                )}
                                Page {index + 1}
                            </button>
                        ))}
                    </div>
                    <div className="text-sm font-medium text-[#335441] pl-4">
                        {readPages.size}/{pages.length} pages read
                    </div>
                </div>
            </div>

            {/* Article Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <div className="flex items-start justify-between mb-8">
                        <h1 className="text-3xl font-bold text-[#335441]">
                            {currentPage.pageTitle}
                        </h1>
                        {readPages.has(currentPage.id) && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4" />
                                Read
                            </div>
                        )}
                    </div>

                    <div className="prose prose-lg prose-slate max-w-none prose-headings:text-[#335441] prose-a:text-[#46704A] prose-strong:text-[#335441]">
                        <MarkdownRenderer content={currentPage.content} />
                    </div>
                </div>
            </div>

            {/* Navigation Footer */}
            <div className="bg-white border-t border-[#E4D7B4] px-6 py-4 sticky bottom-0">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <button
                        onClick={goToPrevious}
                        disabled={currentPageIndex === 0}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${currentPageIndex === 0
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-[#335441] hover:bg-[#F9F6EE] border border-transparent hover:border-[#E4D7B4]'
                            }`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Previous
                    </button>

                    <div className="flex items-center px-4 py-1 bg-[#F9F6EE] rounded-lg">
                        <span className="text-sm font-medium text-[#335441]">
                            Page {currentPageIndex + 1} of {pages.length}
                        </span>
                    </div>

                    <button
                        onClick={goToNext}
                        disabled={currentPageIndex === pages.length - 1}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${currentPageIndex === pages.length - 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#335441] to-[#46704A] text-white hover:shadow-lg hover:scale-105'
                            }`}
                    >
                        Next
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ArticleView;
