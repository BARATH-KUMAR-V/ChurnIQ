import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, RadarChart,
  PolarGrid, PolarAngleAxis, Radar,
} from "recharts";
import { api } from "../api/client";
import { PageHeader } from "../components/ui/PageHeader";
import { useTheme } from "../context/ThemeContext";

const COLORS = ["#DC2626","#D97706","#0078D4","#16A34A","#7C3AED"];

function SegTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="rounded-lg px-3 py-2 text-[11px] shadow-md"
      style={{ background: "var(--tip-bg,#fff)", border: "1px solid #EDEBE9" }}>
      <div className="font-semibold mb-1">{label}</div>
      <div className="text-risk-high">{payload[0]?.name}: {payload[0]?.value}%</div>
      {d?.count != null && (
        <div className="text-ms-neutral mt-0.5">
          Customers: <span className="font-semibold">{d.count.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}

export function Segments() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const tip = {
    fontSize:11, borderRadius:4,
    background:isDark?"#0f172a":"#fff",
    border:`1px solid ${isDark?"#334155":"#EDEBE9"}`,
    color:isDark?"#cbd5e1":"#201F1E",
  };
  const axis = isDark?"#475569":"#000000";

  const { data } = useQuery({ queryKey:["segments"], queryFn:api.segments });

  const contractData = (data?.by_contract ?? []).map((d:any)=>({
    label: d.Contract,
    churn: Math.round((d.avg_churn??0)*100),
    actual:Math.round((d.actual_churn??0)*100),
    count: d.count,
  }));
  const internetData = (data?.by_internet ?? []).map((d:any)=>({
    label: d.InternetService,
    churn: Math.round((d.avg_churn??0)*100),
    actual:Math.round((d.actual_churn??0)*100),
    count: d.count,
  }));
  const tenureData = (data?.by_tenure ?? []).map((d:any)=>({
    label: d.label,
    churn: Math.round((d.avg_churn??0)*100),
    count: d.count,
  }));
  const paymentData = (data?.by_payment ?? []).map((d:any)=>({
    label: d.PaymentMethod?.split(" ")[0] ?? d.PaymentMethod,
    churn: Math.round((d.avg_churn??0)*100),
    count: d.count,
  }));

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <PageHeader
        title="Customer segments"
        subtitle="Churn rate broken down by contract type, internet service, tenure and payment"
      />

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Contract type */}
        <div className="card p-5">
          <div className="text-[12px] font-semibold text-ms-dark dark:text-navy-100 mb-0.5">
            Churn rate by contract type
          </div>
          <div className="text-[11px] text-ms-neutral dark:text-navy-400 mb-4">
            Month-to-month customers churn at dramatically higher rates
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={contractData}>
              <XAxis dataKey="label" tick={{ fontSize:10, fontWeight: isDark ? "normal" : "bold" }} stroke={axis} />
              <YAxis tick={{ fontSize:10, fontWeight: isDark ? "normal" : "bold" }}
                tickFormatter={v=>`${v}%`} stroke={axis} />
              <Tooltip content={<SegTooltip />} />
              <Bar dataKey="churn" radius={[4,4,0,0]}
                name="Predicted churn %">
                {contractData.map((_:any,i:number)=>(
                  <Cell key={i} fill={COLORS[i%COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Insight cards */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {contractData.map((c:any,i:number)=>(
              <motion.div key={c.label}
                className="p-2.5 rounded-fluent border
                  border-ms-border dark:border-navy-700
                  bg-ms-gray/50 dark:bg-navy-900/50 text-center"
                initial={{ opacity:0 }}
                animate={{ opacity:1 }}
                transition={{ delay:i*0.1 }}>
                <div className="font-mono text-[18px] font-bold"
                  style={{ color:COLORS[i%COLORS.length] }}>
                  {c.churn}%
                </div>
                <div className="text-[9px] text-ms-neutral dark:text-navy-400
                  mt-0.5 font-medium leading-tight">
                  {c.label}
                </div>
                <div className="text-[9px] text-ms-neutral/60 dark:text-navy-600 mt-0.5">
                  {c.count?.toLocaleString()} customers
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Internet service */}
        <div className="card p-5">
          <div className="text-[12px] font-semibold text-ms-dark dark:text-navy-100 mb-0.5">
            Churn rate by internet service
          </div>
          <div className="text-[11px] text-ms-neutral dark:text-navy-400 mb-4">
            Fiber optic customers churn significantly more than DSL
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={internetData}>
              <XAxis dataKey="label" tick={{ fontSize:10, fontWeight: isDark ? "normal" : "bold" }} stroke={axis} />
              <YAxis tick={{ fontSize:10, fontWeight: isDark ? "normal" : "bold" }}
                tickFormatter={v=>`${v}%`} stroke={axis} />
              <Tooltip content={<SegTooltip />} />
              <Bar dataKey="churn" radius={[4,4,0,0]}
                name="Predicted churn %">
                {internetData.map((_:any,i:number)=>(
                  <Cell key={i}
                    fill={i===1?"#DC2626":i===0?"#D97706":"#16A34A"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-3 p-3 bg-ms-gray/50 dark:bg-navy-900/50
            rounded-fluent text-[11px]
            text-ms-neutral dark:text-navy-400 leading-relaxed">
            <span className="font-semibold text-ms-dark dark:text-navy-200">
              Why does fiber churn more?
            </span>{" "}
            Fiber customers pay more per month and have higher expectations.
            When service quality doesn't match the premium price,
            they switch faster than DSL customers.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Tenure groups */}
        <div className="card p-5">
          <div className="text-[12px] font-semibold text-ms-dark dark:text-navy-100 mb-0.5">
            Churn rate by tenure group
          </div>
          <div className="text-[11px] text-ms-neutral dark:text-navy-400 mb-4">
            Customers in their first 6 months are the highest-risk group
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tenureData}>
              <XAxis dataKey="label" tick={{ fontSize:10, fontWeight: isDark ? "normal" : "bold" }} stroke={axis} />
              <YAxis tick={{ fontSize:10, fontWeight: isDark ? "normal" : "bold" }}
                tickFormatter={v=>`${v}%`} stroke={axis} />
              <Tooltip content={<SegTooltip />} />
              <Bar dataKey="churn" radius={[4,4,0,0]}
                name="Avg churn %">
                {tenureData.map((_:any,i:number)=>(
                  <Cell key={i}
                    fill={i===0?"#DC2626":i===1?"#D97706":
                          i===2?"#0078D4":"#16A34A"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment method */}
        <div className="card p-5">
          <div className="text-[12px] font-semibold text-ms-dark dark:text-navy-100 mb-0.5">
            Churn rate by payment method
          </div>
          <div className="text-[11px] text-ms-neutral dark:text-navy-400 mb-4">
            Electronic check users show the highest churn rate
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={paymentData}>
              <XAxis dataKey="label" tick={{ fontSize:9, fontWeight: isDark ? "normal" : "bold" }} stroke={axis} />
              <YAxis tick={{ fontSize:10, fontWeight: isDark ? "normal" : "bold" }}
                tickFormatter={v=>`${v}%`} stroke={axis} />
              <Tooltip content={<SegTooltip />} />
              <Bar dataKey="churn" radius={[4,4,0,0]}
                name="Avg churn %">
                {paymentData.map((_:any,i:number)=>(
                  <Cell key={i} fill={COLORS[i%COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/30
            border border-amber-100 dark:border-amber-900
            rounded-fluent text-[11px]">
            <span className="font-semibold text-amber-800 dark:text-amber-300">
              Action insight:{" "}
            </span>
            <span className="text-amber-700 dark:text-amber-400">
              Encourage electronic check users to switch to automatic bank
              transfer or credit card. Auto-pay customers churn
              significantly less.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}