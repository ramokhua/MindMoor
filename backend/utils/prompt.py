"""
Prompt construction and response cleaning for Moira.
Includes keyword-based fallbacks for common requests.
"""
import random
import re

SYSTEM_CONTEXT = (
    "You are Moira, a compassionate and non-judgmental mental wellness companion. "
    "You listen carefully, respond with empathy, and offer evidence-based coping strategies "
    "when appropriate. You never diagnose or replace professional care. "
    "Keep responses warm, concise (2-4 sentences), and focused on the user's wellbeing."
)


def build_prompt(user_message: str, history: list) -> str:
    """
    Build a prompt string for the model.
    BlenderBot / DialoGPT expect conversational turns separated by </s> or newlines.
    """
    recent = history[-6:] if len(history) > 6 else history
    parts = [SYSTEM_CONTEXT]

    for turn in recent:
        role = turn.get("role", "user")
        content = turn.get("content", "")
        prefix = "User:" if role == "user" else "Moira:"
        parts.append(f"{prefix} {content}")

    parts.append(f"User: {user_message}")
    parts.append("Moira:")

    return "\n".join(parts)


def keyword_response(message: str) -> str | None:
    """Check for keywords and return appropriate responses."""
    msg_lower = message.lower()
    
    # Breathing exercises
    if any(word in msg_lower for word in ["breathing", "breath", "breathe", "breathing exercise"]):
        return "🌬️ Try this breathing technique: **Breathe in for 4 seconds** 👃, **hold for 4 seconds** ⏸️, **exhale for 6 seconds** 😌. Repeat 4-6 times. This activates your parasympathetic nervous system and helps reduce anxiety."
    
    # Anxiety
    if any(word in msg_lower for word in ["anxious", "anxiety", "nervous", "worry"]):
        return "I hear that you're feeling anxious. That's a really common experience, especially during stressful times. Would you like to try a quick grounding exercise together? We can do the 5-4-3-2-1 technique — it helps bring you back to the present moment."
    
    # Overwhelmed
    if any(word in msg_lower for word in ["overwhelmed", "too much", "can't handle"]):
        return "Feeling overwhelmed is exhausting. Let's break this down: What's ONE small thing you could do in the next 5 minutes? Even getting a glass of water or taking 3 deep breaths counts as a win. You don't have to do everything at once."
    
    # Procrastination / school work
    if any(word in msg_lower for word in ["procrastinat", "homework", "exam", "study", "school", "assignment"]):
        return "Exam season is tough, and procrastination often comes from feeling overwhelmed. Try the **Pomodoro Technique**: Work for 25 minutes, then take a 5-minute break. Just commit to ONE pomodoro — you might find it easier to keep going afterward. Would you like to try that with me?"
    
    # Stress
    if "stress" in msg_lower:
        return "Stress is your body's way of saying you're carrying a lot right now. Can we take 60 seconds together? Take a slow breath in through your nose... and out through your mouth. One more time. How do you feel now?"
    
    # Sad/depressed
    if any(word in msg_lower for word in ["sad", "depressed", "down", "empty"]):
        return "I'm sorry you're feeling this way. Your feelings are valid. When we feel low, even small acts of self-care can help — like stepping outside for fresh air, texting a friend, or listening to a favorite song. What's one small thing that's helped you feel better in the past?"
    
    # Sleep/insomnia
    if any(word in msg_lower for word in ["sleep", "insomnia", "can't sleep", "tired"]):
        return "Sleep troubles are so frustrating. Try this before bed: Put away screens 30 minutes before sleeping, dim the lights, and try the 4-7-8 breathing (inhale 4 sec, hold 7 sec, exhale 8 sec). Would you like me to guide you through a short wind-down exercise?"
    
    # Motivation
    if any(word in msg_lower for word in ["motivation", "motivated", "energy"]):
        return "Losing motivation is normal, especially when you're tired or stressed. Instead of waiting for motivation to find you, try starting with just ONE tiny action — like opening your notebook or putting on your shoes. Action often comes before motivation. What's the smallest step you can take right now?"
    
    # Crisis keywords
    if any(word in msg_lower for word in ["kill myself", "suicide", "end it", "want to die", "better off dead"]):
        return None  # Let crisis handler take over
    
    return None


def clean_response(text: str, user_message: str = None) -> str:
    """Clean model output and fall back to keyword responses if needed."""
    
    # First, check if user message matches keywords
    if user_message:
        keyword_reply = keyword_response(user_message)
        if keyword_reply:
            return keyword_reply
    
    # If no keyword match, try to use model output
    if not text or len(text) < 10:
        return get_fallback(user_message)
    
    # Strip any prefix echoes like "Moira:" that the model might repeat
    text = re.sub(r"^(Moira:|Bot:|AI:)\s*", "", text, flags=re.IGNORECASE).strip()
    
    # Remove special tokens
    text = re.sub(r"<[^>]+>", "", text).strip()
    
    # Remove repetitive patterns (if model is stuck in a loop)
    if text.count("Thank you for sharing") > 1 or text.count("I'm here to listen") > 1:
        return get_fallback(user_message)
    
    # Collapse extra whitespace
    text = re.sub(r"\s+", " ", text).strip()
    
    # Ensure sentence ends properly
    if text and text[-1] not in ".!?":
        text += "."
    
    # Capitalise first letter
    if text:
        text = text[0].upper() + text[1:]
    
    # If model output is still generic, use fallback
    if text in [
        "Thank you for sharing that with me. I'm here to listen.",
        "I want to understand better — could you share a little more about what you're going through?",
        "That sounds really important. Would you like to explore it together?",
        "I hear you. What would feel most helpful right now?"
    ]:
        return get_fallback(user_message)
    
    return text or get_fallback(user_message)


def get_fallback(user_message: str = None) -> str:
    """Context-aware fallback responses."""
    if user_message:
        if "anxious" in user_message.lower():
            return "I can hear the anxiety in your voice. Would you like to try a quick grounding exercise together? It might help take the edge off."
        if "overwhelmed" in user_message.lower():
            return "That feeling of being overwhelmed is real. Let's pause for a moment. Can you name 3 things you can see right now? That's a start to grounding yourself."
    
    options = [
        "I'm here with you. What's one thing that's on your mind right now?",
        "That sounds really difficult. Would you like to talk more about it?",
        "I appreciate you sharing this with me. What would be most helpful for you right now?",
        "You're not alone in this. Let's work through it together — what feels like the hardest part at this moment?"
    ]
    return random.choice(options)