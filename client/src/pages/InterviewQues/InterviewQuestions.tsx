"use client";

import { useState, useEffect } from "react";
import type { CompanyData, Problem } from "@/types";
import Header from "@/components/DSA/Header";
import Filters from "@/components/DSA/Filters";
import ProblemTable from "@/components/DSA/ProblemTable";
import StatsModal from "@/components/DSA/StatsModal";
import { Dock, DockIcon } from "@/components/ui/dock";
import { TrendingUp, Target, Award } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const InterviewQues = () => {
  const [companyData, setCompanyData] = useState<CompanyData>({});
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("");
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [selectedSort, setSelectedSort] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modalView, setModalView] = useState<
    "stats" | "distribution" | "frequency" | null
  >(null);
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
    const fetchCompanyData = async () => {
      try {
        const response = await fetch("/company_data.json");
        if (!response.ok) {
          throw new Error("Failed to load company data");
        }
        const data = await response.json();
        setCompanyData(data);
        setError(null);
      } catch (error) {
        console.error("Error loading company data:", error);
        setError("Failed to load company data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

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

  useEffect(() => {
    const fetchProblems = async () => {
      if (!selectedCompany && initialLoad) {
        setLoadingQuestions(true);
        setError(null);
        setProblems([]);
        setLoadingQuestions(false);
        setInitialLoad(false);
      } else if (
        selectedCompany &&
        !selectedDuration &&
        companyData[selectedCompany] &&
        companyData[selectedCompany].length > 0
      ) {
        const allTimeOption = companyData[selectedCompany].find(
          (duration) =>
            duration.includes("all_time") || duration.includes("overall")
        );
        const defaultDuration =
          allTimeOption || companyData[selectedCompany][0];
        setSelectedDuration(defaultDuration);
      } else if (selectedCompany && selectedDuration) {
        setLoadingQuestions(true);
        setError(null);
        try {
          const response = await fetch(
            `/data/LeetCode-Questions-CompanyWise/${selectedCompany}_${selectedDuration}.csv`
          );
          if (!response.ok) {
            throw new Error("Failed to load questions");
          }
          const csvText = await response.text();
          const parsedProblems = parseCSV(csvText);
          setProblems(parsedProblems);
        } catch (error) {
          console.error("Failed to load problems:", error);
          setError("Failed to load questions. Please try again later.");
          setProblems([]);
        } finally {
          setLoadingQuestions(false);
        }
      } else if (!selectedCompany) {
        setProblems([]);
      }
    };

    fetchProblems();
  }, [selectedCompany, selectedDuration, companyData, initialLoad]);

  const parseCSV = (csvText: string): Problem[] => {
    const rows = csvText.split("\n").filter((row) => row.trim());
    return rows.slice(1).map((row) => {
      const values = row.split(",").map((value) => value.trim());
      return {
        id: values[0],
        title: values[1],
        difficulty: values[3] as "Easy" | "Medium" | "Hard",
        frequency: Number.parseFloat(values[4]),
        link: values[5].trim(),
        attempted: false,
        dateSolved: "",
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#F9F6EE] to-[#EFE7D4]">
        <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-2xl shadow-lg border-2 border-[#E4D7B4]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#335441]"></div>
          <p className="text-lg text-[#335441] font-medium">
            Loading company data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F6EE] to-[#EFE7D4]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header companyName={selectedCompany} />
        <Filters
          companyData={companyData}
          selectedCompany={selectedCompany}
          setSelectedCompany={(company) => {
            setSelectedCompany(company);
            if (
              company &&
              companyData[company] &&
              companyData[company].length > 0
            ) {
              const allTimeOption = companyData[company].find(
                (duration) =>
                  duration.includes("all_time") ||
                  duration.includes("overall") ||
                  duration.includes("6months") ||
                  duration.includes("1year")
              );
              const defaultDuration = allTimeOption || companyData[company][0];
              setSelectedDuration(defaultDuration);
            } else if (!company) {
              setSelectedDuration("");
            }
          }}
          selectedDuration={selectedDuration}
          setSelectedDuration={setSelectedDuration}
          selectedSort={selectedSort}
          setSelectedSort={setSelectedSort}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          isLoading={loadingQuestions}
        />
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-xl mb-6 shadow-sm">
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}
        {loadingQuestions ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border-2 border-[#E4D7B4]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#335441]"></div>
              <p className="text-lg text-[#335441] font-medium">
                Loading questions...
              </p>
              <p className="text-sm text-[#6B8F60]">
                Fetching problems for {selectedCompany} (
                {selectedDuration.replace("_", " ")})
              </p>
            </div>
          </div>
        ) : (
          <>
            <ProblemTable
              problems={problems}
              selectedSort={selectedSort}
              selectedDifficulty={selectedDifficulty}
            />

            {/* Floating Dock */}
            {problems.length > 0 && (
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
                <TooltipProvider>
                  <Dock
                    iconSize={48}
                    iconMagnification={64}
                    iconDistance={150}
                    direction="middle"
                  >
                    <DockIcon>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setModalView("stats")}
                            className="size-12 rounded-full bg-gradient-to-br from-[#335441] to-[#46704A] hover:from-[#46704A] hover:to-[#6B8F60] transition-all duration-300 shadow-lg flex items-center justify-center"
                            aria-label="Statistics"
                          >
                            <TrendingUp className="w-6 h-6 text-white" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Statistics</p>
                        </TooltipContent>
                      </Tooltip>
                    </DockIcon>
                    <DockIcon>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setModalView("distribution")}
                            className="size-12 rounded-full bg-gradient-to-br from-[#46704A] to-[#6B8F60] hover:from-[#6B8F60] hover:to-[#A9B782] transition-all duration-300 shadow-lg flex items-center justify-center"
                            aria-label="Distribution"
                          >
                            <Target className="w-6 h-6 text-white" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Distribution</p>
                        </TooltipContent>
                      </Tooltip>
                    </DockIcon>
                    <DockIcon>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setModalView("frequency")}
                            className="size-12 rounded-full bg-gradient-to-br from-[#6B8F60] to-[#A9B782] hover:from-[#A9B782] hover:to-[#E4D7B4] transition-all duration-300 shadow-lg flex items-center justify-center"
                            aria-label="Frequency"
                          >
                            <Award className="w-6 h-6 text-white" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Frequency</p>
                        </TooltipContent>
                      </Tooltip>
                    </DockIcon>
                  </Dock>
                </TooltipProvider>
              </div>
            )}

            {/* Stats Modal */}
            <StatsModal
              isOpen={modalView !== null}
              onClose={() => setModalView(null)}
              view={modalView}
              problems={problems}
              difficultyData={difficultyData}
              stats={stats}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default InterviewQues;
