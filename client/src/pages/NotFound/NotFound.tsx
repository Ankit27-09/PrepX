import { Link } from "react-router-dom";
import { Home, Search, ArrowLeft, AlertCircle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F6EE] to-[#EFE7D4] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <h1 className="text-[180px] sm:text-[240px] font-bold text-[#335441] opacity-10 leading-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <AlertCircle className="w-24 h-24 text-[#335441] animate-pulse" />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-4xl sm:text-5xl font-bold text-[#335441] mb-4">
          Page Not Found
        </h2>
        <p className="text-xl text-[#6B8F60] mb-8 leading-relaxed">
          Oops! The page you're looking for seems to have wandered off. Let's
          get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            to="/"
            className="group px-8 py-4 bg-[#335441] text-white rounded-lg font-semibold shadow-lg hover:bg-[#46704A] transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-3 h-3 bg-[#A9B782] rounded-full animate-pulse opacity-40"></div>
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-[#6B8F60] rounded-full animate-pulse opacity-50"></div>
        <div className="absolute top-40 right-20 w-4 h-4 bg-[#46704A] rounded-full animate-pulse opacity-30"></div>
      </div>
    </div>
  );
};

export default NotFound;
