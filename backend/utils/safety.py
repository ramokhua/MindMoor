"""Crisis detection and safety responses."""
import random

CRISIS_KEYWORDS = [
    "suicide", "suicidal", "kill myself", "end it all",
    "self harm", "self-harm", "want to die", "can't go on",
    "no reason to live", "better off dead",
]

def check_crisis(text: str) -> bool:
    lower = text.lower()
    return any(kw in lower for kw in CRISIS_KEYWORDS)


def get_crisis_response() -> str:
    return (
        "I'm really concerned about what you've shared with me. "
        "Please reach out to a crisis line right now — you don't have to face this alone.\n\n"
        "🇺🇸 **US Suicide & Crisis Lifeline:** Call or text **988**\n"
        "📱 **Crisis Text Line:** Text HOME to **741741**\n"
        "🌍 **International:** findahelpline.com\n\n"
        "If you're in immediate danger, please call emergency services (911 or your local equivalent). "
        "Your life matters and help is available."
    )