import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import api from "@/config/axiosInstance";
import { backendUrl } from "@/config/backendUrl";

const jobRoles = [
  "Frontend Developer",
  "Backend Developer",
  "React Developer",
  "Full Stack Developer",
  "MERN Developer",
  "Data Scientist",
  "Machine Learning Engineer",
  "Product Manager",
  "DevOps Engineer",
];

const models = ["Ege", "Awais", "Andre", "Zaid"];

const InterviewHelp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    jobRole: "",
    model: "",
    extraInfo: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      if (resumeFile) {
        data.append("resume", resumeFile);
      }

      const response = await api.post(
        `${backendUrl}/api/v1/interview/create`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Interview created:", response.data);
      navigate("/your-interviews");
    } catch (err: any) {
      console.error("Error submitting form:", err);
      setError("Failed to create interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F6EE] to-[#EFE7D4] py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#335441] mb-2">
              Create New Interview
            </h1>
            <p className="text-[#6B8F60]">
              Set up your AI-powered interview practice session
            </p>
          </div>

          <div className="bg-white rounded-2xl border-2 border-[#E4D7B4] shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="resume"
                  className="text-[#335441] font-semibold"
                >
                  Upload Resume
                </Label>
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setResumeFile(e.target.files[0]);
                    }
                  }}
                  className="border-2 border-[#E4D7B4] focus:border-[#335441] focus:ring-[#335441]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[#335441] font-semibold">
                  Interview Title
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter interview title"
                  required
                  className="border-2 border-[#E4D7B4] focus:border-[#335441] focus:ring-[#335441]"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-[#335441] font-semibold"
                >
                  Description
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter interview description"
                  required
                  className="border-2 border-[#E4D7B4] focus:border-[#335441] focus:ring-[#335441]"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="jobRole"
                  className="text-[#335441] font-semibold"
                >
                  Job Role
                </Label>
                <Select
                  value={formData.jobRole}
                  onValueChange={(value) =>
                    setFormData({ ...formData, jobRole: value })
                  }
                >
                  <SelectTrigger className="border-2 border-[#E4D7B4] focus:border-[#335441] focus:ring-[#335441]">
                    <SelectValue placeholder="Select job role" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model" className="text-[#335441] font-semibold">
                  Select Model
                </Label>
                <Select
                  value={formData.model}
                  onValueChange={(value) =>
                    setFormData({ ...formData, model: value })
                  }
                >
                  <SelectTrigger className="border-2 border-[#E4D7B4] focus:border-[#335441] focus:ring-[#335441]">
                    <SelectValue placeholder="Select AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="extraInfo"
                  className="text-[#335441] font-semibold"
                >
                  Extra Information (Optional)
                </Label>
                <Textarea
                  id="extraInfo"
                  value={formData.extraInfo}
                  onChange={(e) =>
                    setFormData({ ...formData, extraInfo: e.target.value })
                  }
                  placeholder="Add any additional information..."
                  className="min-h-[100px] border-2 border-[#E4D7B4] focus:border-[#335441] focus:ring-[#335441]"
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-xl">
                  <p className="font-medium">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-br from-[#335441] to-[#46704A] hover:from-[#46704A] hover:to-[#6B8F60] text-white font-semibold py-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Interview"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewHelp;
