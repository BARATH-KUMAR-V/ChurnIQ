import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { api } from "../api/client";
import type { CustomerDetail } from "../api/client";
import { RiskBadge } from "../components/ui/RiskBadge";
import { ShapBar } from "../components/ui/ShapBar";
import { PageHeader } from "../components/ui/PageHeader";

const FILTERS = [
  { label:"All",    value:"all"    },
  { label:"High",   value:"high"   },
  { label:"Medium", value:"medium" },
  { label:"Low",    value:"low"    },
];

export function Customers() {
  const [risk, setRisk]       = useState("all");
  const [q, setQ]             = useState("");
  const [panel, setPanel]     = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const { data } = useQuery({
    queryKey:["customers", risk, q],
    queryFn: ()=>api.customers(risk, q),
  });

  async function openPanel(id: string) {
    setLoading(true);
    try { setPanel(await api.customer(id)); }
    finally { setLoading(false); }
  }

  const shapMax = panel
    ? Math.max(...panel.shap_drivers.map(d=>Math.abs(d.shap)))
    : 1;

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <PageHeader
        title="At-risk customer accounts"
        subtitle="7,043 Telco customers · sorted by churn probability · click any row for SHAP breakdown"
      />

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2
            text-ms-neutral dark:text-navy-400" />
          <input className="inp pl-8 w-full"
            placeholder="Search by customer ID..."
            value={q} onChange={e=>setQ(e.target.value)} />
        </div>
        <div className="flex gap-1.5">
          {FILTERS.map(f=>(
            <button key={f.value} onClick={()=>setRisk(f.value)}
              className={risk===f.value ? "btn-primary" : "btn-ghost"}>
              {f.label}
            </button>
          ))}
        </div>

      </div>

      <div className="text-[11px] text-ms-neutral dark:text-navy-400 mb-2">
        {data?.length ?? 0} records
        {q ? ` matching "${q}"` : ""}
        {risk !== "all" ? ` · ${risk} risk` : ""}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full tbl">
            <thead>
              <tr>
                {["Customer","Churn risk","Risk level","Tenure",
                  "Contract","Monthly $","Internet","Tech support"].map(h=>(
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data??[]).map((c,i)=>(
                <motion.tr key={c.CustomerID}
                  className="cursor-pointer"
                  onClick={()=>openPanel(c.CustomerID)}
                  initial={{ opacity:0 }}
                  animate={{ opacity:1 }}
                  transition={{ delay:Math.min(i*0.012,0.25) }}>
                  <td className="font-mono font-semibold text-ms-blue dark:text-blue-400">
                    {c.CustomerID}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1 bg-ms-gray dark:bg-navy-700
                        rounded-full overflow-hidden">
                        <div className="h-full rounded-full"
                          style={{
                            width:`${(c.churn_prob*100).toFixed(0)}%`,
                            background:c.churn_prob>=.65?"#DC2626"
                              :c.churn_prob>=.35?"#D97706":"#0078D4",
                          }} />
                      </div>
                      <span className="font-mono text-[11px] font-semibold"
                        style={{
                          color:c.churn_prob>=.65?"#DC2626"
                            :c.churn_prob>=.35?"#B45309":"#0078D4"
                        }}>
                        {(c.churn_prob*100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td><RiskBadge tier={c.risk_tier} /></td>
                  <td className="font-mono text-ms-neutral dark:text-navy-400">
                    {c.Tenure}m
                  </td>
                  <td className="text-ms-neutral dark:text-navy-400 text-[11px]">
                    {c.Contract}
                  </td>
                  <td className="font-mono text-ms-neutral dark:text-navy-400">
                    ${c.MonthlyCharges?.toFixed(0)}
                  </td>
                  <td className="text-ms-neutral dark:text-navy-400 text-[11px]">
                    {c.InternetService}
                  </td>
                  <td className={`text-[11px] font-semibold
                    ${c.TechSupport==="Yes"
                      ?"text-risk-low":"text-risk-high"}`}>
                    {c.TechSupport}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {(panel || loading) && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/25 z-40"
              initial={{ opacity:0 }} animate={{ opacity:1 }}
              exit={{ opacity:0 }}
              onClick={()=>setPanel(null)}
            />
            <motion.div
              className="fixed right-0 top-0 bottom-0 w-[380px]
                bg-ms-surface dark:bg-navy-900
                border-l border-ms-border dark:border-navy-700
                shadow-fluent-lg z-50 overflow-y-auto"
              initial={{ x:30, opacity:0 }}
              animate={{ x:0, opacity:1 }}
              exit={{ x:30, opacity:0 }}
              transition={{ type:"spring", stiffness:320, damping:32 }}
            >
              {loading ? (
                <div className="flex items-center justify-center h-40
                  text-ms-neutral dark:text-navy-400 text-xs">
                  Loading profile...
                </div>
              ) : panel && (
                <>
                  <div className="sticky top-0
                    bg-ms-surface dark:bg-navy-900
                    border-b border-ms-border dark:border-navy-700
                    px-5 py-4 flex items-start justify-between z-10">
                    <div>
                      <div className="font-bold text-ms-dark dark:text-navy-100
                        text-[14px]">
                        {panel.id}
                      </div>
                      <div className={`text-[12px] font-semibold mt-0.5 ${
                        panel.tier==="High" ? "text-risk-high"
                        :panel.tier==="Medium" ? "text-risk-medium"
                        :"text-risk-low"
                      }`}>
                        {panel.tier} risk · {(panel.churn_prob*100).toFixed(0)}%
                      </div>
                    </div>
                    <button onClick={()=>setPanel(null)}
                      className="text-ms-neutral dark:text-navy-400
                        hover:text-ms-dark dark:hover:text-navy-100 p-0.5">
                      <X size={16} />
                    </button>
                  </div>

                  <div className="px-5 py-4">
                    <div className="h-1 bg-ms-gray dark:bg-navy-700
                      rounded-full mb-5 overflow-hidden">
                      <motion.div className="h-full rounded-full"
                        initial={{ width:0 }}
                        animate={{ width:`${(panel.churn_prob*100).toFixed(0)}%` }}
                        transition={{ duration:0.6, ease:"easeOut" }}
                        style={{
                          background:panel.tier==="High"?"#DC2626"
                            :panel.tier==="Medium"?"#D97706":"#16A34A"
                        }} />
                    </div>

                    <div className="text-[9px] font-bold
                      text-ms-neutral/60 dark:text-navy-600
                      uppercase tracking-[0.12em] mb-2.5 pb-2
                      border-b border-ms-border dark:border-navy-700">
                      Profile
                    </div>
                    {Object.entries(panel.profile).map(([k,v])=>(
                      <div key={k} className="flex justify-between py-2
                        border-b border-ms-border/50 dark:border-navy-700/50
                        text-[12px]">
                        <span className="text-ms-neutral dark:text-navy-400">
                          {k}
                        </span>
                        <span className="font-semibold text-ms-dark dark:text-navy-100">
                          {v}
                        </span>
                      </div>
                    ))}

                    <div className="text-[9px] font-bold
                      text-ms-neutral/60 dark:text-navy-600
                      uppercase tracking-[0.12em] mt-5 mb-2.5 pb-2
                      border-b border-ms-border dark:border-navy-700">
                      Why at risk? (SHAP)
                    </div>
                    <p className="text-[10px] text-ms-neutral dark:text-navy-400 mb-3">
                      Red = increases churn risk · Green = decreases it
                    </p>
                    {panel.shap_drivers.map(d=>(
                      <ShapBar key={d.feature} feature={d.feature}
                        shap={d.shap} max={shapMax} />
                    ))}

                    <div className={`mt-5 p-3 rounded-fluent text-[11px]
                      leading-relaxed border ${
                        panel.tier==="High"
                          ?"bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
                          :panel.tier==="Medium"
                          ?"bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300"
                          :"bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300"
                      }`}>
                      <span className="font-bold block mb-1">
                        Recommended action
                      </span>
                      {panel.tier==="High"
                        ?"Contact immediately. Offer a contract upgrade or loyalty discount within 48 hours."
                        :panel.tier==="Medium"
                        ?"Schedule a check-in call. Consider a tech support or bundle offer."
                        :"No action needed. Account is stable. Review in 30 days."}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}