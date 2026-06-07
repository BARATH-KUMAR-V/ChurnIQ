import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { api } from "../api/client";
import { PageHeader } from "../components/ui/PageHeader";
import { useTheme } from "../context/ThemeContext";

const FEAT_DESC: Record<string,string> = {
  "Tenure Months":       "How long they have been a customer",
  "Monthly Charges":     "How much they pay per month",
  "Total Charges":       "Total amount paid over their lifetime",
  "Contract Enc":        "Contract type — longer = safer",
  "Internet Service Enc":"Fiber optic customers churn most",
  "Tech Support Enc":    "Customers without tech support churn more",
  "No Support":          "No tech support = strong churn signal",
  "Contract Risk":       "Month-to-month = highest risk",
  "Fiber Risk":          "Fiber optic customers have higher churn",
  "Long Tenure Safe":    "Customers with >24 months are much safer",
  "Charge Per Tenure":   "High monthly cost relative to tenure = risky",
  "M2M Fiber Risk":      "Month-to-month + fiber = worst combination",
};

const COLORS = [
  "#0078D4","#2B88D8","#005A9E","#00B7C3",
  "#006CBE","#004F8F","#0063AD","#4A9FE0",
  "#60ADE8","#7DC3F0",
];

export function WhyLeave() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const tip = {
    fontSize:11, borderRadius:4,
    background:isDark?"#0f172a":"#fff",
    border:`1px solid ${isDark?"#334155":"#EDEBE9"}`,
    color:isDark?"#cbd5e1":"#201F1E",
  };

  const { data } = useQuery({ queryKey:["shap"], queryFn:api.shap });
  const top10    = data?.slice(0,10) ?? [];
  const maxVal   = top10[0]?.importance ?? 1;

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <PageHeader
        title="Why customers leave"
        subtitle="SHAP feature importance · mean |SHAP| values · XGBoost TreeExplainer"
      />

      <div className="bg-ms-gray dark:bg-navy-800
        border border-ms-border dark:border-navy-700
        rounded-fluent p-3 mb-5 text-[11px]
        text-ms-neutral dark:text-navy-300 leading-relaxed">
        <span className="font-semibold text-ms-dark dark:text-navy-100">
          How to read this:{" "}
        </span>
        Longer bar = stronger influence on the churn prediction.
        These insights come from real data — not assumptions.
        Each bar shows the average absolute impact of that feature
        across all 7,043 customers.
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Ranked list */}
        <div className="card p-5">
          <div className="text-[12px] font-semibold text-ms-dark dark:text-navy-100 mb-4">
            Factors ranked by influence
          </div>
          <div className="space-y-4">
            {top10.map((s,i)=>{
              const key  = s.feature.trim();
              const desc = FEAT_DESC[key] ?? s.feature;
              return (
                <motion.div key={s.feature}
                  initial={{ opacity:0, x:-8 }}
                  animate={{ opacity:1, x:0 }}
                  transition={{ delay:i*0.045 }}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-semibold
                      text-ms-dark dark:text-navy-100">
                      {s.feature}
                    </span>
                    <span className="font-mono text-[10px]
                      text-ms-neutral dark:text-navy-400">
                      {s.importance.toFixed(4)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-ms-gray dark:bg-navy-700
                    rounded-full overflow-hidden mb-1">
                    <motion.div className="h-full rounded-full"
                      initial={{ width:0 }}
                      animate={{ width:`${(s.importance/maxVal*100).toFixed(0)}%` }}
                      transition={{ duration:0.5, delay:i*0.045 }}
                      style={{ background:COLORS[i%COLORS.length] }}
                    />
                  </div>
                  <div className="text-[10px] text-ms-neutral dark:text-navy-400">
                    {desc}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Chart */}
        <div className="card p-5">
          <div className="text-[12px] font-semibold text-ms-dark dark:text-navy-100 mb-4">
            Importance chart
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={top10} layout="vertical">
              <XAxis type="number" tick={{ fontSize:9, fontWeight: isDark ? "normal" : "bold" }}
                stroke={isDark?"#475569":"#000000"} />
              <YAxis type="category" dataKey="feature"
                tick={{ fontSize:9, fontWeight: isDark ? "normal" : "bold" }} width={130}
                stroke={isDark?"#475569":"#000000"} />
              <Tooltip contentStyle={tip}
                formatter={(v:unknown)=>(v as number).toFixed(4)} />
              <Bar dataKey="importance" radius={[0,3,3,0]}>
                {top10.map((_,i)=>(
                  <Cell key={i} fill={COLORS[i%COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30
            border border-blue-100 dark:border-blue-900
            rounded-fluent text-[11px]">
            <div className="font-semibold text-ms-blue dark:text-blue-300 mb-1">
              Key business insight
            </div>
            <div className="text-ms-neutral dark:text-navy-400 leading-relaxed">
              <strong className="text-ms-dark dark:text-navy-200">
                Contract type
              </strong>{" "}
              is the #1 controllable factor — moving customers from
              month-to-month to annual contracts directly reduces churn.
              Combine with tech support enrollment for maximum retention impact.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}