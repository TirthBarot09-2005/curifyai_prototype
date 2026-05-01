"""Underwriting route — risk assessment and cost estimation for lenders."""

from fastapi import APIRouter
from fastapi.responses import FileResponse
from models import UnderwriteRequest, UnderwriteResponse
from database import get_db
from engines.cost_engine import compute_cost, GEO_MULTIPLIERS
from engines.risk_engine import assess_risk
from engines.confidence_engine import compute_confidence
from engines.underwriting_engine import process_underwriting
from services.pdf_service import generate_underwriting_pdf
import os
from datetime import datetime

router = APIRouter()

DISCLAIMER = (
    "IMPORTANT: This underwriting report is for decision support only. "
    "All cost projections are based on historical benchmarks and statistical models. "
    "Final underwriting decisions must be made by qualified professionals."
)

# Tier mapping from location name
LOCATION_TIER_MAP = {
    "Mumbai": "Metro", "Delhi": "Metro", "Bangalore": "Metro", "Chennai": "Metro",
    "Hyderabad": "Metro", "Kolkata": "Metro", "Gurgaon": "Metro",
    "Pune": "Tier2", "Ahmedabad": "Tier2", "Kochi": "Tier2", "Vellore": "Tier2",
    "Madurai": "Tier2", "Jaipur": "Tier2", "Lucknow": "Tier2",
    "Patna": "Tier3", "Bhopal": "Tier3", "Ranchi": "Tier3",
}

def _run_underwriting_logic(req: UnderwriteRequest):
    """Shared logic for both JSON and PDF endpoints."""
    tier = LOCATION_TIER_MAP.get(req.location, "Tier2")
    geo_mult = GEO_MULTIPLIERS.get(tier, 1.0)

    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM hospitals WHERE city = ? OR state = ?",
        (req.location, req.location)
    ).fetchall()

    if not rows:
        rows = conn.execute("SELECT * FROM hospitals").fetchall()
    conn.close()

    avg_hospital = {
        "base_rate_surgery": sum(dict(r)["base_rate_surgery"] for r in rows) / len(rows),
        "base_rate_doctor": sum(dict(r)["base_rate_doctor"] for r in rows) / len(rows),
        "base_rate_room": sum(dict(r)["base_rate_room"] for r in rows) / len(rows),
        "base_rate_diagnostics": sum(dict(r)["base_rate_diagnostics"] for r in rows) / len(rows),
        "base_rate_medicines": sum(dict(r)["base_rate_medicines"] for r in rows) / len(rows),
        "tier": tier,
    }

    cost = compute_cost(avg_hospital, req.comorbidities, req.age)
    risk_info = assess_risk(req.comorbidities, req.age, req.procedure)
    
    base_risk = risk_info["icu_likelihood"] * 100
    risk_score = min(100, int(base_risk + (len(req.comorbidities) * 10)))

    confidence_score = compute_confidence(
        query=req.procedure,
        procedure=req.procedure,
        location=req.location,
        comorbidities=req.comorbidities,
        age=req.age,
        budget_provided=req.loan_amount > 0,
        hospital_count=len(rows),
    )

    underwriting_result = process_underwriting(
        estimated_cost=int(cost["total_max"]),
        requested_loan=int(req.loan_amount),
        risk_score=risk_score,
        confidence_score=int(confidence_score * 100)
    )
    
    return {
        "cost": cost,
        "risk_info": risk_info,
        "confidence_score": confidence_score,
        "underwriting_result": underwriting_result,
        "geo_mult": geo_mult
    }

@router.post("/underwrite", response_model=UnderwriteResponse)
async def underwrite(req: UnderwriteRequest):
    res = _run_underwriting_logic(req)
    cost = res["cost"]
    risk_info = res["risk_info"]
    underwriting_result = res["underwriting_result"]

    return UnderwriteResponse(
        cost_breakdown={
            "surgery": cost["surgery"],
            "doctor": cost["doctor"],
            "room": cost["room"],
            "diagnostics": cost["diagnostics"],
            "medicines": cost["medicines"],
            "contingency": cost["contingency"],
            "total_min": cost["total_min"],
            "total_max": cost["total_max"],
        },
        risk_flags=risk_info["risk_flags"],
        icu_likelihood=risk_info["icu_likelihood"],
        confidence_score=res["confidence_score"],
        comorbidity_uplift=0.15,
        geo_multiplier=res["geo_mult"],
        approved_loan=underwriting_result["approved_loan"],
        base_cost=underwriting_result["base_cost"],
        buffered_cost=underwriting_result["buffered_cost"],
        requested_loan=underwriting_result["requested_loan"],
        risk_score=underwriting_result["risk_score"],
        confidence=underwriting_result["confidence"],
        decision=underwriting_result["decision"],
        reasoning=underwriting_result["reasoning"],
        message=underwriting_result["message"],
        emi_estimate=underwriting_result["emi_estimate"],
        recommended_tenure=underwriting_result["recommended_tenure"],
        disclaimer=DISCLAIMER,
    )

@router.post("/underwrite/download")
async def download_underwriting_report(req: UnderwriteRequest):
    res = _run_underwriting_logic(req)
    
    # Merge for PDF
    pdf_data = {
        "procedure": req.procedure,
        "location": req.location,
        "cost_breakdown": res["cost"],
        "risk_flags": res["risk_info"]["risk_flags"],
        "icu_likelihood": res["risk_info"]["icu_likelihood"],
        "confidence_score": res["confidence_score"],
        "geo_multiplier": res["geo_mult"],
        **res["underwriting_result"],
        "disclaimer": DISCLAIMER
    }
    
    os.makedirs("reports", exist_ok=True)
    report_filename = f"reports/underwriting_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    generate_underwriting_pdf(pdf_data, report_filename)
    
    return FileResponse(report_filename, media_type='application/pdf', filename="underwriting_report.pdf")
