import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../../config/backendUrl";
import { Sparkles, BookOpen, ArrowRight, ArrowLeft } from "lucide-react";

interface Chapter {
  title: string;
  description: string;
  order_index: number;
}

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [outline, setOutline] = useState<{
    title: string;
    description: string;
    chapters: Chapter[];
  } | null>(null);

  const generateOutline = async () => {
    if (!topic.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        `${backendUrl}/api/v1/courses/generate-outline`,
        { topic },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOutline(response.data);
      setStep(2);
    } catch (error: any) {
      console.error("Error generating outline:", error);
      const errorMsg =
        error.response?.data?.error || error.response?.data || error.message;
      alert(
        `Failed to generate course outline: ${errorMsg}\n\nPlease check:\n1. You're logged in\n2. Server is running\n3. GROQ_API_KEY is set`
      );
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async () => {
    if (!outline) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        `${backendUrl}/api/v1/courses`,
        {
          title: outline.title,
          description: outline.description,
          topic,
          chapters: outline.chapters,
          isPublic: true,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Generate content for all chapters
      const courseId = response.data.id;
      const chapters = response.data.course.chapters;

      for (const chapter of chapters) {
        try {
          await axios.post(
            `${backendUrl}/api/v1/courses/${courseId}/chapters/${chapter.id}/generate-content`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (error) {
          console.error(
            `Error generating content for chapter ${chapter.id}:`,
            error
          );
        }
      }

      navigate(`/courses/${courseId}`);
    } catch (error) {
      console.error("Error creating course:", error);
      alert("Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F6EE] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-[#A9B782]/30 mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#335441]" />
            <span className="text-sm font-medium text-[#335441]">
              AI-Powered Course Generator
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#335441] mb-4">
            Create Your Course
          </h1>
          <p className="text-lg text-[#6B8F60]">
            Let AI generate a comprehensive course outline for any topic
          </p>
        </div>

        {/* Step 1: Topic Input */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-[#E4D7B4]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#335441] to-[#46704A] rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#335441]">
                  Step 1: Choose a Topic
                </h2>
                <p className="text-sm text-[#6B8F60]">
                  What would you like to teach?
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#335441] mb-2">
                  Course Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g., Machine Learning, Web Development, Python Programming"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-[#E4D7B4] rounded-xl focus:border-[#335441] focus:outline-none transition-colors text-[#335441] placeholder-[#A9B782]"
                  disabled={loading}
                />
              </div>

              <button
                onClick={generateOutline}
                disabled={loading || !topic.trim()}
                className="w-full px-6 py-4 bg-gradient-to-r from-[#335441] to-[#46704A] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Course Outline
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 p-4 bg-[#F9F6EE] rounded-xl border border-[#E4D7B4]">
              <p className="text-sm text-[#6B8F60]">
                <strong className="text-[#335441]">💡 Tip:</strong> Be specific
                with your topic for better results. Our AI will create 8-12
                chapters with detailed content.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Review Outline */}
        {step === 2 && outline && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-[#E4D7B4]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#335441] to-[#46704A] rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#335441]">
                  Step 2: Review Outline
                </h2>
                <p className="text-sm text-[#6B8F60]">
                  AI generated course structure
                </p>
              </div>
            </div>

            <div className="mb-8">
              <div className="bg-gradient-to-br from-[#F9F6EE] to-[#EFE7D4] rounded-xl p-6 border border-[#E4D7B4] mb-6">
                <h3 className="text-3xl font-bold text-[#335441] mb-3">
                  {outline.title}
                </h3>
                <p className="text-lg text-[#6B8F60] leading-relaxed">
                  {outline.description}
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xl font-bold text-[#335441] flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Course Chapters ({outline.chapters.length})
                </h4>
                {outline.chapters.map((chapter, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-[#335441] bg-[#F9F6EE] rounded-r-xl p-4 hover:bg-[#EFE7D4] transition-colors"
                  >
                    <h5 className="font-bold text-[#335441] mb-2">
                      Chapter {index + 1}: {chapter.title}
                    </h5>
                    <p className="text-[#6B8F60] text-sm leading-relaxed">
                      {chapter.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                disabled={loading}
                className="flex-1 px-6 py-4 border-2 border-[#335441] text-[#335441] rounded-xl font-semibold hover:bg-[#F9F6EE] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={createCourse}
                disabled={loading}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-[#335441] to-[#46704A] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Course...
                  </>
                ) : (
                  <>
                    Create Course
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {loading && (
              <div className="mt-6 p-4 bg-[#F9F6EE] rounded-xl border border-[#E4D7B4]">
                <p className="text-sm text-[#6B8F60] text-center">
                  <strong className="text-[#335441]">⏳ Please wait:</strong> AI
                  is generating detailed content for each chapter. This may take
                  30-60 seconds...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
