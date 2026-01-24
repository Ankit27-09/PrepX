import type { AgentState } from '@livekit/components-react';
import { BarVisualizer, useVoiceAssistant } from '@livekit/components-react';
import { cn } from '../utils';
import { forwardRef } from 'react';

interface AgentTileProps {
    state: AgentState;
    audioTrack?: ReturnType<typeof useVoiceAssistant>['audioTrack'];
    className?: string;
}

export const AgentTile = forwardRef<HTMLDivElement, AgentTileProps>(
    ({ state, audioTrack, className }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'flex items-center justify-center rounded-2xl bg-white border-2 border-[#E4D7B4] p-8 shadow-lg',
                    className
                )}
            >
                <div className="flex flex-col items-center gap-4">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#46704A] to-[#335441]">
                        {audioTrack && (
                            <BarVisualizer
                                barCount={5}
                                trackRef={audioTrack}
                                options={{ minHeight: 10 }}
                                className="flex h-12 items-end gap-1"
                            />
                        )}
                    </div>
                    <span className="text-sm font-medium capitalize text-[#6B8F60]">
                        {state === 'speaking' ? 'Speaking...' : state === 'thinking' ? 'Thinking...' : 'Listening'}
                    </span>
                </div>
            </div>
        );
    }
);

AgentTile.displayName = 'AgentTile';
