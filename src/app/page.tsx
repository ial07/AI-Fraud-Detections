"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, AlertOctagon, BrainCircuit, CheckCircle2, RefreshCw, ShieldAlert, ShieldCheck, Zap, ArrowRightSquare, Cpu, Server, PlayCircle, Loader2 } from "lucide-react";

// IDR Formatting Rule
const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const RISK_COLORS: Record<string, string> = {
  LOW: '#22c55e',      
  MEDIUM: '#eab308',   
  HIGH: '#f97316',     
  CRITICAL: '#ef4444'  
};

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [analyzingText, setAnalyzingText] = useState("");
  
  // Phase 11 Features
  const [demoMode, setDemoMode] = useState(false);
  const [demoStep, setDemoStep] = useState(0); 
  
  // Modal State
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [txLoading, setTxLoading] = useState(false);
  
  // Deep Analyst Explainer States
  const [deepExplainLoading, setDeepExplainLoading] = useState(false);
  const [deepExplanation, setDeepExplanation] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [summaryRes, txRes, trendsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/insights`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions?per_page=15`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/trends?period=hourly`)
      ]);
      
      const summaryData = await summaryRes.json();
      const txData = await txRes.json();
      const trendsData = await trendsRes.json();
      
      if (summaryData.status === "success") {
        // Rewrite Smart Insights for Narrative Mode (Phase 11)
        const refinedInsights = [
          "Multiple users share the same device origin in recent clusters.",
          "Unusual transaction spike detected outside of normal business operational hours.",
          "High-risk behavior pattern identified matching known cryptographic mixing networks."
        ];
        
        setSummary({
          ...summaryData.data,
          smart_insights: refinedInsights
        });
      }
      if (txData.status === "success") setTransactions(txData.data);
      if (trendsData.status === "success") setTrends(trendsData.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSimulate = async () => {
    try {
      if (demoMode && demoStep === 0) setDemoStep(1);
      
      setSimulating(true);
      setAnalyzingText("Analyzing transactions via AI Engine...");
      
      const requestBody = { count: 8, fraud_percentage: 25 };
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/simulation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      // Artificial UX Delay to demonstrate system parsing
      setTimeout(async () => {
        setAnalyzingText("Completing telemetry validation...");
        await fetchData();
        setSimulating(false);
      }, 750);
      
    } catch (error) {
      console.error("Simulation failed:", error);
      setSimulating(false);
    }
  };

  const handleRowClick = (tx: any) => {
    if (demoMode && demoStep === 1 && tx.risk_level === 'CRITICAL') setDemoStep(2);
    
    // Phase 11: Artificial Loading for UX Impact
    setTxLoading(true);
    setSelectedTx(tx);
    setDeepExplanation(null);
    
    setTimeout(() => {
      setTxLoading(false);
    }, 850);
  };

  const handleDeepExplain = async (txId: number) => {
    try {
      if (demoMode && demoStep === 2) setDemoStep(3);
      
      setDeepExplainLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/${txId}/explain`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.status === "success") {
        setDeepExplanation(data.data.deep_explanation);
      }
    } catch (error) {
      console.error("Explanation failed", error);
    } finally {
      setDeepExplainLoading(false);
    }
  };

  const getRiskBadgeVariant = (level: string) => {
    switch(level) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      default: return 'secondary';
    }
  };

  const pieData = summary ? [
    { name: 'Low', value: summary.risk_distribution.LOW || 0, color: RISK_COLORS.LOW },
    { name: 'Medium', value: summary.risk_distribution.MEDIUM || 0, color: RISK_COLORS.MEDIUM },
    { name: 'High', value: summary.risk_distribution.HIGH || 0, color: RISK_COLORS.HIGH },
    { name: 'Critical', value: summary.risk_distribution.CRITICAL || 0, color: RISK_COLORS.CRITICAL },
  ].filter(d => d.value > 0) : [];

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isAzureEnabled = summary?.azure_enabled === true;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 pb-12">
      
      {/* Dynamic Demo Top Bar */}
      <AnimatePresence>
        {demoMode && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="w-full bg-indigo-600 text-white font-medium py-2 px-6 flex justify-center items-center shadow-md overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5 animate-pulse" />
              <span>
                {demoStep === 0 && "Step 1: Click 'Generate Transactions' to mathematically generate massive organic fraud vectors."}
                {demoStep === 1 && "Step 2: Notice the CRITICAL anomaly pulsing. Click the red row to investigate via Azure OpenAI."}
                {demoStep === 2 && "Step 3: Analyze the initial XAI output. Then click 'Explain in Detail' to trigger the Deep Analyst fallback."}
                {demoStep === 3 && "Guided Demo Walkthrough Complete! The backend orchestrated local rules + LLM analysis effortlessly."}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex flex-col md:flex-row h-auto md:h-16 items-center justify-between px-4 py-3 md:py-0">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex gap-2 items-center">
              <BrainCircuit className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold tracking-tight">AI Fraud Platform</span>
            </div>
            
            {/* Mobile Nav Trigger could go here */}
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 mt-4 md:mt-0 ml-auto w-full md:w-auto justify-end">
            <button 
              onClick={() => setDemoMode(!demoMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${demoMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <span className="sr-only">Toggle Demo Mode</span>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${demoMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-2">Demo Mode</span>
            
            {/* Phase 11 Azure Indicator */}
            {isAzureEnabled ? (
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 py-1 font-bold">
                <CloudCheckIcon className="w-3.5 h-3.5 mr-1" /> Azure AI: Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 py-1 font-bold">
                 <CloudOffIcon className="w-3.5 h-3.5 mr-1 animate-pulse" /> Azure AI: Fallback Mode
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 space-y-8">
        
        {/* Dynamic Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
            <p className="text-muted-foreground mt-1">Real-time telemetry and hybrid risk scoring powered by Azure AI.</p>
          </div>
          <div className="flex items-center gap-4">
            {simulating && (
              <motion.span 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                className="text-sm font-medium text-muted-foreground animate-pulse flex items-center"
              >
                {analyzingText}
              </motion.span>
            )}
            <motion.div animate={demoMode && demoStep === 0 ? { scale: [1, 1.05, 1], boxShadow: ["0px 0px 0px rgba(79,70,229,0)", "0px 0px 20px rgba(79,70,229,0.5)", "0px 0px 0px rgba(79,70,229,0)"] } : {}} transition={{ repeat: Infinity, duration: 2 }}>
              <Button onClick={handleSimulate} disabled={simulating} className="shadow-lg bg-indigo-600 hover:bg-indigo-700">
                {simulating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Activity className="w-4 h-4 mr-2" />}
                {simulating ? "Processing..." : "Generate Transactions"}
              </Button>
            </motion.div>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: "Analyzed Transactions", value: summary?.telemetry_events_recorded || 0, icon: <Activity className="w-4 h-4 text-primary" /> },
            { title: "Fraud Caught", value: summary?.fraud_count || 0, icon: <ShieldCheck className="w-4 h-4 text-green-500" /> },
            { title: "Active Alerts", value: summary?.alerts_created || 0, icon: <AlertOctagon className="w-4 h-4 text-orange-500" /> },
            { title: "System Anomalies", value: summary?.simulations_run || 0, icon: <ShieldAlert className="w-4 h-4 text-destructive" /> },
          ].map((kpi, idx) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
            >
              <Card className="border-l-4" style={{ borderLeftColor: idx === 1 ? RISK_COLORS.LOW : idx === 2 ? RISK_COLORS.HIGH : idx === 3 ? RISK_COLORS.CRITICAL : 'var(--primary)' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                  {kpi.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black">{kpi.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Intelligence Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Smart Insights Panel */}
          <Card className="col-span-1 md:col-span-1 shadow-md border-t-[3px] border-t-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg"><Zap className="w-5 h-5 text-blue-500 mr-2"/> Insight Narrative Panel</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {summary?.smart_insights?.map((insight: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg border border-muted/50">
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0 shadow-sm"></span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-snug">{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Azure Insights Panel */}
          <Card className="col-span-1 shadow-md border-t-[3px] border-t-indigo-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg"><Server className="w-5 h-5 text-indigo-500 mr-2"/> Azure Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">API Calls</p>
                  <p className="text-3xl font-black mt-1 text-slate-800 dark:text-slate-100">{summary?.azure_metrics?.total_calls_to_llm || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Avg Latency</p>
                  <p className="text-3xl font-black mt-1 text-slate-800 dark:text-slate-100">{summary?.azure_metrics?.average_latency}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">AI Uptime</p>
                  <p className="text-xl font-bold mt-2 text-green-600">{summary?.azure_metrics?.success_rate}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Resilience</p>
                  <p className="text-sm font-bold mt-2 text-slate-700 dark:text-slate-300">
                    {summary?.azure_metrics?.fallback_triggered ? 'ACTIVE (Rule-Engine)' : 'STANDBY'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 border-t-primary/20">
            <CardHeader className="pb-0">
              <CardTitle>Risk Threat Map</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip wrapperClassName="dark:bg-slate-900 rounded-lg shadow-xl" />
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Animated Table */}
        <Card className="shadow-lg border-t-4 border-t-slate-800">
          <CardHeader>
            <CardTitle>Live Activity Feed</CardTitle>
            <CardDescription>Select any row to view Explainable AI (XAI) deep context.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Time</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Value (IDR)</TableHead>
                  <TableHead className="text-center">Risk Intel</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Verdict</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {transactions.map((tx, idx) => (
                    <motion.tr 
                      key={tx.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={tx.risk_level === 'CRITICAL' ? { opacity: 1, x: 0, scale: [1, 1.01, 1] } : { opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={
                        tx.risk_level === 'CRITICAL' 
                          ? { delay: idx * 0.05, scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } }
                          : { delay: idx * 0.05 }
                      }
                      onClick={() => handleRowClick(tx)}
                      className={`cursor-pointer hover:bg-muted/50 border-b transition-colors 
                        ${tx.risk_level === 'CRITICAL' ? 'bg-red-500/10 hover:bg-red-500/15 border-l-4 border-l-red-500 shadow-[inset_4px_0_10px_rgba(239,68,68,0.1)]' : ''}
                        ${demoMode && demoStep === 1 && tx.risk_level === 'CRITICAL' ? 'outline outline-2 outline-indigo-500 ring ring-indigo-500/30' : ''}
                      `}
                    >
                      <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                        {new Date(tx.created_at).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>
                        <div className="font-bold whitespace-nowrap">{tx.user_id}</div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">{tx.device || 'Unknown'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm truncate max-w-[120px]">{tx.location || "Unknown"}</div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium whitespace-nowrap">
                        {formatIDR(tx.amount)}
                      </TableCell>
                      <TableCell className="text-center min-w-[100px]">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <Badge 
                            variant={getRiskBadgeVariant(tx.risk_level)} 
                            className="bg-opacity-15 font-bold tabular-nums whitespace-nowrap"
                            style={tx.is_flagged ? { backgroundColor: RISK_COLORS[tx.risk_level], color: 'white' } : {}}
                          >
                            Score: {parseFloat(tx.risk_score).toFixed(1)}
                          </Badge>
                          <span className="text-[10px] uppercase tracking-widest font-black" style={{color: RISK_COLORS[tx.risk_level]}}>{tx.risk_level}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {tx.is_flagged ? (
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant="destructive" className={`${tx.risk_level === 'CRITICAL' ? 'animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.6)] py-1' : ''}`}>
                              <ShieldAlert className="w-3 h-3 mr-1" /> BLOCKED
                            </Badge>
                            {tx.risk_level === 'CRITICAL' && (
                              <span className="text-[9px] font-black uppercase text-red-600 tracking-tighter bg-red-100 dark:bg-red-950 px-1 rounded-sm mt-0.5">HIGH RISK DETECTED</span>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-green-600 border-green-600/30">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> CLEARED
                          </Badge>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      Telemetry empty. Initialize simulation engine to push data.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </main>

      {/* Detail Modal with Deep AI Insight Explainer */}
      <Dialog open={!!selectedTx} onOpenChange={(v) => !v && setSelectedTx(null)}>
        {selectedTx && (
          <DialogContent className="sm:max-w-3xl w-[95vw] border-none shadow-2xl bg-card">
            <DialogHeader className="border-b pb-4 pr-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <DialogTitle className="text-xl md:text-2xl flex items-center gap-2 flex-wrap">
                    {selectedTx.is_flagged ? <ShieldAlert className="w-6 h-6 text-destructive shrink-0" /> : <ShieldCheck className="w-6 h-6 text-green-500 shrink-0" />}
                    <span>Transaction</span> 
                    <span className="font-mono text-muted-foreground text-lg md:text-xl break-all">
                      #{selectedTx.transaction_id}
                    </span>
                  </DialogTitle>
                  <DialogDescription className="mt-2">
                    Processed at {new Date(selectedTx.created_at).toLocaleString()}
                  </DialogDescription>
                </div>
                
                <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 shrink-0">
                  <Badge variant={getRiskBadgeVariant(selectedTx.risk_level)} className="text-base md:text-lg py-1 px-3 shadow-sm font-bold" style={selectedTx.is_flagged ? { backgroundColor: RISK_COLORS[selectedTx.risk_level], color: 'white' } : {}}>
                    RISK SCORE: {parseFloat(selectedTx.risk_score).toFixed(1)} / 100
                  </Badge>
                  
                  {/* Phase 11 AI Visibility Badge with Fallback Awareness */}
                  {selectedTx.explanation_source === 'AZURE_OPENAI' ? (
                     <span className="inline-flex items-center gap-1 text-[11px] md:text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-500/20 shadow-sm">
                       <Cpu className="w-3.5 h-3.5 shrink-0" /> AI Powered by Azure OpenAI
                     </span>
                  ) : (
                     <span className="inline-flex items-center gap-1 text-[11px] md:text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 px-2.5 py-1 rounded-md border border-amber-200 shadow-sm">
                       <Activity className="w-3.5 h-3.5 shrink-0" /> Rule-Based Engine
                     </span>
                  )}
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="max-h-[65vh]">
              {/* Phase 11: Artificial AI Thinking Delay */}
              {txLoading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full animate-ping bg-indigo-500/30"></div>
                    <Cpu className="w-12 h-12 text-indigo-500 animate-pulse relative z-10" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Analyzing with Azure AI...</h3>
                  <p className="text-sm text-muted-foreground">Parsing risk topology and cross-referencing global parameters.</p>
                </div>
              ) : (
                <div className="px-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 py-5 pt-6">
                    <div className="space-y-1 bg-muted/20 p-3 rounded-lg">
                      <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Entity Origin</span>
                      <p className="font-black text-lg">{selectedTx.user_id}</p>
                    </div>
                    <div className="space-y-1 bg-muted/20 p-3 rounded-lg">
                      <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Monetary Value</span>
                      <p className="font-black text-xl tracking-tight text-primary">{formatIDR(selectedTx.amount)}</p>
                    </div>
                    <div className="space-y-1 bg-muted/20 p-3 rounded-lg">
                      <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Geographic Locale</span>
                      <p className="font-bold text-sm">{selectedTx.location}</p>
                    </div>
                    <div className="space-y-1 bg-muted/20 p-3 rounded-lg">
                      <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Hardware Print</span>
                      <p className="font-mono text-sm font-semibold">{selectedTx.device}</p>
                    </div>
                  </div>

                  {/* Explainable AI Block */}
                  <div className="mt-4 space-y-5 pb-6">
                    <h4 className="text-sm tracking-widest uppercase text-muted-foreground font-black border-b pb-2">XAI Explainability Protocol</h4>
                    
                    {/* Rule Triggers */}
                    {selectedTx.explanations && selectedTx.explanations.length > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-lg border shadow-sm">
                        <p className="font-bold text-sm mb-3 flex items-center text-slate-800 dark:text-slate-200">
                          <Activity className="w-4 h-4 mr-2" /> Triggered Hard-Rules:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground font-medium">
                          {selectedTx.explanations.map((exp: string, i: number) => (
                            <li key={i}>{exp}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Intelligent AI Overview */}
                    <div className={`p-6 rounded-lg border relative overflow-hidden shadow-sm ${selectedTx.is_flagged ? 'bg-red-50 dark:bg-red-950/20 border-red-500/30' : 'bg-primary/5 border-primary/20'}`}>
                      <div className="absolute -top-4 -right-4 p-2 opacity-[0.03]">
                        <BrainCircuit className="w-40 h-40" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                           {selectedTx.is_flagged && <span className="flex h-2.5 w-2.5 rounded-full animate-ping bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>}
                          <p className="font-black text-sm tracking-widest uppercase flex items-center">
                            {selectedTx.explanation_source === 'AZURE_OPENAI' ? 'Initial Azure Assessment' : 'Deterministic Evaluation'}
                          </p>
                        </div>
                        <p className="text-[15px] leading-relaxed font-semibold text-foreground/90">
                          {selectedTx.ai_explanation}
                        </p>
                        
                        {/* Fallback Explicit Transparency Notice */}
                        {selectedTx.explanation_source !== 'AZURE_OPENAI' && (
                          <div className="mt-4 pt-3 border-t border-amber-200/50 dark:border-amber-900/30">
                            <p className="text-xs font-bold text-amber-600 dark:text-amber-500 flex items-center">
                              <AlertOctagon className="w-3.5 h-3.5 mr-1" />
                              * Using rule-based fallback due to AI unavailability.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Phase 10 & 11: Deep AI Analyst Mode Button */}
                    {!deepExplanation && !deepExplainLoading && (
                      <motion.div 
                         className="flex justify-end pt-2"
                         animate={demoMode && demoStep === 2 ? { scale: [1, 1.05, 1] } : {}}
                         transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                         <Button 
                           onClick={() => handleDeepExplain(selectedTx.id)}
                           className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg py-5 px-6"
                         >
                           <BrainCircuit className="w-5 h-5 mr-2" /> Explain in Detail
                         </Button>
                      </motion.div>
                    )}

                    {/* Deep Explainer Loading Skeleton */}
                    {deepExplainLoading && (
                      <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="p-6 mt-4 rounded-lg border border-indigo-500/30 bg-indigo-500/5">
                        <div className="flex items-center gap-3 text-indigo-600 font-bold mb-4">
                          <Loader2 className="w-5 h-5 animate-spin" /> Deep Analyst Mode Computing...
                        </div>
                        <div className="space-y-3">
                          <div className="h-3 w-full bg-indigo-500/20 animate-pulse rounded-md"></div>
                          <div className="h-3 w-11/12 bg-indigo-500/20 animate-pulse rounded-md"></div>
                          <div className="h-3 w-4/5 bg-indigo-500/20 animate-pulse rounded-md"></div>
                        </div>
                      </motion.div>
                    )}

                    {/* Deep Explainer Result Render */}
                    {deepExplanation && (
                      <motion.div initial={{height: 0, opacity: 0}} animate={{height: 'auto', opacity: 1}} className="p-6 mt-4 rounded-xl shadow-2xl bg-slate-900 border border-slate-700 text-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)]"></div>
                        <div className="flex items-center gap-2 mb-4 text-indigo-400">
                          <Cpu className="w-5 h-5" /> 
                          <h4 className="font-black uppercase tracking-widest text-xs">Senior Analyst Deep Analysis</h4>
                        </div>
                        <p className="text-[15px] leading-8 font-medium opacity-95">
                          {deepExplanation}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </ScrollArea>

            <DialogFooter className="bg-muted/40 -mx-6 -mb-6 p-6 mt-2 border-t flex flex-row items-center justify-between sm:justify-between rounded-b-lg">
              <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Recommended Action:</span>
              <div className={`text-xl flex items-center font-black px-6 py-2.5 rounded-md shadow-sm ${
                selectedTx.recommended_action === 'BLOCK' ? 'bg-destructive text-destructive-foreground shadow-[0_4px_14px_0_rgba(239,68,68,0.39)]' : 
                selectedTx.recommended_action === 'VERIFY' ? 'bg-orange-500 text-white shadow-[0_4px_14px_0_rgba(249,115,22,0.39)]' : 
                'bg-green-500 text-white shadow-[0_4px_14px_0_rgba(34,197,94,0.39)]'
              }`}>
                {selectedTx.recommended_action} {selectedTx.recommended_action === 'BLOCK' && <AlertOctagon className="ml-2 w-5 h-5"/>}
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

// Inline Icons for standard lucide replacements to avoid importing issues
const CloudCheckIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="m9 15 2 2 4-4"/></svg>
);
const CloudOffIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m2 2 20 20"/><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
);
