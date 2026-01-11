import {type Podcast } from "@/types/podcasts";
import {
  X,
  Download,
  Play,
  FileText,
  Calendar,
  Clock,
  Sparkles,
} from "lucide-react";

interface PodcastModalProps {
  podcast: Podcast;
  isOpen: boolean;
  onClose: () => void;
}

export default function PodcastModal({
  podcast,
  isOpen,
  onClose,
}: PodcastModalProps) {
  if (!isOpen) return null;

  const API_BASE = "http://localhost:3000";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-white to-[#F9F6EE] rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-[#E4D7B4] animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#335441] to-[#46704A] px-8 py-6 flex items-center justify-between rounded-t-2xl shadow-lg z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{podcast.title}</h2>
              <p className="text-[#E4D7B4] text-sm">AI-Generated Podcast</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 group"
          >
            <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border-2 border-[#E4D7B4] shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#335441] to-[#46704A] rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-[#6B8F60] font-medium">Duration</p>
                  <p className="font-bold text-[#335441]">{podcast.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-[#E4D7B4] shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#335441] to-[#46704A] rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-[#6B8F60] font-medium">Created</p>
                  <p className="font-bold text-[#335441] text-sm">
                    {new Date(podcast.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-[#E4D7B4] shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#46704A] to-[#6B8F60] rounded-lg flex items-center justify-center">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-[#6B8F60] font-medium">Status</p>
                  <p className="font-bold text-[#335441] capitalize">
                    {podcast.status}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {podcast.description && (
            <div className="bg-white rounded-xl p-6 border-2 border-[#E4D7B4] shadow-md">
              <h3 className="text-lg font-bold text-[#335441] mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Description
              </h3>
              <p className="text-[#6B8F60] leading-relaxed">
                {podcast.description}
              </p>
            </div>
          )}

          {/* Video Player */}
          {podcast.videoPath && (
            <div className="bg-white rounded-xl p-6 border-2 border-[#E4D7B4] shadow-md">
              <h3 className="text-lg font-bold text-[#335441] mb-4 flex items-center gap-2">
                <Play className="w-5 h-5" />
                Podcast Video
              </h3>
              <div className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-[#E4D7B4]">
                <video
                  controls
                  className="w-full"
                  src={`${API_BASE}${podcast.videoPath}`}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}

          {/* Script */}
          {podcast.script && (
            <div className="bg-white rounded-xl p-6 border-2 border-[#E4D7B4] shadow-md">
              <h3 className="text-lg font-bold text-[#335441] mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Podcast Script
              </h3>
              <div className="bg-[#F9F6EE] rounded-xl p-6 max-h-96 overflow-y-auto border border-[#E4D7B4]">
                <pre className="whitespace-pre-wrap text-sm text-[#335441] font-mono leading-relaxed">
                  {podcast.script}
                </pre>
              </div>
            </div>
          )}

          {/* Download Buttons */}
          <div className="flex flex-wrap gap-4">
            {podcast.videoPath && (
              <a
                href={`${API_BASE}${podcast.videoPath}`}
                download
                className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-[#335441] to-[#46704A] text-white rounded-xl hover:from-[#46704A] hover:to-[#6B8F60] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
              >
                <Download className="w-5 h-5" />
                Download Video
              </a>
            )}
            {podcast.audioPath && podcast.audioPath !== podcast.videoPath && (
              <a
                href={`${API_BASE}${podcast.audioPath}`}
                download
                className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-[#46704A] to-[#6B8F60] text-white rounded-xl hover:from-[#6B8F60] hover:to-[#A9B782] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
              >
                <Download className="w-5 h-5" />
                Download Audio
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
