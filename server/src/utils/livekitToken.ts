import { AccessToken } from "livekit-server-sdk";

interface ParticipantAttributes {
  jobRole?: string;
  extraInfo?: string;
  userId?: string;
  resume?: string;
}

export async function createParticipantToken(
  userInfo: string, 
  roomName: string, 
  attributes?: ParticipantAttributes
) {

  const API_KEY = process.env.LIVEKIT_API_KEY;
  const API_SECRET = process.env.LIVEKIT_API_SECRET;

  const at = new AccessToken(API_KEY, API_SECRET, {
    identity: userInfo,
    metadata: JSON.stringify(attributes || {}),
  });

  const grant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
    canUpdateOwnMetadata: true,

  };
  at.addGrant(grant);
  return await at.toJwt();
}
