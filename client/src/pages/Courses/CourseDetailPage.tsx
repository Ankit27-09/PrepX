import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import {type RootState } from "../../store/store";
import { backendUrl } from "../../config/backendUrl";
import {
  BookOpen,
  CheckCircle,
  Circle,
  Bookmark,
  ArrowLeft,
  Menu,
  X,
  Award,
  FileText,
  Clock,
} from "lucide-react";
import MarkdownRenderer from "../../components/MarkdownRenderer";

interface Chapter {
  id: string;
  title: string;
  description: string;
  content: string | null;
  orderIndex: number;
  isCompleted: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  topic: string;
  views: number;
  chapters: Chapter[];
  is_bookmarked: boolean;
  is_enrolled: boolean;
  enrollment_data: {
    progressPercentage: number;
    isCompleted: boolean;
  } | null;
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tests, setTests] = useState<any[]>([]);
  const [cooldownInfo, setCooldownInfo] = useState<any>(null);
  const [cooldownTime, setCooldownTime] = useState<string>("");
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchCourse();
    if (isLoggedIn) {
      fetchTests();
    }
  }, [id, isLoggedIn]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const response = await axios.get(
        `${backendUrl}/api/v1/courses/${id}`,
        config
      );
      setCourse(response.data.course);
      if (response.data.course.chapters.length > 0) {
        setSelectedChapter(response.data.course.chapters[0]);
      }
    } catch (error) {
      console.error("Error fetching course:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTests = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${backendUrl}/api/v1/courses/${id}/tests`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setTests(response.data.tests);
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
    }
  };

  const handleTakeTest = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        `${backendUrl}/api/v1/courses/${id}/test/generate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        navigate(`/courses/${id}/test/${response.data.test.id}`);
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        // Cooldown active
        setCooldownInfo(error.response.data.cooldown);
      } else {
        console.error("Error generating test:", error);
        alert("Failed to generate test. Please try again.");
      }
    }
  };

  // Update cooldown timer
  useEffect(() => {
    if (!cooldownInfo) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const nextAvailable = new Date(cooldownInfo.nextAvailableAt).getTime();
      const remaining = nextAvailable - now;

      if (remaining <= 0) {
        setCooldownInfo(null);
        setCooldownTime("");
        return;
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      setCooldownTime(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [cooldownInfo]);

  const handleEnroll = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `${backendUrl}/api/v1/courses/${id}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCourse();
    } catch (error) {
      console.error("Error enrolling:", error);
    }
  };

  const handleToggleBookmark = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `${backendUrl}/api/v1/courses/${id}/bookmark`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCourse();
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const handleMarkComplete = async (
    chapterId: string,
    isCompleted: boolean
  ) => {
    if (!isLoggedIn) return;

    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `${backendUrl}/api/v1/courses/${id}/chapters/${chapterId}/progress`,
        { isCompleted: !isCompleted },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCourse();
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const handleChapterSelect = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F6EE] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#335441] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F9F6EE] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#6B8F60] text-lg mb-4">Course not found</p>
          <button
            onClick={() => navigate("/courses")}
            className="px-6 py-3 bg-gradient-to-r from-[#335441] to-[#46704A] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6EE]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#335441] to-[#46704A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <button
            onClick={() => navigate("/courses")}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Courses
          </button>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1 w-full">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full font-medium inline-block mb-4">
                {course.topic}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                {course.title}
              </h1>
              <p className="text-white/90 text-base sm:text-lg mb-6 leading-relaxed">
                {course.description}
              </p>

              {course.enrollment_data && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Your Progress</span>
                    <span className="text-sm font-bold">
                      {course.enrollment_data.progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div
                      className="bg-white h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${course.enrollment_data.progressPercentage}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-auto">
              {isLoggedIn && (
                <button
                  onClick={handleToggleBookmark}
                  className={`flex-1 lg:flex-none px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    course.is_bookmarked
                      ? "bg-white text-[#335441]"
                      : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                  }`}
                >
                  <Bookmark
                    className={`w-5 h-5 ${
                      course.is_bookmarked ? "fill-current" : ""
                    }`}
                  />
                  <span className="hidden sm:inline">
                    {course.is_bookmarked ? "Bookmarked" : "Bookmark"}
                  </span>
                </button>
              )}
              {!course.is_enrolled && (
                <button
                  onClick={handleEnroll}
                  className="flex-1 lg:flex-none px-8 py-3 bg-white text-[#335441] rounded-xl font-bold hover:shadow-xl transition-all duration-300"
                >
                  Enroll Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b-2 border-[#E4D7B4] px-4 py-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-2 text-[#335441] font-semibold"
        >
          {sidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
          <span>
            {sidebarOpen ? "Close" : "Chapters"} ({course.chapters.length})
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Chapters Sidebar - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[#E4D7B4] sticky top-20">
              <h2 className="font-bold text-xl text-[#335441] mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Chapters
              </h2>
              <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                {course.chapters.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    onClick={() => handleChapterSelect(chapter)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 group ${
                      selectedChapter?.id === chapter.id
                        ? "bg-gradient-to-r from-[#335441] to-[#46704A] text-white shadow-lg scale-105"
                        : "hover:bg-[#F9F6EE] text-[#335441] hover:scale-102"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {chapter.isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-[#A9B782]" />
                        ) : (
                          <Circle className="w-5 h-5 opacity-30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm mb-1">
                          Chapter {index + 1}
                        </div>
                        <div className="text-sm line-clamp-2">
                          {chapter.title}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chapters Sidebar - Mobile */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/50">
              <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-xl text-[#335441] flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Chapters
                    </h2>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 hover:bg-[#F9F6EE] rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6 text-[#335441]" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {course.chapters.map((chapter, index) => (
                      <button
                        key={chapter.id}
                        onClick={() => handleChapterSelect(chapter)}
                        className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                          selectedChapter?.id === chapter.id
                            ? "bg-gradient-to-r from-[#335441] to-[#46704A] text-white shadow-lg"
                            : "hover:bg-[#F9F6EE] text-[#335441]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {chapter.isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-[#A9B782]" />
                            ) : (
                              <Circle className="w-5 h-5 opacity-30" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm mb-1">
                              Chapter {index + 1}
                            </div>
                            <div className="text-sm">{chapter.title}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chapter Content */}
          <div className="lg:col-span-3">
            {selectedChapter ? (
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-[#E4D7B4]">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                  <div className="flex-1">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#335441] mb-2">
                      {selectedChapter.title}
                    </h2>
                    <p className="text-[#6B8F60]">
                      {selectedChapter.description}
                    </p>
                  </div>
                  {course.is_enrolled && (
                    <button
                      onClick={() =>
                        handleMarkComplete(
                          selectedChapter.id,
                          selectedChapter.isCompleted
                        )
                      }
                      className={`flex-shrink-0 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                        selectedChapter.isCompleted
                          ? "bg-[#A9B782] text-white"
                          : "bg-[#F9F6EE] text-[#335441] hover:bg-[#E4D7B4]"
                      }`}
                    >
                      {selectedChapter.isCompleted ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span className="hidden sm:inline">Completed</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-5 h-5" />
                          <span className="hidden sm:inline">
                            Mark Complete
                          </span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                  {selectedChapter.content ? (
                    <MarkdownRenderer content={selectedChapter.content} />
                  ) : (
                    <div className="text-center py-12 bg-[#F9F6EE] rounded-xl border-2 border-[#E4D7B4]">
                      <BookOpen className="w-12 h-12 text-[#A9B782] mx-auto mb-4" />
                      <p className="text-[#6B8F60]">
                        Content is being generated by AI...
                      </p>
                      <p className="text-sm text-[#A9B782] mt-2">
                        Please check back in a moment
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 border-2 border-[#E4D7B4] text-center">
                <BookOpen className="w-16 h-16 text-[#A9B782] mx-auto mb-4" />
                <p className="text-[#6B8F60] text-lg">
                  Select a chapter to view its content
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Test Section */}
        {isLoggedIn && course.is_enrolled && (
          <div className="mt-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-[#E4D7B4]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#335441] mb-2 flex items-center gap-2">
                    <Award className="w-6 h-6" />
                    Course Certification
                  </h2>
                  <p className="text-[#6B8F60]">
                    Test your knowledge and earn a certificate
                  </p>
                </div>
                {course.enrollment_data?.isCompleted && (
                  <button
                    onClick={handleTakeTest}
                    disabled={!!cooldownInfo}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                      cooldownInfo
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#335441] to-[#46704A] hover:shadow-lg"
                    } text-white`}
                  >
                    {cooldownInfo ? (
                      <>
                        <Clock className="w-5 h-5" />
                        {cooldownTime}
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        Take Test
                      </>
                    )}
                  </button>
                )}
              </div>

              {!course.enrollment_data?.isCompleted && (
                <div className="bg-[#F9F6EE] p-6 rounded-xl border-2 border-[#E4D7B4]">
                  <p className="text-[#6B8F60] text-center">
                    Complete all chapters to unlock the certification test
                  </p>
                </div>
              )}

              {tests.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-bold text-[#335441] mb-4">
                    Test History
                  </h3>
                  <div className="space-y-3">
                    {tests.map((test) => (
                      <div
                        key={test.id}
                        className="flex items-center justify-between p-4 bg-[#F9F6EE] rounded-xl border border-[#E4D7B4]"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              test.hasPassed
                                ? "bg-green-100"
                                : test.status === "completed"
                                ? "bg-red-100"
                                : "bg-yellow-100"
                            }`}
                          >
                            {test.hasPassed ? (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : test.status === "completed" ? (
                              <Circle className="w-6 h-6 text-red-600" />
                            ) : (
                              <FileText className="w-6 h-6 text-yellow-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-[#335441]">
                              {test.status === "in_progress"
                                ? "In Progress"
                                : test.hasPassed
                                ? "Passed"
                                : "Failed"}
                            </p>
                            <p className="text-sm text-[#6B8F60]">
                              {test.status === "completed"
                                ? `Score: ${test.score}% (${test.marksObtained}/${test.totalMarks})`
                                : "Not submitted yet"}
                            </p>
                            <p className="text-xs text-[#A9B782]">
                              {new Date(test.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {test.status === "in_progress" && (
                            <button
                              onClick={() =>
                                navigate(`/courses/${id}/test/${test.id}`)
                              }
                              className="px-4 py-2 bg-[#335441] text-white rounded-lg font-semibold hover:bg-[#46704A] transition-all"
                            >
                              Continue
                            </button>
                          )}
                          {test.status === "completed" && (
                            <button
                              onClick={() =>
                                navigate(
                                  `/courses/${id}/test/${test.id}/results`
                                )
                              }
                              className="px-4 py-2 bg-[#6B8F60] text-white rounded-lg font-semibold hover:bg-[#46704A] transition-all"
                            >
                              View Results
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
