
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.patient_schema import (
    PatientCreate,
    PatientUpdate,
    PatientOut
)
from app.services import patient_service
from app.services.ai_service import generate_remarks

router = APIRouter()


@router.post("/", response_model=PatientOut, status_code=201)
def create(data: PatientCreate, db: Session = Depends(get_db)):
    return patient_service.create_patient(db, data)


@router.get("/", response_model=list[PatientOut])
def read_all(db: Session = Depends(get_db)):
    return patient_service.list_patients(db)


@router.get("/{patient_id}", response_model=PatientOut)
def read_one(patient_id: int, db: Session = Depends(get_db)):
    return patient_service.get_patient(db, patient_id)


@router.put("/{patient_id}", response_model=PatientOut)
def update(
    patient_id: int,
    data: PatientUpdate,
    db: Session = Depends(get_db)
):
    return patient_service.update_patient(db, patient_id, data)


@router.delete("/{patient_id}")
def delete(patient_id: int, db: Session = Depends(get_db)):
    return patient_service.delete_patient(db, patient_id)


# Generate Gemini AI remarks
@router.post("/{patient_id}/remarks", response_model=PatientOut)
def generate_patient_remarks(
    patient_id: int,
    db: Session = Depends(get_db)
):
    # 1. Retrieve patient
    patient = patient_service.get_patient(db, patient_id)

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    # 2. Generate AI remarks
    remarks = generate_remarks(
        glucose=patient.glucose,
        haemoglobin=patient.haemoglobin,
        cholesterol=patient.cholesterol
    )

    # 3. Save remarks
    patient.remarks = remarks

    try:
        db.commit()
        db.refresh(patient)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Could not save AI remarks"
        )

    # 4. Return updated patient
    return patient
