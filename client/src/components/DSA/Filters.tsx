"use client";

import type { CompanyData } from "@/types";
import { Building2, Clock, ArrowUpDown, BarChart3 } from "lucide-react";
import CustomSelect from "./CustomSelect";

interface FiltersProps {
  companyData: CompanyData;
  selectedCompany: string;
  setSelectedCompany: (company: string) => void;
  selectedDuration: string;
  setSelectedDuration: (duration: string) => void;
  selectedSort: string;
  setSelectedSort: (sort: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (difficulty: string) => void;
  isLoading?: boolean;
}

const Filters = ({
  companyData,
  selectedCompany,
  setSelectedCompany,
  selectedDuration,
  setSelectedDuration,
  selectedSort,
  setSelectedSort,
  selectedDifficulty,
  setSelectedDifficulty,
  isLoading = false,
}: FiltersProps) => {
  const formatDuration = (duration: string) => {
    return duration
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="relative mb-10">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#335441]/5 via-[#46704A]/5 to-[#6B8F60]/5 rounded-2xl blur-2xl"></div>

      <div className="relative bg-gradient-to-br from-white to-[#F9F6EE] backdrop-blur-sm rounded-2xl shadow-xl border-2 border-[#E4D7B4] p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#335441] to-[#46704A] rounded-xl flex items-center justify-center shadow-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#335441]">Filter & Sort</h2>
            <p className="text-sm text-[#6B8F60]">
              Customize your practice session
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CustomSelect
            icon={Building2}
            label="Company"
            value={selectedCompany}
            onChange={setSelectedCompany}
            placeholder="Select Company"
            disabled={isLoading}
            options={Object.keys(companyData).map((company) => ({
              value: company,
              label: company.charAt(0).toUpperCase() + company.slice(1),
            }))}
          />

          <CustomSelect
            icon={Clock}
            label="Time Period"
            value={selectedDuration}
            onChange={setSelectedDuration}
            placeholder="Select Duration"
            disabled={!selectedCompany || isLoading}
            options={
              selectedCompany
                ? companyData[selectedCompany].map((duration) => ({
                    value: duration,
                    label: formatDuration(duration),
                  }))
                : []
            }
          />

          <CustomSelect
            icon={ArrowUpDown}
            label="Sort By"
            value={selectedSort}
            onChange={setSelectedSort}
            placeholder="Sort Order"
            disabled={isLoading}
            options={[
              { value: "difficulty-asc", label: "Difficulty: Easy → Hard" },
              { value: "difficulty-desc", label: "Difficulty: Hard → Easy" },
              { value: "frequency-asc", label: "Frequency: Low → High" },
              { value: "frequency-desc", label: "Frequency: High → Low" },
            ]}
          />

          <CustomSelect
            icon={BarChart3}
            label="Difficulty"
            value={selectedDifficulty}
            onChange={setSelectedDifficulty}
            placeholder="All Levels"
            disabled={isLoading}
            options={[
              { value: "Easy", label: "🟢 Easy" },
              { value: "Medium", label: "🟡 Medium" },
              { value: "Hard", label: "🔴 Hard" },
            ]}
          />
        </div>

        {/* Active Filters Display */}
        {(selectedCompany || selectedDifficulty || selectedSort) && (
          <div className="mt-6 pt-6 border-t-2 border-[#E4D7B4]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-[#335441]">
                Active Filters:
              </span>
              {selectedCompany && (
                <span className="px-3 py-1 bg-[#335441] text-white rounded-full text-xs font-medium">
                  {selectedCompany.charAt(0).toUpperCase() +
                    selectedCompany.slice(1)}
                </span>
              )}
              {selectedDifficulty && (
                <span className="px-3 py-1 bg-[#46704A] text-white rounded-full text-xs font-medium">
                  {selectedDifficulty}
                </span>
              )}
              {selectedSort && (
                <span className="px-3 py-1 bg-[#6B8F60] text-white rounded-full text-xs font-medium">
                  {selectedSort
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Filters;
