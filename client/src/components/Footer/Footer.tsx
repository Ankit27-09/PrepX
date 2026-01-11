import React from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  BookOpen,
  MessageSquare,
  Upload,
  Mail,
  Heart,
  Zap,
  Shield,
  Users,
  Map,
} from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t-2 border-[#E4D7B4] mt-20">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <img src="/logo.png" alt="PrepX" className="w-25 h-25" />
              <span className="text-xl font-bold text-[#335441]">PrepX</span>
            </div>
            <p className="text-[#6B8F60] text-sm mb-6 leading-relaxed">
              Your all-in-one AI-powered learning platform. Master skills with
              3D avatar interviews, intelligent tutoring, personalized roadmaps,
              and comprehensive courses. Transform your career with cutting-edge
              AI technology.
            </p>
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 bg-[#46704A] rounded-full animate-pulse"></div>
              <span className="text-xs text-[#335441] font-semibold">
                SYSTEM ONLINE
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[#335441] font-bold mb-4 flex items-center">
              <Zap className="mr-2" size={16} />
              Quick Access
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/pdfs"
                  className="flex items-center text-[#6B8F60] hover:text-[#335441] transition-colors duration-300 text-sm"
                >
                  <FileText className="mr-2" size={14} />
                  Browse PDFs
                </Link>
              </li>
              <li>
                <Link
                  to="/ebooks"
                  className="flex items-center text-[#6B8F60] hover:text-[#335441] transition-colors duration-300 text-sm"
                >
                  <BookOpen className="mr-2" size={14} />
                  E-book Library
                </Link>
              </li>
              <li>
                <Link
                  to="/discussions"
                  className="flex items-center text-[#6B8F60] hover:text-[#335441] transition-colors duration-300 text-sm"
                >
                  <MessageSquare className="mr-2" size={14} />
                  Discussions
                </Link>
              </li>
              <li>
                <Link
                  to="/roadmaps"
                  className="flex items-center text-[#6B8F60] hover:text-[#335441] transition-colors duration-300 text-sm"
                >
                  <Map className="mr-2" size={14} />
                  Learning Roadmaps
                </Link>
              </li>
              <li>
                <Link
                  to="/upload"
                  className="flex items-center text-[#6B8F60] hover:text-[#335441] transition-colors duration-300 text-sm"
                >
                  <Upload className="mr-2" size={14} />
                  Upload Resource
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-[#335441] font-bold mb-4 flex items-center">
              <Users className="mr-2" size={16} />
              Community
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/discussions/new"
                  className="flex items-center text-[#6B8F60] hover:text-[#335441] transition-colors duration-300 text-sm"
                >
                  Ask Question
                </Link>
              </li>
              <li>
                <Link
                  to="/discussions?category=academic"
                  className="flex items-center text-[#6B8F60] hover:text-[#335441] transition-colors duration-300 text-sm"
                >
                  Academic Help
                </Link>
              </li>
              <li>
                <Link
                  to="/discussions?category=technical"
                  className="flex items-center text-[#6B8F60] hover:text-[#335441] transition-colors duration-300 text-sm"
                >
                  Technical Support
                </Link>
              </li>
              <li>
                <Link
                  to="/discussions?category=career"
                  className="flex items-center text-[#6B8F60] hover:text-[#335441] transition-colors duration-300 text-sm"
                >
                  Career Guidance
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Security */}
          <div>
            <h3 className="text-[#335441] font-bold mb-4 flex items-center">
              <Shield className="mr-2" size={16} />
              Security & Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:tarinagarwal@gmail.com"
                  className="flex items-center text-[#6B8F60] hover:text-[#335441] transition-colors duration-300 text-sm"
                >
                  <Mail className="mr-2" size={14} />
                  Contact Support
                </a>
              </li>

              <li>
                <span className="flex items-center text-[#6B8F60] text-sm">
                  <Shield className="mr-2" size={14} />
                  Secure & Private
                </span>
              </li>
              <li>
                <span className="flex items-center text-[#6B8F60] text-sm">
                  <Zap className="mr-2" size={14} />
                  Always Free
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gradient-to-br from-[#F9F6EE] to-[#EFE7D4] border-t-2 border-[#E4D7B4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-[#6B8F60] text-center sm:text-left">
              <span>© {currentYear} PrepX</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center">
                Made with{" "}
                <Heart
                  className="mx-1"
                  size={14}
                  fill="#46704A"
                  stroke="none"
                />{" "}
                for students
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
              <button className="text-[#6B8F60] hover:text-[#335441] transition-colors duration-300">
                Privacy Policy
              </button>
              <button className="text-[#6B8F60] hover:text-[#335441] transition-colors duration-300">
                Terms of Service
              </button>
              <div className="flex items-center space-x-2 text-[#335441]">
                <div className="w-2 h-2 bg-[#46704A] rounded-full animate-pulse"></div>
                <span className="font-semibold text-xs">SECURE CONNECTION</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute bottom-20 left-10 w-2 h-2 bg-[#A9B782] rounded-full animate-pulse opacity-30"></div>
      <div className="absolute bottom-32 right-20 w-1 h-1 bg-[#6B8F60] rounded-full animate-pulse opacity-40"></div>
      <div className="absolute bottom-16 right-32 w-3 h-3 bg-[#46704A] rounded-full animate-pulse opacity-20"></div>
    </footer>
  );
};

export default Footer;
