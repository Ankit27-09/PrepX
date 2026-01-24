import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { AccessToken } from 'livekit-server-sdk';

const getAITutorConnectionDetails = async (req: Request, res: Response, next: NextFunction) => {
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

        // Generate unique identifiers for AI Tutor session
        const participantIdentity = `tutor_user_${Math.floor(Math.random() * 10000)}`;
        const participantName = 'Learner';
        const roomName = `ai_tutor_room_${Math.floor(Math.random() * 10000)}`;

        // Create access token
        const at = new AccessToken(API_KEY, API_SECRET, {
            identity: participantIdentity,
            name: participantName,
            ttl: '15m',
        });

        // Add grants for the room
        at.addGrant({
            room: roomName,
            roomJoin: true,
            canPublish: true,
            canPublishData: true,
            canSubscribe: true,
            canUpdateOwnMetadata: true,
        });

        const participantToken = await at.toJwt();

        const data = {
            serverUrl: LIVEKIT_URL,
            roomName,
            participantName,
            participantToken,
        };

        console.log("AI Tutor connection details created:", { roomName, participantIdentity });

        res.set("Cache-Control", "no-store");
        res.json(data);
    } catch (err) {
        console.error("AI Tutor connection error:", err);
        return next(createHttpError(500, 'Error creating AI Tutor connection'));
    }
};

export { getAITutorConnectionDetails };
