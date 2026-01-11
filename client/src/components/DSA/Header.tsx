"use client";

import { useState, useEffect } from "react";
import { Code2, TrendingUp, Target, Sparkles } from "lucide-react";

interface HeaderProps {
  companyName?: string;
}

const Header = ({ companyName }: HeaderProps) => {
  const [logoUrl, setLogoUrl] = useState<string>("");

  useEffect(() => {
    if (companyName) {
      setLogoUrl(`https://logo.clearbit.com/${companyName}.com`);
    }
  }, [companyName]);

  return (
    <div className="text-center mb-12">
      {/* Hero Section */}
      <div className="relative mb-8">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 w-20 h-20 bg-[#A9B782] rounded-full opacity-10 animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-16 h-16 bg-[#46704A] rounded-full opacity-10 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border-2 border-[#E4D7B4] mb-6 shadow-md">
            <Sparkles className="w-4 h-4 text-[#335441]" />
            <span className="text-sm font-semibold text-[#335441]">
              Company-Specific DSA Practice
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-[#335441] via-[#46704A] to-[#6B8F60] bg-clip-text text-transparent leading-tight">
            Master Interview Questions
          </h1>

          <p className="text-[#6B8F60] text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Practice company-specific coding problems, track your progress, and
            ace your technical interviews with confidence
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
        <div className="bg-white rounded-xl p-4 border-2 border-[#E4D7B4] shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#335441] to-[#46704A] rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-[#335441]">1000+</p>
              <p className="text-xs text-[#6B8F60]">Problems</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-[#E4D7B4] shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#46704A] to-[#6B8F60] rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-[#335441]">50+</p>
              <p className="text-xs text-[#6B8F60]">Companies</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-[#E4D7B4] shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#6B8F60] to-[#A9B782] rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-[#335441]">Real</p>
              <p className="text-xs text-[#6B8F60]">Interview Qs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Company Card */}
      {companyName && (
        <div className="relative max-w-md mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-[#335441] to-[#46704A] rounded-2xl blur-xl opacity-20"></div>
          <div className="relative flex items-center justify-center gap-4 bg-gradient-to-br from-white to-[#F9F6EE] rounded-2xl p-6 shadow-xl border-2 border-[#E4D7B4]">
            {logoUrl && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#335441] to-[#46704A] rounded-full blur-md opacity-30"></div>
                <img
                  src={logoUrl}
                  alt={`${companyName} logo`}
                  className="relative h-16 w-16 md:h-20 md:w-20 rounded-full shadow-lg object-cover border-2 border-white"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
            <div className="text-left">
              <p className="text-sm text-[#6B8F60] font-medium mb-1">
                Now Practicing
              </p>
              <span className="text-2xl md:text-3xl font-bold text-[#335441]">
                {companyName.charAt(0).toUpperCase() + companyName.slice(1)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
