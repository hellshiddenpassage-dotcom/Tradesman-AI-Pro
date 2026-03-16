export type LeadScoreResult = {
  score: number;
  reasons: string[];
};

export function scoreLead(text: string): LeadScoreResult {
  const lower = text.toLowerCase();
  let score = 0;
  const reasons: string[] = [];

  const positiveSignals: Array<[string, number, string]> = [
    ["gravel", 12, "Gravel/base work match"],
    ["driveway", 12, "Driveway work match"],
    ["pad", 12, "Pad prep match"],
    ["shop pad", 14, "Shop pad match"],
    ["brush", 10, "Brush clearing match"],
    ["clearing", 10, "Land clearing match"],
    ["excavation", 12, "Excavation match"],
    ["dig", 8, "Digging/trenching match"],
    ["fence", 8, "Fence work match"],
    ["concrete", 8, "Concrete-related match"],
    ["tractor", 5, "Equipment-friendly lead"],
    ["skid steer", 15, "Strong skid steer match"],
    ["urgent", 8, "Urgent lead"],
    ["asap", 8, "ASAP timing"],
    ["cash", 6, "Direct payment language"],
    ["estimate", 4, "Estimate requested"],
    ["quote", 4, "Quote requested"],
    ["acre", 8, "Likely larger job"],
    ["haul", 7, "Hauling/material job"],
    ["road base", 12, "Road base match"],
  ];

  const negativeSignals: Array<[string, number, string]> = [
    ["free", -15, "Low-quality/free request"],
    ["cheap", -8, "Price-shopping language"],
    ["volunteer", -20, "Non-paying lead"],
    ["remote only", -10, "Doesn't fit field-work model"],
  ];

  for (const [term, value, reason] of positiveSignals) {
    if (lower.includes(term)) {
      score += value;
      reasons.push(reason);
    }
  }

  for (const [term, value, reason] of negativeSignals) {
    if (lower.includes(term)) {
      score += value;
      reasons.push(reason);
    }
  }

  const moneyMatch = lower.match(/\$ ?\d[\d,]*/g);
  if (moneyMatch?.length) {
    score += 10;
    reasons.push("Budget mentioned");
  }

  const phoneMatch =
    /\b\d{3}[-.)\s]?\d{3}[-.\s]?\d{4}\b/.test(text) ||
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text);

  if (phoneMatch) {
    score += 10;
    reasons.push("Direct contact info included");
  }

  if (score < 0) score = 0;
  if (score > 100) score = 100;

  return { score, reasons };
}

export function scoreBucket(score: number): "Hot" | "Warm" | "Cold" {
  if (score >= 70) return "Hot";
  if (score >= 40) return "Warm";
  return "Cold";
}
