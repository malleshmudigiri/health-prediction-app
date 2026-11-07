from sqlalchemy import Column, Integer, String, Float, Text
from app.database.connection import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    date_of_birth = Column(String(10), nullable=False)  # stored as DD/MM/YYYY
    email = Column(String(254), nullable=False)
    glucose = Column(Float, nullable=False)
    haemoglobin = Column(Float, nullable=False)
    cholesterol = Column(Float, nullable=False)
    remarks = Column(Text, nullable=True)
