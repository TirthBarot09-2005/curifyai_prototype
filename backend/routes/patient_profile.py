"""Patient profile routes — stores medical/personal data linked to Clerk user ID."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import get_db
import sqlite3

router = APIRouter()


class PatientProfileCreate(BaseModel):
    clerk_user_id: str
    full_name: str
    email: str = ""
    age: Optional[int] = None
    date_of_birth: Optional[str] = None
    gender: str = ""
    blood_group: str = ""
    existing_conditions: str = ""
    allergies: str = ""
    city: str = ""
    area_pincode: str = ""
    emergency_name: str = ""
    emergency_phone: str = ""
    emergency_relation: str = ""
    role: str = "patient"
    lender_profile_completed: bool = False
    min_loan: Optional[float] = None
    max_loan: Optional[float] = None
    min_rate: Optional[float] = None
    max_rate: Optional[float] = None
    approval_time: str = ""
    supported_loan_types: str = ""
    customer_type: str = ""


class PatientProfileResponse(BaseModel):
    id: int
    clerk_user_id: str
    full_name: str
    email: str
    age: Optional[int]
    date_of_birth: Optional[str]
    gender: str
    blood_group: str
    existing_conditions: str
    allergies: str
    city: str
    area_pincode: str
    emergency_name: str
    emergency_phone: str
    emergency_relation: str
    role: str
    lender_profile_completed: bool
    min_loan: Optional[float]
    max_loan: Optional[float]
    min_rate: Optional[float]
    max_rate: Optional[float]
    approval_time: str
    supported_loan_types: str
    customer_type: str


@router.post("/patient-profile", response_model=PatientProfileResponse)
async def create_patient_profile(profile: PatientProfileCreate):
    """Create a new patient profile linked to a Clerk user ID."""
    conn = get_db()
    try:
        conn.execute("""
            INSERT INTO patient_profiles 
            (clerk_user_id, full_name, email, age, date_of_birth, gender, 
             blood_group, existing_conditions, allergies, city, area_pincode,
             emergency_name, emergency_phone, emergency_relation, role,
             lender_profile_completed, min_loan, max_loan, min_rate, max_rate,
             approval_time, supported_loan_types, customer_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            profile.clerk_user_id, profile.full_name, profile.email,
            profile.age, profile.date_of_birth, profile.gender,
            profile.blood_group, profile.existing_conditions, profile.allergies,
            profile.city, profile.area_pincode,
            profile.emergency_name, profile.emergency_phone, profile.emergency_relation,
            profile.role, int(profile.lender_profile_completed), 
            profile.min_loan, profile.max_loan, profile.min_rate, profile.max_rate,
            profile.approval_time, profile.supported_loan_types, profile.customer_type
        ))
        conn.commit()

        row = conn.execute(
            "SELECT * FROM patient_profiles WHERE clerk_user_id = ?",
            (profile.clerk_user_id,)
        ).fetchone()
        conn.close()

        return PatientProfileResponse(**dict(row))

    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=409, detail="Profile already exists for this user")


@router.get("/patient-profile/{clerk_user_id}")
async def get_patient_profile(clerk_user_id: str, email: Optional[str] = None):
    """Get patient profile by Clerk user ID or Email (fallback)."""
    conn = get_db()
    
    # 1. Try by Clerk ID
    row = conn.execute(
        "SELECT * FROM patient_profiles WHERE clerk_user_id = ?",
        (clerk_user_id,)
    ).fetchone()
    
    # 2. Try by Email if Clerk ID fails
    if not row and email:
        row = conn.execute(
            "SELECT * FROM patient_profiles WHERE email = ?",
            (email,)
        ).fetchone()
        
        # If found by email, update the clerk_user_id to the new one for future efficiency
        if row:
            conn.execute(
                "UPDATE patient_profiles SET clerk_user_id = ? WHERE email = ?",
                (clerk_user_id, email)
            )
            conn.commit()

    conn.close()

    if not row:
        return {"exists": False}

    return {"exists": True, "profile": dict(row)}


@router.put("/patient-profile/{clerk_user_id}", response_model=PatientProfileResponse)
async def update_patient_profile(clerk_user_id: str, profile: PatientProfileCreate):
    """Update an existing patient profile."""
    conn = get_db()
    conn.execute("""
        UPDATE patient_profiles SET
            full_name = ?, email = ?, age = ?, date_of_birth = ?, gender = ?,
            blood_group = ?, existing_conditions = ?, allergies = ?,
            city = ?, area_pincode = ?,
            emergency_name = ?, emergency_phone = ?, emergency_relation = ?,
            role = ?, lender_profile_completed = ?, min_loan = ?, max_loan = ?,
            min_rate = ?, max_rate = ?, approval_time = ?, supported_loan_types = ?,
            customer_type = ?
        WHERE clerk_user_id = ?
    """, (
        profile.full_name, profile.email, profile.age, profile.date_of_birth,
        profile.gender, profile.blood_group, profile.existing_conditions,
        profile.allergies, profile.city, profile.area_pincode,
        profile.emergency_name, profile.emergency_phone, profile.emergency_relation,
        profile.role, int(profile.lender_profile_completed), 
        profile.min_loan, profile.max_loan, profile.min_rate, profile.max_rate,
        profile.approval_time, profile.supported_loan_types, profile.customer_type,
        clerk_user_id
    ))
    conn.commit()

    row = conn.execute(
        "SELECT * FROM patient_profiles WHERE clerk_user_id = ?",
        (clerk_user_id,)
    ).fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")

    return PatientProfileResponse(**dict(row))
