"use client";

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store/store";
import { logout as logoutAction } from "@/store/auth/authSlice";
import {
  FileText,
  BookOpen,
  LogIn,
  LogOut,
  ChevronDown,
  Lock,
  MessageSquare,
  GraduationCap,
  Map,
  GitGraphIcon,
  Briefcase,
  User as UserIcon,
  Mic2,
  Code,
} from "lucide-react";
import AdminNavLink from "../admin/AdminNavLink";

export default function ResponsiveNavbar() {
  const location = useLocation();
  const dispatch = useDispatch();

  // Get auth state from Redux store
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const user = useSelector((state: RootState) => state.auth.user);
  const loading = useSelector((state: RootState) => state.auth.loading);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [aiToolsOpen, setAiToolsOpen] = useState(false);
  const resourcesRef = useRef<HTMLDivElement | null>(null);
  const aiToolsRef = useRef<HTMLDivElement | null>(null);
  const resourcesCloseTimer = useRef<number | null>(null);
  const aiToolsCloseTimer = useRef<number | null>(null);

  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  const [mobileAiToolsOpen, setMobileAiToolsOpen] = useState(false);

  // profile state preserved
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileDropdownOpen(false);
      }
      if (resourcesRef.current && !resourcesRef.current.contains(target)) {
        setResourcesOpen(false);
      }
      if (aiToolsRef.current && !aiToolsRef.current.contains(target)) {
        setAiToolsOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setResourcesOpen(false);
        setAiToolsOpen(false);
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    try {
      dispatch(logoutAction());
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      dispatch(logoutAction());
      window.location.href = "/";
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const openWithClear = (which: "resources" | "ai") => {
    if (which === "resources") {
      if (resourcesCloseTimer.current)
        window.clearTimeout(resourcesCloseTimer.current);
      setResourcesOpen(true);
    } else {
      if (aiToolsCloseTimer.current)
        window.clearTimeout(aiToolsCloseTimer.current);
      setAiToolsOpen(true);
    }
  };
  const closeWithDelay = (which: "resources" | "ai") => {
    const delay = 120;
    if (which === "resources") {
      if (resourcesCloseTimer.current)
        window.clearTimeout(resourcesCloseTimer.current);
      resourcesCloseTimer.current = window.setTimeout(
        () => setResourcesOpen(false),
        delay
      );
    } else {
      if (aiToolsCloseTimer.current)
        window.clearTimeout(aiToolsCloseTimer.current);
      aiToolsCloseTimer.current = window.setTimeout(
        () => setAiToolsOpen(false),
        delay
      );
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <nav className="bg-white/95 border-b-2 border-[#E4D7B4] sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="PrepX" className="w-25 h-25 " />
              <span className="text-xl font-bold text-[#335441]">PrepX</span>
            </Link>
            <div className="w-6 h-6 border-2 border-[#46704A] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white/95 border-b-2 border-[#E4D7B4] sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="PrepX" className="w-25 h-25 " />
            <span className="text-xl font-bold text-[#335441]">PrepX</span>
          </Link>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <button
              aria-label="Open menu"
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-[#6B8F60] hover:text-[#335441] p-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            <div
              className="relative"
              ref={resourcesRef}
              onMouseEnter={() => openWithClear("resources")}
              onMouseLeave={() => closeWithDelay("resources")}
            >
              <button
                onClick={() => setResourcesOpen((v) => !v)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                  resourcesOpen ||
                  isActive("/pdfs") ||
                  isActive("/ebooks") ||
                  isActive("/interview-resources") ||
                  isActive("/interview-questions")
                    ? "text-[#335441] font-semibold"
                    : "text-[#6B8F60] hover:text-[#335441]"
                }`}
                aria-expanded={resourcesOpen}
                aria-haspopup="menu"
              >
                <span>Resources</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    resourcesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {resourcesOpen && (
                <div
                  className="absolute left-0 mt-2 w-48 bg-white border-2 border-[#E4D7B4] rounded-lg shadow-lg z-50"
                  role="menu"
                >
                  {/* <Link
                    to="/pdfs"
                    onClick={() => setResourcesOpen(false)}
                    className={`block px-4 py-2 text-sm rounded-t-lg transition-colors duration-200 ${
                      isActive("/pdfs")
                        ? "text-[#335441] font-semibold bg-[#F9F6EE]"
                        : "text-[#6B8F60] hover:text-[#335441] hover:bg-[#F9F6EE]"
                    }`}
                    role="menuitem"
                  >
                    PDFs
                  </Link>
                  <Link
                    to="/ebooks"
                    onClick={() => setResourcesOpen(false)}
                    className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                      isActive("/ebooks")
                        ? "text-[#335441] font-semibold bg-[#F9F6EE]"
                        : "text-[#6B8F60] hover:text-[#335441] hover:bg-[#F9F6EE]"
                    }`}
                    role="menuitem"
                  >
                    E-books
                  </Link> */}
                  <Link
                    to="/interview-resources"
                    onClick={() => setResourcesOpen(false)}
                    className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                      isActive("/interview-resources")
                        ? "text-[#335441] font-semibold bg-[#F9F6EE]"
                        : "text-[#6B8F60] hover:text-[#335441] hover:bg-[#F9F6EE]"
                    }`}
                    role="menuitem"
                  >
                    Interview Resources
                  </Link>
                  <Link
                    to="/interview-questions"
                    onClick={() => setResourcesOpen(false)}
                    className={`block px-4 py-2 text-sm rounded-b-lg transition-colors duration-200 ${
                      isActive("/interview-questions")
                        ? "text-[#335441] font-semibold bg-[#F9F6EE]"
                        : "text-[#6B8F60] hover:text-[#335441] hover:bg-[#F9F6EE]"
                    }`}
                    role="menuitem"
                  >
                    DSA Questions
                  </Link>
                </div>
              )}
            </div>

            {/* Keep Discussions as a normal nav link */}
            {/* <Link
              to="/discussions"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                isActive("/discussions")
                  ? "text-[#335441] font-semibold"
                  : "text-[#6B8F60] hover:text-[#335441]"
              }`}
            >
              <span>Discussions</span>
            </Link> */}

            <div
              className="relative"
              ref={aiToolsRef}
              onMouseEnter={() => openWithClear("ai")}
              onMouseLeave={() => closeWithDelay("ai")}
            >
              <button
                onClick={() => setAiToolsOpen((v) => !v)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                  aiToolsOpen ||
                  isActive("/courses") ||
                  isActive("/roadmaps") ||
                  isActive("/pdf-chat") ||
                  isActive("/podcasts")
                    ? "text-[#335441] font-semibold"
                    : "text-[#6B8F60] hover:text-[#335441]"
                }`}
                aria-expanded={aiToolsOpen}
                aria-haspopup="menu"
              >
                <span>AI Tools</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    aiToolsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {aiToolsOpen && (
                <div
                  className="absolute left-0 mt-2 w-48 bg-white border-2 border-[#E4D7B4] rounded-lg shadow-lg z-50"
                  role="menu"
                >
                  <Link
                    to="/courses"
                    onClick={() => setAiToolsOpen(false)}
                    className={`block px-4 py-2 text-sm rounded-t-lg transition-colors duration-200 ${
                      isActive("/courses")
                        ? "text-[#335441] font-semibold bg-[#F9F6EE]"
                        : "text-[#6B8F60] hover:text-[#335441] hover:bg-[#F9F6EE]"
                    }`}
                    role="menuitem"
                  >
                    Courses
                  </Link>
                  {/* <Link
                    to="/roadmaps"
                    onClick={() => setAiToolsOpen(false)}
                    className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                      isActive("/roadmaps")
                        ? "text-[#335441] font-semibold bg-[#F9F6EE]"
                        : "text-[#6B8F60] hover:text-[#335441] hover:bg-[#F9F6EE]"
                    }`}
                    role="menuitem"
                  >
                    Roadmaps
                  </Link> */}
                  <Link
                    to="/pdf-chat"
                    onClick={() => setAiToolsOpen(false)}
                    className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                      isActive("/pdf-chat")
                        ? "text-[#335441] font-semibold bg-[#F9F6EE]"
                        : "text-[#6B8F60] hover:text-[#335441] hover:bg-[#F9F6EE]"
                    }`}
                    role="menuitem"
                  >
                    PDF Chatbot
                  </Link>
                  <Link
                    to="/podcasts"
                    onClick={() => setAiToolsOpen(false)}
                    className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                      isActive("/podcasts")
                        ? "text-[#335441] font-semibold bg-[#F9F6EE]"
                        : "text-[#6B8F60] hover:text-[#335441] hover:bg-[#F9F6EE]"
                    }`}
                    role="menuitem"
                  >
                    AI Podcast Studio
                  </Link>
                  <Link
                    to="/"
                    onClick={() => setAiToolsOpen(false)}
                    className={`block px-4 py-2 text-sm rounded-b-lg transition-colors duration-200 ${
                      isActive("/voxboard")
                        ? "text-[#335441] font-semibold bg-[#F9F6EE]"
                        : "text-[#6B8F60] hover:text-[#335441] hover:bg-[#F9F6EE]"
                    }`}
                    role="menuitem"
                  >
                    VoxBoard
                  </Link>
                  <Link
                    to="/interview"
                    onClick={() => setAiToolsOpen(false)}
                    className={`block px-4 py-2 text-sm rounded-b-lg transition-colors duration-200 ${
                      isActive("/interview")
                        ? "text-[#335441] font-semibold bg-[#F9F6EE]"
                        : "text-[#6B8F60] hover:text-[#335441] hover:bg-[#F9F6EE]"
                    }`}
                    role="menuitem"
                  >
                    Create Interview
                  </Link>
                  <Link
                    to="/your-interviews"
                    onClick={() => setAiToolsOpen(false)}
                    className={`block px-4 py-2 text-sm rounded-b-lg transition-colors duration-200 ${
                      isActive("/your-interviews")
                        ? "text-[#335441] font-semibold bg-[#F9F6EE]"
                        : "text-[#6B8F60] hover:text-[#335441] hover:bg-[#F9F6EE]"
                    }`}
                    role="menuitem"
                  >
                    Your Interviews
                  </Link>
                </div>
              )}
            </div>

            {/* Auth area */}
            {isLoggedIn ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen((v) => !v)}
                  className="flex items-center space-x-2 text-[#6B8F60] hover:text-[#335441] px-3 py-2 rounded-lg transition-all duration-300"
                >
                  <div className="w-8 h-8 border-2 border-[#E4D7B4] rounded-full flex items-center justify-center">
                    <img
                      className="text-royal-black"
                      src={`https://robohash.org/${user?.username}.png`}
                      alt={
                        user?.username
                          ? user.username.charAt(0).toUpperCase()
                          : "U"
                      }
                    />
                  </div>
                  <span className="hidden sm:block">
                    {user?.username || "User"}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      isProfileDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-[#E4D7B4] rounded-lg shadow-lg z-50">
                    <div className="px-4 py-3 border-b-2 border-[#E4D7B4]">
                      <p className="text-sm font-medium text-[#335441]">
                        {user?.username}
                      </p>
                      <p className="text-xs text-[#6B8F60]">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <AdminNavLink
                        authenticated={isLoggedIn}
                        onMobileMenuClose={() =>
                          setIsProfileDropdownOpen(false)
                        }
                        isDropdown={true}
                      />
                      <Link
                        to="/change-username"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-[#6B8F60] hover:bg-[#F9F6EE] hover:text-[#335441] transition-colors duration-200"
                      >
                        <svg
                          className="mr-3"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        Change Username
                      </Link>
                      <Link
                        to="/forgot-password"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-[#6B8F60] hover:bg-[#F9F6EE] hover:text-[#335441] transition-colors duration-200"
                      >
                        <Lock size={16} className="mr-3" />
                        Change Password
                      </Link>
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-[#6B8F60] hover:bg-[#F9F6EE] hover:text-red-500 transition-colors duration-200"
                      >
                        <LogOut size={16} className="mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/Login"
                className={`flex items-center border-2 border-[#335441] space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive("/Login")
                    ? "bg-[#335441] text-white"
                    : "text-[#335441] hover:bg-[#335441] hover:text-white"
                }`}
              >
                <LogIn size={20} />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-55 bg-black/50 transition-opacity duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden={!isMobileMenuOpen}
      />

      {/* Side Sheet */}
      <div
        className={`fixed top-0 left-0 h-screen w-80 max-w-[85vw] bg-white border-r-2 border-[#E4D7B4] shadow-2xl transform transition-transform duration-300 ease-in-out z-60 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Menu"
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b-2 border-[#E4D7B4] bg-white">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center space-x-2"
          >
            <img src="/logo.png" alt="PrepX" className="w-25 h-25" />
            <span className="text-xl font-bold text-[#335441]">PrepX</span>
          </Link>
          <button
            aria-label="Close menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-[#6B8F60] hover:text-[#335441] p-2 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="h-[calc(100vh-4rem)] overflow-y-auto px-2 pt-4 pb-6 space-y-2">
          {/* Resources (collapsible) */}
          <button
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[#6B8F60] hover:text-[#335441] transition-all duration-300"
            onClick={() => setMobileResourcesOpen((v) => !v)}
            aria-expanded={mobileResourcesOpen}
          >
            <span className="flex items-center gap-2">
              <FileText size={20} />
              <span>Resources</span>
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                mobileResourcesOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {mobileResourcesOpen && (
            <div className="ml-8 space-y-1">
              <Link
                to="/pdfs"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isActive("/pdfs")
                    ? "text-[#335441] font-semibold bg-[#F9F6EE]"
                    : "text-[#6B8F60] hover:text-[#335441] hover:bg-[#F9F6EE]"
                }`}
              >
                <FileText size={20} />
                <span>PDFs</span>
              </Link>
              <Link
                to="/ebooks"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isActive("/ebooks")
                    ? "text-[#335441] font-semibold bg-[#F9F6EE]"
                    : "text-[#6B8F60] hover:text-[#335441] hover:bg-[#F9F6EE]"
                }`}
              >
                <BookOpen size={20} />
                <span>E-books</span>
              </Link>
              <Link
                to="/interview-resources"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isActive("/interview-resources")
                    ? "text-[#335441] font-semibold bg-[#F9F6EE]"
                    : "text-[#6B8F60] hover:text-[#335441] hover:bg-[#F9F6EE]"
                }`}
              >
                <Briefcase size={20} />
                <span>Interview Resources</span>
              </Link>
              <Link
                to="/interview-questions"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isActive("/interview-questions")
                    ? "text-[#335441] font-semibold bg-[#F9F6EE]"
                    : "text-[#6B8F60] hover:text-[#335441] hover:bg-[#F9F6EE]"
                }`}
              >
                <Code size={20} />
                <span>DSA Questions</span>
              </Link>
            </div>
          )}

          {/* Discussions (standalone) */}
          <Link
            to="/discussions"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
              isActive("/discussions")
                ? "text-[#335441] font-semibold bg-[#F9F6EE]"
                : "text-[#6B8F60] hover:text-[#335441] hover:bg-[#F9F6EE]"
            }`}
          >
            <MessageSquare size={20} />
            <span>Discussions</span>
          </Link>

          {/* AI Tools (collapsible) */}
          <button
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[#6B8F60] hover:text-[#335441] transition-all duration-300"
            onClick={() => setMobileAiToolsOpen((v) => !v)}
            aria-expanded={mobileAiToolsOpen}
          >
            <span className="flex items-center gap-2">
              <GraduationCap size={20} />
              <span>AI Tools</span>
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                mobileAiToolsOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {mobileAiToolsOpen && (
            <div className="ml-8 space-y-1">
              <Link
                to="/courses"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isActive("/courses")
                    ? "text-[#335441] font-semibold bg-[#F9F6EE]"
                    : "text-[#6B8F60] hover:text-[#335441] hover:bg-[#F9F6EE]"
                }`}
              >
                <GraduationCap size={20} />
                <span>Courses</span>
              </Link>
              <Link
                to="/roadmaps"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isActive("/roadmaps")
                    ? "text-[#335441] font-semibold bg-[#F9F6EE]"
                    : "text-[#6B8F60] hover:text-[#335441] hover:bg-[#F9F6EE]"
                }`}
              >
                <Map size={20} />
                <span>Roadmaps</span>
              </Link>
              <Link
                to="/pdf-chat"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isActive("/pdf-chat")
                    ? "text-[#335441] font-semibold bg-[#F9F6EE]"
                    : "text-[#6B8F60] hover:text-[#335441] hover:bg-[#F9F6EE]"
                }`}
              >
                <MessageSquare size={20} />
                <span>PDF Chatbot</span>
              </Link>
              <Link
                to="/podcasts"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isActive("/podcasts")
                    ? "text-[#335441] font-semibold bg-[#F9F6EE]"
                    : "text-[#6B8F60] hover:text-[#335441] hover:bg-[#F9F6EE]"
                }`}
              >
                <Mic2 size={20} />
                <span>AI Podcast Studio</span>
              </Link>
              <Link
                to="/"
                target="_blank"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isActive("/voxboard")
                    ? "text-[#335441] font-semibold bg-[#F9F6EE]"
                    : "text-[#6B8F60] hover:text-[#335441] hover:bg-[#F9F6EE]"
                }`}
              >
                <GitGraphIcon size={20} />
                <span>VoxBoard</span>
              </Link>
            </div>
          )}

          {/* Auth */}
          {isLoggedIn ? (
            <div className="border-t-2 border-[#E4D7B4] pt-2 mt-2">
              <div className="px-3 py-2">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 border-2 border-[#E4D7B4] rounded-full flex items-center justify-center">
                    <img
                      src={`https://robohash.org/${user?.username}.png`}
                      alt={
                        user?.username
                          ? user.username.charAt(0).toUpperCase()
                          : "U"
                      }
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#335441]">
                      {user?.username}
                    </p>
                    <p className="text-xs text-[#6B8F60]">{user?.email}</p>
                  </div>
                </div>
              </div>
              <AdminNavLink
                authenticated={isLoggedIn}
                onMobileMenuClose={() => setIsMobileMenuOpen(false)}
                isMobile={true}
              />
              <Link
                to="/change-username"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 text-[#6B8F60] hover:text-[#335441] transition-colors duration-300"
              >
                <UserIcon size={20} />
                <span>Change Username</span>
              </Link>
              <Link
                to="/forgot-password"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 text-[#6B8F60] hover:text-[#335441] transition-colors duration-300"
              >
                <Lock size={20} />
                <span>Change Password</span>
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center space-x-2 text-[#6B8F60] hover:text-red-500 px-3 py-2 rounded-lg transition-all duration-300 w-full text-left"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/Login"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                isActive("/Login")
                  ? "text-[#335441] font-semibold bg-[#F9F6EE]"
                  : "text-[#6B8F60] hover:text-[#335441] hover:bg-[#F9F6EE]"
              }`}
            >
              <LogIn size={20} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
