"use client";

import type React from "react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertCircle,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { backendUrl } from "@/config/backendUrl";

interface InterviewResult {
  technicalAssessment: {
    score: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    codeQuality?: {
      rating: string;
      comments: string[];
    };
  };
  projectDiscussion: {
    score: number;
    feedback: string;
    insights: string[];
    technicalDepth: string;
  };
  behavioralAssessment: {
    score: number;
    feedback: string;
    communicationSkills: string;
    problemSolving: string;
    teamwork: string;
  };
  malpracticeFlags: {
    timestamp: string;
    type: string;
    description: string;
  }[];
  overallScore: number;
  finalRecommendation: string;
}

// Custom components for markdown rendering
const MarkdownComponents = {
  h1: ({ node, ...props }: any) => (
    <h1
      className="text-3xl font-bold mt-8 mb-4 text-gray-800 border-b pb-2"
      {...props}
    />
  ),
  h2: ({ node, ...props }: any) => (
    <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-800" {...props} />
  ),
  h3: ({ node, ...props }: any) => (
    <h3 className="text-xl font-semibold mt-5 mb-2 text-gray-800" {...props} />
  ),
  h4: ({ node, ...props }: any) => (
    <h4 className="text-lg font-semibold mt-4 mb-2 text-gray-700" {...props} />
  ),
  h5: ({ node, ...props }: any) => (
    <h5
      className="text-base font-semibold mt-3 mb-1 text-gray-700"
      {...props}
    />
  ),
  h6: ({ node, ...props }: any) => (
    <h6 className="text-sm font-semibold mt-3 mb-1 text-gray-700" {...props} />
  ),
  p: ({ node, ...props }: any) => (
    <p className="my-4 text-gray-600 leading-relaxed" {...props} />
  ),
  ul: ({ node, ...props }: any) => (
    <ul className="my-4 pl-6 list-disc space-y-2" {...props} />
  ),
  ol: ({ node, ...props }: any) => (
    <ol className="my-4 pl-6 list-decimal space-y-2" {...props} />
  ),
  li: ({ node, ...props }: any) => <li className="text-gray-600" {...props} />,
  blockquote: ({ node, ...props }: any) => (
    <blockquote
      className="border-l-4 border-gray-300 pl-4 py-1 my-4 text-gray-600 italic"
      {...props}
    />
  ),
  a: ({ node, ...props }: any) => (
    <a className="text-primary hover:underline font-medium" {...props} />
  ),
  strong: ({ node, ...props }: any) => (
    <strong className="font-bold text-gray-800" {...props} />
  ),
  em: ({ node, ...props }: any) => (
    <em className="italic text-gray-700" {...props} />
  ),
  code: ({ node, inline, ...props }: any) =>
    inline ? (
      <code
        className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono"
        {...props}
      />
    ) : (
      <code
        className="block bg-gray-100 text-gray-800 p-4 rounded-md my-4 overflow-x-auto text-sm font-mono"
        {...props}
      />
    ),
  pre: ({ node, ...props }: any) => (
    <pre
      className="bg-gray-100 rounded-md p-4 my-4 overflow-x-auto"
      {...props}
    />
  ),
  hr: ({ node, ...props }: any) => (
    <hr className="my-8 border-gray-200" {...props} />
  ),
  table: ({ node, ...props }: any) => (
    <div className="overflow-x-auto my-6">
      <table
        className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg"
        {...props}
      />
    </div>
  ),
  thead: ({ node, ...props }: any) => (
    <thead className="bg-gray-50" {...props} />
  ),
  tbody: ({ node, ...props }: any) => (
    <tbody className="divide-y divide-gray-200" {...props} />
  ),
  tr: ({ node, ...props }: any) => (
    <tr className="hover:bg-gray-50" {...props} />
  ),
  th: ({ node, ...props }: any) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      {...props}
    />
  ),
  td: ({ node, ...props }: any) => (
    <td
      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
      {...props}
    />
  ),
  img: ({ node, ...props }: any) => (
    <img
      className="max-w-full h-auto rounded-lg my-4 mx-auto"
      {...props}
      alt={props.alt || ""}
    />
  ),
};

// Custom component for callouts/admonitions in markdown
const Callout = ({
  children,
  type = "info",
}: {
  children: React.ReactNode;
  type?: string;
}) => {
  const styles = {
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: <Info className="h-5 w-5 text-blue-500" />,
      text: "text-blue-800",
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      text: "text-green-800",
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
      text: "text-amber-800",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      text: "text-red-800",
    },
  };

  const style = styles[type as keyof typeof styles] || styles.info;

  return (
    <div
      className={`${style.bg} ${style.border} border-l-4 rounded-r-md p-4 my-4`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5 mr-3">{style.icon}</div>
        <div className={`${style.text} text-sm`}>{children}</div>
      </div>
    </div>
  );
};

const Results = () => {
  // Precise Analysis state
  //@ts-ignore
  const [result, setResult] = useState<InterviewResult>(null);
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const { interviewId } = useParams<{ interviewId: string }>();

  // Detailed Analysis state
  const [detailedText, setDetailedText] = useState<string>("");
  const [textError, setTextError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${backendUrl}/api/v1/interview/getinterviewresults/${interviewId}`
        );
        setResult(response.data.structured_response);
        setDetailedText(response.data.detailed_response);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setTextError("Failed to load detailed analysis.");
      }
    };

    fetchData();
  }, []);

  // Custom renderer for markdown that processes special syntax for callouts
  const renderMarkdown = (content: string) => {
    // Process custom callout syntax: :::type Content :::
    const processedContent = content.replace(
      /:::(info|success|warning|error)\s+([\s\S]+?):::/g,
      (_, type, content) => {
        return `<Callout type="${type}">${content.trim()}</Callout>`;
      }
    );

    return processedContent;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#F9F6EE] to-[#EFE7D4]">
        <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-2xl shadow-lg border-2 border-[#E4D7B4]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#335441]"></div>
          <p className="text-lg text-[#335441] font-medium">
            Loading your results...
          </p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#F9F6EE] to-[#EFE7D4]">
        <div className="w-full max-w-2xl mx-4">
          <div className="bg-white rounded-2xl border-2 border-[#E4D7B4] shadow-xl p-8">
            <div className="flex flex-col items-center">
              <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-[#335441] mb-2">
                Error Loading Results
              </h2>
              <p className="text-[#6B8F60]">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-600";
    if (score >= 60) return "from-yellow-500 to-amber-600";
    return "from-red-500 to-rose-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F6EE] to-[#EFE7D4] py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="precise" className="max-w-6xl mx-auto">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white border-2 border-[#E4D7B4] p-1 rounded-xl shadow-lg">
              <TabsTrigger
                value="precise"
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#335441] data-[state=active]:to-[#46704A] data-[state=active]:text-white rounded-lg px-6 py-2 font-semibold transition-all duration-300"
              >
                Precise Analysis
              </TabsTrigger>
              <TabsTrigger
                value="detailed"
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#335441] data-[state=active]:to-[#46704A] data-[state=active]:text-white rounded-lg px-6 py-2 font-semibold transition-all duration-300"
              >
                Detailed Analysis
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="precise">
            <div className="space-y-6">
              {/* Hero Score Card */}
              <div className="bg-gradient-to-br from-[#335441] to-[#46704A] rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

                <div className="relative z-10">
                  <h1 className="text-3xl font-bold mb-2">Interview Results</h1>
                  <p className="text-[#E4D7B4] mb-6">
                    Your comprehensive performance analysis
                  </p>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#E4D7B4] mb-2">
                        Overall Score
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-bold">
                          {result.overallScore}
                        </span>
                        <span className="text-3xl text-[#E4D7B4]">/ 100</span>
                      </div>
                    </div>

                    <div className="relative w-32 h-32">
                      <svg className="transform -rotate-90 w-32 h-32">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth="12"
                          fill="none"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="white"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 56}`}
                          strokeDashoffset={`${
                            2 * Math.PI * 56 * (1 - result.overallScore / 100)
                          }`}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <CheckCircle2 className="w-12 h-12" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                    <p className="text-white/90">
                      {result.finalRecommendation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Score Breakdown Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Technical Score */}
                <div
                  className={`bg-white rounded-2xl border-2 ${getScoreBg(
                    result.technicalAssessment.score
                  )} p-6 shadow-lg hover:shadow-xl transition-shadow duration-300`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#335441]">
                      Technical
                    </h3>
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${getScoreColor(
                        result.technicalAssessment.score
                      )} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
                    >
                      {result.technicalAssessment.score}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r ${getScoreColor(
                        result.technicalAssessment.score
                      )} transition-all duration-1000 ease-out`}
                      style={{ width: `${result.technicalAssessment.score}%` }}
                    ></div>
                  </div>
                </div>

                {/* Project Score */}
                <div
                  className={`bg-white rounded-2xl border-2 ${getScoreBg(
                    result.projectDiscussion.score
                  )} p-6 shadow-lg hover:shadow-xl transition-shadow duration-300`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#335441]">
                      Project
                    </h3>
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${getScoreColor(
                        result.projectDiscussion.score
                      )} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
                    >
                      {result.projectDiscussion.score}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r ${getScoreColor(
                        result.projectDiscussion.score
                      )} transition-all duration-1000 ease-out`}
                      style={{ width: `${result.projectDiscussion.score}%` }}
                    ></div>
                  </div>
                </div>

                {/* Behavioral Score */}
                <div
                  className={`bg-white rounded-2xl border-2 ${getScoreBg(
                    result.behavioralAssessment.score
                  )} p-6 shadow-lg hover:shadow-xl transition-shadow duration-300`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#335441]">
                      Behavioral
                    </h3>
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${getScoreColor(
                        result.behavioralAssessment.score
                      )} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
                    >
                      {result.behavioralAssessment.score}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r ${getScoreColor(
                        result.behavioralAssessment.score
                      )} transition-all duration-1000 ease-out`}
                      style={{ width: `${result.behavioralAssessment.score}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Technical Assessment */}
              <div className="bg-white rounded-2xl border-2 border-[#E4D7B4] shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-[#F9F6EE] to-[#EFE7D4] px-6 py-4 border-b-2 border-[#E4D7B4]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-[#335441]">
                      Technical Assessment
                    </h2>
                    <div
                      className={`px-4 py-2 rounded-xl bg-gradient-to-br ${getScoreColor(
                        result.technicalAssessment.score
                      )} text-white font-bold text-lg shadow-lg`}
                    >
                      {result.technicalAssessment.score}%
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <p className="text-[#6B8F60] text-lg leading-relaxed">
                    {result.technicalAssessment.feedback}
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-green-50 rounded-xl p-5 border-2 border-green-200">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                        <h4 className="font-bold text-green-800 text-lg">
                          Strengths
                        </h4>
                      </div>
                      <ul className="space-y-2">
                        {result.technicalAssessment.strengths.map((s, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-green-700"
                          >
                            <span className="text-green-500 mt-1">✓</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-5 border-2 border-amber-200">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                        <h4 className="font-bold text-amber-800 text-lg">
                          Areas for Improvement
                        </h4>
                      </div>
                      <ul className="space-y-2">
                        {result.technicalAssessment.weaknesses.map((w, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-amber-700"
                          >
                            <span className="text-amber-500 mt-1">→</span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Discussion */}
              <div className="bg-white rounded-2xl border-2 border-[#E4D7B4] shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-[#F9F6EE] to-[#EFE7D4] px-6 py-4 border-b-2 border-[#E4D7B4]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-[#335441]">
                      Project Discussion
                    </h2>
                    <div
                      className={`px-4 py-2 rounded-xl bg-gradient-to-br ${getScoreColor(
                        result.projectDiscussion.score
                      )} text-white font-bold text-lg shadow-lg`}
                    >
                      {result.projectDiscussion.score}%
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <p className="text-[#6B8F60] text-lg leading-relaxed">
                    {result.projectDiscussion.feedback}
                  </p>
                  <div className="bg-[#F9F6EE] rounded-xl p-5 border-2 border-[#E4D7B4]">
                    <h4 className="font-bold text-[#335441] text-lg mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      Key Insights
                    </h4>
                    <ul className="space-y-3">
                      {result.projectDiscussion.insights.map((insight, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-[#6B8F60]"
                        >
                          <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-[#335441] to-[#46704A] text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {i + 1}
                          </span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-[#335441] to-[#46704A] rounded-xl p-5 text-white">
                    <h4 className="font-bold text-lg mb-3">Technical Depth</h4>
                    <p className="text-[#E4D7B4] leading-relaxed">
                      {result.projectDiscussion.technicalDepth}
                    </p>
                  </div>
                </div>
              </div>

              {/* Behavioral Assessment */}
              <div className="bg-white rounded-2xl border-2 border-[#E4D7B4] shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-[#F9F6EE] to-[#EFE7D4] px-6 py-4 border-b-2 border-[#E4D7B4]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-[#335441]">
                      Behavioral Assessment
                    </h2>
                    <div
                      className={`px-4 py-2 rounded-xl bg-gradient-to-br ${getScoreColor(
                        result.behavioralAssessment.score
                      )} text-white font-bold text-lg shadow-lg`}
                    >
                      {result.behavioralAssessment.score}%
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <p className="text-[#6B8F60] text-lg leading-relaxed">
                    {result.behavioralAssessment.feedback}
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200">
                      <h4 className="font-bold text-blue-800 text-lg mb-3">
                        💬 Communication
                      </h4>
                      <p className="text-blue-700 leading-relaxed">
                        {result.behavioralAssessment.communicationSkills}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border-2 border-purple-200">
                      <h4 className="font-bold text-purple-800 text-lg mb-3">
                        🧩 Problem Solving
                      </h4>
                      <p className="text-purple-700 leading-relaxed">
                        {result.behavioralAssessment.problemSolving}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-5 border-2 border-pink-200">
                      <h4 className="font-bold text-pink-800 text-lg mb-3">
                        🤝 Teamwork
                      </h4>
                      <p className="text-pink-700 leading-relaxed">
                        {result.behavioralAssessment.teamwork}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Malpractice Flags */}
              {result.malpracticeFlags.length > 0 && (
                <div className="bg-white rounded-2xl border-2 border-red-200 shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-red-50 to-red-100 px-6 py-4 border-b-2 border-red-200">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                      <h2 className="text-2xl font-bold text-red-700">
                        Malpractice Flags
                      </h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {result.malpracticeFlags.map((flag, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-4 p-5 bg-red-50 rounded-xl border-2 border-red-200 hover:shadow-md transition-shadow duration-300"
                        >
                          <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                            <XCircle className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-red-800 text-lg mb-1">
                              {flag.type}
                            </p>
                            <p className="text-red-700 mb-2">
                              {flag.description}
                            </p>
                            <p className="text-xs text-red-600 font-medium">
                              {flag.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="detailed">
            {textError ? (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                  <p className="text-red-700 font-medium">
                    Error loading detailed analysis: {textError}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border-2 border-[#E4D7B4] shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-[#F9F6EE] to-[#EFE7D4] px-6 py-4 border-b-2 border-[#E4D7B4]">
                  <h2 className="text-2xl font-bold text-[#335441]">
                    Detailed Analysis
                  </h2>
                  <p className="text-[#6B8F60]">
                    Comprehensive breakdown of your interview performance
                  </p>
                </div>
                <div className="p-8 md:p-12 prose prose-lg max-w-none">
                  <ReactMarkdown
                    components={MarkdownComponents}
                    children={renderMarkdown(detailedText)}
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Results;
