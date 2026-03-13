"use client";

import { useState, useEffect } from "react";
import {
    X, User, Phone, Mail, MapPin, Building2,
    DollarSign, Clock, FileText, Plus, ExternalLink,
    Filter, Download, ChevronRight, Receipt, CreditCard
} from "lucide-react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { formatDate, getInitials, cn } from "@/lib/utils";
import { toast } from "sonner";

interface ClientProfileProps {
    clientId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ClientProfile({ clientId, open, onOpenChange }: ClientProfileProps) {
    const [client, setClient] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open && clientId) {
            fetchClientDetails();
        }
    }, [open, clientId]);

    const fetchClientDetails = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/clientes/${clientId}`);
            if (res.ok) {
                const data = await res.json();
                setClient(data);
            }
        } catch (error) {
            toast.error("Erro ao carregar detalhes do cliente");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !client) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl h-[85vh] flex items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl h-[90vh] p-0 flex flex-col gap-0 overflow-hidden bg-slate-50 dark:bg-slate-950/20 backdrop-blur-3xl border-none shadow-2xl">
                {/* Custom Header */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 border-b border-border/40 flex items-start justify-between">
                    <div className="flex items-center gap-5">
                        <Avatar className="h-20 w-20 border-4 border-white shadow-xl">
                            <AvatarFallback className="bg-indigo-600 text-white text-3xl font-bold">
                                {getInitials(client?.name || "")}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <h2 className="text-3xl font-extrabold tracking-tight">{client?.name}</h2>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                                <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {client?.company || "Pessoa Física"}</span>
                                <span className="h-1 w-1 rounded-full bg-slate-300" />
                                <Badge variant={client?.status === "ativo" ? "success" : "secondary"} className="rounded-full px-3">{client?.status}</Badge>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar Info */}
                    <div className="w-80 border-r border-border/40 bg-white/40 dark:bg-slate-900/40 p-6 space-y-8 hidden md:block overflow-y-auto">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Dados de Contato</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 group">
                                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">E-mail</span>
                                        <span className="text-[11px] text-muted-foreground truncate">{client?.email || "Não informado"}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 group">
                                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                                        <Phone className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Telefone</span>
                                        <span className="text-[11px] text-muted-foreground">{client?.phone || "Não informado"}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 group">
                                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Localização</span>
                                        <span className="text-[11px] text-muted-foreground italic leading-tight">
                                            {client?.address ? `${client.address}, ${client.city}-${client.state}` : "Sem endereço"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Métricas Principais</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-2xl bg-white border border-border/50 shadow-sm">
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Transações</p>
                                    <p className="text-xl font-black text-indigo-600">{client?._count?.transactions || 0}</p>
                                </div>
                                <div className="p-3 rounded-2xl bg-white border border-border/50 shadow-sm">
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Serviços</p>
                                    <p className="text-xl font-black text-emerald-600">{client?._count?.services || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button className="w-full bg-slate-900 hover:bg-black text-white rounded-xl shadow-lg shadow-slate-200 dark:shadow-none font-bold py-6">
                                <Plus className="h-4 w-4 mr-2" /> Nova Venda
                            </Button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 bg-white/20 dark:bg-transparent overflow-hidden flex flex-col pt-4 px-6 pb-6">
                        <Tabs defaultValue="financeiro" className="h-full flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <TabsList className="bg-slate-200/50 dark:bg-slate-900/50 p-1 rounded-xl">
                                    <TabsTrigger value="financeiro" className="rounded-lg px-6 font-bold text-xs uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-md">Financeiro</TabsTrigger>
                                    <TabsTrigger value="assinaturas" className="rounded-lg px-6 font-bold text-xs uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-md">Mensalidades</TabsTrigger>
                                    <TabsTrigger value="servicos" className="rounded-lg px-6 font-bold text-xs uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-md">Serviços</TabsTrigger>
                                </TabsList>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="h-9 rounded-lg border-primary/20 hover:bg-primary/5 text-primary">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-9 rounded-lg border-primary/20 hover:bg-primary/5 text-primary">
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <ScrollArea className="flex-1 -mx-2 px-2">
                                <TabsContent value="financeiro" className="mt-0 space-y-4 pr-1">
                                    {client?.transactions?.length > 0 ? (
                                        client.transactions.map((tx: any) => (
                                            <div key={tx.id} className="group flex items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-border/50 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                                                        tx.type === "receita" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                                                    )}>
                                                        {tx.type === "receita" ? <DollarSign className="h-6 w-6" /> : <CreditCard className="h-6 w-6" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{tx.description}</p>
                                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                                                            <span>Vence em {formatDate(tx.dueDate)}</span>
                                                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                                                            <span className="font-bold text-slate-500 uppercase">{tx.category}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right space-y-1">
                                                    <p className={cn(
                                                        "text-lg font-black",
                                                        tx.type === "receita" ? "text-emerald-500 font-mono" : "text-rose-500"
                                                    )}>
                                                        {tx.type === "receita" ? "+" : "-"} R$ {tx.amount.toFixed(2)}
                                                    </p>
                                                    <Badge variant={tx.status === "pago" ? "success" : "secondary"} className="text-[9px] uppercase font-black tracking-tighter rounded-full">
                                                        {tx.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center">
                                                <Receipt className="h-8 w-8 text-muted-foreground/40" />
                                            </div>
                                            <p className="text-sm text-muted-foreground font-medium">Nenhuma transação registrada para este cliente.</p>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="assinaturas" className="mt-0 space-y-4 pr-1">
                                    {client?.subscriptions?.length > 0 ? (
                                        client.subscriptions.map((sub: any) => (
                                            <div key={sub.id} className="p-5 bg-white rounded-2xl border border-border shadow-sm space-y-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                                                            <Clock className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-900">{sub.description}</h4>
                                                            <p className="text-xs text-muted-foreground">Ciclo: <span className="text-indigo-600 font-bold uppercase">{sub.interval}</span></p>
                                                        </div>
                                                    </div>
                                                    <Badge variant={sub.status === "active" ? "success" : "destructive"}>{sub.status}</Badge>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 py-2 border-y border-slate-50">
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Proximo Faturamento</p>
                                                        <p className="text-sm font-bold">{formatDate(sub.nextBillingDate)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Valor do Plano</p>
                                                        <p className="text-lg font-black text-indigo-600">R$ {sub.amount.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center">
                                                <CreditCard className="h-8 w-8 text-muted-foreground/40" />
                                            </div>
                                            <p className="text-sm text-muted-foreground font-medium">Este cliente não possui serviços recorrentes.</p>
                                            <Button variant="outline" size="sm" className="rounded-full px-8">Configurar Plano</Button>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="servicos" className="mt-0">
                                    {/* Lista de serviços simplificada */}
                                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center">
                                            <FileText className="h-8 w-8 text-muted-foreground/40" />
                                        </div>
                                        <p className="text-sm text-muted-foreground font-medium">Módulo de projetos em desenvolvimento.</p>
                                    </div>
                                </TabsContent>
                            </ScrollArea>
                        </Tabs>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
