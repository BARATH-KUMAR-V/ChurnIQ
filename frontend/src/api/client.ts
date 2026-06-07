const BASE = import.meta.env.VITE_API_URL as string;

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[ChurnIQ] ❌ ${res.status} ${path}`, text.slice(0, 200));
    throw new Error(`API ${res.status}: ${path}`);
  }
  return res.json();
}

export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export interface Summary {
  total_customers: number;
  high_risk: number; medium_risk: number; low_risk: number;
  churn_rate: number; arr_at_risk: number;
  model_auc: number; model_f1: number;
  metrics: Record<string, number>;
}
export interface Customer {
  CustomerID: string;
  churn_prob: number; risk_tier: string;
  Tenure: number; Contract: string;
  MonthlyCharges: number; InternetService: string;
  TechSupport: string;
}
export interface CustomerDetail {
  id: string; churn_prob: number;
  risk_tier: string; tier: string;
  profile: Record<string, string | number>;
  shap_drivers: ShapDriver[];
}
export interface ShapDriver   { feature: string; shap: number }
export interface ShapItem     { feature: string; importance: number }
export interface DistItem     { range: string; count: number }
export interface TenureItem   { label: string; count: number; avg_churn: number; actual_churn: number }
export interface TrendItem    { month: string; churn_rate: number; high_risk: number; arr_saved: number }
export interface ScoreResult  { probability: number; tier: string; drivers: ShapDriver[] }
export interface MetricsData  { metrics: Record<string,number>; roc:{fpr:number[];tpr:number[]}; cm:number[][] }
export interface SegmentsData {
  by_contract: any[]; by_internet: any[];
  by_tenure: any[]; by_payment: any[];
}

export const api = {
  summary:      () => get<Summary>("/api/summary"),
  customers:    (risk = "all", q = "") =>
    get<Customer[]>(`/api/customers?risk=${risk}&q=${encodeURIComponent(q)}&limit=100`),
  customer:     (id: string) => get<CustomerDetail>(`/api/customers/${id}`),
  score:        (p: Record<string, number>) =>
    get<ScoreResult>(`/api/score?${new URLSearchParams(
      Object.entries(p).map(([k, v]) => [k, String(v)])
    )}`),
  shap:         () => get<ShapItem[]>("/api/shap"),
  metrics:      () => get<MetricsData>("/api/metrics"),
  distribution: () => get<DistItem[]>("/api/distribution"),
  byTenure:     () => get<TenureItem[]>("/api/by_tenure"),
  trend:        () => get<TrendItem[]>("/api/trend"),
  segments:     () => get<SegmentsData>("/api/segments"),
  exportUrl:    () => `${BASE}/api/export`,
};