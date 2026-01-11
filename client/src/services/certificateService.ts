import jsPDF from "jspdf";
import QRCode from "qrcode";

interface CertificateData {
  studentName: string;
  courseName: string;
  instructorName: string;
  completionDate: string;
  certificateId: string;
  score: number;
  totalMarks: number;
  marksObtained: number;
}

export class CertificateGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;

  constructor() {
    this.doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  async generateCertificate(data: CertificateData): Promise<Blob> {
    try {
      console.log("🏆 Generating certificate:", data);

      // Background - cream color matching theme
      this.doc.setFillColor(249, 246, 238); // #F9F6EE
      this.doc.rect(0, 0, this.pageWidth, this.pageHeight, "F");

      this.addBorder();
      this.addHeader();
      this.addContent(data);
      this.addFooter(data);
      await this.addQRCode(data.certificateId);

      console.log("✅ Certificate generated successfully");
      return this.doc.output("blob");
    } catch (error) {
      console.error("❌ Error generating certificate:", error);
      throw new Error("Failed to generate certificate");
    }
  }

  private addBorder(): void {
    // Outer border - dark green
    this.doc.setDrawColor(51, 84, 65); // #335441
    this.doc.setLineWidth(0.8);
    this.doc.rect(20, 15, this.pageWidth - 40, this.pageHeight - 30);

    // Inner border - gold accent
    this.doc.setDrawColor(228, 215, 180); // #E4D7B4
    this.doc.setLineWidth(0.3);
    this.doc.rect(22, 17, this.pageWidth - 44, this.pageHeight - 34);
  }

  private addHeader(): void {
    const centerX = this.pageWidth / 2;

    // App name
    this.doc.setTextColor(51, 84, 65); // #335441
    this.doc.setFontSize(18);
    this.doc.setFont("times", "bold");
    this.doc.text("PrepX", centerX, 35, { align: "center" });

    this.doc.setFontSize(10);
    this.doc.setFont("times", "normal");
    this.doc.text("Professional Learning Platform", centerX, 42, {
      align: "center",
    });
  }

  private addContent(data: CertificateData): void {
    const centerX = this.pageWidth / 2;

    // Certificate title
    this.doc.setTextColor(51, 84, 65); // #335441
    this.doc.setFontSize(48);
    this.doc.setFont("times", "bold");
    this.doc.text("Certificate", centerX, 70, { align: "center" });

    this.doc.setFontSize(24);
    this.doc.setFont("times", "normal");
    this.doc.text("of Achievement", centerX, 85, { align: "center" });

    // Decorative line
    this.doc.setDrawColor(107, 143, 96); // #6B8F60
    this.doc.setLineWidth(1);
    this.doc.line(centerX - 60, 95, centerX + 60, 95);

    // Certificate text
    this.doc.setTextColor(70, 112, 74); // #46704A
    this.doc.setFontSize(14);
    this.doc.setFont("times", "normal");
    this.doc.text("This is to certify that", centerX, 105, { align: "center" });

    // Student name
    this.doc.setTextColor(51, 84, 65); // #335441
    this.doc.setFontSize(32);
    this.doc.setFont("times", "bold");
    this.doc.text(data.studentName, centerX, 120, { align: "center" });

    // Completion text
    this.doc.setTextColor(70, 112, 74); // #46704A
    this.doc.setFontSize(14);
    this.doc.setFont("times", "normal");
    this.doc.text("has successfully completed the course", centerX, 130, {
      align: "center",
    });

    // Course name
    this.doc.setTextColor(51, 84, 65); // #335441
    this.doc.setFontSize(18);
    this.doc.setFont("times", "italic");

    const maxWidth = this.pageWidth - 100;
    const lines = this.doc.splitTextToSize(`"${data.courseName}"`, maxWidth);

    const courseStartY = 140;
    for (let i = 0; i < Math.min(lines.length, 2); i++) {
      this.doc.text(lines[i], centerX, courseStartY + i * 12, {
        align: "center",
      });
    }

    // Score
    this.doc.setTextColor(107, 143, 96); // #6B8F60
    this.doc.setFontSize(12);
    this.doc.setFont("times", "normal");
    this.doc.text(
      `Score: ${data.score}% (${data.marksObtained}/${data.totalMarks})`,
      centerX,
      160,
      { align: "center" }
    );
  }

  private addFooter(data: CertificateData): void {
    const footerY = this.pageHeight - 45;

    // Date
    this.doc.setTextColor(107, 143, 96); // #6B8F60
    this.doc.setFontSize(10);
    this.doc.setFont("times", "normal");
    this.doc.text("Date of Completion", 50, footerY + 10);

    this.doc.setTextColor(51, 84, 65); // #335441
    this.doc.setFontSize(12);
    this.doc.setFont("times", "bold");
    this.doc.text(data.completionDate, 50, footerY + 18);

    // Signature line
    this.doc.setTextColor(51, 84, 65); // #335441
    this.doc.setFontSize(12);
    this.doc.setFont("times", "bold");
    this.doc.text("Authorized Signature", this.pageWidth - 70, footerY + 18, {
      align: "center",
    });

    // Signature line
    this.doc.setDrawColor(107, 143, 96); // #6B8F60
    this.doc.setLineWidth(0.5);
    this.doc.line(
      this.pageWidth - 95,
      footerY + 15,
      this.pageWidth - 45,
      footerY + 15
    );
  }

  private async addQRCode(certificateId: string): Promise<void> {
    try {
      const qrSize = 18;
      const qrX = this.pageWidth - 45;
      const qrY = this.pageHeight - 185;

      const verificationUrl = `${window.location.origin}/verify-certificate?id=${certificateId}&source=qr`;

      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 256,
        margin: 1,
        color: {
          dark: "#335441",
          light: "#F9F6EE",
        },
      });

      this.doc.addImage(qrCodeDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

      this.doc.setTextColor(107, 143, 96); // #6B8F60
      this.doc.setFontSize(7);
      this.doc.setFont("times", "normal");
      this.doc.text("Verify", qrX + qrSize / 2, qrY + qrSize + 3, {
        align: "center",
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  }

  downloadCertificate(blob: Blob, filename: string): void {
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("❌ Download failed:", error);
      throw error;
    }
  }
}

export const generateAndDownloadCertificate = async (
  data: CertificateData
): Promise<void> => {
  try {
    console.log("🏆 Starting certificate generation with data:", data);

    const generator = new CertificateGenerator();
    const blob = await generator.generateCertificate(data);

    const filename = `${data.studentName.replace(/\s+/g, "_")}_Certificate_${
      data.certificateId
    }.pdf`;
    generator.downloadCertificate(blob, filename);

    console.log("✅ Certificate download initiated");
  } catch (error) {
    console.error("❌ Certificate generation failed:", error);
    throw error;
  }
};
