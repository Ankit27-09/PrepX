import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Mic2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Zap,
  Radio,
  Waves,
} from "lucide-react";
import { podcastService } from "@/services/api";
import type{ Podcast, CreatePodcastRequest } from "@/types/podcasts";
import PodcastForm from "@/components/Podcast/PodcastForm";
import PodcastCard from "@/components/Podcast/PodcastCard";
import PodcastModal from "@/components/Podcast/PodcastModal";

function PodcastPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [serverStatus, setServerStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");

  const queryClient = useQueryClient();

  // Check server health
  useEffect(() => {
    const checkServer = async () => {
      const isOnline = await podcastService.checkHealth();
      setServerStatus(isOnline ? "online" : "offline");
    };

    checkServer();
    const interval = setInterval(checkServer, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch podcasts
  const {
    data: podcasts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["podcasts"],
    queryFn: () => podcastService.getAllPodcasts(),
    refetchInterval: 5000, // Refetch every 5 seconds to get status updates
    enabled: serverStatus === "online",
  });

  // Create podcast mutation
  const createMutation = useMutation({
    mutationFn: podcastService.createPodcast,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcasts"] });
      setShowForm(false);
    },
  });

  // Delete podcast mutation
  const deleteMutation = useMutation({
    mutationFn: podcastService.deletePodcast,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcasts"] });
    },
  });

  const handleCreatePodcast = (data: CreatePodcastRequest) => {
    createMutation.mutate(data);
  };

  const handleDeletePodcast = (id: string) => {
    if (confirm("Are you sure you want to delete this podcast?")) {
      deleteMutation.mutate(id);
    }
  };

  if (serverStatus === "offline") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9F6EE] to-[#EFE7D4] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto text-center border-2 border-[#E4D7B4]">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#335441] mb-3">
            Server Offline
          </h2>
          <p className="text-[#6B8F60] mb-6 leading-relaxed">
            The AI Podcast server is not running. Please start the server with:
          </p>
          <code className="bg-[#F9F6EE] px-4 py-3 rounded-lg block text-sm text-[#335441] font-mono border-2 border-[#E4D7B4]">
            cd server && npm run dev
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F6EE] to-[#EFE7D4]">
      {/* Hero Header */}
      <header className="relative bg-gradient-to-r from-[#335441] via-[#46704A] to-[#335441] shadow-2xl overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-pulse"></div>
          <div
            className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/3 w-24 h-24 bg-white rounded-full animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl">
                  <Mic2 className="w-9 h-9 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white">
                    AI Podcast Studio
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Sparkles className="w-4 h-4 text-[#E4D7B4]" />
                    <p className="text-[#E4D7B4] text-sm">
                      Powered by Advanced AI
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-lg text-white/90 max-w-2xl leading-relaxed">
                Transform your content into engaging podcast conversations with
                AI-powered 3D avatars. Create professional podcasts in minutes,
                not hours.
              </p>

              {/* Feature badges */}
              <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <Radio className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">
                    Multi-Speaker
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <Waves className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">
                    3D Avatars
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <Zap className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">
                    Instant Generation
                  </span>
                </div>
              </div>
            </div>

            {/* Decorative illustration */}
            <div className="hidden lg:block">
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-3xl rotate-6 animate-pulse"></div>
                <div
                  className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-3xl -rotate-6 animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Mic2 className="w-32 h-32 text-white/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Create Form */}
        {showForm && (
          <div className="mb-8 animate-in slide-in-from-top duration-300">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-[#E4D7B4]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#335441] to-[#46704A] rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#335441]">
                    Create New Podcast
                  </h2>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-[#6B8F60] hover:text-[#335441] font-semibold px-4 py-2 rounded-lg hover:bg-[#F9F6EE] transition-all"
                >
                  Cancel
                </button>
              </div>
              <PodcastForm
                onSubmit={handleCreatePodcast}
                isLoading={createMutation.isPending}
              />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 bg-white border-2 border-red-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <p className="text-[#335441] font-semibold">
                Failed to load podcasts. Please try again.
              </p>
            </div>
          </div>
        )}

        {/* Podcasts Grid */}
        {!showForm && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-[#335441] mb-2">
                  Your Podcasts
                </h2>
                <p className="text-[#6B8F60]">
                  {podcasts.length}{" "}
                  {podcasts.length === 1 ? "podcast" : "podcasts"} created
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-3 text-[#335441] bg-white border-2 border-[#E4D7B4] rounded-xl hover:border-[#335441] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                >
                  <RefreshCw
                    className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#335441] to-[#46704A] text-white rounded-xl hover:from-[#46704A] hover:to-[#6B8F60] transition-all shadow-lg hover:shadow-xl font-bold"
                >
                  <Sparkles className="w-5 h-5" />
                  Create New Podcast
                </button>
              </div>
            </div>

            {isLoading && serverStatus === "checking" ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 border-4 border-[#335441] border-t-transparent rounded-full animate-spin mb-4"></div>
                <span className="text-[#6B8F60] font-semibold text-lg">
                  Loading your podcasts...
                </span>
              </div>
            ) : podcasts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-[#E4D7B4] shadow-xl">
                <div className="w-24 h-24 bg-gradient-to-br from-[#335441] to-[#6B8F60] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <Mic2 className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-[#335441] mb-3">
                  No podcasts yet
                </h3>
                <p className="text-[#6B8F60] mb-8 text-lg max-w-md mx-auto">
                  Start creating amazing AI-powered podcasts with just a few
                  clicks
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-[#335441] to-[#46704A] text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-[#46704A] hover:to-[#6B8F60] transition-all"
                >
                  <Sparkles className="inline w-5 h-5 mr-2" />
                  Create Your First Podcast
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {podcasts.map((podcast) => (
                  <PodcastCard
                    key={podcast.id}
                    podcast={podcast}
                    onDelete={handleDeletePodcast}
                    onView={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default PodcastPage;
