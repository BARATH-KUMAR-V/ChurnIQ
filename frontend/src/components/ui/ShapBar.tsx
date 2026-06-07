interface Props {
  feature: string;
  shap: number;
  max: number;
}

export function ShapBar({ feature, shap, max }: Props) {
  const pct = max > 0 ? (Math.abs(shap) / max) * 100 : 0;
  const pos  = shap > 0;
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="w-44 flex-shrink-0 text-xs text-ms-neutral dark:text-navy-400
        font-medium truncate">
        {feature}
      </div>
      <div className="flex-1 h-1.5 bg-ms-gray dark:bg-navy-700
        rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500
            ${pos ? "bg-risk-high" : "bg-risk-low"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className={`font-mono text-[10px] w-14 text-right font-semibold
        ${pos ? "text-risk-high" : "text-risk-low"}`}>
        {shap > 0 ? "+" : ""}{shap.toFixed(3)}
      </div>
    </div>
  );
}