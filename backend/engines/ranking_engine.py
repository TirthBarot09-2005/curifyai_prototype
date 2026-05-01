"""Hospital Ranking Engine — composite scoring for hospital recommendations."""

import math


def haversine_km(lat1, lng1, lat2, lng2):
    """Calculate distance between two points in km."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    return R * 2 * math.asin(math.sqrt(a))


# City coordinates for proximity calculation
CITY_COORDS = {
    "Mumbai": (19.0760, 72.8777),
    "Delhi": (28.6139, 77.2090),
    "Bangalore": (12.9716, 77.5946),
    "Chennai": (13.0827, 80.2707),
    "Hyderabad": (17.3850, 78.4867),
    "Kolkata": (22.5726, 88.3639),
    "Pune": (18.5204, 73.8567),
    "Gurgaon": (28.4595, 77.0266),
    "Ahmedabad": (23.0225, 72.5714),
    "Kochi": (9.9312, 76.2673),
    "Vellore": (12.9165, 79.1325),
    "Patna": (25.6093, 85.1376),
    "Madurai": (9.9252, 78.1198),
}

ACCREDITATION_SCORES = {
    "NABH, JCI": 1.0,
    "NABH, NAAC": 0.9,
    "NABH": 0.8,
    "NAAC": 0.7,
    "": 0.4,
}


def rank_hospitals(hospitals: list[dict], specialty: str, location: str,
                   budget_max: float = 5000000, cost_estimates: dict = {}):
    """
    Rank hospitals using composite score with strict filtering:
    Score = (0.35 * clinical) + (0.25 * accreditation) + (0.15 * reputation) + (0.15 * affordability) + (0.10 * proximity)
    """
    user_coords = CITY_COORDS.get(location, (20.5937, 78.9629))  # Default: center of India
    is_specific_specialty = specialty.lower() not in ["general medicine", "general consultation", ""]

    scored = []
    for h in hospitals:
        h_dict = dict(h)
        h_id = h_dict["id"]

        # 1. Clinical relevance — does hospital have the specialty?
        specs = (h_dict.get("specialties") or "").split(",")
        specs_lower = [s.strip().lower() for s in specs]
        
        has_specialty = specialty.lower() in specs_lower
        
        # If user searched for a specific specialty, and this hospital doesn't have it, 
        # we give it a very low score or we'll filter it later.
        clinical = 1.0 if has_specialty else 0.1 if is_specific_specialty else 0.5

        # 2. Accreditation
        accred = ACCREDITATION_SCORES.get(h_dict.get("accreditation", ""), 0.4)

        # 3. Reputation (already 0-1)
        reputation = h_dict.get("reputation_score", 0.5)

        # 4. Affordability (inverse of cost relative to budget)
        cost_info = cost_estimates.get(h_id, {})
        total_max = cost_info.get("total_max", 300000)
        
        # Stricter budget penalty: if cost > budget, affordability drops fast
        if budget_max > 0 and budget_max < 5000000: # User provided a real budget
            if total_max <= budget_max:
                affordability = 1.0 - (total_max / (budget_max * 1.2)) # High score if under budget
            elif total_max <= budget_max * 1.5:
                affordability = 0.4 # Significant penalty if slightly over
            else:
                affordability = 0.0 # Extreme penalty if way over
        else:
            affordability = max(0, min(1.0, 1.0 - (total_max / 1000000))) # Default normalization

        # 5. Proximity
        h_lat = h_dict.get("lat", 20.0)
        h_lng = h_dict.get("lng", 78.0)
        dist_km = haversine_km(user_coords[0], user_coords[1], h_lat, h_lng)
        proximity = max(0, 1.0 - (dist_km / 2500))  # Normalize

        # Composite score
        composite = (
            0.35 * clinical +
            0.25 * accred +
            0.15 * reputation +
            0.15 * affordability +
            0.10 * proximity
        )

        # Hard filtering: If specific specialty requested, and hospital doesn't have it, 
        # and we have other hospitals that DO have it, we'll deprioritize or drop.
        # For now, we'll keep them but with the low clinical score they will naturally fall to bottom.
        
        scored.append({
            **h_dict,
            "composite_score": round(composite, 3),
            "clinical_relevance": round(clinical, 2),
            "accreditation_score": round(accred, 2),
            "affordability_score": round(affordability, 2),
            "reputation_score": round(reputation, 2),
            "proximity_km": round(dist_km, 1),
            "proximity_score": round(proximity, 2),
            "has_specialty": has_specialty
        })

    # Strict Filtering Logic:
    # 1. If specific specialty requested, prefer those that have it.
    matching_specialty = [s for s in scored if s["has_specialty"]]
    if is_specific_specialty and matching_specialty:
        # Only show hospitals that match the specialty if any exist
        final_list = matching_specialty
    else:
        final_list = scored

    final_list.sort(key=lambda x: x["composite_score"], reverse=True)
    return final_list[:10]

