"""Pydantic models for API request/response validation."""

from pydantic import BaseModel
from typing import Optional


# --- Auth ---
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    city: str = ""
    role: str  # "patient" or "lender"

class AuthResponse(BaseModel):
    success: bool
    user: Optional[dict] = None
    message: str = ""


# --- Patient Search ---
class SearchRequest(BaseModel):
    query: str
    location: Optional[str] = ""
    budget_min: Optional[float] = 0
    budget_max: Optional[float] = 5000000
    age: Optional[int] = 30
    comorbidities: Optional[list[str]] = []
    blood_group: Optional[str] = ""
    allergies: Optional[str] = ""


class CostBreakdown(BaseModel):
    surgery: float
    doctor: float
    room: float
    diagnostics: float
    medicines: float
    contingency: float
    total_min: float
    total_max: float


class HospitalResult(BaseModel):
    id: int
    name: str
    city: str
    state: str
    tier: str
    accreditation: str
    specialties: list[str]
    composite_score: float
    clinical_relevance: float
    affordability_score: float
    reputation_score: float
    proximity_km: float
    cost_breakdown: CostBreakdown
    beds: int
    icu_beds: int
    established_year: int
    phone: Optional[str] = "N/A"
    latitude: Optional[float] = 0.0
    longitude: Optional[float] = 0.0


class ParsedIntent(BaseModel):
    raw_query: str
    procedure: str
    symptom: str
    specialty: str
    location: str
    budget_range: list[float]


class FinancingOption(BaseModel):
    id: str
    lender_name: str
    emi: float
    tenure: int
    interest_rate: float
    approval_time: str
    tag: str
    is_recommended: bool
    reason: str
    trust_signals: list[str] = []
    total_repayment: float = 0



class SearchResponse(BaseModel):
    parsed_intent: ParsedIntent
    hospitals: list[HospitalResult]
    confidence_score: float
    disclaimer: str
    estimated_cost: Optional[int] = 0
    budget_gap: Optional[int] = 0
    show_financing: Optional[bool] = False
    lowest_emi: Optional[float] = 0
    recommended_lender: Optional[str] = ""
    message: Optional[str] = ""
    financing_options: Optional[list[FinancingOption]] = []




# --- Underwriting ---
class UnderwriteRequest(BaseModel):
    procedure: str
    location: str
    age: int
    comorbidities: list[str] = []
    blood_group: Optional[str] = ""
    allergies: Optional[str] = ""
    loan_amount: float = 0


class RiskFlag(BaseModel):
    flag: str
    severity: str  # "low", "medium", "high"
    detail: str


class UnderwriteResponse(BaseModel):
    cost_breakdown: CostBreakdown
    risk_flags: list[RiskFlag]
    icu_likelihood: float
    confidence_score: float
    comorbidity_uplift: float
    geo_multiplier: float
    approved_loan: int
    base_cost: int
    buffered_cost: int
    requested_loan: int
    risk_score: int
    confidence: str  # "Low", "Medium", "High"
    decision: str  # "APPROVE", "APPROVE_WITH_CONDITIONS", "REJECT"
    reasoning: list[str]
    message: str
    emi_estimate: float
    recommended_tenure: int
    disclaimer: str

