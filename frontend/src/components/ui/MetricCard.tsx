import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type Color = "blue" | "red" | "amber" | "green";

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  color: Color;
  delay?: number;
}

const light: Record<Color, { icon: string; bg: string; bar: string }> = {
  blue:  { icon:"text-ms-blue",    bg:"bg-blue-50",   bar:"bg-ms-blue"    },
  red:   { icon:"text-risk-high",  bg:"bg-red-50",    bar:"bg-risk-high"  },
  amber: { icon:"text-risk-medium",bg:"bg-amber-50",  bar:"bg-risk-medium"},
  green: { icon:"text-risk-low",   bg:"bg-green-50",  bar:"bg-risk-low"   },
};
const dark: Record<Color, { icon: string; bg: string; bar: string }> = {
  blue:  { icon:"text-blue-400",   bg:"bg-blue-950/40",   bar:"bg-blue-500"   },
  red:   { icon:"text-red-400",    bg:"bg-red-950/40",    bar:"bg-red-500"    },
  amber: { icon:"text-amber-400",  bg:"bg-amber-950/40",  bar:"bg-amber-500"  },
  green: { icon:"text-green-400",  bg:"bg-green-950/40",  bar:"bg-green-600"  },
};

export function MetricCard({ label, value, sub, icon: Icon, color, delay=0 }: Props) {
  const l = light[color];
  const d = dark[color];
  return (
    <motion.div
      className="card p-5 relative overflow-hidden"
      initial={{ opacity:0, y:14 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.35, delay, ease:"easeOut" }}
    >
      {/* top accent bar */}
      <div className={`absolute top-0 inset-x-0 h-0.5 ${l.bar} dark:${d.bar}`} />

      <div className={`w-8 h-8 rounded-fluent flex items-center justify-center
        mb-3 ${l.bg} dark:${d.bg}`}>
        <Icon size={16} className={`${l.icon} dark:${d.icon}`} />
      </div>

      <div className="font-mono text-[26px] font-bold leading-none
        text-ms-dark dark:text-navy-100 mb-1.5">
        {value}
      </div>
      <div className="text-[10px] font-semibold text-ms-neutral dark:text-navy-400
        uppercase tracking-wider mb-1">
        {label}
      </div>
      {sub && (
        <div className="text-[11px] text-ms-neutral/70 dark:text-navy-500">
          {sub}
        </div>
      )}
    </motion.div>
  );
}