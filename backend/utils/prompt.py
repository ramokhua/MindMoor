"""
Prompt construction and response cleaning for Moira.
Adjust the system context here to shape your fine-tuned model's persona.
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
    Adjust format when swapping models.
    """
    # Use last 3 exchanges for context (keep token count manageable)
    recent = history[-6:] if len(history) > 6 else history
    parts = [SYSTEM_CONTEXT]

    for turn in recent:
        role    = turn.get("role", "user")
        content = turn.get("content", "")
        prefix  = "User:" if role == "user" else "Moira:"
        parts.append(f"{prefix} {content}")

    parts.append(f"User: {user_message}")
    parts.append("Moira:")

    return "\n".join(parts)


def clean_response(text: str) -> str:
    """Remove artifacts and normalise the model output."""
    if not text:
        return get_fallback()

    # Strip any prefix echoes like "Moira:" that the model might repeat
    text = re.sub(r"^(Moira:|Bot:|AI:)\s*", "", text, flags=re.IGNORECASE).strip()

    # Remove special tokens
    text = re.sub(r"<[^>]+>", "", text).strip()

    # Collapse extra whitespace
    text = re.sub(r"\s+", " ", text).strip()

    # Ensure sentence ends properly
    if text and text[-1] not in ".!?":
        text += "."

    # Capitalise first letter
    if text:
        text = text[0].upper() + text[1:]

    return text or get_fallback()


def get_fallback() -> str:
    options = [
        "I want to understand better — could you share a little more about what you're going through?",
        "That sounds really important. Would you like to explore it together?",
        "I hear you. What would feel most helpful right now?",
        "Thank you for sharing that with me. I'm here to listen.",
    ]
    return random.choice(options)