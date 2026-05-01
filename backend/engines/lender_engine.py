"""Lender Matching Engine — Financial options for healthcare costs."""

from typing import List, Dict

def calculate_emi(principal: int, annual_rate: float, months: int) -> int:
    """Standard EMI calculation formula: [P x R x (1+R)^N] / [(1+R)^N - 1]"""
    if annual_rate == 0:
        return round(principal / months)
    
    r = (annual_rate / 100) / 12
    n = months
    emi = (principal * r * (1 + r)**n) / ((1 + r)**n - 1)
    return round(emi)

def match_lenders(estimated_cost: int, user_budget: int) -> Dict:
    """
    Match available lenders, calculate EMIs, and identify the best recommendation.
    Returns a dict with summary and detailed options.
    """
    gap = max(0, estimated_cost - user_budget)
    if gap <= 0:
        return {
            "lowest_emi": 0,
            "recommended_lender": "",
            "message": "",
            "options": []
        }
    
    # Static lender database with extended metadata
    lenders = [
        {
            "id": "carepay_01",
            "lender_name": "CarePay",
            "interest_rate": 0.0,
            "max_loan": 300000,
            "tenure": 9,
            "approval_time": "Instant",
            "trust_signals": ["No collateral", "Instant approval"]
        },
        {
            "id": "bajaj_01",
            "lender_name": "Bajaj Finserv Health",
            "interest_rate": 8.5,
            "max_loan": 500000,
            "tenure": 24,
            "approval_time": "2 hours",
            "trust_signals": ["High approval rate", "No hidden fees"]
        },
        {
            "id": "arogya_01",
            "lender_name": "Arogya Finance",
            "interest_rate": 10.0,
            "max_loan": 1000000,
            "tenure": 36,
            "approval_time": "24 hours",
            "trust_signals": ["Pan-India presence", "Easy documentation"]
        }
    ]
    
    options = []
    for lender in lenders:
        # Check if lender covers at least 40% of the gap
        if lender["max_loan"] >= (gap * 0.4):
            emi = calculate_emi(gap, lender["interest_rate"], lender["tenure"])
            total_repayment = emi * lender["tenure"]
            
            option = {
                **lender,
                "emi": emi,
                "total_repayment": total_repayment,
                "tag": "",
                "is_recommended": False,
                "reason": ""
            }
            options.append(option)
            
    if not options:
        return {
            "lowest_emi": 0,
            "recommended_lender": "",
            "message": "Treatment exceeds current financing limits.",
            "options": []
        }

    # 1. Smart Tagging
    # Sort for Lowest EMI
    options.sort(key=lambda x: x["emi"])
    options[0]["tag"] = "Lowest EMI"
    options[0]["reason"] = "Lowest monthly payment option"
    
    # 0% Interest Tag
    for opt in options:
        if opt["interest_rate"] == 0:
            opt["tag"] = "0% Interest"
            opt["reason"] = "Interest-free medical credit"
            
    # Fast Approval Tag (if not already tagged or if it's the fastest)
    fastest = min(options, key=lambda x: 0 if x["approval_time"] == "Instant" else 24)
    if not fastest["tag"]:
        fastest["tag"] = "Fast Approval"
        fastest["reason"] = f"{fastest['approval_time']} processing time"

    # 2. Recommendation Logic
    # Prefer 0% interest if available, else lowest EMI with reasonable tenure
    recommended = next((o for o in options if o["interest_rate"] == 0), options[0])
    recommended["is_recommended"] = True
    if not recommended["reason"]:
        recommended["reason"] = "Best balanced plan for your budget"

    # 3. Summary Stats
    lowest_emi = options[0]["emi"]
    rec_name = recommended["lender_name"]
    
    return {
        "lowest_emi": lowest_emi,
        "recommended_lender": rec_name,
        "message": f"You're ₹{gap:,} short, but you can start treatment from just ₹{lowest_emi:,}/month.",
        "options": options
    }
