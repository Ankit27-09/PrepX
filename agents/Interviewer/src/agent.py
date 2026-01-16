import json
import logging

from dotenv import load_dotenv
from livekit.agents import (
    NOT_GIVEN,
    Agent,
    AgentFalseInterruptionEvent,
    AgentSession,
    JobContext,
    JobProcess,
    MetricsCollectedEvent,
    RoomInputOptions,
    WorkerOptions,
    cli,
    metrics,
)
from livekit.agents.llm import function_tool, ChatContext
from livekit.plugins import google, noise_cancellation, silero, bey
from livekit import api
import os
from requests import session
from resume_parser import extract_pdf_text_from_s3_url, query_groq, build_resume_parsing_prompt
import time
logger = logging.getLogger("agent")

load_dotenv()  # Loads .env by default

access_key = os.getenv("AWS_ACCESS_KEY_ID")
secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
aws_region = os.getenv("AWS_REGION")
bucket_name = os.getenv("AWS_S3_BUCKET_NAME")

class Assistant(Agent):
    def __init__(self, chat_ctx: ChatContext) -> None:
        super().__init__(chat_ctx=chat_ctx,
            instructions="""
You are a professional, no-nonsense technical interviewer conducting a rigorous live audio/video interview session.

Your responsibilities:

---

1. **Interview Flow**

   - **Introduction:**
     - Greet the candidate by name.
     - Confirm the role they're interviewing for.
     - Briefly outline the structure:
       1. Technical Deep-Dive
       2. Project Discussion
       3. Behavioral/Situational
       4. Wrap-up & Questions

   - **Technical Section:**
     - Start with resume-based questions (e.g., “You've listed AWS Kubernetes—can you walk me through a deployment you architected?”).
     - Probe deeper based on answers—ask for specifics: code snippets, configurations, libraries used, architectural decisions.
     - Cover core areas:
       - Data structures and algorithms
       - Object-oriented principles
       - Error handling patterns
       - API integration practices
       - Component and high-level system design
     - **When asking any coding question:**
       - Say: **"The code editor button is at the bottom of your screen. Please click it and begin coding."**
       - **"Also, please share your screen while coding so I can follow your thought process in real-time."**
       - Observe their approach, reasoning, and code quality. Do not accept pseudo-code unless explicitly specified.

   - **Project Deep-Dive:**
     - For each major project:
       - Ask: What were the objectives? What was your role? Why those tech choices? How was it architected?
       - Follow-up with performance trade-offs, scalability concerns, failure handling, testing strategy, deployment methods.

   - **Behavioral/Situational:**
     - Ask targeted questions like:
       - “Tell me about a time you worked under pressure.”
       - “Describe a conflict within your team and how you handled it.”
       - “Have you ever had to take ownership of a failed feature?”
     - Evaluate clarity, decision-making process, and professionalism.

   - **Closing:**
     - Ask if the candidate has any questions.
     - End with a professional summary of the next steps in the hiring process.

---

2. **Answer Quality Enforcement**

   - Do not accept vague, generic, or memorized answers.
   - Probe with:
     - “Can you be more specific?”
     - “Walk me through actual code you wrote.”
     - “How did you debug it?”
   - Keep a strict, technical tone—no chit-chat or humor.

---

3. **Malpractice Detection (Continuous Monitoring)**

   - **Visual Cues:**
     - Monitor gaze: If the candidate repeatedly looks away from the camera for more than 5 seconds, say:  
       **“Please keep your focus on the screen to ensure interview integrity.”**
     - If more than one face is visible:  
       **“I see someone else in the frame. Please make sure you are alone.”**
     - Detect unauthorized materials (phones, notebooks, tablets). Say:  
       **“Please put away all notes and personal devices during the session.”**

   - **Audio Cues:**
     - If overlapping voices are detected:  
       **“Could you please ensure you're the only one speaking during the interview?”**
     - Detect notification sounds or phone interactions. Remind the candidate to mute devices and minimize distractions.

   - **All malpractice observations must be logged in the session transcript** for post-interview audit and evaluation.

---

Maintain a strict, focused pace. After each answer, transition professionally:  
**“Great—now, let's move to system design.”** or **“Thanks—let’s proceed to the project discussion.”**
""")

def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


async def entrypoint(ctx: JobContext):
        # Join the room and connect to the user
    
    await ctx.connect()
    # Logging setup
    # Add any other context you want in all log entries here
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }
    participant = await ctx.wait_for_participant()
    print(f"connected to room {ctx.room.name} with participant {participant.identity}")
    language = participant.attributes
    print(f"Participant {participant.identity} has language attribute: {language}")


    metadata = json.loads(participant.metadata) if participant.metadata else {}
    extra_info = metadata.get("extraInfo")
    job_role = metadata.get("jobRole") 
    user_id = metadata.get("userId")
    resume = metadata.get("resume")

    print(f"extraInfo: {extra_info}, jobRole: {job_role}, userId: {user_id}, resume: {resume}")

    session = AgentSession(
         llm=google.beta.realtime.RealtimeModel(
        model="gemini-2.0-flash-exp",
        voice="Fenrir",
        temperature=0.8,
        instructions="You are a helpful assistant",
        language="en-US",
    ),
    )

    pdf_text = extract_pdf_text_from_s3_url(resume)
    prompt = build_resume_parsing_prompt(pdf_text)
    resume_text = query_groq(prompt)

    # Metrics collection, to measure pipeline performance
    # For more information, see https://docs.livekit.io/agents/build/metrics/
    usage_collector = metrics.UsageCollector()

    @session.on("metrics_collected")
    def _on_metrics_collected(ev: MetricsCollectedEvent):
        metrics.log_metrics(ev.metrics)
        usage_collector.collect(ev.metrics)

    async def log_usage():
        summary = usage_collector.get_summary()
        logger.info(f"Usage: {summary}")

    ctx.add_shutdown_callback(log_usage)

    # # Add a virtual avatar to the session
    # avatar = tavus.AvatarSession(
    #     replica_id="rf4703150052",
    #     persona_id="pa437382c84f"
    # )
    avatar = bey.AvatarSession(
    avatar_id="b9be11b8-89fb-4227-8f86-4a881393cbdb",
    )

    req = api.RoomCompositeEgressRequest(
        room_name=ctx.room.name,
        layout='grid',
        file_outputs=[api.EncodedFileOutput(
            file_type=api.EncodedFileType.MP4,
            filepath=f"{ctx.room.name}-video.mp4",
            s3=api.S3Upload(
                bucket=bucket_name,
                region=aws_region,
                access_key=access_key,
                secret=secret_key,
            ),
        )],
    )
    
    # Debug logging for S3 upload config
    logger.info(f"Starting egress - Bucket: {bucket_name}, Region: {aws_region}")
    logger.info(f"Access key present: {bool(access_key)}, Secret present: {bool(secret_key)}")
    
    lkapi = api.LiveKitAPI()
    try:
        res = await lkapi.egress.start_room_composite_egress(req)
        logger.info(f"Egress started successfully: {res.egress_id}")
    except Exception as e:
        logger.error(f"Failed to start egress: {e}")

    await lkapi.aclose()

    
    initial_ctx = ChatContext()
    initial_ctx.add_message(role="assistant", content=f"""
    You are a technical interviewer preparing to assess a candidate for the **{job_role}** role.

    Additional context from the recruiter or system:
    - **Extra Info:** {extra_info}

    Candidate's resume content:
    ---
    {resume_text}
    ---

    Start the interview with a strong, personalized question that:
    - Is based on specific experiences, projects, or technologies from the resume.
    - Is aligned with the job role: **{job_role}**.
    - Optionally ties into the extra info provided above.
    Avoid general or repeated prompts. Be insightful and tailored.
    """)

    # # Start the avatar and wait for it to join
    await avatar.start(session, room=ctx.room)

    # Start the session, which initializes the voice pipeline and warms up the models
    await session.start(
        agent=Assistant(chat_ctx=initial_ctx),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            # LiveKit Cloud enhanced noise cancellation
            # - If self-hosting, omit this parameter
            # - For telephony applications, use `BVCTelephony` for best results
            video_enabled=True,
            audio_enabled=True,
        
        ),
    )
    await session.generate_reply(instructions="""You may begin the interview now. """, allow_interruptions=False)



if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))
