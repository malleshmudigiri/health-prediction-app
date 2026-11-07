from datetime import datetime, date
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict

class PatientBase(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    date_of_birth: str
    email: EmailStr
    glucose: float = Field(gt=0)
    haemoglobin: float = Field(gt=0)
    cholesterol: float = Field(gt=0)

    @field_validator("full_name")
    @classmethod
    def clean_name(cls, value):
        value = value.strip()
        if not value:
            raise ValueError("Full name is required")
        return value

    @field_validator("date_of_birth")
    @classmethod
    def validate_dob(cls, value):
        raw = value.strip().replace(".", "/").replace("-", "/")
        parsed = None
        for fmt in ("%d/%m/%Y",):
            try:
                parsed = datetime.strptime(raw, fmt).date()
                break
            except ValueError:
                pass
        if parsed is None:
            raise ValueError("Date of birth must be a real date in DD/MM/YYYY format")
        if parsed > date.today():
            raise ValueError("Date of birth cannot be in the future")
        return parsed.strftime("%d/%m/%Y")

class PatientCreate(PatientBase):
    pass

class PatientUpdate(PatientBase):
    pass

class PatientOut(PatientBase):
    id: int
    remarks: str | None = None
    model_config = ConfigDict(from_attributes=True)
