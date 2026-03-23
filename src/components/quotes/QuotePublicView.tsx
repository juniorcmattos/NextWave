"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, X, Download, FileText, Calendar, User, Printer, Send, Loader2, CheckCircle2, PenTool } from "lucide-react";
import { toast } from "sonner";

export function QuotePublicView({ quote }: { quote: any }) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(quote.status);

    const handleAction = async (newStatus: "aprovado" | "recusado") => {
        setLoading(true);
        try {
            const res = await fetch(`/api/quotes/${quote.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error();
            setStatus(newStatus);
            toast.success(newStatus === "aprovado" ? "Orçamento aprovado!" : "Orçamento recusado.");
            if (newStatus === "aprovado") {
                // Refresh to show contract link if automatically created
                window.location.reload();
            }
        } catch {
            toast.error("Erro ao processar solicitação");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Orçamento</h1>
                    <p className="text-slate-500 font-medium">#{quote.id.slice(-6).toUpperCase()}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant={status === "aprovado" ? "success" : status === "recusado" ? "destructive" : "secondary"} className="text-sm px-4 py-1 rounded-full font-bold uppercase">
                        {status}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="md:col-span-2 space-y-8">
                    <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-6">
                            <CardTitle className="text-xl font-black">Detalhes da Proposta</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold">{quote.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                                    {quote.description}
                                </p>
                            </div>

                            <div className="space-y-4 pt-4">
                                <h4 className="text-sm font-black uppercase text-slate-400 tracking-widest">Itens do Orçamento</h4>
                                <div className="space-y-3">
                                    {quote.items.map((item: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-800 last:border-0">
                                            <div className="space-y-1">
                                                <p className="font-bold text-slate-800 dark:text-slate-200">{item.description}</p>
                                                <p className="text-xs text-slate-500">Qtd: {item.quantity}</p>
                                            </div>
                                            <p className="font-mono font-bold text-lg">R$ {(Number(item.quantity) * Number(item.price)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col items-end pt-6">
                                <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Valor Total</p>
                                <p className="text-5xl font-black text-primary">R$ {Number(quote.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-none shadow-xl bg-primary text-primary-foreground overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-black opacity-80 uppercase tracking-widest">Resumo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-xs font-bold opacity-60 uppercase">Vencimento</p>
                                <p className="font-bold flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString("pt-BR") : "N/A"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold opacity-60 uppercase">Emitido por</p>
                                <p className="font-bold flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    {quote.user.name}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-black uppercase tracking-widest text-slate-400">Cliente</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="font-black text-slate-800 dark:text-slate-200 text-lg">{quote.client.name}</p>
                            <p className="text-sm text-slate-500">{quote.client.email}</p>
                        </CardContent>
                    </Card>

                    {status === "rascunho" || status === "enviado" ? (
                        <div className="space-y-3 pt-4">
                            <Button className="w-full h-14 text-lg font-black gap-2 shadow-lg shadow-primary/20" onClick={() => handleAction("aprovado")} disabled={loading}>
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                                APROVAR PROPOSTA
                            </Button>
                            <Button variant="outline" className="w-full h-12 font-bold text-destructive hover:bg-destructive/5 gap-2 border-destructive/20" onClick={() => handleAction("recusado")} disabled={loading}>
                                <X className="h-4 w-4" /> Recusar
                            </Button>
                        </div>
                    ) : status === "aprovado" ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl text-center space-y-4">
                            <div className="h-12 w-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-white">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <div>
                                <h4 className="font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Aprovado!</h4>
                                <p className="text-sm text-emerald-600/80">Este orçamento foi aprovado.</p>
                            </div>
                            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white gap-3 font-black h-14 shadow-xl" onClick={() => {
                                window.location.href = `/public/contratos/${quote.id}`;
                            }}>
                                <PenTool className="h-5 w-5" /> ASSINAR CONTRATO
                            </Button>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
