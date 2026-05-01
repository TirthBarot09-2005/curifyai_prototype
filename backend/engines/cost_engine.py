"""Cost Estimation Engine — computes cost breakdowns with geo and comorbidity modifiers."""

GEO_MULTIPLIERS = {
    "Metro": 1.4,
    "Tier2": 1.0,
    "Tier3": 0.75,
}

COMORBIDITY_UPLIFTS = {
    "diabetes": 0.18,
    "hypertension": 0.08,
    "cardiac_history": 0.22,
    "obesity": 0.12,
    "copd": 0.10,
    "ckd": 0.15,
    "elderly": 0.15,
}

MAX_UPLIFT_CAP = 0.60


def compute_cost(hospital_row: dict, comorbidities: list[str] = [], age: int = 30, blood_group: str = "", allergies: str = ""):
    """Compute min-max cost breakdown for a hospital."""
    tier = hospital_row.get("tier", "Tier2")
    geo_mult = GEO_MULTIPLIERS.get(tier, 1.0)

    # Comorbidity uplift
    total_uplift = 0.0
    for c in comorbidities:
        key = c.lower().replace(" ", "_")
        total_uplift += COMORBIDITY_UPLIFTS.get(key, 0.05)

    if age >= 65:
        total_uplift += COMORBIDITY_UPLIFTS.get("elderly", 0.15)

    # Blood group & Allergy uplift
    blood_uplift = 0.05 if blood_group and "-" in blood_group else 0.0
    allergy_uplift = 0.05 if allergies and len(allergies.strip()) > 3 and allergies.lower() != "none" else 0.0

    total_uplift = min(total_uplift + blood_uplift + allergy_uplift, MAX_UPLIFT_CAP)

    # Base rates from hospital
    surgery = hospital_row.get("base_rate_surgery", 150000)
    doctor = hospital_row.get("base_rate_doctor", 30000)
    room = hospital_row.get("base_rate_room", 5000)
    diagnostics = hospital_row.get("base_rate_diagnostics", 20000)
    medicines = hospital_row.get("base_rate_medicines", 12000)

    # LOS-based room cost (5-day base, can extend with comorbidities)
    los_days = 5 + int(total_uplift * 5)  # up to 8 days
    room_total = room * los_days

    # Apply modifiers
    modifier = geo_mult * (1 + total_uplift)

    surgery_adj = surgery * modifier
    doctor_adj = doctor * geo_mult
    diagnostics_adj = diagnostics * modifier
    
    # Medicines can increase specifically if patient has allergies (alternative drugs needed)
    medicine_modifier = modifier + (0.1 if allergy_uplift > 0 else 0)
    medicines_adj = medicines * medicine_modifier
    
    room_adj = room_total * geo_mult

    contingency_rate = 0.15 + (0.05 if total_uplift > 0.3 else 0) + (0.02 if blood_uplift > 0 else 0)
    subtotal = surgery_adj + doctor_adj + room_adj + diagnostics_adj + medicines_adj
    contingency = subtotal * contingency_rate

    total_min = subtotal * 0.85  # best case
    total_max = subtotal + contingency  # worst case

    return {
        "surgery": round(surgery_adj),
        "doctor": round(doctor_adj),
        "room": round(room_adj),
        "diagnostics": round(diagnostics_adj),
        "medicines": round(medicines_adj),
        "contingency": round(contingency),
        "total_min": round(total_min),
        "total_max": round(total_max),
        "geo_multiplier": geo_mult,
        "comorbidity_uplift": round(total_uplift, 2),
        "los_days": los_days,
    }
