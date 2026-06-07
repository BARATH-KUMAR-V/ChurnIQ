import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import { api } from "../api/client";
import { PageHeader } from "../components/ui/PageHeader";
import { useTheme } from "../context/ThemeContext";

export function Trend() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const tip = {
    fontSize:11, borderRadius:4,
    background:isDark?"#0f172a":"#fff",
    border:`1px solid ${isDark?"#334155":"#EDEBE9"}`,
    color:isDark?"#cbd5e1":"#201F1E",
  };
  const grid = isDark?"rgba(255,255,255,.06)":"#EDEBE9";
  const axis = isDark?"#475569":"#000000";

  const { data } = useQuery({ queryKey:["trend"], queryFn:api.trend });

  const avgRate  = data
    ? (data.reduce((a,d)=>a+d.churn_rate,0)/data.length).toFixed(1) : "—";
  const peakHigh = data
    ? Math.max(...data.map(d=>d.high_risk)).toLocaleString() : "—";
  const avgARR   = data
    ? `$${(data.reduce((a,d)=>a+d.arr_saved,0)/data.length/1000).toFixed(0)}K` : "—";

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <PageHeader
        title="Churn over time"
        subtitle="Monthly churn rate and high-risk account count · 12-month rolling view"
      />

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label:"Avg monthly churn rate", value:`${avgRate}%`, color:"#DC2626" },
          { label:"Peak high-risk count",   value:peakHigh,      color:"#D97706" },
          { label:"Avg ARR saved / month",  value:avgARR,        color:"#16A34A" },
        ].map((c,i)=>(
          <motion.div key={i} className="card p-5"
            initial={{ opacity:0, y:10 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay:i*0.07 }}>
            <div className="text-[10px] font-semibold
              text-ms-neutral dark:text-navy-400
              uppercase tracking-wider mb-1.5">
              {c.label}
            </div>
            <div className="font-mono text-[24px] font-bold"
              style={{ color:c.color }}>
              {c.value}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="card p-5 mb-4">
        <div className="text-[12px] font-semibold text-ms-dark dark:text-navy-100 mb-0.5">
          Monthly churn rate (%)
        </div>
        <div className="text-[11px] text-ms-neutral dark:text-navy-400 mb-4">
          Rising line = more customers leaving ·
          Falling line = retention improving ·
          Sudden spike = pricing change or service issue
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis dataKey="month" tick={{ fontSize:10, fontWeight: isDark ? "normal" : "bold" }} stroke={axis} />
            <YAxis tick={{ fontSize:10, fontWeight: isDark ? "normal" : "bold" }}
              tickFormatter={v=>`${v}%`} domain={["auto","auto"]}
              stroke={axis} />
            <Tooltip contentStyle={tip}
              formatter={(v:unknown)=>`${v}%`} />
            <Line type="monotone" dataKey="churn_rate"
              stroke="#DC2626" strokeWidth={2.5}
              dot={{ r:3.5, fill:"#DC2626" }}
              activeDot={{ r:5 }} name="Churn rate" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="text-[12px] font-semibold text-ms-dark dark:text-navy-100 mb-0.5">
            High-risk account count
          </div>
          <div className="text-[11px] text-ms-neutral dark:text-navy-400 mb-4">
            Accounts flagged by the model each month
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={data ?? []}>
              <XAxis dataKey="month" tick={{ fontSize:10, fontWeight: isDark ? "normal" : "bold" }} stroke={axis} />
              <YAxis tick={{ fontSize:10, fontWeight: isDark ? "normal" : "bold" }} stroke={axis} />
              <Tooltip contentStyle={tip} />
              <Bar dataKey="high_risk" radius={[3,3,0,0]}
                name="High-risk accounts">
                {(data??[]).map((_,i)=>(
                  <Cell key={i}
                    fill={`rgba(0,120,212,${0.45+i*0.04})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="text-[12px] font-semibold text-ms-dark dark:text-navy-100 mb-0.5">
            Estimated ARR saved per month
          </div>
          <div className="text-[11px] text-ms-neutral dark:text-navy-400 mb-4">
            Revenue retained through proactive intervention
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={data ?? []}>
              <XAxis dataKey="month" tick={{ fontSize:10, fontWeight: isDark ? "normal" : "bold" }} stroke={axis} />
              <YAxis tick={{ fontSize:10, fontWeight: isDark ? "normal" : "bold" }}
                tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}
                stroke={axis} />
              <Tooltip contentStyle={tip}
                formatter={(v:unknown)=>`$${((v as number)/1000).toFixed(0)}K`} />
              <Bar dataKey="arr_saved" radius={[3,3,0,0]}
                fill="#16A34A" name="ARR saved" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}