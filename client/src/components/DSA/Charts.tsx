"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import type { Problem } from "@/types";
import { TrendingUp, Target, Award } from "lucide-react";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

interface ChartsProps {
  problems: Problem[];
}

const Charts = ({ problems }: ChartsProps) => {
  const [difficultyData, setDifficultyData] = useState({
    labels: ["Easy", "Medium", "Hard"],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ["#A9B782", "#D1B377", "#C45B5B"],
        borderColor: ["#9A8B5F", "#B89C64", "#A84D4D"],
        borderWidth: 2,
      },
    ],
  });

  const [stats, setStats] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
    total: 0,
    avgFrequency: 0,
  });

  useEffect(() => {
    const difficultyCounts = {
      Easy: 0,
      Medium: 0,
      Hard: 0,
    };

    let totalFrequency = 0;

    problems.forEach((problem) => {
      difficultyCounts[problem.difficulty]++;
      totalFrequency += problem.frequency;
    });

    setDifficultyData((prev) => ({
      ...prev,
      datasets: [
        {
          ...prev.datasets[0],
          data: [
            difficultyCounts.Easy,
            difficultyCounts.Medium,
            difficultyCounts.Hard,
          ],
        },
      ],
    }));

    setStats({
      easy: difficultyCounts.Easy,
      medium: difficultyCounts.Medium,
      hard: difficultyCounts.Hard,
      total: problems.length,
      avgFrequency: problems.length > 0 ? totalFrequency / problems.length : 0,
    });
  }, [problems]);

  if (problems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="bg-gradient-to-br from-white to-[#F9F6EE] p-6 rounded-2xl shadow-xl border-2 border-[#E4D7B4]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#335441] to-[#46704A] rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-[#335441]">Statistics</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[#F9F6EE] rounded-lg border border-[#E4D7B4]">
            <span className="text-sm text-[#6B8F60] font-medium">
              Total Problems
            </span>
            <span className="text-xl font-bold text-[#335441]">
              {stats.total}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <span className="text-sm text-green-700 font-medium">🟢 Easy</span>
            <span className="text-xl font-bold text-green-800">
              {stats.easy}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <span className="text-sm text-yellow-700 font-medium">
              🟡 Medium
            </span>
            <span className="text-xl font-bold text-yellow-800">
              {stats.medium}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
            <span className="text-sm text-red-700 font-medium">🔴 Hard</span>
            <span className="text-xl font-bold text-red-800">{stats.hard}</span>
          </div>
        </div>
      </div>

      {/* Difficulty Distribution Chart */}
      <div className="bg-gradient-to-br from-white to-[#F9F6EE] p-6 rounded-2xl shadow-xl border-2 border-[#E4D7B4]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#46704A] to-[#6B8F60] rounded-xl flex items-center justify-center shadow-lg">
            <Target className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-[#335441]">Distribution</h3>
        </div>

        <div className="h-64">
          <Pie
            data={difficultyData}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "bottom",
                  labels: {
                    padding: 12,
                    font: {
                      size: 11,
                      weight: 500,
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
                  borderWidth: 1,
                  padding: 12,
                  borderRadius: 8,
                  usePointStyle: true,
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
                      return `${context.label}: ${context.parsed} (${percentage}%)`;
                    },
                  },
                },
              },
              cutout: "60%",
              responsive: true,
            }}
          />
        </div>
      </div>

      {/* Average Frequency */}
      <div className="bg-gradient-to-br from-[#335441] to-[#46704A] p-6 rounded-2xl shadow-xl text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Award className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold">Avg. Frequency</h3>
        </div>
        <p className="text-4xl font-bold">{stats.avgFrequency.toFixed(2)}%</p>
        <p className="text-sm text-[#E4D7B4] mt-2">Across all problems</p>
      </div>
    </div>
  );
};

export default Charts;
