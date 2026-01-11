import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Download,
  Play,
  FileText,
  Calendar,
  Clock,
  Sparkles,
  Loader2,
} from "lucide-react";
import { podcastService } from "@/services/api";

export default function PodcastPlayerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: podcast,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["podcast", id],
    queryFn: () => podcastService.getPodcast(id!),
    enabled: !!id,
  });

  const API_BASE = "http://localhost:3000";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9F6EE] to-[#EFE7D4] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#335441] animate-spin mx-auto mb-4" />
          <p className="text-[#335441] font-semibold text-lg">
            Loading podcast...
          </p>
        </div>
      </div>
    );
  }

  if (error || !podcast) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9F6EE] to-[#EFE7D4] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center border-2 border-[#E4D7B4]">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#335441] mb-3">
            Podcast Not Found
          </h2>
          <p className="text-[#6B8F60] mb-6">
            The podcast you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/podcasts")}
            className="px-6 py-3 bg-gradient-to-r from-[#335441] to-[#46704A] text-white rounded-xl font-semibold hover:from-[#46704A] hover:to-[#6B8F60] transition-all"
          >
            Back to Podcasts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F6EE] to-[#EFE7D4]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#335441] via-[#46704A] to-[#335441] shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate("/podcasts")}
            className="flex items-center gap-2 text-white hover:text-[#E4D7B4] transition-colors mb-4 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back to Podcasts</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{podcast.title}</h1>
              <p className="text-[#E4D7B4] text-sm mt-1">
                AI-Generated Podcast
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Video Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            {podcast.videoPath && (
              <div className="bg-white rounded-2xl p-6 border-2 border-[#E4D7B4] shadow-xl">
                <div className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-[#E4D7B4] bg-black">
                  <video
                    controls
                    className="w-full"
                    src={`${API_BASE}${podcast.videoPath}`}
                    poster="/podcast-thumbnail.jpg"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}

            {/* Description */}
            {podcast.description && (
              <div className="bg-white rounded-2xl p-6 border-2 border-[#E4D7B4] shadow-lg">
                <h2 className="text-xl font-bold text-[#335441] mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  About This Podcast
                </h2>
                <p className="text-[#6B8F60] leading-relaxed">
                  {podcast.description}
                </p>
              </div>
            )}

            {/* Script */}
            {podcast.script && (
              <div className="bg-white rounded-2xl p-6 border-2 border-[#E4D7B4] shadow-lg">
                <h2 className="text-xl font-bold text-[#335441] mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Podcast Script
                </h2>
                <div className="bg-[#F9F6EE] rounded-xl p-6 max-h-[600px] overflow-y-auto border border-[#E4D7B4]">
                  <pre className="whitespace-pre-wrap text-sm text-[#335441] font-mono leading-relaxed">
                    {podcast.script}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metadata Cards */}
            <div className="bg-white rounded-2xl p-6 border-2 border-[#E4D7B4] shadow-lg space-y-4">
              <h2 className="text-xl font-bold text-[#335441] mb-4">Details</h2>

              <div className="flex items-center gap-3 p-4 bg-[#F9F6EE] rounded-xl border border-[#E4D7B4]">
                <div className="w-10 h-10 bg-gradient-to-br from-[#335441] to-[#46704A] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-[#6B8F60] font-medium">Duration</p>
                  <p className="font-bold text-[#335441]">{podcast.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-[#F9F6EE] rounded-xl border border-[#E4D7B4]">
                <div className="w-10 h-10 bg-gradient-to-br from-[#335441] to-[#46704A] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-[#6B8F60] font-medium">Created</p>
                  <p className="font-bold text-[#335441] text-sm">
                    {new Date(podcast.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-[#F9F6EE] rounded-xl border border-[#E4D7B4]">
                <div className="w-10 h-10 bg-gradient-to-br from-[#46704A] to-[#6B8F60] rounded-lg flex items-center justify-center flex-shrink-0">
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

            {/* Download Section */}
            <div className="bg-white rounded-2xl p-6 border-2 border-[#E4D7B4] shadow-lg space-y-3">
              <h2 className="text-xl font-bold text-[#335441] mb-4">
                Downloads
              </h2>

              {podcast.videoPath && (
                <a
                  href={`${API_BASE}${podcast.videoPath}`}
                  download
                  className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-[#335441] to-[#46704A] text-white rounded-xl hover:from-[#46704A] hover:to-[#6B8F60] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                >
                  <Download className="w-5 h-5" />
                  Download Video
                </a>
              )}

              {podcast.audioPath && podcast.audioPath !== podcast.videoPath && (
                <a
                  href={`${API_BASE}${podcast.audioPath}`}
                  download
                  className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-[#46704A] to-[#6B8F60] text-white rounded-xl hover:from-[#6B8F60] hover:to-[#A9B782] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                >
                  <Download className="w-5 h-5" />
                  Download Audio
                </a>
              )}
            </div>

            {/* Share Section (Optional - for future) */}
            <div className="bg-gradient-to-br from-[#335441] to-[#46704A] rounded-2xl p-6 text-white shadow-lg">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI-Powered
              </h3>
              <p className="text-sm text-[#E4D7B4]">
                This podcast was generated using advanced AI technology with 3D
                avatars and natural conversations.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
