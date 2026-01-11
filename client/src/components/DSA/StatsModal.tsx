"use client";

import { X, TrendingUp, Target, Award } from "lucide-react";
import { Pie } from "react-chartjs-2";
import type { Problem } from "@/types";

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  view: "stats" | "distribution" | "frequency" | null;
  problems: Problem[];
  difficultyData: any;
  stats: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
    avgFrequency: number;
  };
}

export default function StatsModal({
  isOpen,
  onClose,
  view,
  problems,
  difficultyData,
  stats,
}: StatsModalProps) {
  if (!isOpen || !view) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-white to-[#F9F6EE] rounded-2xl max-w-2xl w-full shadow-2xl border-2 border-[#E4D7B4] animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#335441] to-[#46704A] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              {view === "stats" && (
                <TrendingUp className="w-5 h-5 text-white" />
              )}
              {view === "distribution" && (
                <Target className="w-5 h-5 text-white" />
              )}
              {view === "frequency" && <Award className="w-5 h-5 text-white" />}
            </div>
            <h2 className="text-xl font-bold text-white">
              {view === "stats" && "Problem Statistics"}
              {view === "distribution" && "Difficulty Distribution"}
              {view === "frequency" && "Frequency Analysis"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 group"
          >
            <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {view === "stats" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-[#F9F6EE] rounded-xl border-2 border-[#E4D7B4]">
                  <span className="text-sm text-[#6B8F60] font-medium">
                    Total Problems
                  </span>
                  <span className="text-3xl font-bold text-[#335441]">
                    {stats.total}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#F9F6EE] rounded-xl border-2 border-[#E4D7B4]">
                  <span className="text-sm text-[#6B8F60] font-medium">
                    Avg. Frequency
                  </span>
                  <span className="text-3xl font-bold text-[#335441]">
                    {stats.avgFrequency.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-4 bg-green-50 rounded-xl border-2 border-green-200">
                  <span className="text-4xl mb-2">🟢</span>
                  <span className="text-2xl font-bold text-green-800">
                    {stats.easy}
                  </span>
                  <span className="text-sm text-green-700 font-medium">
                    Easy
                  </span>
                </div>

                <div className="flex flex-col items-center p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                  <span className="text-4xl mb-2">🟡</span>
                  <span className="text-2xl font-bold text-yellow-800">
                    {stats.medium}
                  </span>
                  <span className="text-sm text-yellow-700 font-medium">
                    Medium
                  </span>
                </div>

                <div className="flex flex-col items-center p-4 bg-red-50 rounded-xl border-2 border-red-200">
                  <span className="text-4xl mb-2">🔴</span>
                  <span className="text-2xl font-bold text-red-800">
                    {stats.hard}
                  </span>
                  <span className="text-sm text-red-700 font-medium">Hard</span>
                </div>
              </div>
            </div>
          )}

          {view === "distribution" && (
            <div className="h-96">
              <Pie
                data={difficultyData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: {
                        padding: 20,
                        font: {
                          size: 14,
                          weight: 600,
                        },
                        color: "#335441",
                        usePointStyle: true,
                        pointStyle: "circle",
                      },
                    },
                    tooltip: {
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      titleColor: "#335441",
                      bodyColor: "#6B8F60",
                      borderColor: "#A9B782",
                      borderWidth: 2,
                      padding: 16,
                      borderRadius: 12,
                      usePointStyle: true,
                      bodyFont: {
                        size: 14,
                        weight: 600,
                      },
                      callbacks: {
                        label: function (context) {
                          const total = context.dataset.data.reduce(
                            (a: number, b: number) => a + b,
                            0
                          );
                          const percentage = (
                            (context.parsed / total) *
                            100
                          ).toFixed(1);
                          return `${context.label}: ${context.parsed} problems (${percentage}%)`;
                        },
                      },
                    },
                  },
                  cutout: "50%",
                  responsive: true,
                }}
              />
            </div>
          )}

          {view === "frequency" && (
            <div className="space-y-6">
              <div className="text-center p-8 bg-gradient-to-br from-[#335441] to-[#46704A] rounded-2xl text-white">
                <Award className="w-16 h-16 mx-auto mb-4 opacity-80" />
                <p className="text-6xl font-bold mb-2">
                  {stats.avgFrequency.toFixed(2)}%
                </p>
                <p className="text-lg text-[#E4D7B4]">Average Frequency</p>
                <p className="text-sm text-[#E4D7B4] mt-2">
                  Across all {stats.total} problems
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {problems
                  .slice(0, 3)
                  .sort((a, b) => b.frequency - a.frequency)
                  .map((problem, idx) => (
                    <div
                      key={problem.id}
                      className="text-center p-4 bg-[#F9F6EE] rounded-xl border-2 border-[#E4D7B4]"
                    >
                      <div className="text-2xl font-bold text-[#335441] mb-1">
                        #{idx + 1}
                      </div>
                      <div className="text-xs text-[#6B8F60] mb-2 truncate">
                        {problem.title}
                      </div>
                      <div className="text-lg font-bold text-[#46704A]">
                        {problem.frequency.toFixed(1)}%
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
