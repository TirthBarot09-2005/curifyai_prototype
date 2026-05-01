"""Professional Underwriting PDF Generator for CURIFY AI."""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.units import inch
from datetime import datetime
import os
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Register Unicode-capable fonts (Windows default Arial supports Rupee symbol)
try:
    pdfmetrics.registerFont(TTFont('Arial', 'C:/Windows/Fonts/arial.ttf'))
    pdfmetrics.registerFont(TTFont('Arial-Bold', 'C:/Windows/Fonts/arialbd.ttf'))
    FONT_NAME = 'Arial'
    FONT_BOLD = 'Arial-Bold'
except Exception as e:
    print(f"Warning: Could not load Arial font, falling back to Helvetica. Error: {e}")
    FONT_NAME = 'Helvetica'
    FONT_BOLD = 'Helvetica-Bold'

def generate_underwriting_pdf(data: dict, filename: str):
    """
    Generates a professional, lender-grade PDF report.
    Args:
        data: Dict containing cost_breakdown, underwriting_result, etc.
        filename: Path to save the PDF.
    """
    doc = SimpleDocTemplate(filename, pagesize=A4, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)
    styles = getSampleStyleSheet()
    elements = []

    # Custom Styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=12,
        fontName=FONT_BOLD
    )
    section_title = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=15,
        spaceAfter=8,
        fontName=FONT_BOLD,
        borderPadding=2,
        borderWidth=0,
        borderColor=colors.HexColor("#e2e8f0"),
    )
    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontSize=10,
        leading=12,
        textColor=colors.HexColor("#475569"),
        fontName=FONT_NAME
    )
    metric_label = ParagraphStyle(
        'MetricLabel',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor("#64748b"),
        textTransform='uppercase',
        fontName=FONT_NAME
    )
    metric_value = ParagraphStyle(
        'MetricValue',
        parent=styles['Normal'],
        fontSize=12,
        fontName=FONT_BOLD,
        textColor=colors.HexColor("#0f172a")
    )

    # 1. HEADER
    elements.append(Paragraph("Curify AI – Automated Underwriting Report", title_style))
    
    header_data = [
        [Paragraph(f"<b>Case ID:</b> {data.get('case_id', 'CUR-99283')}", body_style), 
         Paragraph(f"<b>Date:</b> {datetime.now().strftime('%Y-%m-%d')}", body_style)],
        [Paragraph(f"<b>Procedure:</b> {data.get('procedure', 'N/A')}", body_style), 
         Paragraph(f"<b>Geography:</b> {data.get('location', 'N/A')}", body_style)]
    ]
    t_header = Table(header_data, colWidths=[3*inch, 3*inch])
    t_header.setStyle(TableStyle([('ALIGN', (0,0), (-1,-1), 'LEFT'), ('VALIGN', (0,0), (-1,-1), 'TOP')]))
    elements.append(t_header)
    elements.append(Spacer(1, 15))

    # 2. EXECUTIVE SUMMARY
    elements.append(Paragraph("EXECUTIVE SUMMARY", section_title))
    
    # Decision Color Logic
    decision = data.get('decision', 'REJECT')
    d_color = colors.HexColor("#059669") if decision == "APPROVE" else colors.HexColor("#d97706") if decision == "APPROVE_WITH_CONDITIONS" else colors.HexColor("#dc2626")
    
    summary_data = [
        [Paragraph("UNDERWRITING DECISION", metric_label), Paragraph("APPROVED LOAN", metric_label), Paragraph("RISK SCORE", metric_label)],
        [Paragraph(f"<b><font color='{d_color}'>{decision.replace('_', ' ')}</font></b>", metric_value), 
         Paragraph(f"₹{data.get('approved_loan', 0):,}", metric_value), 
         Paragraph(f"{data.get('risk_score', 0)}/100", metric_value)]
    ]
    t_summary = Table(summary_data, colWidths=[2.2*inch, 2.2*inch, 2*inch])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f8fafc")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(t_summary)
    
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(f"<b>Exposure Confidence:</b> {data.get('confidence', 'Medium')} Level", body_style))
    elements.append(Spacer(1, 10))

    # 3. COST ANALYSIS
    elements.append(Paragraph("FINANCIAL ANALYSIS", section_title))
    cost = data.get('cost_breakdown', {})
    fin_data = [
        ["Benchmark Projection (Max)", f"₹{cost.get('total_max', 0):,}"],
        ["Buffered Requirement (20%)", f"₹{data.get('buffered_cost', 0):,}"],
        ["Safety Cap (2x Base)", f"₹{data.get('base_cost', 0)*2:,}"],
        ["Regional Volatility Factor", f"{data.get('geo_multiplier', 1.0)}x"]
    ]
    t_fin = Table(fin_data, colWidths=[3.5*inch, 2.5*inch])
    t_fin.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), FONT_NAME),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#f1f5f9")),
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#f8fafc")),
    ]))
    elements.append(t_fin)

    # 4. LOAN STRUCTURING
    elements.append(Paragraph("LOAN STRUCTURING", section_title))
    struct_data = [
        ["Requested Amount", f"₹{data.get('requested_loan', 0):,}"],
        ["Calculated Principal", f"₹{data.get('approved_loan', 0):,}"],
        ["Recommended Tenure", f"{data.get('recommended_tenure', 24)} Months"],
        ["Estimated Monthly EMI", f"₹{data.get('emi_estimate', 0):,}"]
    ]
    t_struct = Table(struct_data, colWidths=[3.5*inch, 2.5*inch])
    t_struct.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), FONT_NAME),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#f1f5f9")),
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#f8fafc")),
    ]))
    elements.append(t_struct)

    # 5. RISK ASSESSMENT
    elements.append(Paragraph("RISK ASSESSMENT", section_title))
    elements.append(Paragraph(f"<b>ICU Likelihood Index:</b> {data.get('icu_likelihood', 0)*100:.1f}%", body_style))
    elements.append(Spacer(1, 5))
    
    risk_flags = data.get('risk_flags', [])
    if risk_flags:
        for rf in risk_flags:
            flag_text = f"• [{rf.get('severity', 'LOW').upper()}] {rf.get('flag', 'Unknown')}: {rf.get('detail', '')}"
            elements.append(Paragraph(flag_text, body_style))
    else:
        elements.append(Paragraph("No critical risk flags identified in this assessment profile.", body_style))

    # 6. COST BREAKDOWN TABLE
    elements.append(Paragraph("COST COMPONENT BREAKDOWN", section_title))
    breakdown_data = [["Component", "Min Estimate", "Max Projection"]]
    for key in ['surgery', 'doctor', 'room', 'diagnostics', 'medicines', 'contingency']:
        val = cost.get(key, 0)
        breakdown_data.append([key.capitalize(), f"₹{val*0.9:,.0f}", f"₹{val:,.0f}"])
    
    t_breakdown = Table(breakdown_data, colWidths=[2.5*inch, 1.75*inch, 1.75*inch])
    t_breakdown.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1e293b")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), FONT_BOLD),
        ('FONTNAME', (0,1), (-1,-1), FONT_NAME),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
    ]))
    elements.append(t_breakdown)

    # 7. DECISION LOGIC
    elements.append(Paragraph("UNDERWRITING RATIONALE", section_title))
    reasoning = data.get('reasoning', [])
    for r in reasoning:
        elements.append(Paragraph(f"• {r}", body_style))

    # 9. DISCLAIMER
    elements.append(Spacer(1, 40))
    disclaimer_style = ParagraphStyle('Disclaimer', parent=body_style, fontSize=7, textColor=colors.HexColor("#94a3b8"), italic=True)
    elements.append(Paragraph(data.get('disclaimer', 'Model-based estimation. For institutional use only.'), disclaimer_style))

    # Build PDF
    doc.build(elements)
    return filename
