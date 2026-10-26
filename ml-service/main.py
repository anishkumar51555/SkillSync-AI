
from pathlib import Path

import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="SkillSync AI ML Service")

MODEL_PATH = Path(__file__).parent / "job_classifier.joblib"
model = joblib.load(MODEL_PATH)


class ResumeRequest(BaseModel):
    text: str = Field(min_length=10, max_length=20000)


@app.get("/health")
def health():
    return {"status": "ok", "service": "SkillSync AI ML"}


@app.post("/predict")
def predict(request: ResumeRequest):
    text = request.text.strip()

    if len(text) < 10:
        raise HTTPException(
            status_code=422,
            detail="Please provide more resume text.",
        )

    prediction = model.predict([text])[0]

    probabilities = model.predict_proba([text])[0]
    confidence = float(max(probabilities))

    return {
        "predicted_category": prediction,
        "model_confidence": round(confidence, 4),
        "notice": (
            "Experimental prediction from a small demonstration "
            "dataset; not a validated job suitability score."
        ),
    }
