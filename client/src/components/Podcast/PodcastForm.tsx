import { useState } from "react";
import { Upload, FileText, Loader2, Sparkles, Clock, Zap } from "lucide-react";
import {type CreatePodcastRequest } from "@/types/podcasts";

interface PodcastFormProps {
  onSubmit: (data: CreatePodcastRequest) => void;
  isLoading: boolean;
}

export default function PodcastForm({ onSubmit, isLoading }: PodcastFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    length: "Short" as "Short" | "Medium" | "Long",
    knowledgeText: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<"text" | "file">("text");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreatePodcastRequest = {
      title: formData.title,
      description: formData.description || undefined,
      length: formData.length,
    };

    if (inputMode === "text") {
      data.knowledgeText = formData.knowledgeText;
    } else if (file) {
      data.knowledgeFile = file;
    }

    onSubmit(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const lengthOptions = [
    { value: "Short", duration: "3-5 min", icon: Zap },
    { value: "Medium", duration: "5-10 min", icon: Clock },
    { value: "Long", duration: "10-15 min", icon: Sparkles },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-bold text-[#335441] mb-2"
        >
          Podcast Title *
        </label>
        <input
          type="text"
          id="title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 border-2 border-[#E4D7B4] rounded-xl focus:ring-2 focus:ring-[#335441] focus:border-[#335441] text-[#335441] placeholder-[#A9B782] transition-all"
          placeholder="e.g., The Future of AI in Education"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-bold text-[#335441] mb-2"
        >
          Description (Optional)
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          className="w-full px-4 py-3 border-2 border-[#E4D7B4] rounded-xl focus:ring-2 focus:ring-[#335441] focus:border-[#335441] text-[#335441] placeholder-[#A9B782] transition-all"
          placeholder="Brief description of your podcast topic..."
        />
      </div>

      {/* Length */}
      <div>
        <label className="block text-sm font-bold text-[#335441] mb-3">
          Podcast Length *
        </label>
        <div className="grid grid-cols-3 gap-4">
          {lengthOptions.map(({ value, duration, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFormData({ ...formData, length: value as any })}
              className={`relative p-4 rounded-xl font-semibold transition-all duration-300 border-2 ${
                formData.length === value
                  ? "bg-gradient-to-br from-[#335441] to-[#46704A] text-white border-[#335441] shadow-lg scale-105"
                  : "bg-white text-[#335441] border-[#E4D7B4] hover:border-[#335441] hover:shadow-md"
              }`}
            >
              <Icon
                className={`w-6 h-6 mx-auto mb-2 ${
                  formData.length === value ? "text-white" : "text-[#335441]"
                }`}
              />
              <div className="text-base">{value}</div>
              <div
                className={`text-xs mt-1 ${
                  formData.length === value
                    ? "text-[#E4D7B4]"
                    : "text-[#6B8F60]"
                }`}
              >
                {duration}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Mode Toggle */}
      <div>
        <label className="block text-sm font-bold text-[#335441] mb-3">
          Knowledge Base Input *
        </label>
        <div className="flex gap-3 mb-4">
          <button
            type="button"
            onClick={() => setInputMode("text")}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 border-2 ${
              inputMode === "text"
                ? "bg-gradient-to-r from-[#335441] to-[#46704A] text-white border-[#335441] shadow-lg"
                : "bg-white text-[#335441] border-[#E4D7B4] hover:border-[#335441] hover:shadow-md"
            }`}
          >
            <FileText className="w-5 h-5" />
            Text Input
          </button>
          <button
            type="button"
            onClick={() => setInputMode("file")}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 border-2 ${
              inputMode === "file"
                ? "bg-gradient-to-r from-[#335441] to-[#46704A] text-white border-[#335441] shadow-lg"
                : "bg-white text-[#335441] border-[#E4D7B4] hover:border-[#335441] hover:shadow-md"
            }`}
          >
            <Upload className="w-5 h-5" />
            File Upload
          </button>
        </div>

        {inputMode === "text" ? (
          <div className="relative">
            <textarea
              required={inputMode === "text"}
              value={formData.knowledgeText}
              onChange={(e) =>
                setFormData({ ...formData, knowledgeText: e.target.value })
              }
              rows={10}
              className="w-full px-4 py-3 border-2 border-[#E4D7B4] rounded-xl focus:ring-2 focus:ring-[#335441] focus:border-[#335441] text-[#335441] placeholder-[#A9B782] transition-all font-mono text-sm"
              placeholder="Paste your content here... AI will transform it into an engaging podcast conversation! (minimum 50 words)"
            />
            <div className="absolute bottom-3 right-3 text-xs text-[#6B8F60] bg-white px-2 py-1 rounded">
              {formData.knowledgeText.split(" ").filter((w) => w).length} words
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-[#E4D7B4] rounded-xl p-8 bg-[#F9F6EE] hover:border-[#335441] transition-all">
            <input
              type="file"
              accept=".txt,.md"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              required={inputMode === "file"}
            />
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center cursor-pointer"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#335441] to-[#46704A] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <span className="text-base font-semibold text-[#335441] mb-1">
                {file ? file.name : "Click to upload your content"}
              </span>
              <span className="text-sm text-[#6B8F60]">
                Supports .txt and .md files (Max 10MB)
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#335441] to-[#46704A] text-white rounded-xl font-bold text-lg hover:from-[#46704A] hover:to-[#6B8F60] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              AI is Creating Magic...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate AI Podcast
            </>
          )}
        </button>
      </div>
    </form>
  );
}
