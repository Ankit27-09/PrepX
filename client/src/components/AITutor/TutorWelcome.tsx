import { forwardRef } from 'react';
import { BookOpen, Monitor, Mail } from 'lucide-react';

interface TutorWelcomeProps {
    disabled: boolean;
    startButtonText: string;
    onStartCall: () => void;
}

export const TutorWelcome = forwardRef<HTMLDivElement, TutorWelcomeProps>(
    ({ disabled, startButtonText, onStartCall }, ref) => {
        return (
            <div
                ref={ref}
                className="fixed inset-0 z-10 flex flex-col items-center justify-center bg-[#F9F6EE] px-4 text-center"
                style={{ pointerEvents: disabled ? 'none' : 'auto' }}
            >
                {/* Logo / Title */}
                <div className="mb-8">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <img src="/logo.png" alt="PrepX" className="w-12 h-12" />
                        <h1 className="text-5xl font-bold text-[#335441]">
                            AI Tutor
                        </h1>
                    </div>
                    <p className="mt-2 text-lg text-[#6B8F60]">Your personal learning companion</p>
                </div>

                {/* Feature Cards */}
                <div className="mb-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border-2 border-[#E4D7B4] bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                        <BookOpen className="mx-auto mb-2 h-8 w-8 text-[#46704A]" />
                        <h3 className="font-semibold text-[#335441]">Code Explanation</h3>
                        <p className="mt-1 text-sm text-[#6B8F60]">Get help understanding any code</p>
                    </div>
                    <div className="rounded-xl border-2 border-[#E4D7B4] bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                        <Monitor className="mx-auto mb-2 h-8 w-8 text-[#46704A]" />
                        <h3 className="font-semibold text-[#335441]">Screen Sharing</h3>
                        <p className="mt-1 text-sm text-[#6B8F60]">Share your screen for guidance</p>
                    </div>
                    <div className="rounded-xl border-2 border-[#E4D7B4] bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                        <Mail className="mx-auto mb-2 h-8 w-8 text-[#46704A]" />
                        <h3 className="font-semibold text-[#335441]">Session Summary</h3>
                        <p className="mt-1 text-sm text-[#6B8F60]">Get notes emailed to you</p>
                    </div>
                </div>

                {/* Start Button */}
                <button
                    onClick={onStartCall}
                    disabled={disabled}
                    className="group relative overflow-hidden rounded-full border-2 border-[#335441] bg-[#335441] px-10 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-[#46704A] hover:border-[#46704A] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <span className="relative z-10">{startButtonText}</span>
                </button>

                <p className="mt-6 max-w-md text-sm text-[#6B8F60]">
                    Start a session to connect with your AI Tutor. Share your screen to get help with code, documents, or any learning material.
                </p>
            </div>
        );
    }
);

TutorWelcome.displayName = 'TutorWelcome';
