import { Button } from "@/components/ui/button";
import {
  Link2,
  CheckCircle,
  ArrowRight,
  HelpCircle,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import BarLoader from "react-spinners/BarLoader";
import type { ErrorResponse } from "@/types/auth";
import { verifyUserEmail } from "@/api/authService";

const VerificationStatus = () => {
  const { verificationToken } = useParams();

  const [status, setStatus] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const verifyEmail = async () => {
      setStatus("LOADING");
      try {
        const response = await verifyUserEmail(verificationToken);
        if (response.data.success) {
          if (response.data.code === "ALREADY_VERIFIED" || "VERIFIED") {
            setStatus("VERIFIED");
            setMessage(response.data.message);
          }
        }
      } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        if (axiosError.response && axiosError.response.data) {
          const backendError = axiosError.response.data.message;
          setStatus("VERIFICATION_ERROR");
          setMessage(backendError);
        }
        setStatus("VERIFICATION_ERROR");
      }
    };

    verifyEmail();
  }, [verificationToken]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#F9F6EE] to-[#EFE7D4] flex items-center justify-center p-4">
        <div className="max-w-lg w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border-2 border-[#E4D7B4]">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="p-2 bg-[#335441] rounded-xl">
              <Link2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-[#335441]">PrepX</span>
          </div>

          {status === "LOADING" && (
            <div className="flex flex-col justify-center items-center gap-5">
              <BarLoader color="#335441" />
              <span className="animate-fadeblink text-[#335441]">
                Please wait while we verify your email
              </span>
            </div>
          )}

          {status === "VERIFIED" && (
            <>
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#F9F6EE]">
                  <CheckCircle className="h-8 w-8 text-[#46704A]" />
                </div>
                <h2 className="mt-6 text-2xl font-semibold text-[#335441]">
                  {message}
                </h2>
                <p className="mt-2 text-sm text-[#6B8F60]">
                  Your email has been verified. You can now access all features
                  of your account.
                </p>
              </div>

              <div className="space-y-6">
                <Button
                  className="w-full bg-[#335441] hover:bg-[#46704A] text-white py-2 h-11"
                  asChild
                >
                  <Link to="/profile">Go to Profile</Link>
                </Button>

                <div className="text-center space-y-4">
                  <p className="text-sm text-[#6B8F60]">
                    Need help?{" "}
                    <a
                      href="#"
                      className="text-[#335441] hover:text-[#46704A] font-medium"
                    >
                      Contact support
                    </a>
                  </p>
                  <p className="text-sm text-[#6B8F60]">
                    Want to update your profile?{" "}
                    <Link
                      to="#"
                      className="text-[#335441] hover:text-[#46704A] font-medium"
                    >
                      Go to Settings
                    </Link>
                  </p>
                </div>
              </div>
            </>
          )}

          {status === "VERIFICATION_ERROR" && (
            <>
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-semibold text-[#335441]">
                  Email Verification Failed
                </h2>
                <p className="mt-2 text-sm text-[#6B8F60]">
                  We're sorry, but we couldn't verify your email address. This
                  could be due to an expired or invalid verification link.
                </p>
              </div>

              <div className="space-y-6">
                <div className="rounded-md bg-[#F9F6EE] p-4 border border-[#E4D7B4]">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <HelpCircle
                        className="h-5 w-5 text-[#A9B782]"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-[#335441]">
                        What can you do now?
                      </h3>
                      <div className="mt-2 text-sm text-[#6B8F60]">
                        <ul className="list-disc pl-5 space-y-1">
                          <li>
                            Try signing up again with the same email address
                          </li>
                          <li>
                            Check if you have typed your email correctly during
                            sign-up
                          </li>
                          <li>Contact our support team for assistance</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <p className="text-sm text-[#6B8F60]">
                    Need help?{" "}
                    <Link
                      to="#"
                      className="text-[#335441] hover:text-[#46704A] font-medium"
                    >
                      Contact support
                    </Link>
                  </p>
                </div>

                <Button
                  className="w-full bg-[#335441] hover:bg-[#46704A] text-white py-2 h-11"
                  asChild
                >
                  <Link to="/SignUp">
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Back to Sign Up
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default VerificationStatus;
