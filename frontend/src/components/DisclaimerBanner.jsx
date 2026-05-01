import { AlertTriangle } from "lucide-react";

export default function DisclaimerBanner({ text }) {
  return (
    <div className="disclaimer-bar">
      <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm leading-relaxed">
        {text || "IMPORTANT: This is a Decision Support Tool, NOT a medical diagnosis. All estimates are indicative. Consult qualified healthcare professionals before making decisions."}
      </p>
    </div>
  );
}
