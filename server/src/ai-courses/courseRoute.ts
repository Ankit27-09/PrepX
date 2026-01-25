import express from 'express';
import passport from 'passport';
import {
    getAllCourses,
    getCourseById,
    getSectionWithContent,
    createCourse,
    generateSection,
    deleteCourse,
    markSectionComplete,
    markArticleRead,
    submitMcqAnswer,
    submitTrueFalseAnswer,
    submitFillUpAnswer,
    reviewFlashcard,
} from './courseController';

const router = express.Router();

// Middleware for authentication with error handling
const authenticateToken = (req: any, res: any, next: any) => {
    passport.authenticate(
        'jwt',
        { session: false },
        (err: any, user: any, info: any) => {
            if (err) {
                console.error('🔴 Passport error:', err);
                return res.status(500).json({ error: 'Authentication error' });
            }
            if (!user) {
                console.error('🔴 No user found. Info:', info);
                return res.status(401).json({
                    error: 'Unauthorized',
                    details: info?.message || 'Invalid token',
                });
            }
            req.user = user;
            next();
        }
    )(req, res, next);
};

// ============================================================================
// COURSE ROUTES
// ============================================================================

// Get all courses for current user
router.get('/', authenticateToken, getAllCourses as any);

// Get a specific course
router.get('/:id', authenticateToken, getCourseById as any);

// Create a new course (generates first section)
router.post('/', authenticateToken, createCourse as any);

// Generate next section for a course
router.post('/:id/generate-section', authenticateToken, generateSection as any);

// Delete a course
router.delete('/:id', authenticateToken, deleteCourse as any);

// ============================================================================
// SECTION ROUTES
// ============================================================================

// Get section with full content
router.get('/sections/:sectionId', authenticateToken, getSectionWithContent as any);

// Mark section as complete
router.post('/sections/:sectionId/complete', authenticateToken, markSectionComplete as any);

// ============================================================================
// ARTICLE ROUTES
// ============================================================================

// Mark article as read
router.post('/articles/:articleId/read', authenticateToken, markArticleRead as any);

// ============================================================================
// QUIZ ROUTES
// ============================================================================

// Submit MCQ answer
router.post('/mcq/:questionId/answer', authenticateToken, submitMcqAnswer as any);

// Submit True/False answer
router.post('/truefalse/:questionId/answer', authenticateToken, submitTrueFalseAnswer as any);

// Submit Fill-up answer
router.post('/fillup/:questionId/answer', authenticateToken, submitFillUpAnswer as any);

// ============================================================================
// FLASHCARD ROUTES
// ============================================================================

// Review flashcard
router.post('/flashcards/:flashcardId/review', authenticateToken, reviewFlashcard as any);

export default router;
