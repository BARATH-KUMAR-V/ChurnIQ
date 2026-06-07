import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, TrendingUp, Zap,
  BarChart2, ShieldCheck, PieChart, ChevronRight,
} from "lucide-react";
import { clsx } from "clsx";

const NAV = [
  { id:"home",      label:"Executive summary",   icon:LayoutDashboard, group:"Overview"  },
  { id:"customers", label:"At-risk accounts",    icon:Users,           group:"Churn"     },
  { id:"trend",     label:"Churn over time",     icon:TrendingUp,      group:"Churn"     },
  { id:"predictor", label:"Live predictor",      icon:Zap,             group:"Churn"     },
  { id:"whyleave",  label:"Why customers leave", icon:BarChart2,       group:"Churn"     },
  { id:"accuracy",  label:"Model validation",    icon:ShieldCheck,     group:"Churn"     },
  { id:"segments",  label:"Customer segments",   icon:PieChart,        group:"Churn"     },
];

interface Props { current: string; onNav: (id: string) => void; }

export function Sidebar({ current, onNav }: Props) {
  const groups = [...new Set(NAV.map(n => n.group))];
  return (
    <aside className="w-[220px] sidebar-base flex flex-col
      h-screen sticky top-0 flex-shrink-0">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-ms-border dark:border-navy-700">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-ms-blue rounded-fluent flex items-center
            justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">C</span>
          </div>
          <div>
            <div className="text-[13px] font-bold text-ms-dark dark:text-navy-100
              leading-none">ChurnIQ</div>
            <div className="text-[10px] text-ms-neutral dark:text-navy-500 mt-0.5">
              v3 · Telco intelligence
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {groups.map(group => (
          <div key={group} className="mb-3">
            <div className="px-5 py-1.5 text-[9px] font-bold
              text-ms-neutral/60 dark:text-navy-600
              uppercase tracking-[0.12em]">
              {group}
            </div>
            {NAV.filter(n => n.group === group).map(item => {
              const active = current === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNav(item.id)}
                  className={clsx("nav-item", active && "active")}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute left-0 top-0 bottom-0 w-0.5
                        bg-ms-blue dark:bg-blue-400"
                    />
                  )}
                  <item.icon size={14} className="flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {active && <ChevronRight size={11} className="opacity-40" />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-ms-border dark:border-navy-700">
        <div className="flex items-center gap-1.5 text-[10px]
          text-ms-neutral dark:text-navy-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Live · 7,043 customers
        </div>
        <div className="text-[10px] text-ms-neutral/60 dark:text-navy-600 mt-0.5">
          XGBoost + SHAP · FastAPI
        </div>
      </div>
    </aside>
  );
}