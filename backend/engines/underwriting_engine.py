"""Fintech-grade Underwriting Engine for CURIFY AI."""

import math

def calculate_loan_amount(estimated_cost: int, requested_loan: int = 0) -> dict:
    """
    Decouples medical requirement from user intent.
    Logic:
    1. base_cost = estimated_cost
    2. buffered_cost = base_cost * 1.2
    3. recommended_loan = max(buffered_cost, requested_loan)
    4. safety_cap = base_cost * 2
    5. final_loan = min(recommended_loan, safety_cap)
    """
    base_cost = estimated_cost
    buffered_cost = base_cost * 1.2
    
    if requested_loan > 0:
        # Honor the requested amount, but don't exceed the buffered medical cost
        recommended_loan = min(buffered_cost, requested_loan)
    else:
        recommended_loan = buffered_cost
        
    safety_cap = base_cost * 2
    final_loan = min(recommended_loan, safety_cap)
    
    is_capped = recommended_loan > safety_cap
    
    return {
        "final_loan": final_loan,
        "base_cost": base_cost,
        "buffered_cost": buffered_cost,
        "is_capped": is_capped
    }

def apply_risk_adjustment(loan_amount: float, risk_score: int, max_allowed: float) -> float:
    """
    Adjusts loan based on risk profile.
    If risk > 75: -20%
    If risk < 40: +10% (capped at max_allowed)
    """
    adjusted_loan = loan_amount
    
    if risk_score > 75:
        adjusted_loan *= 0.8
    elif risk_score < 40:
        adjusted_loan *= 1.1
        
    return min(adjusted_loan, max_allowed)

def generate_decision(risk_score: int) -> dict:
    """
    Determines final decision based on risk score.
    > 85: REJECT
    60-85: APPROVE_WITH_CONDITIONS
    < 60: APPROVE
    """
    if risk_score > 85:
        return {"decision": "REJECT", "label": "Reject"}
    elif risk_score >= 60:
        return {"decision": "APPROVE_WITH_CONDITIONS", "label": "Approve with Conditions"}
    else:
        return {"decision": "APPROVE", "label": "Approve"}

def estimate_emi(principal: float, rate_annual: float = 12.0, tenure_months: int = 24) -> float:
    """Calculate monthly EMI."""
    r = rate_annual / (12 * 100)
    if r == 0: return principal / tenure_months
    emi = principal * r * (pow(1 + r, tenure_months) / (pow(1 + r, tenure_months) - 1))
    return round(emi, 2)

def process_underwriting(estimated_cost: int, requested_loan: int, risk_score: int, confidence_score: int) -> dict:
    """Main entry point for fintech underwriting logic."""
    
    # 1. Base calculation
    calc = calculate_loan_amount(estimated_cost, requested_loan)
    
    # 2. Risk adjustment
    adjusted_loan = apply_risk_adjustment(calc["final_loan"], risk_score, calc["base_cost"] * 2)
    
    # 3. Rounding to nearest 10,000
    final_approved = round(adjusted_loan / 10000) * 10000
    
    # 4. Decision
    decision_info = generate_decision(risk_score)
    
    # 5. Reasoning & Messages
    reasoning = []
    if requested_loan > 0 and final_approved == round(requested_loan / 10000) * 10000:
        message = "Loan approved for the requested amount."
        reasoning.append("Approved amount matches user request (within rounding).")
    elif calc["is_capped"]:
        message = "Requested loan exceeds medical requirement, capped at safe limit."
        reasoning.append("Requested loan amount exceeded the safety cap (2x base medical cost).")
    else:
        message = "Loan approved based on estimated treatment cost and risk profile."
        reasoning.append("Loan amount aligned with medical cost estimates and contingency buffers.")
        
    if risk_score > 75:
        reasoning.append("Applied 20% risk-haircut due to high clinical risk score (>75).")
    elif risk_score < 40:
        reasoning.append("Incentivized low-risk profile with 10% additional credit headroom.")
        
    # 6. Bonus: EMI & Tenure
    # Recommend tenure based on loan amount
    if final_approved > 500000:
        tenure = 36
    elif final_approved > 200000:
        tenure = 24
    else:
        tenure = 12
        
    emi = estimate_emi(final_approved, tenure_months=tenure)
    
    # Confidence label
    if confidence_score > 80:
        conf_label = "High"
    elif confidence_score > 50:
        conf_label = "Medium"
    else:
        conf_label = "Low"
        
    return {
        "approved_loan": int(final_approved),
        "base_cost": int(calc["base_cost"]),
        "buffered_cost": int(calc["buffered_cost"]),
        "requested_loan": requested_loan,
        "risk_score": risk_score,
        "confidence": conf_label,
        "decision": decision_info["decision"],
        "reasoning": reasoning,
        "message": message,
        "emi_estimate": emi,
        "recommended_tenure": tenure
    }
