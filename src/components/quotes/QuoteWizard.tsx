"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash, ArrowLeft, ArrowRight, Save, Loader2, CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type Client = { id: string; name: string; email: string };

export default function QuoteWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [clients, setClients] = useState<Client[]>([]);
    const [loadingClients, setLoadingClients] = useState(true);
    const [saving, setSaving] = useState(false);
    const [createdQuoteId, setCreatedQuoteId] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: "",
        description: "",
        clientId: "",
        validUntil: "",
        items: [{ description: "", quantity: 1, price: 0 }],
    });

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await fetch("/api/clientes");
                if (res.ok) setClients(await res.json());
            } finally {
                setLoadingClients(false);
            }
        };
        fetchClients();
    }, []);

    const addItem = () => {
        setForm({ ...form, items: [...form.items, { description: "", quantity: 1, price: 0 }] });
    };

    const removeItem = (index: number) => {
        setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
    };

    const updateItem = (index: number, field: keyof typeof form.items[0], value: string | number) => {
        const newItems = [...form.items];
        (newItems[index] as any)[field] = value;
        setForm({ ...form, items: newItems });
    };

    const total = form.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/quotes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, value: total }),
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setCreatedQuoteId(data.id);
            toast.success("Orçamento criado com sucesso!");
            // Comment out push to let user copy link
            // router.push("/servicos"); 
        } catch {
            toast.error("Erro ao salvar orçamento");
        } finally {
            setSaving(false);
        }
    };

    const copyLink = (id: string) => {
        const url = `${window.location.origin}/public/orcamentos/${id}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copiado para a área de transferência!");
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Progress Header */}
            <div className="flex items-center justify-between mb-8">
                {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            {s}
                        </div>
                        <div className={`h-1 w-12 md:w-24 rounded ${step > s ? "bg-primary" : "bg-muted"}`} />
                    </div>
                ))}
            </div>

            <Card className="border-none shadow-xl shadow-black/5 bg-card/50 backdrop-blur-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-black">
                        {step === 1 && "Selecione o Cliente"}
                        {step === 2 && "Detalhes do Orçamento"}
                        {step === 3 && "Itens e Preços"}
                        {step === 4 && "Revisão Final"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {step === 1 && (
                        <div className="space-y-4">
                            <Label>Cliente</Label>
                            <Select value={form.clientId} onValueChange={(val) => setForm({ ...form, clientId: val })}>
                                <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Selecione um cliente..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {loadingClients && <p className="text-xs text-muted-foreground animate-pulse">Carregando clientes...</p>}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Título da Proposta</Label>
                                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex: Desenvolvimento Web" className="h-12" />
                            </div>
                            <div className="space-y-2">
                                <Label>Descrição Detalhada</Label>
                                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detalhe o escopo do serviço..." rows={4} />
                            </div>
                            <div className="space-y-2">
                                <Label>Válido até</Label>
                                <Input type="date" value={form.validUntil} onChange={e => setForm({ ...form, validUntil: e.target.value })} className="h-12" />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            {form.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end p-4 rounded-lg bg-muted/30 border border-border/50 relative group">
                                    <div className="md:col-span-3 space-y-2">
                                        <Label>Descrição do Item</Label>
                                        <Input value={item.description} onChange={e => updateItem(index, "description", e.target.value)} placeholder="Serviço ou produto" />
                                    </div>
                                    <div className="md:col-span-1 space-y-2">
                                        <Label>Qtd</Label>
                                        <Input type="number" value={item.quantity} onChange={e => updateItem(index, "quantity", e.target.value)} />
                                    </div>
                                    <div className="md:col-span-1 space-y-2">
                                        <Label>Preço Unit.</Label>
                                        <Input type="number" value={item.price} onChange={e => updateItem(index, "price", e.target.value)} />
                                    </div>
                                    <div className="md:col-span-1">
                                        <Button variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-destructive hover:bg-destructive/10">
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full dashed gap-2" onClick={addItem}>
                                <Plus className="h-4 w-4" /> Adicionar Item
                            </Button>
                            <div className="text-right pt-4">
                                <p className="text-sm text-muted-foreground uppercase font-black tracking-widest">Total Estimado</p>
                                <p className="text-4xl font-black text-primary">R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                    )}

                    {step === 4 && !createdQuoteId && (
                        <div className="space-y-6">
                            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                                <h4 className="font-black text-lg mb-2">{form.title}</h4>
                                <p className="text-sm text-muted-foreground mb-4">{form.description}</p>
                                <div className="space-y-2">
                                    <p className="text-xs font-bold uppercase text-muted-foreground">Cliente</p>
                                    <p className="font-semibold">{clients.find(c => c.id === form.clientId)?.name}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-bold uppercase text-muted-foreground">Resumo de Itens</p>
                                {form.items.map((it, i) => (
                                    <div key={i} className="flex justify-between text-sm py-2 border-b last:border-0">
                                        <span>{it.description} (x{it.quantity})</span>
                                        <span className="font-mono">R$ {(Number(it.quantity) * Number(it.price)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between text-xl font-black pt-4">
                                    <span>TOTAL</span>
                                    <span className="text-primary">R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {createdQuoteId && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-3xl text-center space-y-6">
                            <div className="h-20 w-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-white shadow-xl shadow-emerald-500/20">
                                <CheckCircle2 className="h-12 w-12" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Orçamento Gerado!</h3>
                                <p className="text-muted-foreground font-medium">O orçamento está pronto para ser enviado ao cliente.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button className="flex-1 h-12 gap-2 font-bold" onClick={() => copyLink(createdQuoteId)}>
                                    <Copy className="h-4 w-4" /> Copiar Link de Aprovação
                                </Button>
                                <Button variant="outline" className="flex-1 h-12 gap-2 font-bold" onClick={() => window.open(`/public/orcamentos/${createdQuoteId}`, "_blank")}>
                                    <ExternalLink className="h-4 w-4" /> Visualizar
                                </Button>
                            </div>
                            <Button variant="ghost" className="w-full text-xs font-bold uppercase tracking-widest text-muted-foreground" onClick={() => {
                                setCreatedQuoteId(null);
                                setStep(1);
                                setForm({
                                    title: "",
                                    description: "",
                                    clientId: "",
                                    validUntil: "",
                                    items: [{ description: "", quantity: 1, price: 0 }],
                                });
                            }}>
                                Criar Outro Orçamento
                            </Button>
                        </div>
                    )}
                </CardContent>

                {!createdQuoteId && (
                    <div className="p-6 border-t border-border/50 flex items-center justify-between">
                        <Button variant="ghost" className="gap-2" onClick={prevStep} disabled={step === 1}>
                            <ArrowLeft className="h-4 w-4" /> Voltar
                        </Button>
                        {step < 4 ? (
                            <Button className="gap-2 px-8" onClick={nextStep} disabled={step === 1 && !form.clientId}>
                                Próximo <ArrowRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button className="gap-2 px-8 bg-primary hover:bg-primary/90" onClick={handleSave} disabled={saving}>
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4" />}
                                Gerar Orçamento
                            </Button>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
}
