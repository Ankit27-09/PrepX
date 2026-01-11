import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../../config/backendUrl";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Send,
  BookOpen,
  Award,
  Code,
  ChevronDown,
} from "lucide-react";
import Editor, { loader } from "@monaco-editor/react";

interface Question {
  type: string;
  question: string;
  options?: string[];
  correctAnswer?: number;
  marks: number;
  difficulty: string;
  topic: string;
}

interface TestInstructions {
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  passingScore: number;
  instructions: string[];
}

export default function CourseTestPage() {
  const { id: courseId, testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [instructions, setInstructions] = useState<TestInstructions | null>(
    null
  );
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [unansweredCount, setUnansweredCount] = useState(0);
  const [codeLanguages, setCodeLanguages] = useState<{ [key: number]: string }>(
    {}
  );
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState<{
    [key: number]: boolean;
  }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Configure Monaco Editor globally (runs once)
  useEffect(() => {
    // Don't configure CDN path - let @monaco-editor/react use its bundled version
    loader
      .init()
      .then((monaco) => {
        // Configure JavaScript/TypeScript language features
        monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
        });
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ES2020,
          allowNonTsExtensions: true,
          allowJs: true,
          checkJs: false,
          lib: ["es2020", "dom"],
          moduleResolution:
            monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          module: monaco.languages.typescript.ModuleKind.ESNext,
        });

        // TypeScript defaults
        monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
        });
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ES2020,
          allowNonTsExtensions: true,
          lib: ["es2020", "dom"],
          moduleResolution:
            monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          module: monaco.languages.typescript.ModuleKind.ESNext,
        });
      })
      .catch((err) => {
        console.error("Failed to initialize Monaco:", err);
      });
  }, []);

  useEffect(() => {
    fetchTest();
  }, [courseId, testId]);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".custom-dropdown")) {
        setLanguageDropdownOpen({});
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showInstructions && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showInstructions, timeRemaining]);

  const fetchTest = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      // If testId exists, fetch that test, otherwise generate new
      const url = testId
        ? `${backendUrl}/api/v1/courses/${courseId}/tests`
        : `${backendUrl}/api/v1/courses/${courseId}/test/generate`;

      const response = await axios({
        method: testId ? "get" : "post",
        url,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        let testData;

        if (testId) {
          // Fetching existing test
          testData = response.data.tests.find((t: any) => t.id === testId);
          if (!testData) {
            throw new Error("Test not found");
          }
          // Parse JSON strings from database
          testData.questions =
            typeof testData.questions === "string"
              ? JSON.parse(testData.questions)
              : testData.questions;
          testData.testInstructions =
            typeof testData.testInstructions === "string"
              ? JSON.parse(testData.testInstructions)
              : testData.testInstructions;
        } else {
          // New test generation
          testData = response.data.test;
        }

        // Validate testData has required fields
        if (!testData || !testData.questions || !testData.testInstructions) {
          console.error("Invalid test data:", testData);
          throw new Error("Invalid test data received");
        }

        setTest(testData);
        setQuestions(testData.questions);
        setInstructions(testData.testInstructions);
        setTimeRemaining(testData.timeLimit * 60);
      }
    } catch (error: any) {
      console.error("Error fetching test:", error);
      if (error.response?.status === 429) {
        alert(error.response.data.message);
        navigate(`/courses/${courseId}`);
      } else {
        alert("Failed to load test. Please try again.");
        navigate(`/courses/${courseId}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const languages = [
    { value: "javascript", label: "JavaScript", icon: "JS" },
    { value: "typescript", label: "TypeScript", icon: "TS" },
    { value: "python", label: "Python", icon: "🐍" },
    { value: "java", label: "Java", icon: "☕" },
    { value: "cpp", label: "C++", icon: "C++" },
    { value: "c", label: "C", icon: "C" },
    { value: "csharp", label: "C#", icon: "C#" },
    { value: "go", label: "Go", icon: "🔷" },
    { value: "rust", label: "Rust", icon: "🦀" },
    { value: "php", label: "PHP", icon: "🐘" },
    { value: "ruby", label: "Ruby", icon: "💎" },
    { value: "swift", label: "Swift", icon: "🦅" },
    { value: "kotlin", label: "Kotlin", icon: "KT" },
    { value: "scala", label: "Scala", icon: "SC" },
    { value: "r", label: "R", icon: "📊" },
    { value: "sql", label: "SQL", icon: "🗄️" },
    { value: "html", label: "HTML", icon: "🌐" },
    { value: "css", label: "CSS", icon: "🎨" },
    { value: "json", label: "JSON", icon: "{}" },
    { value: "yaml", label: "YAML", icon: "📝" },
    { value: "markdown", label: "Markdown", icon: "MD" },
    { value: "shell", label: "Shell", icon: "💻" },
    { value: "powershell", label: "PowerShell", icon: "PS" },
    { value: "dart", label: "Dart", icon: "🎯" },
    { value: "lua", label: "Lua", icon: "🌙" },
    { value: "perl", label: "Perl", icon: "🐪" },
    { value: "haskell", label: "Haskell", icon: "λ" },
    { value: "elixir", label: "Elixir", icon: "💧" },
    { value: "clojure", label: "Clojure", icon: "🔧" },
    { value: "objective-c", label: "Objective-C", icon: "OC" },
  ];

  const handleSubmitClick = () => {
    if (submitting || !questions || questions.length === 0) return;

    const unanswered = questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      setUnansweredCount(unanswered);
      setShowSubmitDialog(true);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (submitting || !questions || questions.length === 0) return;

    try {
      setSubmitting(true);
      setShowSubmitDialog(false);
      const token = localStorage.getItem("accessToken");

      const answersArray = questions.map((_, i) => answers[i] || "");

      const response = await axios.post(
        `${backendUrl}/api/v1/courses/${courseId}/test/${test.id}/submit`,
        { answers: answersArray },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        navigate(`/courses/${courseId}/test/${test.id}/results`, {
          state: { result: response.data.result },
        });
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      setShowSubmitDialog(false);
      // Show error in a dialog instead of alert
      alert("Failed to submit test. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F6EE] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#335441] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (showInstructions && instructions) {
    return (
      <div className="min-h-screen bg-[#F9F6EE] py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-[#E4D7B4]">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-[#335441] to-[#46704A] rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-[#335441] mb-2">
                Test Instructions
              </h1>
              <p className="text-[#6B8F60]">
                Please read carefully before starting
              </p>
            </div>

            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F9F6EE] p-4 rounded-xl">
                  <p className="text-sm text-[#6B8F60] mb-1">Duration</p>
                  <p className="text-2xl font-bold text-[#335441]">
                    {instructions.duration} min
                  </p>
                </div>
                <div className="bg-[#F9F6EE] p-4 rounded-xl">
                  <p className="text-sm text-[#6B8F60] mb-1">Questions</p>
                  <p className="text-2xl font-bold text-[#335441]">
                    {instructions.totalQuestions}
                  </p>
                </div>
                <div className="bg-[#F9F6EE] p-4 rounded-xl">
                  <p className="text-sm text-[#6B8F60] mb-1">Total Marks</p>
                  <p className="text-2xl font-bold text-[#335441]">
                    {instructions.totalMarks}
                  </p>
                </div>
                <div className="bg-[#F9F6EE] p-4 rounded-xl">
                  <p className="text-sm text-[#6B8F60] mb-1">Passing Score</p>
                  <p className="text-2xl font-bold text-[#335441]">
                    {instructions.passingScore}%
                  </p>
                </div>
              </div>

              <div className="bg-[#F9F6EE] p-6 rounded-xl">
                <h3 className="font-bold text-[#335441] mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Important Instructions
                </h3>
                <ul className="space-y-2">
                  {instructions.instructions.map((instruction, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-[#6B8F60]"
                    >
                      <CheckCircle className="w-5 h-5 text-[#46704A] flex-shrink-0 mt-0.5" />
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Question Types Info */}
              <div className="bg-gradient-to-br from-[#335441] to-[#46704A] p-6 rounded-xl text-white">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Question Types
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Multiple Choice Questions (MCQ)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>True/False Questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Short Answer Questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Coding/Practical Questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Situational Questions</span>
                  </div>
                </div>
              </div>

              {/* Warning Box */}
              <div className="bg-red-50 border-2 border-red-200 p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-red-800 mb-2">
                      Important Warning
                    </h4>
                    <ul className="space-y-1 text-sm text-red-700">
                      <li>• Once started, the test cannot be paused</li>
                      <li>• Closing the browser will auto-submit your test</li>
                      <li>• You can only take the test once every 24 hours</li>
                      <li>• Make sure you have a stable internet connection</li>
                      <li>
                        • Ensure you have enough time to complete the test
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Certificate Info */}
              <div className="bg-green-50 border-2 border-green-200 p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <Award className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-green-800 mb-2">
                      Certificate Eligibility
                    </h4>
                    <p className="text-sm text-green-700">
                      You need to score at least {instructions.passingScore}% to
                      be eligible for the course completion certificate. The
                      certificate will be available for download immediately
                      after passing the test.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate(`/courses/${courseId}`)}
                className="flex-1 px-6 py-3 border-2 border-[#E4D7B4] text-[#335441] rounded-xl font-semibold hover:bg-[#F9F6EE] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowConfirmDialog(true)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#335441] to-[#46704A] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                I'm Ready - Start Test
              </button>
            </div>
          </div>

          {/* Confirmation Dialog */}
          {showConfirmDialog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-[#E4D7B4] animate-fade-in">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#335441] to-[#46704A] rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#335441] mb-2">
                    Ready to Start?
                  </h3>
                  <p className="text-[#6B8F60]">
                    Once you start the test, the timer will begin and cannot be
                    paused.
                  </p>
                </div>

                <div className="bg-[#F9F6EE] p-4 rounded-xl mb-6">
                  <ul className="space-y-2 text-sm text-[#6B8F60]">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#46704A] flex-shrink-0 mt-0.5" />
                      <span>Timer starts immediately</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#46704A] flex-shrink-0 mt-0.5" />
                      <span>Cannot pause or stop the test</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#46704A] flex-shrink-0 mt-0.5" />
                      <span>Auto-submits when time expires</span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    className="flex-1 px-6 py-3 border-2 border-[#E4D7B4] text-[#335441] rounded-xl font-semibold hover:bg-[#F9F6EE] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmDialog(false);
                      setShowInstructions(false);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#335441] to-[#46704A] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Start Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6EE] py-8">
      {/* Timer Header */}
      <div className="sticky top-0 z-40 bg-white border-b-2 border-[#E4D7B4] shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="flex items-center gap-2 text-[#6B8F60] hover:text-[#335441] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Exit Test</span>
          </button>

          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${
                timeRemaining < 300
                  ? "bg-red-100 text-red-600"
                  : "bg-[#F9F6EE] text-[#335441]"
              }`}
            >
              <Clock className="w-5 h-5" />
              {formatTime(timeRemaining)}
            </div>

            <button
              onClick={handleSubmitClick}
              disabled={submitting}
              className="px-6 py-2 bg-gradient-to-r from-[#335441] to-[#46704A] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {questions && questions.length > 0 ? (
            questions.map((question, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[#E4D7B4]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-gradient-to-r from-[#335441] to-[#46704A] text-white text-sm rounded-full font-medium">
                        Q{index + 1}
                      </span>
                      <span className="px-3 py-1 bg-[#F9F6EE] text-[#6B8F60] text-sm rounded-full">
                        {question.marks} marks
                      </span>
                      <span className="px-3 py-1 bg-[#F9F6EE] text-[#6B8F60] text-sm rounded-full capitalize">
                        {question.type.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-lg text-[#335441] font-medium">
                      {question.question}
                    </p>
                  </div>
                </div>

                {/* Answer Input */}
                {question.type === "mcq" || question.type === "true_false" ? (
                  <div className="space-y-2">
                    {question.options?.map((option, optIndex) => (
                      <label
                        key={optIndex}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          answers[index] === optIndex.toString()
                            ? "border-[#335441] bg-[#F9F6EE]"
                            : "border-[#E4D7B4] hover:border-[#6B8F60]"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={optIndex}
                          checked={answers[index] === optIndex.toString()}
                          onChange={(e) =>
                            handleAnswerChange(index, e.target.value)
                          }
                          className="w-5 h-5 text-[#335441]"
                        />
                        <span className="text-[#335441]">{option}</span>
                      </label>
                    ))}
                  </div>
                ) : question.type === "coding" ? (
                  <div className="space-y-3">
                    {/* Custom Language Selector */}
                    <div className="flex items-center gap-3">
                      <Code className="w-5 h-5 text-[#335441]" />
                      <div className="relative custom-dropdown">
                        <button
                          type="button"
                          onClick={() =>
                            setLanguageDropdownOpen((prev) => ({
                              ...prev,
                              [index]: !prev[index],
                            }))
                          }
                          className="px-4 py-2 border-2 border-[#E4D7B4] rounded-lg focus:border-[#335441] focus:outline-none transition-colors text-[#335441] bg-white hover:bg-[#F9F6EE] flex items-center gap-2 min-w-[150px]"
                        >
                          <span className="font-mono text-sm font-bold">
                            {
                              languages.find(
                                (l) =>
                                  l.value ===
                                  (codeLanguages[index] || "javascript")
                              )?.icon
                            }
                          </span>
                          <span className="flex-1 text-left">
                            {
                              languages.find(
                                (l) =>
                                  l.value ===
                                  (codeLanguages[index] || "javascript")
                              )?.label
                            }
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              languageDropdownOpen[index] ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {languageDropdownOpen[index] && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#E4D7B4] rounded-lg shadow-xl z-50 overflow-hidden animate-fade-in max-h-80 overflow-y-auto">
                            {languages.map((lang) => (
                              <button
                                key={lang.value}
                                type="button"
                                onClick={() => {
                                  setCodeLanguages((prev) => ({
                                    ...prev,
                                    [index]: lang.value,
                                  }));
                                  setLanguageDropdownOpen((prev) => ({
                                    ...prev,
                                    [index]: false,
                                  }));
                                }}
                                className={`w-full px-4 py-2 text-left hover:bg-[#F9F6EE] transition-colors flex items-center gap-2 ${
                                  codeLanguages[index] === lang.value ||
                                  (!codeLanguages[index] &&
                                    lang.value === "javascript")
                                    ? "bg-gradient-to-r from-[#335441] to-[#46704A] text-white"
                                    : "text-[#335441]"
                                }`}
                              >
                                <span className="font-mono text-sm font-bold">
                                  {lang.icon}
                                </span>
                                <span>{lang.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-[#6B8F60]">
                        Select your language
                      </span>
                    </div>

                    {/* Monaco Editor */}
                    <div className="border-2 border-[#E4D7B4] rounded-xl overflow-hidden">
                      <Editor
                        height="400px"
                        language={codeLanguages[index] || "javascript"}
                        value={answers[index] || ""}
                        onChange={(value) =>
                          handleAnswerChange(index, value || "")
                        }
                        theme="vs-dark"
                        loading={
                          <div className="flex items-center justify-center h-full bg-[#1e1e1e]">
                            <div className="text-white">Loading editor...</div>
                          </div>
                        }
                        options={{
                          // Editor appearance
                          minimap: { enabled: true },
                          fontSize: 14,
                          lineNumbers: "on",
                          roundedSelection: true,
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          tabSize: 2,
                          wordWrap: "on",

                          // IntelliSense & Suggestions
                          quickSuggestions: {
                            other: true,
                            comments: true,
                            strings: true,
                          },
                          suggestOnTriggerCharacters: true,
                          acceptSuggestionOnCommitCharacter: true,
                          acceptSuggestionOnEnter: "on",
                          wordBasedSuggestions: "allDocuments",

                          // Code completion
                          autoClosingBrackets: "always",
                          autoClosingQuotes: "always",
                          autoSurround: "languageDefined",
                          autoIndent: "full",
                          formatOnPaste: true,
                          formatOnType: true,

                          // Code folding
                          folding: true,
                          foldingStrategy: "auto",
                          showFoldingControls: "always",

                          // Bracket pair colorization
                          bracketPairColorization: {
                            enabled: true,
                          },

                          // Hover & Parameter hints
                          hover: {
                            enabled: true,
                            delay: 300,
                          },
                          parameterHints: {
                            enabled: true,
                          },

                          // Other helpful features
                          snippetSuggestions: "top",
                          suggest: {
                            showMethods: true,
                            showFunctions: true,
                            showConstructors: true,
                            showFields: true,
                            showVariables: true,
                            showClasses: true,
                            showStructs: true,
                            showInterfaces: true,
                            showModules: true,
                            showProperties: true,
                            showEvents: true,
                            showOperators: true,
                            showUnits: true,
                            showValues: true,
                            showConstants: true,
                            showEnums: true,
                            showEnumMembers: true,
                            showKeywords: true,
                            showWords: true,
                            showColors: true,
                            showFiles: true,
                            showReferences: true,
                            showFolders: true,
                            showTypeParameters: true,
                            showSnippets: true,
                          },
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={answers[index] || ""}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    placeholder="Type your answer here..."
                    rows={5}
                    className="w-full p-4 border-2 border-[#E4D7B4] rounded-xl focus:border-[#335441] focus:outline-none transition-colors text-[#335441] placeholder-[#A9B782]"
                  />
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 border-2 border-[#E4D7B4] text-center">
              <BookOpen className="w-16 h-16 text-[#A9B782] mx-auto mb-4" />
              <p className="text-[#6B8F60] text-lg">No questions available</p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSubmitClick}
            disabled={submitting}
            className="px-12 py-4 bg-gradient-to-r from-[#335441] to-[#46704A] text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-3 mx-auto"
          >
            {submitting ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-6 h-6" />
                Submit Test
              </>
            )}
          </button>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      {showSubmitDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-[#E4D7B4] animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-[#335441] mb-2">
                Unanswered Questions
              </h3>
              <p className="text-[#6B8F60]">
                You have {unansweredCount} unanswered question
                {unansweredCount > 1 ? "s" : ""}. Are you sure you want to
                submit?
              </p>
            </div>

            <div className="bg-[#F9F6EE] p-4 rounded-xl mb-6">
              <p className="text-sm text-[#6B8F60] text-center">
                Unanswered questions will be marked as incorrect and you won't
                receive marks for them.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitDialog(false)}
                className="flex-1 px-6 py-3 border-2 border-[#E4D7B4] text-[#335441] rounded-xl font-semibold hover:bg-[#F9F6EE] transition-all"
              >
                Go Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#335441] to-[#46704A] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Anyway"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
