import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./context/ThemeContext";
import { ThemeToggle } from "./components/ThemeToggle";
import { Sidebar }   from "./components/Sidebar";
import { Home }      from "./pages/Home";
import { Customers } from "./pages/Customers";
import { Trend }     from "./pages/Trend";
import { Predictor } from "./pages/Predictor";
import { WhyLeave }  from "./pages/WhyLeave";
import { Accuracy }  from "./pages/Accuracy";
import { Segments }  from "./pages/Segments";
import { healthCheck } from "./api/client";

const qc = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 2, refetchOnWindowFocus: false },
  },
});

const PAGES: Record<string, React.ComponentType> = {
  home:      Home,
  customers: Customers,
  trend:     Trend,
  predictor: Predictor,
  whyleave:  WhyLeave,
  accuracy:  Accuracy,
  segments:  Segments,
};

function Dashboard() {
  const [page, setPage] = useState("home");
  const [apiStatus, setApiStatus] = useState<"checking" | "ok" | "error">("checking");
  const Page = PAGES[page] ?? Home;

  useEffect(() => {
    const check = async () => {
      const ok = await healthCheck();
      setApiStatus(ok ? "ok" : "error");
    };
    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-ms-bg dark:bg-navy-950">
      <Sidebar current={page} onNav={setPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Connection banner */}
        {apiStatus === "error" && (
          <div className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white text-[11px] font-medium flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Backend unreachable — get a new ngrok URL from Colab and update{" "}
            <code className="bg-red-700 px-1.5 py-0.5 rounded font-mono">.env</code>
            {" → "}
            <code className="bg-red-700 px-1.5 py-0.5 rounded font-mono">VITE_API_URL=https://your-new-url.ngrok-free.app</code>
            , then restart{" "}
            <code className="bg-red-700 px-1.5 py-0.5 rounded font-mono">npm run dev</code>
          </div>
        )}

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-2
          border-b border-ms-border dark:border-navy-700
          bg-ms-surface dark:bg-navy-900 flex-shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-ms-neutral dark:text-navy-400">
            ChurnIQ v3 · Telco Customer Intelligence
            {apiStatus === "ok" && (
              <span className="flex items-center gap-1 text-risk-low font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Connected
              </span>
            )}
            {apiStatus === "checking" && (
              <span className="text-ms-neutral/50 dark:text-navy-600">Connecting…</span>
            )}
          </div>
          <ThemeToggle />
        </div>

        <main className="flex-1 overflow-y-auto">
          <Page />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={qc}>
        <Dashboard />
      </QueryClientProvider>
    </ThemeProvider>
  );
}