import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Link2,
  Lock,
  Eye,
  EyeOff,
  XCircle,
  RefreshCw,
  LogIn,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { resetPassword, verifyResetToken } from "@/api/authService";
import {
  type ResetPasswordFormData,
  resetPasswordSchema,
} from "@/validation/userSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import BarLoader from "react-spinners/BarLoader";

const PasswordResetForm = () => {
  const { resetToken } = useParams();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<string>("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const resetPassword = async () => {
      setStatus("LOADING");
      try {
        const response = await verifyResetToken(resetToken);

        if (response.data.success) {
          if (response.data.Code === "INVALID_TOKEN")
            setStatus("INVALID_TOKEN");
          else setStatus("VALID_TOKEN");
        }
      } catch (error) {
        console.log(error);
      }
    };
    resetPassword();
  }, [resetToken]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      const response = await resetPassword(data, resetToken);

      if (response.data.success && response.data.Code === "RESET_SUCCESSFUL")
        setStatus("RESET_SUCCESSFUL");
    } catch (error) {
      console.log(error);
    }
  };

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
        </div>

        {status === "LOADING" && (
          <>
            {" "}
            <div className="flex flex-col justify-center items-center gap-5">
              <BarLoader color="#335441" />
              <span className="animate-fadeblink text-[#335441]">
                Verifying...
              </span>
            </div>
          </>
        )}

        {status === "INVALID_TOKEN" && (
          <>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-semibold text-[#335441]">
                Invalid Reset Link
              </h2>
              <p className="mt-2 text-sm text-[#6B8F60]">
                The password reset link you clicked is invalid. It may have been
                used already, expired or is malformed.
              </p>
            </div>

            <div className="space-y-6">
              <Button
                className="w-full bg-[#335441] hover:bg-[#46704A] text-white py-2 h-11"
                asChild
              >
                <Link to="/forgot-password">
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Request New Reset Link
                </Link>
              </Button>

              <div className="text-center space-y-4">
                <p className="text-sm text-[#6B8F60]">
                  Remember your password?{" "}
                  <Link
                    to="/Login"
                    className="text-[#335441] hover:text-[#46704A] font-medium"
                  >
                    Sign in
                  </Link>
                </p>
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
            </div>
          </>
        )}

        {status === "VALID_TOKEN" && (
          <>
            <div className="text-center">
              <h2 className="mt-6 text-2xl font-semibold text-[#335441]">
                Reset Your Password
              </h2>
              <p className="mt-2 text-sm text-[#6B8F60]">
                Enter your new password below.
              </p>
            </div>

            <div className="space-y-6">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
                noValidate
              >
                <div className="space-y-2">
                  <label htmlFor="password" className="sr-only">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border-2 border-[#E4D7B4] placeholder-[#A9B782] text-[#335441] focus:outline-none focus:ring-2 focus:ring-[#335441] focus:border-[#335441] focus:z-10 sm:text-sm"
                      placeholder="Enter your new password"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-[#6B8F60]" />
                      ) : (
                        <Eye className="h-5 w-5 text-[#6B8F60]" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="sr-only">
                    Confirm New Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border-2 border-[#E4D7B4] placeholder-[#A9B782] text-[#335441] focus:outline-none focus:ring-2 focus:ring-[#335441] focus:border-[#335441] focus:z-10 sm:text-sm"
                    placeholder="Confirm your new password"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#335441] hover:bg-[#46704A] text-white py-2 h-11"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}{" "}
                  <Lock className="h-5 w-5 mr-2" /> Reset Password
                </Button>
              </form>

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

                <Link
                  to="/Login"
                  className="inline-flex items-center text-sm text-[#335441] hover:text-[#46704A] font-medium"
                >
                  Back to Sign in
                </Link>
              </div>
            </div>
          </>
        )}

        {status === "RESET_SUCCESSFUL" && (
          <>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#F9F6EE] mb-4">
                <CheckCircle className="h-8 w-8 text-[#46704A]" />
              </div>
              <h2 className="text-2xl font-semibold text-[#335441]">
                Password Changed Successfully
              </h2>
              <p className="mt-2 text-sm text-[#6B8F60]">
                Your password has been successfully updated. You can now log in
                with your new password.
              </p>
            </div>

            <div className="space-y-6">
              <Button
                className="w-full bg-[#335441] hover:bg-[#46704A] text-white py-2 h-11"
                asChild
              >
                <Link to="/Login">
                  <LogIn className="h-5 w-5 mr-2" />
                  Log In
                </Link>
              </Button>

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
                <p className="text-sm text-[#6B8F60]">
                  Back to{" "}
                  <Link
                    to="/"
                    className="text-[#335441] hover:text-[#46704A] font-medium"
                  >
                    Home
                  </Link>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PasswordResetForm;
