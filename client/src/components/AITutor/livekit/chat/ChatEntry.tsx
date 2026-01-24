import type { ReceivedChatMessage } from '@livekit/components-react';
import { cn } from '../../utils';

interface ChatEntryProps {
    entry: ReceivedChatMessage;
    hideName?: boolean;
    hideTimestamp?: boolean;
}

export const ChatEntry = ({ entry, hideName, hideTimestamp }: ChatEntryProps) => {
    const isUser = entry.from?.isLocal ?? false;
    const time = new Date(entry.timestamp);
    const name = entry.from?.name || entry.from?.identity || (isUser ? 'You' : 'AI Tutor');

    return (
        <li className={cn('group flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
            {!hideName && (
                <span className="text-xs font-medium text-[#6B8F60]">
                    {name}
                    {!hideTimestamp && (
                        <span className="ml-2 font-mono text-[10px] text-[#6B8F60]/60">
                            {time.toLocaleTimeString(undefined, { timeStyle: 'short' })}
                        </span>
                    )}
                </span>
            )}
            <span
                className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
                    isUser
                        ? 'bg-[#335441] text-white'
                        : 'bg-white text-[#335441] border-2 border-[#E4D7B4]'
                )}
            >
                {entry.message}
            </span>
        </li>
    );
};
