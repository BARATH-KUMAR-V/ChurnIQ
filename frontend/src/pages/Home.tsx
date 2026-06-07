import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, DollarSign, Target, TrendingUp, FileDown } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, LineChart, Line, CartesianGrid,
} from "recharts";
import { api } from "../api/client";
import { MetricCard } from "../components/ui/MetricCard";
import { PageHeader } from "../components/ui/PageHeader";
import { useTheme } from "../context/ThemeContext";
import { downloadPDF } from "../utils/pdfReport";

const PIE_COLORS = ["#DC2626","#D97706","#16A34A"];

export function Home() {
  const { theme } = useTheme();
  const [pdfLoading, setPdfLoading] = useState(false);
  const isDark = theme === "dark";
  const grid   = isDark ? "rgba(255,255,255,.06)" : "#EDEBE9";
  const tip    = {
    fontSize:11, borderRadius:4,
    background: isDark ? "#0f172a" : "#fff",
    border: `1px solid ${isDark ? "#334155" : "#EDEBE9"}`,
    color: isDark ? "#cbd5e1" : "#201F1E",
  };

  const { data: s }     = useQuery({ queryKey:["summary"],  queryFn:api.summary });
  const { data: dist }  = useQuery({ queryKey:["dist"],     queryFn:api.distribution });
  const { data: ten }   = useQuery({ queryKey:["tenure"],   queryFn:api.byTenure });
  const { data: trend } = useQuery({ queryKey:["trend"],    queryFn:api.trend });

  const pieData = s ? [
    { name:"High",   value:s.high_risk },
    { name:"Medium", value:s.medium_risk },
    { name:"Low",    value:s.low_risk },
  ] : [];

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-1">
        <PageHeader
          title="Executive summary"
          subtitle="Real-time churn intelligence · 7,043 Telco customers · XGBoost + SHAP"
          badge="Live"
        />
        <button
          onClick={async () => { setPdfLoading(true); try { await downloadPDF(); } finally { setPdfLoading(false); } }}
          disabled={pdfLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-fluent
            bg-ms-blue text-white text-[11px] font-semibold
            hover:bg-blue-700 transition-colors disabled:opacity-60 flex-shrink-0"
        >
          <FileDown size={13} />
          {pdfLoading ? "Generating…" : "Download Report"}
        </button>
      </div>

      {/* ARR Banner */}
      {s && (
        <motion.div
          className="bg-ms-blue text-white rounded-fluent p-4 mb-5
            flex items-center justify-between"
          initial={{ opacity:0 }} animate={{ opacity:1 }}
          transition={{ delay:0.1 }}
        >
          <div>
            <div className="text-[11px] font-semibold opacity-80 mb-0.5">
              Estimated annual recurring revenue at risk
            </div>
            <div className="font-mono text-[24px] font-bold">
              ${(s.arr_at_risk/1_000_000).toFixed(1)}M
            </div>
          </div>
          <div className="text-right">
            <div className="opacity-80 text-[12px]">
              {s.high_risk} accounts flagged high risk
            </div>
            <div className="opacity-60 text-[11px] mt-0.5">
              Early intervention recovers ~30%
            </div>
          </div>
        </motion.div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <MetricCard label="High-risk accounts"
          value={s?.high_risk ?? "—"}
          sub={`of ${s?.total_customers?.toLocaleString() ?? "—"} total`}
          icon={AlertTriangle} color="red"   delay={0}    />
        <MetricCard label="Actual churn rate"
          value={s ? `${(s.churn_rate*100).toFixed(1)}%` : "—"}
          sub="from ground-truth labels"
          icon={TrendingUp} color="amber" delay={0.07} />
        <MetricCard label="Model AUC-ROC"
          value={s ? `${(s.model_auc*100).toFixed(1)}%` : "—"}
          sub="discrimination score"
          icon={Target}     color="blue"  delay={0.14} />
        <MetricCard label="F1 score"
          value={s ? `${(s.model_f1*100).toFixed(1)}%` : "—"}
          sub="precision–recall balance"
          icon={DollarSign} color="green" delay={0.21} />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="card p-5">
          <div className="text-[12px] font-semibold text-ms-dark dark:text-navy-100 mb-0.5">
            Churn probability distribution
          </div>
          <div className="text-[11px] text-ms-neutral dark:text-navy-400 mb-3">
            Score spread across all 7,043 customers
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={dist ?? []} barSize={10}>
              <XAxis dataKey="range" tick={{ fontSize:9, fontWeight: isDark ? "normal" : "bold" }} interval={3}
                stroke={isDark?"#475569":"#000000"} />
              <YAxis tick={{ fontSize:9, fontWeight: isDark ? "normal" : "bold" }}
                stroke={isDark?"#475569":"#000000"} />
              <Tooltip contentStyle={tip} />
              <Bar dataKey="count" radius={[2,2,0,0]}>
                {(dist??[]).map((d,i)=>(
                  <Cell key={i}
                    fill={parseFloat(d.range)>=.65?"#DC2626"
                        :parseFloat(d.range)>=.35?"#D97706":"#0078D4"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-ms-neutral dark:text-navy-500 mt-2">
            Most customers cluster near 0%. Red bars need immediate action.
          </p>
        </div>

        <div className="card p-5">
          <div className="text-[12px] font-semibold text-ms-dark dark:text-navy-100 mb-0.5">
            Risk tier breakdown
          </div>
          <div className="text-[11px] text-ms-neutral dark:text-navy-400 mb-3">
            High · Medium · Low split
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={65}
                dataKey="value"
                label={({ name, percent }: any) =>
                  `${name} ${((percent??0)*100).toFixed(0)}%`}
                labelLine={false} fontSize={10}>
                {pieData.map((_,i)=>(
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tip} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="text-[12px] font-semibold text-ms-dark dark:text-navy-100 mb-0.5">
            Churn rate by tenure
          </div>
          <div className="text-[11px] text-ms-neutral dark:text-navy-400 mb-3">
            New customers churn significantly more
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={ten ?? []}>
              <XAxis dataKey="label" tick={{ fontSize:10, fontWeight: isDark ? "normal" : "bold" }}
                stroke={isDark?"#475569":"#000000"} />
              <YAxis tick={{ fontSize:10, fontWeight: isDark ? "normal" : "bold" }}
                tickFormatter={v=>`${(v*100).toFixed(0)}%`}
                stroke={isDark?"#475569":"#000000"} />
              <Tooltip contentStyle={tip}
                formatter={(v:unknown)=>`${((v as number)*100).toFixed(1)}%`} />
              <Bar dataKey="avg_churn" radius={[3,3,0,0]}
                fill="#0078D4" name="Avg churn probability" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="text-[12px] font-semibold text-ms-dark dark:text-navy-100 mb-0.5">
            Monthly churn trend
          </div>
          <div className="text-[11px] text-ms-neutral dark:text-navy-400 mb-3">
            Rising = more leaving · Falling = retention improving
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={trend ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} />
              <XAxis dataKey="month" tick={{ fontSize:10, fontWeight: isDark ? "normal" : "bold" }}
                stroke={isDark?"#475569":"#000000"} />
              <YAxis tick={{ fontSize:10, fontWeight: isDark ? "normal" : "bold" }}
                tickFormatter={v=>`${v}%`} domain={["auto","auto"]}
                stroke={isDark?"#475569":"#000000"} />
              <Tooltip contentStyle={tip}
                formatter={(v:unknown)=>`${v}%`} />
              <Line type="monotone" dataKey="churn_rate"
                stroke="#DC2626" strokeWidth={2}
                dot={{ r:3, fill:"#DC2626" }}
                activeDot={{ r:5 }} name="Churn rate" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}