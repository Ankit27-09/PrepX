import { NextFunction, Request, Response } from 'express';
import { prisma } from '../client';
import createHttpError from 'http-errors';
import { createParticipantToken } from '../utils/livekitToken';
import { RoomServiceClient } from 'livekit-server-sdk';

const createConnection = async (req: Request, res: Response, next: NextFunction) => {

    const API_KEY = process.env.LIVEKIT_API_KEY;
    const API_SECRET = process.env.LIVEKIT_API_SECRET;
    const LIVEKIT_URL = process.env.LIVEKIT_URL;

    try {
       if (!LIVEKIT_URL) {
      throw new Error("LIVEKIT_URL is not defined");
    }
    if (!API_KEY) {
      throw new Error("LIVEKIT_API_KEY is not defined");
    }
    if (!API_SECRET) {
      throw new Error("LIVEKIT_API_SECRET is not defined");
    }

    const participantIdentity = req.query.participantName as string;
    const roomName = req.query.roomName as string;

    console.log("Participant Identity:", participantIdentity);
    console.log("Room Name:", roomName);

    const basicData = await prisma.interview.findUnique({
        where: { id: roomName },
    })

    // Create token with participant attributes embedded
    const participantToken = await createParticipantToken(
      participantIdentity, 
      roomName,
      {
        jobRole: basicData?.jobRole || 'Software Engineer',
        extraInfo: basicData?.extraInfo || '',
        userId: basicData?.userId || '',
        resume: basicData?.resumeUrl || '',
      }
    );

    const data = {
      serverUrl: LIVEKIT_URL,
      roomName,
      participantName: participantIdentity,
      participantToken,
    };

    console.log("Participant token created with attributes embedded");

    res.set("Cache-Control", "no-store");
    res.json(data);
    } catch (err) {
        console.log(err);
        return next(createHttpError(500, 'Error while processing your request'));
    }
};

export {createConnection};