import { Request, Response, NextFunction } from "express";
import { prisma } from "../client";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Extend Express Request to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username?: string;
    email?: string;
  };
}

// Enhanced prompts for course generation (from Edulume)
const COURSE_OUTLINE_PROMPT = (topic: string) => `
Create a comprehensive course outline for "${topic}". This should be a well-structured, progressive learning path that takes students from basic concepts to advanced applications.

Respond with a JSON object ONLY. DO NOT include any other text, explanations, or introductions. Follow this exact structure:

{
  "title": "Course title that clearly describes what students will learn",
  "description": "A comprehensive 2-3 sentence description explaining what this course covers, who it's for, and what students will achieve by the end",
  "chapters": [
    {
      "title": "Chapter title that clearly indicates the learning objective",
      "description": "Brief 1-2 sentence description of what will be covered in this chapter and why it's important",
      "order_index": chapter number (starting from 1)
    }
  ]
}

Requirements for the course outline:
1. Create 8-12 chapters for comprehensive coverage
2. Structure should be logical and progressive (basic → intermediate → advanced)
3. Each chapter should build upon previous knowledge
4. Include both theoretical concepts and practical applications
5. Cover real-world use cases and examples
6. Include best practices and common pitfalls
7. End with advanced topics or specializations
8. Ensure the course is practical and applicable

Make sure the course is comprehensive, engaging, and provides real value to learners.
`;

const CHAPTER_CONTENT_PROMPT = (
  chapterTitle: string,
  courseTitle: string,
  chapterDescription: string
) => `
Generate comprehensive, educational content for the chapter "${chapterTitle}" which is part of the course "${courseTitle}".

Chapter Description: ${chapterDescription}

Create detailed, well-structured content that includes:

## Learning Objectives
- Clear, specific objectives for what students will learn
- Measurable outcomes they should achieve

## Core Concepts
- Detailed explanations of key concepts
- Clear definitions and terminology
- Why these concepts matter

## Detailed Content
- Step-by-step explanations
- Multiple examples and use cases
- Practical applications
- Code examples (if applicable)
- Diagrams or visual descriptions (describe what should be shown)

## Practical Examples
- Real-world scenarios
- Hands-on exercises or projects
- Common use cases and implementations

## Best Practices
- Industry standards and recommendations
- Common mistakes to avoid
- Tips for success

## Key Takeaways
- Summary of the most important points
- What students should remember
- How this connects to the next chapter

## Further Reading
- Suggested resources for deeper learning
- Related topics to explore

Format the content using proper Markdown:
- Use ## for main sections
- Use ### for subsections  
- Use bullet points for lists
- Use code blocks for examples (if applicable)
- Use **bold** and *italic* for emphasis
- Use > for important quotes or notes

The content should be:
- Comprehensive yet easy to understand
- Engaging and practical
- Well-organized with clear structure
- Suitable for learners at the appropriate level
- Rich with examples and real-world applications
- Professional and educational in tone

Aim for substantial content that provides real value and learning.
`;

// Optional auth middleware
const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = undefined;
      return next();
    }

    const token = authHeader.substring(7);
    if (!token) {
      req.user = undefined;
      return next();
    }

    const jwt = await import("jsonwebtoken");
    const decoded = jwt.default.verify(
      token,
      process.env.ACCESS_JWT_SECRET!
    ) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, email: true },
    });

    req.user = user || undefined;
    next();
  } catch (error) {
    req.user = undefined;
    next();
  }
};

// Get all courses with filters
export const getCourses = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const {
      search,
      filter = "all",
      sort = "recent",
      page = 1,
      limit = 12,
    } = req.query;

    const userId = req.user?.id;
    let where: any = {};

    if (filter === "my-courses" && userId) {
      where.authorId = userId;
    } else if (filter === "bookmarked" && userId) {
      where.bookmarks = { some: { userId } };
    } else if (filter === "enrolled" && userId) {
      where.enrollments = { some: { userId } };
    } else {
      where.OR = [
        { isPublic: true },
        ...(userId ? [{ authorId: userId }] : []),
      ];
    }

    if (search) {
      const searchConditions = [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
        { topic: { contains: search as string, mode: "insensitive" } },
      ];

      if (where.authorId || where.bookmarks || where.enrollments) {
        where.AND = [
          where.authorId
            ? { authorId: where.authorId }
            : where.bookmarks
            ? { bookmarks: where.bookmarks }
            : { enrollments: where.enrollments },
          { OR: searchConditions },
        ];
        delete where.authorId;
        delete where.bookmarks;
        delete where.enrollments;
      } else {
        where.AND = [
          { OR: where.OR || [{ isPublic: true }] },
          { OR: searchConditions },
        ];
        delete where.OR;
      }
    }

    let orderBy: any = {};
    switch (sort) {
      case "popular":
        orderBy = [{ views: "desc" }, { createdAt: "desc" }];
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          chapters: { select: { id: true } },
          bookmarks: userId
            ? { where: { userId }, select: { id: true } }
            : { select: { id: true }, take: 0 },
          enrollments: userId
            ? { where: { userId }, select: { id: true } }
            : { select: { id: true }, take: 0 },
          _count: { select: { bookmarks: true, enrollments: true } },
        },
        orderBy,
        skip,
        take,
      }),
      prisma.course.count({ where }),
    ]);

    const transformedCourses = courses.map((course: any) => ({
      ...course,
      chapter_count: course.chapters.length,
      bookmark_count: course._count.bookmarks,
      enrollment_count: course._count.enrollments,
      is_bookmarked: userId ? course.bookmarks.length > 0 : false,
      is_enrolled: userId ? course.enrollments.length > 0 : false,
    }));

    res.json({
      courses: transformedCourses,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

// Get single course
export const getCourse = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        chapters: {
          orderBy: { orderIndex: "asc" },
          include: userId
            ? {
                progress: {
                  where: { userId },
                  select: { isCompleted: true, completedAt: true },
                },
              }
            : {},
        },
        bookmarks: userId
          ? { where: { userId }, select: { id: true } }
          : { select: { id: true }, take: 0 },
        enrollments: userId
          ? {
              where: { userId },
              select: {
                id: true,
                enrolledAt: true,
                isCompleted: true,
                completedAt: true,
                progressPercentage: true,
                lastAccessedAt: true,
              },
            }
          : { select: { id: true }, take: 0 },
        _count: { select: { bookmarks: true, enrollments: true } },
      },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (!course.isPublic && course.authorId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    await prisma.course.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    if (userId && course.enrollments.length > 0) {
      await prisma.courseEnrollment.update({
        where: { courseId_userId: { courseId: id, userId } },
        data: { lastAccessedAt: new Date() },
      });
    }

    const transformedChapters = course.chapters?.map((chapter: any) => ({
      ...chapter,
      isCompleted:
        (chapter.progress && chapter.progress[0]?.isCompleted) || false,
      completedAt:
        (chapter.progress && chapter.progress[0]?.completedAt) || null,
    }));

    const courseDetails = {
      ...course,
      chapter_count: course.chapters.length,
      bookmark_count: course._count.bookmarks,
      enrollment_count: course._count.enrollments,
      is_bookmarked: userId ? course.bookmarks.length > 0 : false,
      is_enrolled: userId ? course.enrollments.length > 0 : false,
      enrollment_data:
        userId && course.enrollments.length > 0 ? course.enrollments[0] : null,
      chapters: transformedChapters,
    };

    res.json({ course: courseDetails });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ error: "Failed to fetch course" });
  }
};

// Generate course outline
export const generateOutline = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    console.log("🔍 Generate outline request received");
    console.log("User:", req.user);
    console.log("Headers:", req.headers.authorization);

    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: COURSE_OUTLINE_PROMPT(topic) }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content generated");
    }

    const outline = JSON.parse(content);
    res.json(outline);
  } catch (error: any) {
    console.error("Error generating course outline:", error);
    res.status(500).json({
      error: "Failed to generate course outline",
      details: error.message,
    });
  }
};

// Create course
export const createCourse = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { title, description, topic, chapters, isPublic = true } = req.body;

    if (
      !title ||
      !description ||
      !topic ||
      !chapters ||
      !Array.isArray(chapters)
    ) {
      return res.status(400).json({
        error: "Title, description, topic, and chapters are required",
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        topic,
        authorId: req.user.id,
        isPublic,
        chapters: {
          create: chapters.map((chapter: any, index: number) => ({
            title: chapter.title,
            description: chapter.description,
            orderIndex: chapter.order_index || index + 1,
          })),
        },
      },
      include: { chapters: { orderBy: { orderIndex: "asc" } } },
    });

    res
      .status(201)
      .json({ id: course.id, message: "Course created successfully", course });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ error: "Failed to create course" });
  }
};

// Generate chapter content
export const generateChapterContent = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { courseId, chapterId } = req.params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { chapters: { where: { id: chapterId } } },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (!req.user?.id || course.authorId !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const chapter = course.chapters[0];
    if (!chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: CHAPTER_CONTENT_PROMPT(
            chapter.title,
            course.title,
            chapter.description
          ),
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 32768,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content generated");
    }

    const updatedChapter = await prisma.courseChapter.update({
      where: { id: chapterId },
      data: { content },
    });

    res.json({
      message: "Chapter content generated successfully",
      content,
      chapter: updatedChapter,
    });
  } catch (error: any) {
    console.error("Error generating chapter content:", error);
    res.status(500).json({
      error: "Failed to generate chapter content",
      details: error.message,
    });
  }
};

// Toggle bookmark
export const toggleBookmark = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = req.user.id;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const existingBookmark = await prisma.courseBookmark.findFirst({
      where: { courseId: id, userId },
    });

    if (existingBookmark) {
      await prisma.courseBookmark.delete({
        where: { id: existingBookmark.id },
      });
      res.json({ message: "Course unbookmarked", bookmarked: false });
    } else {
      await prisma.courseBookmark.create({ data: { courseId: id, userId } });
      res.json({ message: "Course bookmarked", bookmarked: true });
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    res.status(500).json({ error: "Failed to toggle bookmark" });
  }
};

// Enroll in course
export const enrollCourse = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = req.user.id;

    const course = await prisma.course.findUnique({
      where: { id },
      include: { chapters: { select: { id: true } } },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (!course.isPublic && course.authorId !== userId) {
      return res
        .status(403)
        .json({ error: "Course is not available for enrollment" });
    }

    const existingEnrollment = await prisma.courseEnrollment.findFirst({
      where: { courseId: id, userId },
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: "Already enrolled in this course" });
    }

    const enrollment = await prisma.courseEnrollment.create({
      data: { courseId: id, userId, lastAccessedAt: new Date() },
    });

    res.json({
      message: "Successfully enrolled in course",
      enrollment: {
        id: enrollment.id,
        enrolledAt: enrollment.enrolledAt,
        isCompleted: enrollment.isCompleted,
        progressPercentage: enrollment.progressPercentage,
      },
    });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    res.status(500).json({ error: "Failed to enroll in course" });
  }
};

// Unenroll from course
export const unenrollCourse = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = req.user.id;

    const enrollment = await prisma.courseEnrollment.findFirst({
      where: { courseId: id, userId },
    });

    if (!enrollment) {
      return res.status(404).json({ error: "Not enrolled in this course" });
    }

    await prisma.$transaction([
      prisma.chapterProgress.deleteMany({
        where: { userId, chapter: { courseId: id } },
      }),
      prisma.courseEnrollment.delete({ where: { id: enrollment.id } }),
    ]);

    res.json({ message: "Successfully unenrolled from course" });
  } catch (error) {
    console.error("Error unenrolling from course:", error);
    res.status(500).json({ error: "Failed to unenroll from course" });
  }
};

// Update chapter progress
export const updateChapterProgress = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { courseId, chapterId } = req.params;
    const { isCompleted } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = req.user.id;

    const enrollment = await prisma.courseEnrollment.findFirst({
      where: { courseId, userId },
    });

    if (!enrollment) {
      return res
        .status(403)
        .json({ error: "Must be enrolled in course to track progress" });
    }

    const chapter = await prisma.courseChapter.findFirst({
      where: { id: chapterId, courseId },
    });

    if (!chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }

    const progress = await prisma.chapterProgress.upsert({
      where: { chapterId_userId: { chapterId, userId } },
      update: { isCompleted, completedAt: isCompleted ? new Date() : null },
      create: {
        chapterId,
        userId,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    const allChapters = await prisma.courseChapter.findMany({
      where: { courseId },
      select: { id: true },
    });

    const completedChapters = await prisma.chapterProgress.count({
      where: { userId, isCompleted: true, chapter: { courseId } },
    });

    const progressPercentage = Math.round(
      (completedChapters / allChapters.length) * 100
    );
    const isCourseCompleted = progressPercentage === 100;

    await prisma.courseEnrollment.update({
      where: { id: enrollment.id },
      data: {
        progressPercentage,
        isCompleted: isCourseCompleted,
        completedAt:
          isCourseCompleted && !enrollment.completedAt
            ? new Date()
            : enrollment.completedAt,
        lastAccessedAt: new Date(),
      },
    });

    res.json({
      message: "Progress updated successfully",
      progress: {
        isCompleted: progress.isCompleted,
        completedAt: progress.completedAt,
        progressPercentage,
      },
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({ error: "Failed to update progress" });
  }
};

// Update course
export const updateCourse = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const { title, description, topic, isPublic } = req.body;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (!req.user?.id || course.authorId !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(topic && { topic }),
        ...(typeof isPublic === "boolean" && { isPublic }),
      },
    });

    res.json({ message: "Course updated successfully", course: updatedCourse });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ error: "Failed to update course" });
  }
};

// Delete course
export const deleteCourse = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (!req.user?.id || course.authorId !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    await prisma.course.delete({ where: { id } });
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ error: "Failed to delete course" });
  }
};

// Get user's tests for a course
export const getUserTests = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Check access
    const hasAccess =
      course.authorId === userId ||
      (await prisma.courseEnrollment.findFirst({
        where: { courseId, userId },
      }));

    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    const tests = await prisma.courseTest.findMany({
      where: { courseId, userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        score: true,
        hasPassed: true,
        marksObtained: true,
        totalMarks: true,
        createdAt: true,
        submittedAt: true,
        questions: true,
        testInstructions: true,
        timeLimit: true,
        passingScore: true,
        evaluationResults: true,
      },
    });

    // Parse evaluationResults for completed tests
    const testsWithEvaluations = tests.map((test) => ({
      ...test,
      evaluations:
        test.status === "completed" && test.evaluationResults
          ? JSON.parse(test.evaluationResults)
          : null,
    }));

    res.json({ success: true, tests: testsWithEvaluations });
  } catch (error) {
    console.error("Error fetching tests:", error);
    res.status(500).json({ error: "Failed to fetch tests" });
  }
};

// Generate test for a course
export const generateTest = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          where: { content: { not: null } },
          select: { title: true, content: true },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Check access
    const hasAccess =
      course.authorId === userId ||
      (await prisma.courseEnrollment.findFirst({
        where: { courseId, userId },
      }));

    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (course.chapters.length === 0) {
      return res
        .status(400)
        .json({ error: "Course has no content for test generation" });
    }

    // Check cooldown (24 hours)
    const existingTests = await prisma.courseTest.findMany({
      where: { courseId, userId },
      orderBy: { createdAt: "desc" },
    });

    if (existingTests.length > 0) {
      const latestTest = existingTests[0];
      const now = new Date();
      const testCreatedAt = new Date(latestTest.createdAt);
      const hoursDifference =
        (now.getTime() - testCreatedAt.getTime()) / (1000 * 60 * 60);
      const cooldownHours = 24;

      if (hoursDifference < cooldownHours) {
        const remainingHours = cooldownHours - hoursDifference;
        return res.status(429).json({
          error: "Test cooldown active",
          message: `You must wait ${Math.ceil(
            remainingHours
          )} hours before generating a new test`,
          cooldown: {
            isActive: true,
            remainingHours: Math.ceil(remainingHours),
            nextAvailableAt: new Date(
              testCreatedAt.getTime() + cooldownHours * 60 * 60 * 1000
            ).toISOString(),
          },
          tests: existingTests.map((t) => ({
            id: t.id,
            status: t.status,
            score: t.score,
            hasPassed: t.hasPassed,
            createdAt: t.createdAt,
          })),
        });
      }

      // Check for in-progress test
      const inProgressTest = existingTests.find(
        (t) => t.status === "in_progress"
      );
      if (inProgressTest) {
        return res.json({
          success: true,
          message: "You have an in-progress test",
          test: {
            id: inProgressTest.id,
            questions: JSON.parse(inProgressTest.questions),
            testInstructions: JSON.parse(inProgressTest.testInstructions),
            timeLimit: inProgressTest.timeLimit,
            passingScore: inProgressTest.passingScore,
            totalMarks: inProgressTest.totalMarks,
            status: inProgressTest.status,
            createdAt: inProgressTest.createdAt,
          },
        });
      }
    }

    // Generate test with AI
    const courseContent = course.chapters
      .map((ch) => `Chapter: ${ch.title}\n${ch.content}`)
      .join("\n\n");

    const testPrompt = `CRITICAL: You must respond with VALID JSON ONLY. No markdown, no explanations, no additional text.

You are a professional assessment specialist. Create a comprehensive certification test for the course "${
      course.title
    }" based on the provided course content.

Course: ${course.title}
Chapter Titles: ${course.chapters.map((ch: any) => ch.title).join(", ")}
Course Content:
${courseContent.substring(0, 10000)}

Create 15-20 questions with mixed question types based on the course content:
- Multiple Choice Questions (MCQ): Use EXACT type "mcq"
- True/False Questions: Use EXACT type "true_false"
- Short Answer Questions: Use EXACT type "short_answer"
- Coding/Practical Questions: Use EXACT type "coding"
- Situational Questions: Use EXACT type "situational"

Each question must have specific mark weightage (3-10 marks based on complexity). Total marks should be around 100.

FOR MCQ QUESTIONS:
- MUST provide exactly 4 meaningful options
- correctAnswer MUST be a number (0-3)
- Options should be course-specific

FOR TRUE_FALSE QUESTIONS:
- MUST provide exactly ["True", "False"] as options
- correctAnswer MUST be 0 (for True) or 1 (for False)

FOR OTHER QUESTION TYPES:
- Do NOT include options array or set it to empty array
- Provide detailed sampleAnswer
- Set correctAnswer to null

RESPOND WITH THIS EXACT JSON FORMAT ONLY (NO TRAILING COMMAS):
{
  "questions": [
    {
      "type": "mcq",
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "keyPoints": ["Key point 1", "Key point 2"],
      "sampleAnswer": "Sample correct answer",
      "explanation": "Explanation of correct answer",
      "marks": 5,
      "difficulty": "easy",
      "topic": "Relevant course topic"
    }
  ]
}

Requirements:
- 15-20 questions (flexible)
- Total marks around 100
- Valid JSON only - NO markdown, NO comments, NO trailing commas
- Cover all major course topics
- Mix difficulty levels appropriately`;

    console.log("🤖 Calling Groq API for test generation...");

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a professional assessment specialist. You MUST respond with valid JSON only. No markdown formatting, no code blocks, no explanations - just pure JSON. Ensure NO trailing commas in your JSON.",
        },
        { role: "user", content: testPrompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 32000,
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    console.log("🔍 Raw AI response length:", aiResponse.length);

    let testData;

    // Try to parse with cleanup
    try {
      // Remove markdown and trailing commas
      let cleanedResponse = aiResponse
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .replace(/^[^{]*/, "")
        .replace(/[^}]*$/, "")
        .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
        .trim();

      testData = JSON.parse(cleanedResponse);
      console.log("✅ JSON parse successful");
    } catch (error) {
      console.log("❌ JSON parse failed, using fallback test");

      // Generate fallback test
      const courseTopics = course.chapters
        .map((ch: any) => ch.title)
        .slice(0, 5);
      const fallbackQuestions = [];

      for (let i = 0; i < 15; i++) {
        const topicIndex = i % courseTopics.length;
        const topic = courseTopics[topicIndex] || "General";

        if (i % 3 === 0) {
          fallbackQuestions.push({
            type: "mcq",
            question: `What is a key concept related to ${topic}?`,
            options: [
              "Fundamental principles",
              "Advanced techniques",
              "Best practices",
              "All of the above",
            ],
            correctAnswer: 3,
            keyPoints: ["Understanding", topic],
            sampleAnswer: "All aspects are important",
            explanation: `Comprehensive understanding requires all areas`,
            marks: 5,
            difficulty: "medium",
            topic: topic,
          });
        } else if (i % 3 === 1) {
          fallbackQuestions.push({
            type: "true_false",
            question: `${topic} is an important component of this course.`,
            options: ["True", "False"],
            correctAnswer: 0,
            keyPoints: ["Understanding", topic],
            sampleAnswer: "True",
            explanation: `${topic} is indeed important`,
            marks: 5,
            difficulty: "easy",
            topic: topic,
          });
        } else {
          fallbackQuestions.push({
            type: "short_answer",
            question: `Explain the importance of ${topic}.`,
            options: [],
            correctAnswer: null,
            keyPoints: ["Explanation", topic],
            sampleAnswer: `${topic} is crucial for understanding the course material.`,
            explanation: "Students should demonstrate clear understanding",
            marks: 7,
            difficulty: "medium",
            topic: topic,
          });
        }
      }

      testData = { questions: fallbackQuestions };
      console.log("✅ Generated fallback test with 15 questions");
    }

    // Validate questions array exists
    if (!testData.questions || !Array.isArray(testData.questions)) {
      throw new Error("Invalid test structure: questions array missing");
    }

    console.log(`📝 Generated ${testData.questions.length} questions`);

    // Ensure we have at least 10 questions
    if (testData.questions.length < 10) {
      throw new Error("Too few questions generated");
    }

    // Calculate total marks dynamically from questions
    let totalMarks = testData.questions.reduce(
      (sum: number, q: any) => sum + (q.marks || 5),
      0
    );

    console.log(`📊 Initial total marks: ${totalMarks}`);

    // Optionally adjust to target 100 marks (but keep it flexible)
    // If marks are way off (< 50 or > 150), adjust them
    if (totalMarks < 50 || totalMarks > 150) {
      console.log(`⚠️ Adjusting marks from ${totalMarks} to 100`);
      const adjustment = 100 / totalMarks;
      testData.questions.forEach((q: any) => {
        q.marks = Math.round((q.marks || 5) * adjustment);
      });

      // Recalculate
      totalMarks = testData.questions.reduce(
        (sum: number, q: any) => sum + q.marks,
        0
      );

      // Final adjustment to exactly 100
      if (totalMarks !== 100) {
        testData.questions[testData.questions.length - 1].marks +=
          100 - totalMarks;
        totalMarks = 100;
      }
    }

    console.log(
      `✅ Test validated: ${testData.questions.length} questions, ${totalMarks} total marks`
    );

    const testInstructions = {
      duration: 180,
      totalQuestions: testData.questions.length,
      totalMarks: totalMarks,
      passingScore: 80,
      instructions: [
        "Read each question carefully before answering.",
        "You have 180 minutes (3 hours) to complete the test.",
        "All questions are mandatory.",
        "Questions include multiple choice, true/false, short answer, coding, and situational types.",
        "Each question has specific marks as indicated.",
        "You need to score at least 80% to pass and receive a certificate.",
        "The test will be automatically submitted when time expires.",
      ],
    };

    const test = await prisma.courseTest.create({
      data: {
        courseId,
        userId,
        questions: JSON.stringify(testData.questions),
        testInstructions: JSON.stringify(testInstructions),
        timeLimit: 180,
        passingScore: 80,
        totalMarks: totalMarks,
        status: "in_progress",
      },
    });

    res.json({
      success: true,
      message: "Test generated successfully",
      test: {
        id: test.id,
        questions: testData.questions,
        testInstructions,
        timeLimit: test.timeLimit,
        passingScore: test.passingScore,
        totalMarks: test.totalMarks,
        createdAt: test.createdAt,
      },
    });
  } catch (error) {
    console.error("Error generating test:", error);
    res.status(500).json({ error: "Failed to generate test" });
  }
};

// Submit test answers
export const submitTest = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { courseId, testId } = req.params;
    const { answers } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const test = await prisma.courseTest.findFirst({
      where: { id: testId, courseId, userId },
    });

    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    if (test.status === "completed") {
      return res.status(400).json({ error: "Test already submitted" });
    }

    const questions = JSON.parse(test.questions);

    // Evaluate with AI
    const evaluationPrompt = `Evaluate these test answers and provide detailed feedback.

Questions and Answers:
${questions
  .map(
    (q: any, i: number) => `
Q${i + 1} [${q.marks} marks] (${q.type}): ${q.question}
${
  q.type === "mcq" || q.type === "true_false"
    ? `Options: ${q.options.join(", ")}\nCorrect: ${q.options[q.correctAnswer]}`
    : ""
}
Student Answer: ${answers[i] || "No answer"}
Sample Answer: ${q.sampleAnswer}
Key Points: ${q.keyPoints.join(", ")}
`
  )
  .join("\n")}

Respond with ONLY valid JSON:
{
  "evaluations": [
    {
      "questionIndex": 0,
      "isCorrect": true,
      "marksAwarded": 5,
      "feedback": "Detailed feedback",
      "strengths": ["point1"],
      "improvements": ["point1"]
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a fair evaluator. Respond with valid JSON only.",
        },
        { role: "user", content: evaluationPrompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 16000,
      response_format: { type: "json_object" },
    });

    const evalResponse = completion.choices[0]?.message?.content;
    if (!evalResponse) {
      throw new Error("No evaluation response");
    }

    const evaluationData = JSON.parse(evalResponse);
    const marksObtained = evaluationData.evaluations.reduce(
      (sum: number, e: any) => sum + (e.marksAwarded || 0),
      0
    );
    const score = Math.round((marksObtained / test.totalMarks) * 100);
    const hasPassed = score >= test.passingScore;

    const updatedTest = await prisma.courseTest.update({
      where: { id: testId },
      data: {
        answers: JSON.stringify(answers),
        evaluationResults: JSON.stringify(evaluationData.evaluations),
        marksObtained,
        score,
        hasPassed,
        status: "completed",
        submittedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: "Test submitted successfully",
      result: {
        id: updatedTest.id,
        score,
        marksObtained,
        totalMarks: test.totalMarks,
        hasPassed,
        evaluations: evaluationData.evaluations,
        submittedAt: updatedTest.submittedAt,
      },
    });
  } catch (error) {
    console.error("Error submitting test:", error);
    res.status(500).json({ error: "Failed to submit test" });
  }
};

// Get certificate data
export const getCertificateData = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { courseId, testId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const test = await prisma.courseTest.findFirst({
      where: { id: testId, courseId, userId },
      include: {
        course: {
          include: {
            chapters: { select: { id: true } },
          },
        },
      },
    });

    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    if (test.status !== "completed") {
      return res
        .status(400)
        .json({ error: "Test must be completed to download certificate" });
    }

    if (!test.hasPassed) {
      return res
        .status(400)
        .json({ error: "Test must be passed to download certificate" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const certificateData = {
      studentName: user.username,
      courseName: test.course.title,
      instructorName: "Instructor",
      completionDate: new Date(test.submittedAt!).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      certificateId: test.id,
      score: test.score || 0,
      totalMarks: test.totalMarks,
      marksObtained: test.marksObtained || 0,
    };

    res.json({
      success: true,
      message: "Certificate data retrieved successfully",
      certificateData,
    });
  } catch (error) {
    console.error("Error retrieving certificate:", error);
    res.status(500).json({ error: "Failed to retrieve certificate data" });
  }
};

// Verify certificate (public)
export const verifyCertificate = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { certificateId } = req.params;

    const test = await prisma.courseTest.findFirst({
      where: {
        id: certificateId,
        status: "completed",
        hasPassed: true,
      },
      include: {
        course: { select: { title: true } },
      },
    });

    if (!test) {
      return res.json({
        success: true,
        isValid: false,
        error: "Certificate not found or invalid",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: test.userId },
      select: { username: true },
    });

    const certificateDetails = {
      studentName: user?.username || "Unknown",
      courseName: test.course.title,
      instructorName: "Instructor",
      completionDate: new Date(test.submittedAt!).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      certificateId: test.id,
      score: test.score || 0,
      totalMarks: test.totalMarks,
      marksObtained: test.marksObtained || 0,
      issueDate: new Date(test.submittedAt!).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };

    res.json({
      success: true,
      isValid: true,
      certificateDetails,
    });
  } catch (error) {
    console.error("Error verifying certificate:", error);
    res.status(500).json({ error: "Failed to verify certificate" });
  }
};

export { optionalAuth };
