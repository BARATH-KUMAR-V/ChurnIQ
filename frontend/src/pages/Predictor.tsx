import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { api } from "../api/client";
import type { ScoreResult } from "../api/client";
import { RiskBadge } from "../components/ui/RiskBadge";
import { ShapBar } from "../components/ui/ShapBar";
import { PageHeader } from "../components/ui/PageHeader";

const SLIDERS = [
  { key:"tenure",    label:"Tenure (months)",                     min:0,  max:72, step:1,   def:12  },
  { key:"monthly",   label:"Monthly charges ($)",                 min:18, max:120,step:1,   def:65  },
  { key:"contract",  label:"Contract  0=M2M  1=1yr  2=2yr",       min:0,  max:2,  step:1,   def:0   },
  { key:"internet",  label:"Internet  0=DSL  1=Fiber  2=None",    min:0,  max:2,  step:1,   def:1   },
  { key:"tech",      label:"Tech support  0=No  1=Yes",           min:0,  max:1,  step:1,   def:0   },
  { key:"security",  label:"Online security  0=No  1=Yes",        min:0,  max:1,  step:1,   def:0   },
  { key:"paperless", label:"Paperless billing  0=No  1=Yes",      min:0,  max:1,  step:1,   def:1   },
  { key:"senior",    label:"Senior citizen  0=No  1=Yes",         min:0,  max:1,  step:1,   def:0   },
  { key:"streaming", label:"Streaming services  0=No  1=Yes",     min:0,  max:1,  step:1,   def:0   },
];

export function Predictor() {
  const [vals, setVals] = useState<Record<string,number>>(
    Object.fromEntries(SLIDERS.map(s=>[s.key,s.def]))
  );
  const [result, setResult] = useState<ScoreResult|null>(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer]     = useState<ReturnType<typeof setTimeout>|null>(null);

  const score = useCallback(async (v: Record<string,number>) => {
    setLoading(true);
    try { setResult(await api.score(v)); }
    finally { setLoading(false); }
  }, []);

  function handleChange(key: string, value: number) {
    const next = { ...vals, [key]:value };
    setVals(next);
    if (timer) clearTimeout(timer);
    setTimer(setTimeout(()=>score(next),300));
  }

  const pct       = result ? Math.round(result.probability*100) : null;
  const shapMax   = result ? Math.max(...result.drivers.map(d=>Math.abs(d.shap))) : 1;
  const tierColor = result?.tier==="High"?"#DC2626"
    :result?.tier==="Medium"?"#B45309":"#16A34A";

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <PageHeader
        title="Live churn predictor"
        subtitle="Adjust any parameter — XGBoost scores instantly and explains why"
        badge="Live"
      />

      <div className="bg-blue-50 dark:bg-blue-950/30
        border border-blue-100 dark:border-blue-900
        rounded-fluent p-3 mb-5 text-[11px]
        text-ms-blue dark:text-blue-300 leading-relaxed">
        <span className="font-semibold">Try this: </span>
        Set Contract to 0 (month-to-month), Internet to 1 (Fiber optic),
        Tech support to 0 — watch the risk jump.
        Then set Contract to 2 (two year) and watch it drop.
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Sliders */}
        <div className="card p-5">
          <div className="text-[12px] font-semibold text-ms-dark dark:text-navy-100 mb-4">
            Customer parameters
          </div>
          <div className="space-y-4">
            {SLIDERS.map(s=>(
              <div key={s.key}>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[11px] font-semibold
                    text-ms-neutral dark:text-navy-400">
                    {s.label}
                  </label>
                  <span className="font-mono text-[11px] font-bold
                    text-ms-blue dark:text-blue-400">
                    {vals[s.key]}
                  </span>
                </div>
                <input type="range"
                  min={s.min} max={s.max} step={s.step} value={vals[s.key]}
                  onChange={e=>handleChange(s.key,Number(e.target.value))}
                  className="w-full accent-ms-blue cursor-pointer" />
                <div className="flex justify-between text-[9px]
                  text-ms-neutral/50 dark:text-navy-600 mt-0.5">
                  <span>{s.min}</span><span>{s.max}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Output */}
        <div className="card p-5">
          <div className="text-[12px] font-semibold text-ms-dark dark:text-navy-100 mb-4">
            Prediction result
          </div>
          <div className="border border-ms-border dark:border-navy-700
            rounded-fluent p-5 text-center mb-4
            bg-ms-gray/30 dark:bg-navy-900/50">
            {loading ? (
              <div className="text-ms-neutral dark:text-navy-400 text-xs py-4">
                Scoring...
              </div>
            ) : result ? (
              <>
                <motion.div
                  className="font-mono text-[48px] font-bold leading-none mb-2"
                  style={{ color:tierColor }}
                  key={pct}
                  initial={{ scale:0.9, opacity:0 }}
                  animate={{ scale:1, opacity:1 }}
                  transition={{ duration:0.2 }}>
                  {pct}%
                </motion.div>
                <RiskBadge tier={result.tier} />
                <div className={`mt-3 text-[11px] rounded-fluent p-2.5
                  text-left leading-relaxed border ${
                    result.tier==="High"
                      ?"bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-100 dark:border-red-900"
                      :result.tier==="Medium"
                      ?"bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-100 dark:border-amber-900"
                      :"bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300 border-green-100 dark:border-green-900"
                  }`}>
                  {result.tier==="High"
                    ?"High churn risk. Offer a contract upgrade or retention discount within 48 hours."
                    :result.tier==="Medium"
                    ?"Moderate risk. Consider a check-in call or bundled service offer."
                    :"Low risk. Account appears stable. No immediate action needed."}
                </div>
              </>
            ) : (
              <div className="text-ms-neutral dark:text-navy-400 text-[12px] py-6">
                Adjust any slider to generate a prediction
              </div>
            )}
          </div>

          {result && (
            <>
              <div className="text-[9px] font-bold
                text-ms-neutral/60 dark:text-navy-600
                uppercase tracking-[0.12em] mb-2.5">
                SHAP contribution — what drives this prediction
              </div>
              <p className="text-[10px] text-ms-neutral dark:text-navy-400 mb-3">
                Red = increases churn risk · Green = decreases it
              </p>
              {result.drivers.map(d=>(
                <ShapBar key={d.feature} feature={d.feature}
                  shap={d.shap} max={shapMax} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}