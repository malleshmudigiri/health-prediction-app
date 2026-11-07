import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import Base, engine
from app.routes.patient_routes import router as patient_router

load_dotenv()
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Health Prediction API", version="1.0.0")
origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(patient_router, prefix="/api/patients", tags=["Patients"])

@app.get("/")
def health_check():
    return {"message": "Health Prediction API is running"}
