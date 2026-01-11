import { Router } from "express";
import passport from "passport";
import {
  getCourses,
  getCourse,
  generateOutline,
  createCourse,
  generateChapterContent,
  toggleBookmark,
  enrollCourse,
  unenrollCourse,
  updateChapterProgress,
  updateCourse,
  deleteCourse,
  optionalAuth,
  getUserTests,
  generateTest,
  submitTest,
  getCertificateData,
  verifyCertificate,
} from "./courseController";

const router = Router();

// Middleware for authentication with error handling
const authenticateToken = (req: any, res: any, next: any) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (err: any, user: any, info: any) => {
      if (err) {
        console.error("🔴 Passport error:", err);
        return res.status(500).json({ error: "Authentication error" });
      }
      if (!user) {
        console.error("🔴 No user found. Info:", info);
        return res.status(401).json({
          error: "Unauthorized",
          details: info?.message || "Invalid token",
        });
      }
      req.user = user;
      next();
    }
  )(req, res, next);
};

// Public routes (with optional auth)
router.get("/", optionalAuth as any, getCourses as any);
router.get("/:id", optionalAuth as any, getCourse as any);

// Protected routes (require authentication)
router.post("/generate-outline", authenticateToken, generateOutline as any);
router.post("/", authenticateToken, createCourse as any);
router.post(
  "/:courseId/chapters/:chapterId/generate-content",
  authenticateToken,
  generateChapterContent as any
);
router.post("/:id/bookmark", authenticateToken, toggleBookmark as any);
router.post("/:id/enroll", authenticateToken, enrollCourse as any);
router.delete("/:id/enroll", authenticateToken, unenrollCourse as any);
router.post(
  "/:courseId/chapters/:chapterId/progress",
  authenticateToken,
  updateChapterProgress as any
);
router.put("/:id", authenticateToken, updateCourse as any);
router.delete("/:id", authenticateToken, deleteCourse as any);

// Test routes
router.get("/:courseId/tests", authenticateToken, getUserTests as any);
router.post("/:courseId/test/generate", authenticateToken, generateTest as any);
router.post(
  "/:courseId/test/:testId/submit",
  authenticateToken,
  submitTest as any
);
router.get(
  "/:courseId/test/:testId/certificate",
  authenticateToken,
  getCertificateData as any
);

// Public certificate verification
router.get("/verify-certificate/:certificateId", verifyCertificate as any);

export default router;
