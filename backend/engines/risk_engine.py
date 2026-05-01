"""Risk & Comorbidity Engine — risk flags and ICU likelihood."""

COMORBIDITY_RISK_DETAILS = {
    "diabetes": {
        "severity": "high",
        "detail": "Diabetes increases surgical risk, post-op infections, and healing time by 18-25%",
        "icu_factor": 0.15,
    },
    "hypertension": {
        "severity": "medium",
        "detail": "Hypertension requires BP management pre/post surgery, adds 8-12% cost overhead",
        "icu_factor": 0.08,
    },
    "cardiac_history": {
        "severity": "high",
        "detail": "Prior cardiac events increase anesthesia risk and require cardiac clearance, +22% cost",
        "icu_factor": 0.25,
    },
    "obesity": {
        "severity": "medium",
        "detail": "BMI >30 increases surgical complexity and post-op complications",
        "icu_factor": 0.10,
    },
    "copd": {
        "severity": "high",
        "detail": "COPD significantly increases ventilator dependence and ICU stay probability",
        "icu_factor": 0.20,
    },
    "ckd": {
        "severity": "high",
        "detail": "Chronic kidney disease requires dialysis management and careful drug dosing",
        "icu_factor": 0.18,
    },
}


def assess_risk(comorbidities: list[str], age: int, procedure: str):
    """Generate risk flags and ICU likelihood."""
    risk_flags = []
    base_icu = 0.10  # 10% base ICU likelihood

    for c in comorbidities:
        key = c.lower().replace(" ", "_")
        if key in COMORBIDITY_RISK_DETAILS:
            info = COMORBIDITY_RISK_DETAILS[key]
            risk_flags.append({
                "flag": f"{c.title()} Risk",
                "severity": info["severity"],
                "detail": info["detail"],
            })
            base_icu += info["icu_factor"]

    # Age-based risks
    if age >= 65:
        risk_flags.append({
            "flag": "Elderly Patient Risk",
            "severity": "high",
            "detail": f"Age {age}: increased anesthesia risk, slower recovery, +15% cost adjustment",
        })
        base_icu += 0.15
    elif age >= 50:
        risk_flags.append({
            "flag": "Age-related Risk",
            "severity": "medium",
            "detail": f"Age {age}: moderate risk adjustment, pre-op cardiac screening recommended",
        })
        base_icu += 0.05

    # Procedure-specific risk flags
    high_risk_procedures = ["cabg", "bypass", "transplant", "angioplasty", "tumor", "stroke"]
    if any(p in procedure.lower() for p in high_risk_procedures):
        risk_flags.append({
            "flag": "High-Risk Procedure",
            "severity": "high",
            "detail": f"'{procedure}' classified as high-risk; extended ICU monitoring likely",
        })
        base_icu += 0.15

    icu_likelihood = min(base_icu, 0.95)  # Cap at 95%

    # Workflow recommendation
    if icu_likelihood > 0.5:
        workflow = "MANUAL_REVIEW — High risk case requires senior underwriter review"
    elif icu_likelihood > 0.3:
        workflow = "ENHANCED_REVIEW — Moderate risk, additional documentation recommended"
    elif len(risk_flags) > 2:
        workflow = "STANDARD_PLUS — Multiple risk factors, verify comorbidity documentation"
    else:
        workflow = "AUTO_APPROVE — Low risk profile, standard processing"

    return {
        "risk_flags": risk_flags,
        "icu_likelihood": round(icu_likelihood, 2),
        "workflow_recommendation": workflow,
    }
