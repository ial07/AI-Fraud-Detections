"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BrainCircuit, AlertOctagon, CheckCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alerts?per_page=50`);
      const data = await res.json();
      if (data.status === "success") {
        setAlerts(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const updateAlertStatus = async (id: number, newStatus: string) => {
    // Optimistic UI Update
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, alert_status: newStatus } : alert
    ));

    try {
      console.log(`[Frontend] Sending PATCH request to ${process.env.NEXT_PUBLIC_API_URL}/alerts/${id}`);
      const patchRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alert_status: newStatus })
      });
      console.log(`[Frontend] Response received:`, await patchRes.clone().json());
    } catch (error) {
      console.error(error);
      fetchAlerts(); // Rollback on fail
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'NEW': return <AlertOctagon className="w-4 h-4 text-destructive" />;
      case 'INVESTIGATING': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'RESOLVED': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-8">
          <div className="flex gap-2 items-center">
            <BrainCircuit className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">AI Fraud Platform</span>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <a href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">Dashboard</a>
            <a href="#" className="transition-colors hover:text-foreground/80 text-foreground">Alerts Hub</a>
          </nav>
        </div>
      </header>

      <main className="container mx-auto p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alerts Hub</h1>
          <p className="text-muted-foreground mt-1">Manage and resolve flagged transaction alerts.</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Actionable Alerts</CardTitle>
            <CardDescription>Update the resolution status of suspected fraud incidents.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-12 text-center text-muted-foreground animate-pulse">Loading alerts...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alert ID</TableHead>
                    <TableHead>Transaction / User</TableHead>
                    <TableHead>Risk Penalty</TableHead>
                    <TableHead>Key Concern</TableHead>
                    <TableHead>Time Flagged</TableHead>
                    <TableHead className="text-right w-[180px]">Status Tracker</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {alerts.map((alert, idx) => (
                      <motion.tr 
                        key={alert.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b"
                      >
                        <TableCell className="font-mono text-xs">ALT-{alert.id.toString().padStart(4, '0')}</TableCell>
                        <TableCell>
                          <div className="font-medium">{alert.transaction?.transaction_id}</div>
                          <div className="text-xs text-muted-foreground">{alert.transaction?.user_id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col items-start gap-1">
                            <Badge variant="destructive" className="bg-red-500">
                              {alert.risk_score} SCORE
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">{alert.risk_level}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md truncate text-sm">
                            {alert.explanations?.[0] || 'Unknown anomaly detected.'}
                          </div>
                          {alert.explanations?.length > 1 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              + {alert.explanations.length - 1} more factors
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                           {new Date(alert.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Select 
                            value={alert.alert_status} 
                            onValueChange={(val) => updateAlertStatus(alert.id, val)}
                          >
                            <SelectTrigger className="w-[160px] h-8 text-xs font-semibold">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NEW">
                                <span className="flex items-center gap-2"><AlertOctagon className="w-3 h-3 text-destructive"/> NEW</span>
                              </SelectItem>
                              <SelectItem value="INVESTIGATING">
                                <span className="flex items-center gap-2"><Clock className="w-3 h-3 text-orange-500"/> INVESTIGATING</span>
                              </SelectItem>
                              <SelectItem value="RESOLVED">
                                <span className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500"/> RESOLVED</span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {alerts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        No alerts in the system. Everything looks clear!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
