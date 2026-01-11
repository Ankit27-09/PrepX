"use client"

import { useState, useEffect } from "react"
import type { CompanyData, Problem } from "@/types"
import Header from "./Header"
import Filters from "./Filters"
import ProblemTable from "./ProblemTable"
import Charts from "./Charts"

const InterviewQuestionsMain = () => {
  const [companyData, setCompanyData] = useState<CompanyData>({})
  const [selectedCompany, setSelectedCompany] = useState<string>("")
  const [selectedDuration, setSelectedDuration] = useState<string>("")
  const [selectedSort, setSelectedSort] = useState<string>("")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("")
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch("/company_data.json")
        if (!response.ok) {
          throw new Error("Failed to load company data")
        }
        const data = await response.json()
        setCompanyData(data)
        setError(null)
      } catch (error) {
        console.error("Error loading company data:", error)
        setError("Failed to load company data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchCompanyData()
  }, [])

  useEffect(() => {
    const fetchProblems = async () => {
      // When company is selected but no duration, automatically set to "all_time" if available
      if (selectedCompany && !selectedDuration && companyData[selectedCompany] && companyData[selectedCompany].length > 0) {
        // Set the duration to the first available option (preferably "all_time" if it exists)
        const allTimeOption = companyData[selectedCompany].find(duration => duration.includes("all_time") || duration.includes("overall") || duration.includes("6months") || duration.includes("1year"))
        const defaultDuration = allTimeOption || companyData[selectedCompany][0]
        setSelectedDuration(defaultDuration)
      } 
      // When both company and duration are selected
      else if (selectedCompany && selectedDuration) {
        setLoadingQuestions(true)
        setError(null)
        try {
          const response = await fetch(
            `/data/LeetCode-Questions-CompanyWise/${selectedCompany}_${selectedDuration}.csv`,
          )
          if (!response.ok) {
            throw new Error("Failed to load questions")
          }
          const csvText = await response.text()
          const parsedProblems = parseCSV(csvText)
          setProblems(parsedProblems)
        } catch (error) {
          console.error("Failed to load problems:", error)
          setError("Failed to load questions. Please try again later.")
          setProblems([])
        } finally {
          setLoadingQuestions(false)
        }
      } 
      // Reset when company is deselected
      else if (!selectedCompany) {
        setProblems([])
      }
    }

    fetchProblems()
  }, [selectedCompany, selectedDuration, companyData])

  const parseCSV = (csvText: string): Problem[] => {
    const rows = csvText.split("\n").filter((row) => row.trim())
    return rows.slice(1).map((row) => {
      const values = row.split(",").map((value) => value.trim())
      return {
        id: values[0],
        title: values[1],
        difficulty: values[3] as "Easy" | "Medium" | "Hard",
        frequency: Number.parseFloat(values[4]),
        link: values[5].trim(),
        attempted: false,
        dateSolved: "",
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#F9F6EE] to-[#EFE7D4]">
        <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-2xl shadow-lg border border-[#A9B782]/30">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#335441]"></div>
          <p className="text-lg text-[#335441] font-medium">Loading company data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F6EE] to-[#EFE7D4]">
      <div className="container mx-auto px-4 py-8">
        <Header companyName={selectedCompany} />
        <Filters
          companyData={companyData}
          selectedCompany={selectedCompany}
          setSelectedCompany={(company) => {
            setSelectedCompany(company);
            // If company is selected and companyData is available, set duration automatically
            if (company && companyData[company] && companyData[company].length > 0) {
              // Set the duration to the first available option (preferably "all_time" if it exists)
              const allTimeOption = companyData[company].find(duration => duration.includes("all_time") || duration.includes("overall") || duration.includes("6months") || duration.includes("1year"))
              const defaultDuration = allTimeOption || companyData[company][0]
              setSelectedDuration(defaultDuration)
            } else if (!company) {
              // If company is cleared, also clear the duration
              setSelectedDuration("")
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
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl mb-6 shadow-sm">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-2xl shadow-lg border border-[#A9B782]/30">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#335441]"></div>
              <p className="text-lg text-[#335441] font-medium">Loading questions...</p>
              <p className="text-sm text-[#6B8F60]">
                Fetching problems for {selectedCompany} ({selectedDuration.replace("_", " ")})
              </p>
            </div>
          </div>
        ) : (
          <>
            <ProblemTable problems={problems} selectedSort={selectedSort} selectedDifficulty={selectedDifficulty} />
            <Charts problems={problems} />
          </>
        )}
      </div>
    </div>
  )
}

export default InterviewQuestionsMain
