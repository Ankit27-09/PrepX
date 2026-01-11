import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import {type RootState } from "../../store/store";
import { backendUrl } from "../../config/backendUrl";
import {
  GraduationCap,
  Search,
  Filter,
  Plus,
  BookOpen,
  Users,
  Bookmark,
  TrendingUp,
  ChevronDown,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  topic: string;
  views: number;
  chapter_count: number;
  bookmark_count: number;
  enrollment_count: number;
  is_bookmarked: boolean;
  is_enrolled: boolean;
  createdAt: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchCourses();
  }, [filter, sort]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".custom-dropdown")) {
        setFilterOpen(false);
        setSortOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const response = await axios.get(
        `${backendUrl}/api/v1/courses?filter=${filter}&sort=${sort}&search=${search}`,
        config
      );
      setCourses(response.data.courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  return (
    <div className="min-h-screen bg-[#F9F6EE] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 sm:mb-12">
          <div className="w-full sm:w-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-[#A9B782]/30 mb-4 shadow-sm">
              <GraduationCap className="w-4 h-4 text-[#335441]" />
              <span className="text-sm font-medium text-[#335441]">
                AI-Generated Courses
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#335441] mb-2">
              Explore Courses
            </h1>
            <p className="text-base sm:text-lg text-[#6B8F60]">
              Learn from AI-powered comprehensive courses
            </p>
          </div>
          {isLoggedIn && (
            <Link
              to="/courses/create"
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#335441] to-[#46704A] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Course
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border-2 border-[#E4D7B4]">
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B8F60]" />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-[#E4D7B4] rounded-xl focus:border-[#335441] focus:outline-none transition-colors text-[#335441] placeholder-[#A9B782]"
              />
            </div>
            <div className="flex gap-3 sm:gap-4">
              {/* Custom Filter Dropdown */}
              <div className="relative flex-1 sm:flex-none custom-dropdown">
                <button
                  type="button"
                  onClick={() => {
                    setFilterOpen(!filterOpen);
                    setSortOpen(false);
                  }}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#E4D7B4] rounded-xl focus:border-[#335441] focus:outline-none transition-all text-[#335441] bg-white hover:bg-[#F9F6EE] flex items-center justify-between gap-2"
                >
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B8F60]" />
                  <span className="truncate">
                    {filter === "all"
                      ? "All Courses"
                      : filter === "my-courses"
                      ? "My Courses"
                      : filter === "enrolled"
                      ? "Enrolled"
                      : "Bookmarked"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#6B8F60] transition-transform ${
                      filterOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {filterOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#E4D7B4] rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                    <button
                      type="button"
                      onClick={() => {
                        setFilter("all");
                        setFilterOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-[#F9F6EE] transition-colors ${
                        filter === "all"
                          ? "bg-gradient-to-r from-[#335441] to-[#46704A] text-white"
                          : "text-[#335441]"
                      }`}
                    >
                      All Courses
                    </button>
                    {isLoggedIn && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setFilter("my-courses");
                            setFilterOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-[#F9F6EE] transition-colors ${
                            filter === "my-courses"
                              ? "bg-gradient-to-r from-[#335441] to-[#46704A] text-white"
                              : "text-[#335441]"
                          }`}
                        >
                          My Courses
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFilter("enrolled");
                            setFilterOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-[#F9F6EE] transition-colors ${
                            filter === "enrolled"
                              ? "bg-gradient-to-r from-[#335441] to-[#46704A] text-white"
                              : "text-[#335441]"
                          }`}
                        >
                          Enrolled
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFilter("bookmarked");
                            setFilterOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-[#F9F6EE] transition-colors ${
                            filter === "bookmarked"
                              ? "bg-gradient-to-r from-[#335441] to-[#46704A] text-white"
                              : "text-[#335441]"
                          }`}
                        >
                          Bookmarked
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Custom Sort Dropdown */}
              <div className="relative flex-1 sm:flex-none custom-dropdown">
                <button
                  type="button"
                  onClick={() => {
                    setSortOpen(!sortOpen);
                    setFilterOpen(false);
                  }}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#E4D7B4] rounded-xl focus:border-[#335441] focus:outline-none transition-all text-[#335441] bg-white hover:bg-[#F9F6EE] flex items-center justify-between gap-2"
                >
                  <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B8F60]" />
                  <span className="truncate">
                    {sort === "recent"
                      ? "Recent"
                      : sort === "popular"
                      ? "Popular"
                      : "Oldest"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#6B8F60] transition-transform ${
                      sortOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {sortOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#E4D7B4] rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                    <button
                      type="button"
                      onClick={() => {
                        setSort("recent");
                        setSortOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-[#F9F6EE] transition-colors ${
                        sort === "recent"
                          ? "bg-gradient-to-r from-[#335441] to-[#46704A] text-white"
                          : "text-[#335441]"
                      }`}
                    >
                      Recent
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSort("popular");
                        setSortOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-[#F9F6EE] transition-colors ${
                        sort === "popular"
                          ? "bg-gradient-to-r from-[#335441] to-[#46704A] text-white"
                          : "text-[#335441]"
                      }`}
                    >
                      Popular
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSort("oldest");
                        setSortOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-[#F9F6EE] transition-colors ${
                        sort === "oldest"
                          ? "bg-gradient-to-r from-[#335441] to-[#46704A] text-white"
                          : "text-[#335441]"
                      }`}
                    >
                      Oldest
                    </button>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-[#335441] to-[#46704A] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </form>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-4 border-[#335441] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-[#E4D7B4]">
            <GraduationCap className="w-16 h-16 text-[#A9B782] mx-auto mb-4" />
            <p className="text-[#6B8F60] text-lg mb-4">No courses found</p>
            {isLoggedIn && (
              <Link
                to="/courses/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#335441] to-[#46704A] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Create Your First Course
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {courses.map((course, index) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-[#E4D7B4] hover:border-[#335441] hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-[#335441] to-[#46704A] text-white text-xs sm:text-sm rounded-full font-medium">
                      {course.topic}
                    </span>
                    {course.is_enrolled && (
                      <span className="px-3 py-1 bg-[#A9B782] text-white text-xs sm:text-sm rounded-full font-medium flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        Enrolled
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#335441] mb-3 group-hover:text-[#46704A] transition-colors line-clamp-2 min-h-[3.5rem]">
                    {course.title}
                  </h3>
                  <p className="text-[#6B8F60] mb-4 line-clamp-3 text-sm leading-relaxed min-h-[4rem]">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-[#6B8F60] pt-4 border-t border-[#E4D7B4]">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4 flex-shrink-0" />
                      <span>{course.chapter_count} chapters</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 flex-shrink-0" />
                        <span>{course.enrollment_count}</span>
                      </div>
                      {course.is_bookmarked && (
                        <Bookmark className="w-4 h-4 fill-[#335441] text-[#335441] flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
