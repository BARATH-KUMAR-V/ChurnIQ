import { jsPDF } from "jspdf";

const BASE = import.meta.env.VITE_API_URL as string;
const HDR  = { headers: { "ngrok-skip-browser-warning": "true" } };

async function fetchAll() {
  const [summary, shap, metrics, segments, byTenure] = await Promise.all([
    fetch(`${BASE}/api/summary`,   HDR).then(r => r.json()),
    fetch(`${BASE}/api/shap`,      HDR).then(r => r.json()),
    fetch(`${BASE}/api/metrics`,   HDR).then(r => r.json()),
    fetch(`${BASE}/api/segments`,  HDR).then(r => r.json()),
    fetch(`${BASE}/api/by_tenure`, HDR).then(r => r.json()),
  ]);
  return { summary, shap, metrics, segments, byTenure };
}

export async function downloadPDF() {
  const { summary, shap, metrics, segments, byTenure } = await fetchAll();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const PW = 210, M = 14;
  let y = 0;

  // ── helpers ───────────────────────────────────────────────────────
  const fill  = (r:number,g:number,b:number) => doc.setFillColor(r,g,b);
  const text  = (c:number[]) => doc.setTextColor(c[0],c[1],c[2]);
  const BLUE  = [0,120,212], RED=[220,38,38], AMBER=[217,119,6], GREEN=[22,163,74];
  const DARK  = [32,31,30],  MID=[96,94,92],  BG=[249,248,247], BORDER=[237,235,233];

  function heading(title: string) {
    fill(BG[0],BG[1],BG[2]);
    doc.rect(M, y, PW-M*2, 7, "F");
    text(DARK);
    doc.setFontSize(8); doc.setFont("helvetica","bold");
    doc.text(title.toUpperCase(), M+2, y+5);
    y += 10;
  }

  function hBar(label:string, pct:number, count:number, col:number[]) {
    const bw = (pct/100)*(PW-M*2-58);
    fill(col[0],col[1],col[2]);
    doc.roundedRect(M+50, y, Math.max(bw,2), 4.5, 1,1,"F");
    text(DARK); doc.setFontSize(7.5); doc.setFont("helvetica","normal");
    doc.text(label, M+2, y+4);
    text(MID);
    doc.text(`${pct}%  (${count.toLocaleString()} customers)`, PW-M-2, y+4, {align:"right"});
    y += 7;
  }

  // ── Header ────────────────────────────────────────────────────────
  fill(0,120,212); doc.rect(0,0,PW,22,"F");
  text([255,255,255]);
  doc.setFontSize(13); doc.setFont("helvetica","bold");
  doc.text("ChurnIQ v3  ─  Executive Summary Report", M, 9);
  doc.setFontSize(7.5); doc.setFont("helvetica","normal");
  const now = new Date().toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
  doc.text(`Generated: ${now}  ·  Telco Customer Churn Intelligence  ·  XGBoost + SHAP`, M, 15);
  doc.text(`${(summary.total_customers??0).toLocaleString()} customers`, PW-M, 15, {align:"right"});
  y = 30;

  // ── KPIs ──────────────────────────────────────────────────────────
  heading("Key Performance Indicators");
  const kpis = [
    { label:"High-Risk Accounts", val:String(summary.high_risk??"–"), col:RED   },
    { label:"Actual Churn Rate",  val:`${((summary.churn_rate??0)*100).toFixed(1)}%`, col:AMBER },
    { label:"Model AUC-ROC",      val:String(summary.model_auc??"–"), col:BLUE  },
    { label:"F1 Score",           val:String(summary.model_f1??"–"),  col:GREEN },
  ];
  const bw = (PW-M*2-9)/4;
  kpis.forEach((k,i) => {
    const x = M + i*(bw+3);
    fill(BORDER[0],BORDER[1],BORDER[2]); doc.roundedRect(x,y,bw,18,2,2,"F");
    text(k.col); doc.setFontSize(15); doc.setFont("helvetica","bold");
    doc.text(k.val, x+bw/2, y+11, {align:"center"});
    doc.setFontSize(6.5); doc.setFont("helvetica","normal"); text(MID);
    doc.text(k.label.toUpperCase(), x+bw/2, y+16, {align:"center"});
  });
  y += 24;

  // ARR banner
  fill(0,120,212); doc.roundedRect(M,y,PW-M*2,10,2,2,"F");
  text([255,255,255]); doc.setFontSize(8.5); doc.setFont("helvetica","bold");
  const arr = ((summary.arr_at_risk??0)/1_000_000).toFixed(1);
  doc.text(`Estimated Annual Revenue at Risk: $${arr}M`, M+4, y+6.5);
  doc.setFont("helvetica","normal"); doc.setFontSize(7.5);
  doc.text(`${summary.high_risk??0} high-risk accounts  ·  ~30% recoverable with early action`, PW-M-2, y+6.5, {align:"right"});
  y += 16;

  // ── Risk tiers ────────────────────────────────────────────────────
  heading("Risk Tier Breakdown");
  const total = summary.total_customers ?? 1;
  [
    {label:"High Risk",   count:summary.high_risk??0,   col:RED  },
    {label:"Medium Risk", count:summary.medium_risk??0, col:AMBER},
    {label:"Low Risk",    count:summary.low_risk??0,    col:GREEN},
  ].forEach((t,i) => {
    const x = M + i*((PW-M*2)/3+1);
    const cw = (PW-M*2)/3-2;
    fill(t.col[0],t.col[1],t.col[2]); doc.roundedRect(x,y,cw,14,2,2,"F");
    text([255,255,255]); doc.setFontSize(12); doc.setFont("helvetica","bold");
    doc.text(`${t.count.toLocaleString()}`, x+cw/2, y+8, {align:"center"});
    doc.setFontSize(6.5); doc.setFont("helvetica","normal");
    doc.text(`${t.label.toUpperCase()}  (${((t.count/total)*100).toFixed(1)}%)`, x+cw/2, y+12.5, {align:"center"});
  });
  y += 20;

  // ── Model metrics ─────────────────────────────────────────────────
  heading("Model Performance Metrics");
  const mm = metrics?.metrics ?? {};
  [
    ["AUC-ROC",   String(mm.auc??"–"),       "Area under receiver operating curve"],
    ["F1 Score",  String(mm.f1??"–"),        "Harmonic mean of precision & recall"],
    ["Precision", String(mm.precision??"–"), "True positives / all predicted positives"],
    ["Recall",    String(mm.recall??"–"),    "True positives / all actual positives"],
    ["Accuracy",  String(mm.accuracy??"–"),  "Overall classification accuracy"],
  ].forEach((row,i) => {
    fill(i%2===0?255:BG[0], i%2===0?255:BG[1], i%2===0?255:BG[2]);
    doc.rect(M,y,PW-M*2,6,"F");
    text(DARK); doc.setFontSize(7.5); doc.setFont("helvetica","normal");
    doc.text(row[0], M+2,  y+4.2);
    text(BLUE);  doc.setFont("helvetica","bold");
    doc.text(row[1], M+40, y+4.2);
    text(MID);   doc.setFont("helvetica","normal");
    doc.text(row[2], M+65, y+4.2);
    y += 6;
  });
  y += 5;

  // ── SHAP drivers ──────────────────────────────────────────────────
  heading("Top Churn Drivers  (Global SHAP Feature Importance)");
  const topShap = (shap??[]).slice(0,8);
  const maxImp  = topShap[0]?.importance ?? 1;
  topShap.forEach((s:any, i:number) => {
    const fw = ((s.importance/maxImp)*(PW-M*2-55));
    const col = i < 3 ? RED : BLUE;
    fill(col[0],col[1],col[2]); doc.roundedRect(M+48,y+1,Math.max(fw,2),4.5,1,1,"F");
    text(DARK); doc.setFontSize(7.5); doc.setFont("helvetica", i<3?"bold":"normal");
    doc.text(`${i+1}. ${s.feature}`, M+2, y+5);
    text(MID); doc.text(s.importance.toFixed(4), PW-M-2, y+5, {align:"right"});
    y += 7;
  });
  y += 4;

  // ── Segments ──────────────────────────────────────────────────────
  heading("Segment Analysis  —  Churn Rate by Group");

  text(DARK); doc.setFontSize(8); doc.setFont("helvetica","bold");
  doc.text("By Contract Type", M, y+4); y+=7;
  (segments?.by_contract??[]).forEach((d:any) => {
    const pct = Math.round((d.avg_churn??0)*100);
    const col = pct>35?RED:pct>15?AMBER:GREEN;
    hBar(d.Contract??d.label??"", pct, d.count??0, col);
  });
  y += 2;

  text(DARK); doc.setFontSize(8); doc.setFont("helvetica","bold");
  doc.text("By Customer Tenure", M, y+4); y+=7;
  (byTenure??[]).forEach((d:any) => {
    const pct = Math.round((d.avg_churn??0)*100);
    const col = pct>35?RED:pct>15?AMBER:GREEN;
    hBar(d.label??"", pct, d.count??0, col);
  });
  y += 2;

  text(DARK); doc.setFontSize(8); doc.setFont("helvetica","bold");
  doc.text("By Payment Method", M, y+4); y+=7;
  (segments?.by_payment??[]).forEach((d:any) => {
    const pct = Math.round((d.avg_churn??0)*100);
    const col = pct>35?RED:pct>15?AMBER:GREEN;
    hBar(d.PaymentMethod??d.label??"", pct, d.count??0, col);
  });

  // ── Footer ────────────────────────────────────────────────────────
  fill(0,120,212); doc.rect(0,285,PW,12,"F");
  text([255,255,255]); doc.setFontSize(7); doc.setFont("helvetica","normal");
  doc.text("ChurnIQ v3  ·  Confidential  ·  XGBoost + SHAP  ·  Telco Customer Intelligence", M, 292);
  doc.text("Page 1 of 1", PW-M, 292, {align:"right"});

  doc.save(`ChurnIQ_Report_${new Date().toISOString().slice(0,10)}.pdf`);
}
