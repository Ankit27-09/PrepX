import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../../config/backendUrl";
import { generateAndDownloadCertificate } from "../../services/certificateService";
import {
  Award,
  CheckCircle,
  XCircle,
  Download,
  ArrowLeft,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

interface Evaluation {
  questionIndex: number;
  isCorrect: boolean;
  marksAwarded: number;
  feedback: string;
  strengths?: string[];
  improvements?: string[];
}

interface TestResult {
  id: string;
  score: number;
  marksObtained: number;
  totalMarks: number;
  hasPassed: boolean;
  evaluations: Evaluation[];
  submittedAt: string;
}

export default function TestResultsPage() {
  const { id: courseId, testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState<TestResult | null>(
    location.state?.result || null
  );
  const [loading, setLoading] = useState(!result);
  const [downloadingCert, setDownloadingCert] = useState(false);

  useEffect(() => {
    if (!result) {
      // Fetch result if not passed via state
      fetchResult();
    }
  }, []);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${backendUrl}/api/v1/courses/${courseId}/tests`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const testResult = response.data.tests.find((t: any) => t.id === testId);
      if (testResult) {
        setResult(testResult);
      }
    } catch (error) {
      console.error("Error fetching result:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!result?.hasPassed) return;

    try {
      setDownloadingCert(true);
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${backendUrl}/api/v1/courses/${courseId}/test/${testId}/certificate`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await generateAndDownloadCertificate(response.data.certificateData);
      }
    } catch (error) {
      console.error("Error downloading certificate:", error);
      alert("Failed to download certificate. Please try again.");
    } finally {
      setDownloadingCert(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F6EE] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#335441] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-[#F9F6EE] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#6B8F60] text-lg mb-4">Result not found</p>
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="px-6 py-3 bg-gradient-to-r from-[#335441] to-[#46704A] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  // Ensure result has required properties
  if (
    !result.hasOwnProperty("score") ||
    !result.hasOwnProperty("marksObtained") ||
    !result.hasOwnProperty("totalMarks")
  ) {
    return (
      <div className="min-h-screen bg-[#F9F6EE] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#6B8F60] text-lg mb-4">Invalid result data</p>
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="px-6 py-3 bg-gradient-to-r from-[#335441] to-[#46704A] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6EE] py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          className="flex items-center gap-2 text-[#6B8F60] hover:text-[#335441] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Course
        </button>

        {/* Result Card */}
        <div
          className={`bg-white rounded-2xl shadow-lg p-8 border-2 mb-8 ${
            result.hasPassed ? "border-green-300" : "border-red-300"
          }`}
        >
          <div className="text-center mb-8">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
                result.hasPassed ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {result.hasPassed ? (
                <Award className="w-12 h-12 text-green-600" />
              ) : (
                <AlertCircle className="w-12 h-12 text-red-600" />
              )}
            </div>
            <h1
              className={`text-4xl font-bold mb-2 ${
                result.hasPassed ? "text-green-600" : "text-red-600"
              }`}
            >
              {result.hasPassed ? "Congratulations!" : "Keep Trying!"}
            </h1>
            <p className="text-[#6B8F60] text-lg">
              {result.hasPassed
                ? "You have successfully passed the test"
                : "You didn't pass this time, but you can try again"}
            </p>
          </div>

          {/* Score Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#F9F6EE] p-6 rounded-xl text-center">
              <TrendingUp className="w-8 h-8 text-[#335441] mx-auto mb-2" />
              <p className="text-sm text-[#6B8F60] mb-1">Your Score</p>
              <p className="text-4xl font-bold text-[#335441]">
                {result.score}%
              </p>
            </div>
            <div className="bg-[#F9F6EE] p-6 rounded-xl text-center">
              <CheckCircle className="w-8 h-8 text-[#335441] mx-auto mb-2" />
              <p className="text-sm text-[#6B8F60] mb-1">Marks Obtained</p>
              <p className="text-4xl font-bold text-[#335441]">
                {result.marksObtained}
              </p>
            </div>
            <div className="bg-[#F9F6EE] p-6 rounded-xl text-center">
              <Award className="w-8 h-8 text-[#335441] mx-auto mb-2" />
              <p className="text-sm text-[#6B8F60] mb-1">Total Marks</p>
              <p className="text-4xl font-bold text-[#335441]">
                {result.totalMarks}
              </p>
            </div>
          </div>

          {/* Certificate Download */}
          {result.hasPassed && (
            <div className="text-center">
              <button
                onClick={handleDownloadCertificate}
                disabled={downloadingCert}
                className="px-8 py-4 bg-gradient-to-r from-[#335441] to-[#46704A] text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-3 mx-auto"
              >
                {downloadingCert ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-6 h-6" />
                    Download Certificate
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Detailed Evaluation */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-[#E4D7B4]">
          <h2 className="text-2xl font-bold text-[#335441] mb-6">
            Detailed Evaluation
          </h2>

          <div className="space-y-6">
            {result.evaluations && result.evaluations.length > 0 ? (
              result.evaluations.map((evaluation, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl border-2 ${
                    evaluation.isCorrect
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {evaluation.isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                      )}
                      <div>
                        <h3 className="font-bold text-[#335441]">
                          Question {evaluation.questionIndex + 1}
                        </h3>
                        <p className="text-sm text-[#6B8F60]">
                          {evaluation.marksAwarded} marks awarded
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-[#335441] mb-1">
                        Feedback:
                      </p>
                      <p className="text-[#6B8F60]">{evaluation.feedback}</p>
                    </div>

                    {evaluation.strengths &&
                      evaluation.strengths.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-green-600 mb-1">
                            Strengths:
                          </p>
                          <ul className="list-disc list-inside text-[#6B8F60] space-y-1">
                            {evaluation.strengths.map((strength, i) => (
                              <li key={i}>{strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {evaluation.improvements &&
                      evaluation.improvements.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-orange-600 mb-1">
                            Areas for Improvement:
                          </p>
                          <ul className="list-disc list-inside text-[#6B8F60] space-y-1">
                            {evaluation.improvements.map((improvement, i) => (
                              <li key={i}>{improvement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-[#F9F6EE] p-8 rounded-xl text-center">
                <p className="text-[#6B8F60]">
                  No detailed evaluation available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
