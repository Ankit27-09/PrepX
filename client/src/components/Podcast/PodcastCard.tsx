import { type Podcast } from "@/types/podcasts";
import {
  Play,
  Trash2,
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
  Sparkles,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PodcastCardProps {
  podcast: Podcast;
  onDelete: (id: string) => void;
  onView: (podcast: Podcast) => void;
}

export default function PodcastCard({ podcast, onDelete }: PodcastCardProps) {
  const navigate = useNavigate();

  const getStatusIcon = () => {
    switch (podcast.status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-[#46704A]" />;
      case "processing":
        return <Loader2 className="w-5 h-5 text-[#335441] animate-spin" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-[#A9B782]" />;
    }
  };

  const getStatusText = () => {
    switch (podcast.status) {
      case "completed":
        return "Ready to Play";
      case "processing":
        return "AI Generating...";
      case "error":
        return "Failed";
      default:
        return "Queued";
    }
  };

  const getStatusColor = () => {
    switch (podcast.status) {
      case "completed":
        return "text-[#46704A] bg-[#F9F6EE] border-[#46704A]";
      case "processing":
        return "text-[#335441] bg-[#F9F6EE] border-[#335441]";
      case "error":
        return "text-red-600 bg-red-50 border-red-300";
      default:
        return "text-[#6B8F60] bg-[#F9F6EE] border-[#A9B782]";
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-[#E4D7B4] hover:border-[#335441] overflow-hidden flex flex-col h-full">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#335441]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Content wrapper with padding */}
      <div className="p-6 flex flex-col flex-1">
        {/* Status Badge - Top Right - Absolute positioned */}
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-2">
            {/* {getStatusIcon()} */}
            <span
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border-2 whitespace-nowrap ${getStatusColor()}`}
            >
              {getStatusText()}
            </span>
          </div>
        </div>

        {/* Header with Icon - Fixed height area */}
        <div className="flex items-start gap-4 mb-4 pr-28 min-h-[80px]">
          <div className="w-14 h-14 bg-gradient-to-br from-[#335441] to-[#46704A] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col">
            <h3 className="text-lg font-bold text-[#335441] mb-2 line-clamp-2 group-hover:text-[#46704A] transition-colors leading-tight">
              {podcast.title}
            </h3>
            {podcast.description && (
              <p className="text-sm text-[#6B8F60] line-clamp-2 leading-snug">
                {podcast.description}
              </p>
            )}
          </div>
        </div>

        {/* Info Grid - Fixed height */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#F9F6EE] rounded-lg p-3 border border-[#E4D7B4]">
            <p className="text-xs text-[#6B8F60] mb-1 font-medium">Duration</p>
            <p className="font-bold text-[#335441] truncate">
              {podcast.length}
            </p>
          </div>
          <div className="bg-[#F9F6EE] rounded-lg p-3 border border-[#E4D7B4]">
            <p className="text-xs text-[#6B8F60] mb-1 flex items-center gap-1 font-medium">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">Created</span>
            </p>
            <p className="font-bold text-[#335441] text-sm truncate">
              {new Date(podcast.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Error Message - Dynamic height */}
        {podcast.status === "error" && podcast.errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium line-clamp-3">
              {podcast.errorMessage}
            </p>
          </div>
        )}

        {/* Processing Progress - Fixed height */}
        {podcast.status === "processing" && (
          <div className="mb-4">
            <div className="h-2 bg-[#F9F6EE] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#335441] to-[#46704A] rounded-full animate-pulse w-3/4"></div>
            </div>
            <p className="text-xs text-[#6B8F60] mt-2 text-center font-medium">
              AI is crafting your podcast...
            </p>
          </div>
        )}

        {/* Spacer to push actions to bottom */}
        <div className="flex-1"></div>

        {/* Actions - Always at bottom */}
        <div className="flex gap-2 mt-4">
          {podcast.status === "completed" && (
            <button
              onClick={() => navigate(`/podcasts/${podcast.id}`)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#335441] to-[#46704A] text-white rounded-xl hover:from-[#46704A] hover:to-[#6B8F60] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl group/btn"
            >
              <Play className="w-5 h-5 group-hover/btn:scale-110 transition-transform flex-shrink-0" />
              <span className="truncate">Play Podcast</span>
            </button>
          )}
          <button
            onClick={() => onDelete(podcast.id)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-300 border-2 border-red-200 hover:border-red-300 flex-shrink-0"
            aria-label="Delete podcast"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
