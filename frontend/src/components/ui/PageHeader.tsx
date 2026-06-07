import { motion } from "framer-motion";

interface Props {
  title: string;
  subtitle: string;
  badge?: string;
}

export function PageHeader({ title, subtitle, badge }: Props) {
  return (
    <motion.div
      className="mb-6 pb-4 border-b border-ms-border dark:border-navy-700"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[18px] font-bold text-ms-dark dark:text-navy-100
            tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-xs text-ms-neutral dark:text-navy-400 mt-1">
            {subtitle}
          </p>
        </div>
        {badge && (
          <span className="flex-shrink-0 flex items-center gap-1.5 text-[10px]
            font-semibold text-ms-blue dark:text-blue-400
            bg-blue-50 dark:bg-blue-950/40
            border border-blue-100 dark:border-blue-800
            px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-ms-blue
              dark:bg-blue-400 animate-pulse" />
            {badge}
          </span>
        )}
      </div>
    </motion.div>
  );
}