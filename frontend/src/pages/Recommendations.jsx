import React from "react";
import { Sparkles } from "lucide-react";
import EmptyState from "../components/ui/EmptyState";

export default function Recommendations() {
  return (
    <div className="page-container">
      <h1 className="text-lg font-semibold text-white">Recommendations</h1>
      <div className="section-card">
        <EmptyState icon={Sparkles} title="Recommendations coming soon" description="AI-powered product recommendations will appear here" />
      </div>
    </div>
  );
}
