const API_BASE = "/api";

export async function apiPost(endpoint, data) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function apiGet(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function formatCurrency(amount) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

export function formatNumber(num) {
  return new Intl.NumberFormat("en-IN").format(Math.round(num));
}

export function getConfidenceColor(score) {
  if (score > 0.8) return "green";
  if (score >= 0.5) return "yellow";
  return "red";
}

export function getConfidenceLabel(score) {
  if (score > 0.8) return "High Confidence";
  if (score >= 0.5) return "Moderate Confidence";
  return "Low Confidence";
}
