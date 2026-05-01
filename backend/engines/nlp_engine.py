"""NLP Engine — structured parsing of patient queries."""

import re

# Symptom → procedure mapping
SYMPTOM_PROCEDURE_MAP = {
    "chest pain": {"procedure": "Angiography / Angioplasty", "specialty": "Cardiology"},
    "heart": {"procedure": "Cardiac Evaluation", "specialty": "Cardiology"},
    "heart attack": {"procedure": "Angioplasty / CABG", "specialty": "Cardiology"},
    "bypass": {"procedure": "CABG (Coronary Artery Bypass)", "specialty": "Cardiology"},
    "angioplasty": {"procedure": "Angioplasty", "specialty": "Cardiology"},
    "knee": {"procedure": "Knee Replacement", "specialty": "Orthopedics"},
    "knee pain": {"procedure": "Knee Replacement / Arthroscopy", "specialty": "Orthopedics"},
    "hip": {"procedure": "Hip Replacement", "specialty": "Orthopedics"},
    "joint": {"procedure": "Joint Replacement", "specialty": "Orthopedics"},
    "spine": {"procedure": "Spinal Surgery", "specialty": "Orthopedics"},
    "back pain": {"procedure": "Spinal Evaluation / Discectomy", "specialty": "Orthopedics"},
    "brain": {"procedure": "Neurological Evaluation", "specialty": "Neurology"},
    "headache": {"procedure": "Neurological Evaluation / MRI", "specialty": "Neurology"},
    "seizure": {"procedure": "Epilepsy Evaluation", "specialty": "Neurology"},
    "stroke": {"procedure": "Stroke Management / Thrombolysis", "specialty": "Neurology"},
    "cancer": {"procedure": "Oncology Consultation / Biopsy", "specialty": "Oncology"},
    "tumor": {"procedure": "Tumor Excision / Biopsy", "specialty": "Oncology"},
    "kidney": {"procedure": "Kidney Evaluation / Dialysis", "specialty": "Nephrology"},
    "dialysis": {"procedure": "Dialysis Setup", "specialty": "Nephrology"},
    "liver": {"procedure": "Liver Evaluation / Transplant", "specialty": "Gastroenterology"},
    "stomach": {"procedure": "Gastric Evaluation / Endoscopy", "specialty": "Gastroenterology"},
    "eye": {"procedure": "Ophthalmic Evaluation / LASIK", "specialty": "Ophthalmology"},
    "cataract": {"procedure": "Cataract Surgery", "specialty": "Ophthalmology"},
    "appendix": {"procedure": "Appendectomy", "specialty": "General Surgery"},
    "hernia": {"procedure": "Hernia Repair", "specialty": "General Surgery"},
    "gallbladder": {"procedure": "Cholecystectomy", "specialty": "General Surgery"},
    "pregnancy": {"procedure": "Obstetric Care / Delivery", "specialty": "Obstetrics"},
    "delivery": {"procedure": "Normal / C-Section Delivery", "specialty": "Obstetrics"},
    "c-section": {"procedure": "Caesarean Section", "specialty": "Obstetrics"},
    "fracture": {"procedure": "Fracture Fixation / ORIF", "specialty": "Orthopedics"},
    "transplant": {"procedure": "Organ Transplant Evaluation", "specialty": "Transplant"},
    "urology": {"procedure": "Urological Evaluation", "specialty": "Urology"},
    "prostate": {"procedure": "Prostate Evaluation / TURP", "specialty": "Urology"},
}

CITY_ALIASES = {
    "mumbai": "Mumbai", "bombay": "Mumbai",
    "delhi": "Delhi", "new delhi": "Delhi",
    "bangalore": "Bangalore", "bengaluru": "Bangalore",
    "chennai": "Chennai", "madras": "Chennai",
    "hyderabad": "Hyderabad",
    "kolkata": "Kolkata", "calcutta": "Kolkata",
    "pune": "Pune",
    "gurgaon": "Gurgaon", "gurugram": "Gurgaon",
    "ahmedabad": "Ahmedabad",
    "kochi": "Kochi", "cochin": "Kochi",
    "vellore": "Vellore",
    "patna": "Patna",
    "madurai": "Madurai",
}


def parse_query(raw_query: str, location: str = ""):
    """Extract procedure, symptom, specialty from free-text query."""
    query_lower = raw_query.lower().strip()

    matched_symptom = ""
    matched_procedure = "General Consultation"
    matched_specialty = "General Medicine"

    # Match longest symptom first
    sorted_keys = sorted(SYMPTOM_PROCEDURE_MAP.keys(), key=len, reverse=True)
    for symptom in sorted_keys:
        if symptom in query_lower:
            matched_symptom = symptom
            matched_procedure = SYMPTOM_PROCEDURE_MAP[symptom]["procedure"]
            matched_specialty = SYMPTOM_PROCEDURE_MAP[symptom]["specialty"]
            break

    # Try to extract location from query if not provided
    parsed_location = location
    if not parsed_location:
        for alias, city in CITY_ALIASES.items():
            if alias in query_lower:
                parsed_location = city
                break

    # Extract budget hints
    budget_match = re.search(r'(\d+)\s*(?:lakh|lac|L)', query_lower)
    budget_range = [0, 5000000]
    if budget_match:
        lakhs = int(budget_match.group(1))
        budget_range = [lakhs * 50000, lakhs * 150000]

    return {
        "raw_query": raw_query,
        "procedure": matched_procedure,
        "symptom": matched_symptom,
        "specialty": matched_specialty,
        "location": parsed_location,
        "budget_range": budget_range,
    }
