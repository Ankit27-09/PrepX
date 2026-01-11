import express, { Router, Request, Response } from "express";
import axios from "axios";
import OpenAI from "openai";

// Initialize router
const router: Router = express.Router();

// Lazy initialization of OpenAI client
let openai: OpenAI | null = null;

const getOpenAIClient = (): OpenAI => {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set in environment variables");
    }

    openai = new OpenAI({
      apiKey: apiKey,
    });
  }
  return openai;
};

interface SearchResult {
  title: string;
  snippet: string;
  link: string;
}

interface GoogleSearchItem {
  title: string;
  snippet: string;
  link: string;
}

interface GoogleSearchResponse {
  items?: GoogleSearchItem[];
}

interface SalaryRange {
  role: string;
  min: number;
  max: number;
  median: number;
  location?: string;
}

interface IndustryInsights {
  salaryRanges: SalaryRange[];
  growthRate: number;
  demandLevel: "High" | "Medium" | "Low";
  topSkills: string[];
  marketOutlook: "Positive" | "Neutral" | "Negative";
  keyTrends: string[];
  recommendedSkills: string[];
  dataSources: string[];
  generatedBy?: string;
  dataFreshness?: string;
}

/**
 * Perform Google Custom Search to get recent industry data
 * @param {string} industry - The industry to search for
 * @returns {Array} - Array of search results
 */
const performGoogleSearch = async (industry: string): Promise<SearchResult[]> => {
  try {
    const queries = [
      `${industry} industry salary ranges 2025`,
      `${industry} industry growth rate statistics 2025`,
      `${industry} top skills and trends 2025`,
      `${industry} job market outlook 2025`,
    ];

    const searchResults: SearchResult[] = [];

    for (const query of queries) {
      const response = await axios.get<GoogleSearchResponse>(
        "https://www.googleapis.com/customsearch/v1",
        {
          params: {
            key: process.env.GOOGLE_SEARCH_API_KEY,
            cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
            q: query,
            num: 5, // Get top 5 results per query
          },
        }
      );

      if (response.data.items) {
        searchResults.push(
          ...response.data.items.map((item) => ({
            title: item.title,
            snippet: item.snippet,
            link: item.link,
          }))
        );
      }
    }

    return searchResults;
  } catch (error) {
    console.error(
      "Google Search API error:",
      (error as any).response?.data || (error as any).message
    );
    return [];
  }
};

/**
 * Generate industry insights using OpenAI with Google Search results
 * @param {string} industry - The industry to analyze
 * @returns {Object} - JSON object with industry insights
 */
const generateAIInsights = async (industry: string): Promise<IndustryInsights> => {
  try {
    // First, get real-time data from Google Search
    console.log(`Fetching real-time data for ${industry} industry...`);
    const searchResults = await performGoogleSearch(industry);

    // Prepare context from search results
    const searchContext =
      searchResults.length > 0
        ? searchResults
            .map(
              (result, index) =>
                `Source ${index + 1}: ${result.title}\n${
                  result.snippet
                }\nLink: ${result.link}`
            )
            .join("\n\n")
        : "No recent search results available.";

    // Create enhanced prompt with search results
    const prompt = `You are an industry analyst. Based on the following real-time search results from Google, analyze the ${industry} industry and provide detailed, accurate insights.

SEARCH RESULTS:
${searchContext}

Using the above real-time data and your knowledge, provide a comprehensive analysis in the following JSON format ONLY:

{
  "salaryRanges": [
    { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
  ],
  "growthRate": number,
  "demandLevel": "High" | "Medium" | "Low",
  "topSkills": ["skill1", "skill2"],
  "marketOutlook": "Positive" | "Neutral" | "Negative",
  "keyTrends": ["trend1", "trend2"],
  "recommendedSkills": ["skill1", "skill2"],
  "dataSources": ["source1", "source2"]
}

REQUIREMENTS:
- Include at least 7-10 common roles for salary ranges with accurate 2025 data
- Growth rate should be a percentage based on latest industry reports
- Include at least 8-10 top skills and key trends
- Include at least 8 recommended skills for career growth
- List data sources used from the search results
- Provide location-specific salary data (US, Global, Europe, Asia, etc.)
- Be specific with numbers and percentages
- Focus on accuracy based on the search results provided

Return ONLY the JSON object, no additional text or markdown formatting.`;

    // Call OpenAI API
    console.log("Generating insights with OpenAI...");
    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // or "gpt-4" for better quality
      messages: [
        {
          role: "system",
          content:
            "You are an expert industry analyst who provides accurate, data-driven insights based on real-time information. You always return valid JSON without any additional formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent, factual output
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error("OpenAI response was empty");
    }
    console.log("OpenAI response received, parsing JSON...");

    // Parse and return the JSON
    const insights: IndustryInsights = JSON.parse(responseText);

    // Add metadata
    insights.generatedBy = "OpenAI with Google Search";
    insights.dataFreshness = "Real-time";

    return insights;
  } catch (error) {
    console.error("Error generating AI insights:", error);

    // If search fails, use OpenAI with general knowledge
    if ((error as any).message.includes("Google Search")) {
      console.log("Falling back to OpenAI without search results...");
      return await generateInsightsWithoutSearch(industry);
    }

    throw new Error("Failed to generate industry insights: " + (error as any).message);
  }
};

/**
 * Fallback method: Generate insights using OpenAI without search results
 * @param {string} industry - The industry to analyze
 * @returns {Object} - JSON object with industry insights
 */
const generateInsightsWithoutSearch = async (industry: string): Promise<IndustryInsights> => {
  const prompt = `Analyze the current state of the ${industry} industry and provide detailed insights in the following JSON format:

{
  "salaryRanges": [
    { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
  ],
  "growthRate": number,
  "demandLevel": "High" | "Medium" | "Low",
  "topSkills": ["skill1", "skill2"],
  "marketOutlook": "Positive" | "Neutral" | "Negative",
  "keyTrends": ["trend1", "trend2"],
  "recommendedSkills": ["skill1", "skill2"],
  "dataSources": ["OpenAI Knowledge Base"]
}

Include at least 7-10 roles with 2025 salary estimates, 8-10 skills and trends. Return ONLY JSON.`;

  const client = getOpenAIClient();
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an expert industry analyst. Return valid JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 3000,
    response_format: { type: "json_object" },
  });

  const responseContent = completion.choices[0].message.content;
  if (!responseContent) {
    throw new Error("OpenAI response was empty in fallback function");
  }
  const insights: IndustryInsights = JSON.parse(responseContent);
  insights.generatedBy = "OpenAI";
  insights.dataFreshness = "AI Knowledge Base";

  return insights;
};

// GET endpoint to get industry insights
router.get("/insights/:industry", async (req: Request, res: Response) => {
  try {
    const { industry } = req.params;

    console.log(`🔍 Generating new insights for ${industry}...`);
    const insights = await generateAIInsights(industry);

    // Add industry name and timestamps to response
    const result = {
      ...insights,
      industry: industry.toLowerCase(),
      lastUpdated: new Date(),
      nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now (for compatibility with frontend)
    };

    res.json(result);
  } catch (error) {
    console.error("Error fetching industry insights:", error);
    res.status(500).json({
      error: "Failed to fetch industry insights",
      details: (error as any).message,
    });
  }
});

// POST endpoint to refresh industry insights (same functionality now)
router.post("/insights/:industry/refresh", async (req: Request, res: Response) => {
  try {
    const { industry } = req.params;

    console.log(`🔄 Generating fresh insights for ${industry}...`);
    const insights = await generateAIInsights(industry);

    // Add industry name and timestamps to response
    const result = {
      ...insights,
      industry: industry.toLowerCase(),
      lastUpdated: new Date(),
      nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now (for compatibility with frontend)
    };

    res.json(result);
  } catch (error) {
    console.error("Error refreshing industry insights:", error);
    res.status(500).json({
      error: "Failed to refresh industry insights",
      details: (error as any).message,
    });
  }
});

// Simple health check endpoint
router.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", message: "Industry Insights API is running" });
});

export default router;
