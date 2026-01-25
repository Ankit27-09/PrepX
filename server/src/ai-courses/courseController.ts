import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/authType';
import { createCourseAndGenerateFirstSection, generateNextSection, CreateCourseInput } from './courseGenerator';

const prisma = new PrismaClient();

// Helper to get userId from request
const getUserId = (req: Request): string | undefined => {
    const user = req.user as AuthRequest | undefined;
    return user?.id;
};

// ============================================================================
// COURSE CRUD OPERATIONS
// ============================================================================

/**
 * Get all AI courses for the current user
 */
export const getAllCourses = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const courses = await prisma.aiCourse.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                sections: {
                    select: {
                        id: true,
                        sectionNumber: true,
                        title: true,
                        isCompleted: true,
                    },
                    orderBy: { sectionNumber: 'asc' },
                },
            },
        });

        return res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        return res.status(500).json({ error: 'Failed to fetch courses' });
    }
};

/**
 * Get a single course with all its sections
 */
export const getCourseById = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const id = req.params.id as string;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const course = await prisma.aiCourse.findFirst({
            where: { id, userId },
            include: {
                sections: {
                    orderBy: { sectionNumber: 'asc' },
                },
            },
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Fetch user progress stats
        const [
            articlesRead,
            totalArticles,
            flashcardsReviewed,
            totalFlashcards,
            mcqAttempted,
            totalMcq,
            tfAttempted,
            totalTf,
            fillAttempted,
            totalFill
        ] = await Promise.all([
            prisma.aiArticlePage.count({ where: { section: { courseId: id }, isRead: true } }),
            prisma.aiArticlePage.count({ where: { section: { courseId: id } } }),

            prisma.aiFlashcard.count({ where: { section: { courseId: id }, reviewCount: { gt: 0 } } }),
            prisma.aiFlashcard.count({ where: { section: { courseId: id } } }),

            prisma.aiMcqQuestion.count({ where: { section: { courseId: id }, isAttempted: true } }),
            prisma.aiMcqQuestion.count({ where: { section: { courseId: id } } }),

            prisma.aiTrueFalseQuestion.count({ where: { section: { courseId: id }, isAttempted: true } }),
            prisma.aiTrueFalseQuestion.count({ where: { section: { courseId: id } } }),

            prisma.aiFillUpQuestion.count({ where: { section: { courseId: id }, isAttempted: true } }),
            prisma.aiFillUpQuestion.count({ where: { section: { courseId: id } } }),
        ]);

        return res.json({
            ...course,
            stats: {
                articles: { read: articlesRead, total: totalArticles },
                flashcards: { reviewed: flashcardsReviewed, total: totalFlashcards },
                quizzes: {
                    attempted: mcqAttempted + tfAttempted + fillAttempted,
                    total: totalMcq + totalTf + totalFill
                },
                breakdown: {
                    mcq: { attempted: mcqAttempted, total: totalMcq },
                    tf: { attempted: tfAttempted, total: totalTf },
                    fill: { attempted: fillAttempted, total: totalFill }
                }
            }
        });
    } catch (error) {
        console.error('Error fetching course:', error);
        return res.status(500).json({ error: 'Failed to fetch course' });
    }
};

/**
 * Get section with full content
 */
export const getSectionWithContent = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const sectionId = req.params.sectionId as string;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const section = await prisma.aiCourseSection.findUnique({
            where: { id: sectionId },
            include: {
                course: { select: { userId: true, title: true, topic: true } },
                articlePages: { orderBy: { pageNumber: 'asc' } },
                flashcards: true,
                mindMaps: true,
                mcqQuestions: true,
                trueFalseQuestions: true,
                fillUpQuestions: true,
            },
        });

        if (!section) {
            return res.status(404).json({ error: 'Section not found' });
        }

        if (section.course.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        return res.json(section);
    } catch (error) {
        console.error('Error fetching section:', error);
        return res.status(500).json({ error: 'Failed to fetch section' });
    }
};

// ============================================================================
// COURSE GENERATION
// ============================================================================

/**
 * Create a new course and generate the first section
 */
export const createCourse = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const input: CreateCourseInput = req.body;

        // Validate required fields
        if (!input.topic || !input.level || !input.goal || !input.tone) {
            return res.status(400).json({ error: 'Missing required fields: topic, level, goal, tone' });
        }

        // Set defaults
        input.sectionCount = input.sectionCount || 5;
        input.timeCommitment = input.timeCommitment || 30;

        const result = await createCourseAndGenerateFirstSection(userId, input);

        if (!result.success) {
            return res.status(500).json({ error: result.error });
        }

        return res.status(201).json({ courseId: result.courseId });
    } catch (error) {
        console.error('Error creating course:', error);
        return res.status(500).json({ error: 'Failed to create course' });
    }
};

/**
 * Generate the next section of a course
 */
export const generateSection = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const id = req.params.id as string;
        const { sectionNumber } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Verify course ownership
        const course = await prisma.aiCourse.findFirst({
            where: { id, userId },
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const result = await generateNextSection(id, sectionNumber);

        if (!result.success) {
            return res.status(500).json({ error: result.error });
        }

        return res.json({ sectionId: result.sectionId });
    } catch (error) {
        console.error('Error generating section:', error);
        return res.status(500).json({ error: 'Failed to generate section' });
    }
};

/**
 * Delete a course
 */
export const deleteCourse = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const id = req.params.id as string;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const course = await prisma.aiCourse.findFirst({
            where: { id, userId },
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        await prisma.aiCourse.delete({ where: { id } });

        return res.json({ success: true });
    } catch (error) {
        console.error('Error deleting course:', error);
        return res.status(500).json({ error: 'Failed to delete course' });
    }
};

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

/**
 * Mark a section as complete
 */
export const markSectionComplete = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const sectionId = req.params.sectionId as string;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const section = await prisma.aiCourseSection.findUnique({
            where: { id: sectionId },
            include: { course: { select: { userId: true } } },
        });

        if (!section) {
            return res.status(404).json({ error: 'Section not found' });
        }

        if (section.course.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Check if already completed to avoid double counting
        if (section.isCompleted) {
            return res.json(section);
        }

        const updatedSection = await prisma.aiCourseSection.update({
            where: { id: sectionId },
            data: { isCompleted: true, completedAt: new Date() },
        });

        // Recalculate total completed sections for accuracy
        const completedCount = await prisma.aiCourseSection.count({
            where: {
                courseId: section.courseId,
                isCompleted: true
            }
        });

        // Update course completed sections count
        await prisma.aiCourse.update({
            where: { id: section.courseId },
            data: { completedSections: completedCount },
        });

        return res.json(updatedSection);
    } catch (error) {
        console.error('Error marking section complete:', error);
        return res.status(500).json({ error: 'Failed to mark section complete' });
    }
};

/**
 * Mark an article as read
 */
export const markArticleRead = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const articleId = req.params.articleId as string;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const article = await prisma.aiArticlePage.findUnique({
            where: { id: articleId },
        });

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Verify ownership through section -> course
        const section = await prisma.aiCourseSection.findUnique({
            where: { id: article.sectionId },
            include: { course: { select: { userId: true } } },
        });

        if (!section || section.course.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const updatedArticle = await prisma.aiArticlePage.update({
            where: { id: articleId },
            data: { isRead: true, readAt: new Date() },
        });

        return res.json(updatedArticle);
    } catch (error) {
        console.error('Error marking article read:', error);
        return res.status(500).json({ error: 'Failed to mark article read' });
    }
};

// ============================================================================
// QUIZ SUBMISSIONS
// ============================================================================

/**
 * Submit MCQ answer
 */
export const submitMcqAnswer = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const questionId = req.params.questionId as string;
        const { answer } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const question = await prisma.aiMcqQuestion.findUnique({
            where: { id: questionId },
        });

        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        // Verify ownership through section -> course
        const section = await prisma.aiCourseSection.findUnique({
            where: { id: question.sectionId },
            include: { course: { select: { userId: true } } },
        });

        if (!section || section.course.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const isCorrect = question.answer === answer;

        await prisma.aiMcqQuestion.update({
            where: { id: questionId },
            data: {
                isAttempted: true,
                userAnswer: answer,
                isCorrect,
                attemptedAt: new Date(),
            },
        });

        return res.json({ isCorrect, correctAnswer: question.answer });
    } catch (error) {
        console.error('Error submitting MCQ answer:', error);
        return res.status(500).json({ error: 'Failed to submit answer' });
    }
};

/**
 * Submit True/False answer
 */
export const submitTrueFalseAnswer = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const questionId = req.params.questionId as string;
        const { answer } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const question = await prisma.aiTrueFalseQuestion.findUnique({
            where: { id: questionId },
        });

        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        // Verify ownership through section -> course
        const section = await prisma.aiCourseSection.findUnique({
            where: { id: question.sectionId },
            include: { course: { select: { userId: true } } },
        });

        if (!section || section.course.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const isCorrect = question.answer === answer;

        await prisma.aiTrueFalseQuestion.update({
            where: { id: questionId },
            data: {
                isAttempted: true,
                userAnswer: answer,
                isCorrect,
                attemptedAt: new Date(),
            },
        });

        return res.json({ isCorrect, correctAnswer: question.answer, explanation: question.explanation });
    } catch (error) {
        console.error('Error submitting True/False answer:', error);
        return res.status(500).json({ error: 'Failed to submit answer' });
    }
};

/**
 * Submit Fill-up answer
 */
export const submitFillUpAnswer = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const questionId = req.params.questionId as string;
        const { answer } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const question = await prisma.aiFillUpQuestion.findUnique({
            where: { id: questionId },
        });

        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        // Verify ownership through section -> course
        const section = await prisma.aiCourseSection.findUnique({
            where: { id: question.sectionId },
            include: { course: { select: { userId: true } } },
        });

        if (!section || section.course.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const isCorrect = question.missingWord.toLowerCase().trim() === answer.toLowerCase().trim();

        await prisma.aiFillUpQuestion.update({
            where: { id: questionId },
            data: {
                isAttempted: true,
                userAnswer: answer,
                isCorrect,
                attemptedAt: new Date(),
            },
        });

        return res.json({ isCorrect, correctAnswer: question.missingWord });
    } catch (error) {
        console.error('Error submitting Fill-up answer:', error);
        return res.status(500).json({ error: 'Failed to submit answer' });
    }
};

/**
 * Review flashcard
 */
export const reviewFlashcard = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const flashcardId = req.params.flashcardId as string;
        const { isCorrect } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const flashcard = await prisma.aiFlashcard.findUnique({
            where: { id: flashcardId },
        });

        if (!flashcard) {
            return res.status(404).json({ error: 'Flashcard not found' });
        }

        // Verify ownership through section -> course
        const section = await prisma.aiCourseSection.findUnique({
            where: { id: flashcard.sectionId },
            include: { course: { select: { userId: true } } },
        });

        if (!section || section.course.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Update spaced repetition data
        const newDifficulty = isCorrect
            ? Math.max(0, flashcard.difficulty - 1)
            : Math.min(5, flashcard.difficulty + 1);

        // Calculate next review based on difficulty (simple spaced repetition)
        const daysUntilReview = Math.pow(2, 5 - newDifficulty); // 1, 2, 4, 8, 16, 32 days
        const nextReviewAt = new Date();
        nextReviewAt.setDate(nextReviewAt.getDate() + daysUntilReview);

        const updated = await prisma.aiFlashcard.update({
            where: { id: flashcardId },
            data: {
                reviewCount: { increment: 1 },
                correctCount: isCorrect ? { increment: 1 } : undefined,
                difficulty: newDifficulty,
                nextReviewAt,
            },
        });

        return res.json(updated);
    } catch (error) {
        console.error('Error reviewing flashcard:', error);
        return res.status(500).json({ error: 'Failed to review flashcard' });
    }
};
