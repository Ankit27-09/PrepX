import { useState, useEffect } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../../config/backendUrl";
import { CheckCircle, XCircle, Award, Shield } from "lucide-react";

interface CertificateDetails {
  studentName: string;
  courseName: string;
  instructorName: string;
  completionDate: string;
  certificateId: string;
  score: number;
  totalMarks: number;
  marksObtained: number;
  issueDate: string;
}

export default function CertificateVerificationPage() {
  const [searchParams] = useSearchParams();
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [details, setDetails] = useState<CertificateDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const certificateId = searchParams.get("id");
  const source = searchParams.get("source");

  useEffect(() => {
    if (certificateId) {
      verifyCertificate();
    } else {
      setError("Certificate ID is required");
      setLoading(false);
    }
  }, [certificateId]);

  const verifyCertificate = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${backendUrl}/api/v1/courses/verify-certificate/${certificateId}`
      );

      if (response.data.success) {
        setIsValid(response.data.isValid);
        if (response.data.isValid) {
          setDetails(response.data.certificateDetails);
        } else {
          setError(response.data.error);
        }
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Failed to verify certificate");
      setIsValid(false);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not from QR code
  if (source !== "qr") {
    return <Navigate to="/404" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F6EE] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 border-2 border-[#E4D7B4]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#335441] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-[#335441] mb-2">
              Verifying Certificate
            </h2>
            <p className="text-[#6B8F60]">
              Please wait while we verify the certificate...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !isValid) {
    return (
      <div className="min-h-screen bg-[#F9F6EE] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 border-2 border-red-300">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-semibold text-red-600 mb-2">
              Invalid Certificate
            </h2>
            <p className="text-[#6B8F60] mb-4">
              {error || "This certificate could not be verified"}
            </p>
            <p className="text-sm text-[#A9B782]">
              Certificate ID: {certificateId}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6EE] py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-green-600 mb-2">
            Certificate Verified
          </h1>
          <p className="text-[#6B8F60] text-lg">
            This certificate has been successfully verified and is authentic
          </p>
        </div>

        {/* Certificate Details */}
        {details && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border-2 border-[#E4D7B4]">
            <h2 className="text-2xl font-semibold text-[#335441] mb-6 pb-4 border-b-2 border-[#E4D7B4]">
              Certificate Details
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B8F60] mb-1">
                    Student Name
                  </label>
                  <p className="text-[#335441] font-semibold text-lg">
                    {details.studentName}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B8F60] mb-1">
                    Course Name
                  </label>
                  <p className="text-[#335441] font-semibold">
                    {details.courseName}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B8F60] mb-1">
                    Instructor
                  </label>
                  <p className="text-[#335441]">{details.instructorName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B8F60] mb-1">
                    Completion Date
                  </label>
                  <p className="text-[#335441]">{details.completionDate}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B8F60] mb-1">
                    Final Score
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="text-3xl font-bold text-green-600">
                      {details.score}%
                    </div>
                    <div className="text-[#6B8F60]">
                      ({details.marksObtained}/{details.totalMarks} marks)
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B8F60] mb-1">
                    Certificate ID
                  </label>
                  <p className="text-[#335441] font-mono text-sm bg-[#F9F6EE] p-3 rounded-lg break-all">
                    {details.certificateId}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B8F60] mb-1">
                    Issue Date
                  </label>
                  <p className="text-[#335441]">{details.issueDate}</p>
                </div>

                <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <Shield className="w-5 h-5" />
                  <span className="font-semibold">Verified & Authentic</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Platform Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[#E4D7B4]">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#335441] to-[#46704A] rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#335441]">PrepX</h3>
              <p className="text-[#6B8F60]">
                Professional Certification Authority
              </p>
              <p className="text-sm text-[#A9B782]">
                Advancing Digital Excellence Through Innovation
              </p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="text-center mt-8">
          <p className="text-sm text-[#A9B782]">
            This verification is valid at the time of scanning. For any
            questions about this certificate, please contact PrepX.
          </p>
        </div>
      </div>
    </div>
  );
}
