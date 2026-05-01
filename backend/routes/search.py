"""Patient Search route — NLP parsing, hospital ranking, cost estimation."""

from fastapi import APIRouter
from models import SearchRequest, SearchResponse
from database import get_db
from engines.nlp_engine import parse_query
from engines.cost_engine import compute_cost
from engines.ranking_engine import rank_hospitals
from engines.confidence_engine import compute_confidence
from engines.lender_engine import match_lenders

router = APIRouter()

DISCLAIMER = (
    "IMPORTANT: This is a Decision Support Tool, NOT a medical diagnosis. "
    "All cost estimates are indicative and based on historical benchmarks. "
    "Actual costs may vary. Always consult qualified healthcare professionals "
    "before making medical decisions."
)



@router.post("/search", response_model=SearchResponse)
async def search_hospitals(req: SearchRequest):
    # 1. Parse query with NLP engine
    parsed = parse_query(req.query, req.location)

    # 2. Fetch hospitals from DB — filter by location if provided
    location = parsed["location"] or req.location or ""
    conn = get_db()
    if location:
        # Try exact city match first, then state match
        rows = conn.execute(
            "SELECT * FROM hospitals WHERE LOWER(city) = LOWER(?) OR LOWER(state) = LOWER(?)",
            (location, location)
        ).fetchall()
        if not rows:
            # Try partial/fuzzy match on city name (e.g. "ahmed" → "Ahmedabad")
            rows = conn.execute(
                "SELECT * FROM hospitals WHERE LOWER(city) LIKE LOWER(?) OR LOWER(state) LIKE LOWER(?)",
                (f"%{location}%", f"%{location}%")
            ).fetchall()
        # If still no results, return empty — don't fall back to all hospitals
    else:
        rows = conn.execute("SELECT * FROM hospitals").fetchall()
    conn.close()

    # 3. Compute costs for each hospital
    cost_map = {}
    for row in rows:
        h = dict(row)
        cost_map[h["id"]] = compute_cost(h, req.comorbidities or [], req.age or 30)

    # 4. Rank hospitals
    budget_max = req.budget_max if req.budget_max and req.budget_max > 0 else 5000000
    ranked = rank_hospitals(
        rows,
        parsed["specialty"],
        location,
        budget_max,
        cost_map
    )

    # 5. Compute confidence score
    confidence = compute_confidence(
        query=req.query,
        procedure=parsed["procedure"],
        location=location,
        comorbidities=req.comorbidities or [],
        age=req.age or 0,
        budget_provided=bool(req.budget_max and req.budget_max < 5000000),
        hospital_count=len(ranked),
    )

    # 6. Build response
    hospital_results = []
    for h in ranked:
        cost = cost_map.get(h["id"], {})
        hospital_results.append({
            "id": h["id"],
            "name": h["name"],
            "city": h["city"],
            "state": h["state"],
            "tier": h["tier"],
            "accreditation": h.get("accreditation", ""),
            "specialties": (h.get("specialties") or "").split(","),
            "composite_score": h["composite_score"],
            "clinical_relevance": h.get("clinical_relevance", 0),
            "affordability_score": h.get("affordability_score", 0),
            "reputation_score": h.get("reputation_score", 0),
            "proximity_km": h.get("proximity_km", 0),
            "cost_breakdown": {
                "surgery": cost.get("surgery", 0),
                "doctor": cost.get("doctor", 0),
                "room": cost.get("room", 0),
                "diagnostics": cost.get("diagnostics", 0),
                "medicines": cost.get("medicines", 0),
                "contingency": cost.get("contingency", 0),
                "total_min": cost.get("total_min", 0),
                "total_max": cost.get("total_max", 0),
            },
            "beds": h.get("beds", 0),
            "icu_beds": h.get("icu_beds", 0),
            "established_year": h.get("established_year", 0),
            "phone": h.get("phone", "N/A"),
            "latitude": h.get("lat", 0.0),
            "longitude": h.get("lng", 0.0),
        })

    # 7. Lender Matching & Financing
    user_budget = int(req.budget_max) if req.budget_max else 5000000
    # Use the max cost of the top ranked hospital as the benchmark
    estimated_cost = int(hospital_results[0]["cost_breakdown"]["total_max"]) if hospital_results else 0
    budget_gap = max(0, estimated_cost - user_budget)
    show_financing = budget_gap > 0

    if show_financing:
        lender_data = match_lenders(estimated_cost, user_budget)
        financing_options = lender_data["options"]
        financing_message = lender_data["message"]
        lowest_emi = lender_data["lowest_emi"]
        recommended_lender = lender_data["recommended_lender"]
    else:
        financing_options = []
        financing_message = ""
        lowest_emi = 0
        recommended_lender = ""

    return SearchResponse(
        parsed_intent={
            "raw_query": parsed["raw_query"],
            "procedure": parsed["procedure"],
            "symptom": parsed["symptom"],
            "specialty": parsed["specialty"],
            "location": location or "India",
            "budget_range": parsed["budget_range"],
        },
        hospitals=hospital_results,
        confidence_score=confidence,
        disclaimer=DISCLAIMER,
        estimated_cost=estimated_cost,
        budget_gap=budget_gap,
        show_financing=show_financing,
        lowest_emi=lowest_emi,
        recommended_lender=recommended_lender,
        message=financing_message,
        financing_options=financing_options,
    )
