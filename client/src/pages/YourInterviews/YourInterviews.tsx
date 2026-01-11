import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, FileText } from "lucide-react";
import { encodePassphrase, randomString } from "@/lib/client-utils";
import api from "@/config/axiosInstance";
import moment from "moment";
import { backendUrl } from "@/config/backendUrl";

const jobRoleImages: { [key: string]: string } = {
  "Frontend Developer":
    "https://miro.medium.com/v2/resize:fit:826/1*t9VEDxOAAzBZoa2ZjCQo7A.png",
  "Backend Developer":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/768px-React-icon.svg.png",
  "React Developer":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/768px-React-icon.svg.png",
  "Full Stack Developer":
    "https://media.geeksforgeeks.org/wp-content/cdn-uploads/20190626123927/untitlsssssed.png",
  "MERN Developer":
    "https://almablog-media.s3.ap-south-1.amazonaws.com/MERN_Stack_9437df2ba9_62af1dd3fc.png",
  "Data Scientist": "https://cdn-icons-png.flaticon.com/512/4824/4824797.png",
  "Machine Learning Engineer":
    "https://t4.ftcdn.net/jpg/03/98/18/19/360_F_398181949_BudYmmAeTPJwDz6HMxwf1PL3ZNIblohm.jpg",
  "Product Manager":
    "https://cdn.iconscout.com/icon/free/png-256/free-product-manager-icon-download-in-svg-png-gif-file-formats--management-cog-cogwheel-business-and-vol-2-pack-icons-1153021.png",
  "DevOps Engineer":
    "https://miro.medium.com/v2/resize:fit:1400/0*xDsDpJsXjq55Dzda.png",
};

const YourInterviews = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [e2ee, setE2ee] = useState(false);
  const [sharedPassphrase, setSharedPassphrase] = useState(randomString(64));

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await api.get(
          `${backendUrl}/api/v1/interview/getinterviews`
        );
        setInterviews(response.data);
      } catch (error) {
        console.error("Failed to fetch interviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  const startMeeting = (interviewId: string) => {
    if (e2ee) {
      navigate(
        `/interview/${interviewId}#${encodePassphrase(sharedPassphrase)}`
      );
    } else {
      navigate(`/interview/${interviewId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#F9F6EE] to-[#EFE7D4]">
        <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-2xl shadow-lg border-2 border-[#E4D7B4]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#335441]"></div>
          <p className="text-lg text-[#335441] font-medium">
            Loading interviews...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F6EE] to-[#EFE7D4] py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#335441] to-[#46704A] rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#335441]">
                Your Interviews
              </h1>
              <p className="text-[#6B8F60]">
                Manage and track your interview practice sessions
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {interviews.map((interview: any) => (
            <div
              key={interview.id}
              className="bg-white rounded-2xl border-2 border-[#E4D7B4] shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="bg-gradient-to-r from-[#F9F6EE] to-[#EFE7D4] px-6 py-4 border-b-2 border-[#E4D7B4]">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-[#335441]">
                    {interview.title}
                  </h2>
                  <span className="text-sm text-[#6B8F60]">
                    {moment(interview.createdAt).format(
                      "MMMM Do YYYY, h:mm:ss A"
                    )}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#F9F6EE] p-4 rounded-xl border border-[#E4D7B4]">
                        <p className="text-sm text-[#6B8F60] mb-1">Job Role</p>
                        <p className="font-semibold text-[#335441]">
                          {interview.jobRole}
                        </p>
                      </div>
                      <div className="bg-[#F9F6EE] p-4 rounded-xl border border-[#E4D7B4]">
                        <p className="text-sm text-[#6B8F60] mb-1">AI Model</p>
                        <p className="font-semibold text-[#335441]">
                          {interview.model}
                        </p>
                      </div>
                    </div>
                    <p className="text-[#6B8F60]">{interview.description}</p>
                    {!interview.isCompleted && (
                      <div className="flex flex-col gap-4 bg-[#F9F6EE] p-4 rounded-xl border border-[#E4D7B4]">
                        <div className="flex items-center gap-2">
                          <input
                            id={`use-e2ee-${interview.id}`}
                            type="checkbox"
                            checked={e2ee}
                            onChange={(ev) => setE2ee(ev.target.checked)}
                            className="w-4 h-4 text-[#335441] border-[#E4D7B4] rounded focus:ring-[#335441]"
                          />
                          <label
                            htmlFor={`use-e2ee-${interview.id}`}
                            className="text-[#335441] font-medium"
                          >
                            Enable end-to-end encryption
                          </label>
                        </div>
                        {e2ee && (
                          <div className="flex flex-col gap-2">
                            <label
                              htmlFor={`passphrase-${interview.id}`}
                              className="text-[#335441] font-medium"
                            >
                              Passphrase
                            </label>
                            <input
                              id={`passphrase-${interview.id}`}
                              type="password"
                              value={sharedPassphrase}
                              onChange={(ev) =>
                                setSharedPassphrase(ev.target.value)
                              }
                              className="px-4 py-2 border-2 border-[#E4D7B4] rounded-lg focus:border-[#335441] focus:ring-[#335441] focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {interview.isCompleted && !interview.isResultEvaluated && (
                      <div className="flex items-center bg-[#F9F6EE] p-4 rounded-xl border border-[#E4D7B4]">
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-[#6B8F60]"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          />
                        </svg>
                        <span className="text-[#6B8F60] text-sm italic">
                          Evaluating Results (Check again after some time)...
                        </span>
                      </div>
                    )}

                    <div className="flex gap-4 pt-4">
                      {!interview.isCompleted && (
                        <button
                          className="flex-1 bg-gradient-to-br from-[#335441] to-[#46704A] hover:from-[#46704A] hover:to-[#6B8F60] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                          onClick={() => startMeeting(interview.id)}
                        >
                          <PlayCircle className="w-5 h-5" />
                          Start Interview
                        </button>
                      )}

                      {interview.isResultEvaluated && (
                        <Link
                          to={`/interview/results/${interview.id}`}
                          className="flex-1"
                        >
                          <button className="w-full bg-gradient-to-br from-[#46704A] to-[#6B8F60] hover:from-[#6B8F60] hover:to-[#A9B782] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                            <FileText className="w-5 h-5" />
                            View Results
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {interview.jobRole && jobRoleImages[interview.jobRole] && (
                    <div className="w-full md:w-1/3 flex justify-center items-center">
                      <img
                        src={jobRoleImages[interview.jobRole]}
                        alt={interview.jobRole}
                        className="rounded-lg shadow-md max-h-48 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default YourInterviews;
