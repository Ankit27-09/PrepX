import { Button } from "@/components/ui/button";
import { Link2, Mail, ArrowRight, Clock } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { z } from "zod";

export const emailSchema = z
  .string()
  .email("Please provide a valid email address");

const VerificationEmailSent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const email = queryParams.get("email");

  useEffect(() => {
    const result = emailSchema.safeParse(email);

    if (!result.success) {
      navigate("/");
    }
  }, [email, navigate]);

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F6EE] to-[#EFE7D4] flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border-2 border-[#E4D7B4]">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="p-2 bg-[#335441] rounded-xl">
              <Link2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-[#335441]">PrepX</span>
          </div>
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#F9F6EE] mb-4">
            <Mail className="h-8 w-8 text-[#335441]" />
          </div>
          <h2 className="text-2xl font-semibold text-[#335441]">
            Verification Email Sent
          </h2>
          <p className="mt-2 text-sm text-[#6B8F60]">
            We've sent a verification email to your registered email address.
            Please check your inbox and follow the instructions to verify your
            account.
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-md bg-[#F9F6EE] p-4 border border-[#E4D7B4]">
            <div className="flex">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5 text-[#46704A]" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-[#335441]">
                  Verification link expires in 24 hours
                </h3>
                <div className="mt-2 text-sm text-[#6B8F60]">
                  <p>
                    Please verify your email within 24 hours to ensure account
                    activation.
                  </p>
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
            <Link to="/Login">
              <ArrowRight className="h-5 w-5 mr-2" />
              Back to Login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerificationEmailSent;
