export function RiskBadge({ tier }: { tier: string }) {
  const t = (tier ?? "").toLowerCase();
  if (t === "high")   return <span className="badge-high">High</span>;
  if (t === "medium") return <span className="badge-medium">Medium</span>;
  return <span className="badge-low">Low</span>;
}