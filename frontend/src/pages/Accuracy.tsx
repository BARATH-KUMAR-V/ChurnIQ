import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { api } from "../api/client";
import { PageHeader } from "../components/ui/PageHeader";
import { useTheme } from "../context/ThemeContext";

export function Accuracy() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const tip = {
    fontSize:11, borderRadius:4,
    background:isDark?"#0f172a":"#fff",
    border:`1px solid ${isDark?"#334155":"#EDEBE9"}`,
    color:isDark?"#cbd5e1":"#201F1E",
  };
  const grid = isDark?"rgba(255,255,255,.06)":"#EDEBE9";

  const { data } = useQuery({ queryKey:["metrics"], queryFn:api.metrics });
  const m  = data?.metrics;
  const cm = data?.cm;
  const roc = data?.roc
    ? data.roc.fpr.map((f,i)=>({ fpr:f, tpr:data.roc.tpr[i] }))
    : [];

  const METRIC_DEFS = [
    { key:"auc",       label:"AUC-ROC",   color:"#0078D4",
      desc:"Ranks churners above non-churners. 1.0 = perfect." },
    { key:"f1",        label:"F1 score",  color:"#16A34A",
      desc:"Harmonic mean of precision and recall." },
    { key:"precision", label:"Precision", color:"#00B7C3",
      desc:"When model predicts churn, it is correct this % of the time." },
    { key:"recall",    label:"Recall",    color:"#D97706",
      desc:"Percentage of real churners the model identified." },
  ];

  const CM_CELLS = cm ? [
    { n:cm[0][0], label:"True negative",  sub:"Correctly predicted: stays",
      bg:"bg-green-50 dark:bg-green-950/40",
      border:"border-green-200 dark:border-green-800",
      c:"text-risk-low" },
    { n:cm[0][1], label:"False positive", sub:"Predicted churn · stayed",
      bg:"bg-red-50 dark:bg-red-950/40",
      border:"border-red-200 dark:border-red-800",
      c:"text-risk-high" },
    { n:cm[1][0], label:"False negative", sub:"Predicted safe · churned",
      bg:"bg-amber-50 dark:bg-amber-950/40",
      border:"border-amber-200 dark:border-amber-800",
      c:"text-risk-medium" },
    { n:cm[1][1], label:"True positive",  sub:"Correctly predicted: churns",
      bg:"bg-blue-50 dark:bg-blue-950/40",
      border:"border-blue-200 dark:border-blue-800",
      c:"text-ms-blue dark:text-blue-400" },
  ] : [];

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <PageHeader
        title="Model validation"
        subtitle="Evaluated on 20% holdout test set · stratified split · unseen customers only"
      />

      <div className="grid grid-cols-4 gap-3 mb-5">
        {METRIC_DEFS.map((md,i)=>(
          <motion.div key={md.key} className="card p-5"
            initial={{ opacity:0, y:10 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay:i*0.07 }}>
            <div className="text-[10px] font-semibold
              text-ms-neutral dark:text-navy-400
              uppercase tracking-wider mb-2">
              {md.label}
            </div>
            <div className="font-mono text-[24px] font-bold mb-1.5"
              style={{ color:md.color }}>
              {m?.[md.key] != null ? `${(m[md.key]*100).toFixed(1)}%` : "—"}
            </div>
            <div className="text-[10px] text-ms-neutral dark:text-navy-400
              leading-relaxed">
              {md.desc}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* ROC */}
        <div className="card p-5">
          <div className="text-[12px] font-semibold text-ms-dark dark:text-navy-100 mb-0.5">
            ROC curve
          </div>
          <div className="text-[11px] text-ms-neutral dark:text-navy-400 mb-4">
            AUC = {m?.auc != null ? `${(m.auc*100).toFixed(1)}%` : "—"} · closer to 100% is better ·
            dashed = random classifier
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={roc}>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} />
              <XAxis dataKey="fpr" tick={{ fontSize:9, fontWeight: isDark ? "normal" : "bold" }}
                tickFormatter={v=>v.toFixed(1)}
                stroke={isDark?"#475569":"#000000"}
                label={{ value:"False positive rate",
                  position:"insideBottom", fontSize:9, offset:-2 }} />
              <YAxis tick={{ fontSize:9, fontWeight: isDark ? "normal" : "bold" }}
                tickFormatter={v=>v.toFixed(1)}
                stroke={isDark?"#475569":"#000000"}
                label={{ value:"True positive rate", angle:-90,
                  position:"insideLeft", fontSize:9 }} />
              <Tooltip contentStyle={tip}
                formatter={(v:unknown)=>(v as number).toFixed(3)} />
              <Line type="monotone" dataKey="tpr"
                stroke="#0078D4" strokeWidth={2}
                dot={false} name="Model" />
              <Line type="monotone"
                data={[{ fpr:0,tpr:0 },{ fpr:1,tpr:1 }]}
                dataKey="tpr" stroke={isDark?"#334155":"#EDEBE9"}
                strokeDasharray="4 4" dot={false} name="Random" />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-ms-neutral dark:text-navy-500 mt-2">
            The curve hugs the top-left corner — near-perfect discrimination
            between churners and loyal customers.
          </p>
        </div>

        {/* Confusion matrix */}
        <div className="card p-5">
          <div className="text-[12px] font-semibold text-ms-dark dark:text-navy-100 mb-0.5">
            Confusion matrix
          </div>
          <div className="text-[11px] text-ms-neutral dark:text-navy-400 mb-5">
            How the model performed on test customers it had never seen
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-[300px] mx-auto">
            {CM_CELLS.map((cell,i)=>(
              <motion.div key={i}
                className={`${cell.bg} border ${cell.border}
                  rounded-fluent p-4 text-center`}
                initial={{ scale:0.9, opacity:0 }}
                animate={{ scale:1, opacity:1 }}
                transition={{ delay:i*0.08 }}>
                <div className={`font-mono text-[24px] font-bold ${cell.c}`}>
                  {cell.n}
                </div>
                <div className={`text-[10px] font-semibold mt-1 ${cell.c}`}>
                  {cell.label}
                </div>
                <div className="text-[10px] text-ms-neutral dark:text-navy-400
                  mt-0.5 leading-tight">
                  {cell.sub}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-5 p-3 bg-ms-gray dark:bg-navy-900
            rounded-fluent text-[10px]
            text-ms-neutral dark:text-navy-400 leading-relaxed">
            <span className="font-semibold text-ms-dark dark:text-navy-200">
              False negatives are the costliest error
            </span>{" "}
            — a churner predicted as safe leaves without intervention.
             Our recall of {m ? `${(m.recall*100).toFixed(1)}%` : "—"} means only{" "}
            {m ? Math.round((1-m.recall)*100) : "—"}% of churners go undetected.
          </div>
        </div>
      </div>
    </div>
  );
}