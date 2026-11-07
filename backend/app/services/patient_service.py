from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.patient import Patient
from app.schemas.patient_schema import PatientCreate, PatientUpdate
from app.services.ai_service import generate_remarks

def create_patient(db: Session, data: PatientCreate):
    patient = Patient(**data.model_dump())
    patient.remarks = generate_remarks(data.glucose, data.haemoglobin, data.cholesterol)
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

def list_patients(db: Session):
    return db.query(Patient).order_by(Patient.id.asc()).all()

def get_patient(db: Session, patient_id: int):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

def update_patient(db: Session, patient_id: int, data: PatientUpdate):
    patient = get_patient(db, patient_id)
    for key, value in data.model_dump().items():
        setattr(patient, key, value)
    patient.remarks = generate_remarks(data.glucose, data.haemoglobin, data.cholesterol)
    db.commit()
    db.refresh(patient)
    return patient

def delete_patient(db: Session, patient_id: int):
    patient = get_patient(db, patient_id)
    db.delete(patient)
    db.commit()
    return {"message": "Patient deleted successfully"}
