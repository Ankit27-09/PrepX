import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import AWS from "aws-sdk";
import { AuthRequest } from "../types/authType";
import createHttpError from "http-errors";

const prisma = new PrismaClient();

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const uploadResumeToS3 = async (
  file: Express.Multer.File,
  userId: string
): Promise<string> => {
  const fileContent = file.buffer;
  const fileName = `${userId}.pdf`;
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: fileName,
    Body: fileContent,
    ContentType: file.mimetype,
  };
  const s3Response = await s3.upload(params).promise();
  return s3Response.Location;
};

export const createInterview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, jobRole, model, extraInfo } = req.body;
    // userId from auth middleware
    const userId = req.user as AuthRequest;
    let resumeUrl: string | undefined = undefined;
    const file = (req as any).file;
    if (file) {
      resumeUrl = await uploadResumeToS3(file, userId.id);
    }
    const interview = await prisma.interview.create({
      data: {
        title,
        description,
        jobRole,
        model,
        extraInfo,
        userId: userId.id,
        resumeUrl,
      },
    });
    res.status(201).json(interview);
  } catch (error) {
    console.error(error);
    return next(
      createHttpError(
        400,
        "An Unknown error occurred during interview creation."
      )
    );
  }
};

export const getInterviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as AuthRequest).id;
    const interviews = await prisma.interview.findMany({
      where: { userId },
    });
    res.status(200).json(interviews);
  } catch (error) {
    console.error(error);
    return next(createHttpError(400, "Failed to fetch interviews."));
  }
};

export const getInterviewById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as AuthRequest).id;
    const { id } = req.params;
    const interview = await prisma.interview.findFirst({
      where: { id, userId },
    });
    if (!interview) {
      return next(createHttpError(404, "Interview not found."));
    }
    res.status(200).json(interview);
  } catch (error) {
    console.error(error);
    return next(createHttpError(400, "Failed to fetch interview."));
  }
};

export const getInterviewResult = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    console.log(id);
    try {
        
        const result = await prisma.interviewResults.findUnique({
            where: { interview_id: id },
        })


        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        return next(createHttpError(500, 'Error retrieving interview'));
    }
};