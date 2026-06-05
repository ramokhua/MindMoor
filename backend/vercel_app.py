"""
Vercel serverless function entry point
"""
from app import app

# Vercel expects a handler named 'app'
handler = app
