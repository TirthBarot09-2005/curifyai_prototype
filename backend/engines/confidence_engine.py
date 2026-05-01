"""Confidence Score Engine — measures data completeness and reliability."""


def compute_confidence(
    query: str = "",
    procedure: str = "",
    location: str = "",
    comorbidities: list[str] = [],
    age: int = 0,
    budget_provided: bool = False,
    hospital_count: int = 0,
):
    """
    Start at 0.90 and deduct for missing/incomplete data.
    Range: 0.0 – 1.0
    """
    score = 0.90

    # Deductions
    if not procedure or procedure == "General Consultation":
        score -= 0.15  # Unclear procedure
    if not location:
        score -= 0.10  # No location
    if not comorbidities:
        score -= 0.05  # No comorbidity data (might be fine, small penalty)
    if age <= 0:
        score -= 0.05  # No age
    if not budget_provided:
        score -= 0.03  # No budget
    if len(query.split()) < 3:
        score -= 0.08  # Very short query
    if hospital_count < 3:
        score -= 0.10  # Too few matching hospitals

    # Bonuses
    if len(comorbidities) > 0 and age > 0 and location:
        score += 0.05  # Complete patient profile

    return round(max(0.0, min(1.0, score)), 2)
