
import os
import time
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types


# Load environment variables from backend/.env
BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")


def generate_remarks(
    glucose: float,
    haemoglobin: float,
    cholesterol: float
) -> str:

    """Generate educational AI remarks, not a medical diagnosis."""

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        print("ERROR: GEMINI_API_KEY is missing")
        return "AI service unavailable. Please configure the API key."

    try:
        client = genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(timeout=60000)
        )

        model = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

        prompt = f"""
        You are providing general educational information, not a diagnosis.

        Blood test values:
        Glucose: {glucose}
        Haemoglobin: {haemoglobin}
        Cholesterol: {cholesterol}

        Units and laboratory reference ranges are not supplied.

        Explain cautiously that interpretation depends on units,
        fasting status, laboratory reference ranges and clinical context.

        Do not diagnose any disease or recommend treatment.
        Recommend discussing results with a qualified healthcare professional.

        Keep your response under 90 words.
        """

        print("Gemini request started...")

        start_time = time.time()

        response = client.models.generate_content(
            model=model,
            contents=prompt
        )

        elapsed = time.time() - start_time

        print(f"Gemini response received in {elapsed:.2f} seconds")

        remarks = (response.text or "").strip()

        if not remarks:
            return "No AI remarks were returned."

        print("Gemini AI remarks generated successfully.")

        return remarks

    except Exception as e:
        print("Gemini API Error:", repr(e))

        return (
            "AI service is temporarily unavailable. "
            "Please try again later and consult a healthcare professional."
        )
