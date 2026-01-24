from dotenv import load_dotenv

from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import (
    google,
    noise_cancellation,
    bey
)
from AITutor.tools import send_session_summary
from AITutor.prompts import TUTOR_INSTRUCTIONS
import os
from livekit.agents import BackgroundAudioPlayer, AudioConfig, BuiltinAudioClip
from pathlib import Path

# Load shared .env from agents root
load_dotenv(Path(__file__).parent.parent / ".env")


class AITutor(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=TUTOR_INSTRUCTIONS,
            tools=[send_session_summary]
        )


async def entrypoint(ctx: agents.JobContext):
    await ctx.connect()
    
    session = AgentSession(
        llm=google.beta.realtime.RealtimeModel(
            model="gemini-2.0-flash-exp",
            voice="Aoede",
            temperature=0.8,
            language="en-US",
        )
    )

    avatar = bey.AvatarSession(
        avatar_id=os.getenv("BEY_AVATAR_ID"),
    )

    # Start the avatar and wait for it to join
    await avatar.start(session, room=ctx.room)

    await session.start(
        room=ctx.room,
        agent=AITutor(),
        room_input_options=RoomInputOptions(
            video_enabled=True,
            audio_enabled=True,
        ),
    )

    background_audio = BackgroundAudioPlayer(
        thinking_sound=[
            AudioConfig(BuiltinAudioClip.KEYBOARD_TYPING, volume=1),
            AudioConfig(BuiltinAudioClip.KEYBOARD_TYPING2, volume=1),
        ],
    )
    await background_audio.start(room=ctx.room, agent_session=session)

    await session.generate_reply(
        instructions="Greet the user warmly and introduce yourself as their AI Tutor. Let them know you can help explain code, PDFs, and any educational content they share on screen. Ask what they'd like to learn today."
    )


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
