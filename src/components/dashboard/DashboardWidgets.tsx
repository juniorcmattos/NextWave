"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DollarSign, TrendingUp, MessageSquare,
    Database, CheckCircle2, AlertCircle, Clock,
    ArrowUpRight, ArrowDownRight, ShieldCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function FinanceWidget({ stats }: { stats: any }) {
    const data = stats || { totalReceita: 0, variacaoReceita: 0 };

    return (
        <Card className="premium-card glass overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-semibold opacity-70 uppercase tracking-widest">Financeiro</CardTitle>
                <div className="p-2.5 bg-primary/10 rounded-2xl text-primary shadow-sm shadow-primary/10">
                    <DollarSign className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-black tracking-tighter">R$ {data.totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                <div className="flex items-center gap-2 mt-2">
                    {data.variacaoReceita >= 0 ? (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                            <ArrowUpRight className="h-3 w-3" /> {data.variacaoReceita.toFixed(1)}%
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                            <ArrowDownRight className="h-3 w-3" /> {Math.abs(data.variacaoReceita).toFixed(1)}%
                        </div>
                    )}
                    <span className="text-[10px] font-medium text-muted-foreground uppercase opacity-60">vs mês anterior</span>
                </div>
            </CardContent>
        </Card>
    );
}

export function WhatsAppWidget({ data }: { data: any }) {
    const defaultData = data || { totalMessages: 0, activeInstances: 0 };
    return (
        <Card className="premium-card glass overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-semibold opacity-70 uppercase tracking-widest">WhatsApp</CardTitle>
                <div className="p-2.5 bg-success/10 rounded-2xl text-success shadow-sm shadow-success/10">
                    <MessageSquare className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-black tracking-tighter">{defaultData.totalMessages}</div>
                <p className="text-[10px] font-medium text-muted-foreground mt-2 uppercase opacity-60">
                    {defaultData.activeInstances} instâncias ativas
                </p>
                <div className="flex items-center gap-2 mt-2">
                    <div className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20">SISTEMA ONLINE</div>
                </div>
            </CardContent>
        </Card>
    );
}

export function BackupWidget({ data }: { data: any }) {
    const defaultData = data || { lastBackup: "Hoje, 03:00" };
    return (
        <Card className="premium-card glass overflow-hidden border-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-semibold opacity-70 uppercase tracking-widest">Segurança</CardTitle>
                <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-500 shadow-sm shadow-amber-500/10">
                    <ShieldCheck className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter">Protegido</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-[10px] font-medium text-muted-foreground uppercase opacity-60">
                    <Database className="h-3 w-3" /> {defaultData.lastBackup}
                </div>
            </CardContent>
        </Card>
    );
}

export function TasksWidget({ data }: { data: any }) {
    const defaultData = data || { pendingTasks: 0 };
    return (
        <Card className="premium-card glass overflow-hidden border-none text-white card-navy">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-semibold opacity-70 uppercase tracking-widest">Automações</CardTitle>
                <div className="p-2.5 bg-white/10 rounded-2xl text-white shadow-sm shadow-white/10">
                    <Clock className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-black tracking-tighter">{defaultData.pendingTasks} Jobs</div>
                <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-accent uppercase">
                    <AlertCircle className="h-3 w-3" />
                    <span>Cron Ativo</span>
                </div>
            </CardContent>
        </Card>
    );
}
