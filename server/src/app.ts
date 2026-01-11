import express, { Request, Response } from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import globalErrorHandler from './middleware/globalErrorHandler';
import passport from 'passport'
import passportConfig from './config/passport';
import authRouter from './auth/authRoute';
import podcastRouter from './podcast/podcasts';
import courseRouter from "./courses/courseRoute";
import industryInsightsRouter from "./industry/industryInsights";
import livekitRouter from './livekit/livekitRoute';
import interviewRouter from './interview/interviewRoute';


config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

app.use(passport.initialize());
passportConfig(passport);



app.get('/', (req: Request, res: Response) => {
  res.json({
    message: "DSCE Hackman Server is running",
  });
});


// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    message: 'DSCE Hackman Server is running',
    environment: {
      GROQ_API_KEY: process.env.GROQ_API_KEY ? '✅ Loaded' : '❌ Missing',
      HEYGEN_API_KEY: process.env.HEYGEN_API_KEY ? '✅ Loaded' : '❌ Missing',
    }
  });
});

// API Routes
app.use("/api/v1/auth", authRouter);
app.use('/api/podcasts', podcastRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/industry", industryInsightsRouter);
app.use('/api/v1/livekit', livekitRouter);
app.use('/api/v1/interview', interviewRouter);
app.use(globalErrorHandler);

export { server, io };
