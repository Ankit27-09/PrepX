import express from 'express';
import multer from 'multer';
import { createInterview, getInterviews, getInterviewById, getInterviewResult } from './interviewController';
import passport from 'passport';

const router = express.Router();
const upload = multer();


router.post('/create', passport.authenticate('jwt', { session: false }), upload.single('resume'), createInterview);
router.get('/getinterviews', passport.authenticate('jwt', { session: false }), getInterviews);
router.get('/getinterview/:id', passport.authenticate('jwt', { session: false }), getInterviewById);
router.get('/getinterviewresults/:id', getInterviewResult);

export default router;
