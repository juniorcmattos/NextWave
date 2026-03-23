"use client";

import { useState, useEffect, useCallback } from "react";
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    useDroppable,
    type DragStartEvent,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Mail, Phone, DollarSign, Edit, Trash, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

type Lead = {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    source?: string;
    value?: number;
    status: string;
    notes?: string;
    createdAt: string;
};

const STAGES = [
    { id: "novo", title: "Novo", color: "bg-[#3462EE]" },
    { id: "em_contato", title: "Em Contato", color: "bg-[#4A91A8]" },
    { id: "qualificado", title: "Qualificado", color: "bg-[#EFE347]" },
    { id: "proposta", title: "Proposta", color: "bg-[#121721]" },
    { id: "ganho", title: "Ganho", color: "bg-emerald-500" },
    { id: "perdido", title: "Perdido", color: "bg-rose-500" },
];

function LeadCard({ lead, onEdit, onDelete }: { lead: Lead; onEdit?: () => void; onDelete?: () => void }) {
    return (
        <Card className="premium-card glass cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-primary/20 transition-all border-none shadow-xl shadow-black/5 overflow-hidden group">
            <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                    <p className="font-black text-sm tracking-tight leading-tight group-hover:text-primary transition-colors">{lead.name}</p>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 bg-transparent hover:bg-primary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl glass border-white/20">
                            <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-1.5">Ações do Lead</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem onClick={onEdit} className="gap-2 rounded-xl focus:bg-primary/10 focus:text-primary cursor-pointer mt-1">
                                <Edit className="h-4 w-4" /> <span className="font-medium">Editar Detalhes</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onDelete} className="gap-2 rounded-xl text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer mt-1">
                                <Trash className="h-4 w-4" /> <span className="font-medium">Excluir</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="space-y-2">
                    {lead.email && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{lead.email}</span>
                        </div>
                    )}
                    {lead.phone && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                            <Phone className="h-3 w-3" />
                            <span>{lead.phone}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-1 text-sm font-black tracking-tighter text-primary">
                        <span>R$ {Number(lead.value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="text-[9px] font-black uppercase bg-primary/5 text-primary px-2 py-1 rounded-full border border-primary/10">
                        {lead.source || "Direto"}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function SortableLead({ lead, onEdit, onDelete }: { lead: Lead; onEdit?: () => void; onDelete?: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id });
    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 }}
            {...attributes}
            {...listeners}
        >
            <LeadCard lead={lead} onEdit={onEdit} onDelete={onDelete} />
        </div>
    );
}

function DroppableStage({ stage, children, count }: { stage: typeof STAGES[0]; children: React.ReactNode; count: number }) {
    const { setNodeRef, isOver } = useDroppable({ id: stage.id });
    return (
        <div className="flex-shrink-0 w-80 flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className={cn("h-3 w-3 rounded-full shadow-lg", stage.color)} />
                    <h3 className="font-black text-sm uppercase tracking-widest text-[#121721] dark:text-white opacity-80">{stage.title}</h3>
                </div>
                <div className="h-6 w-10 flex items-center justify-center font-black text-[10px] bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full shadow-sm">{count}</div>
            </div>
            <div
                ref={setNodeRef}
                className={cn(
                    "flex flex-col gap-4 min-h-[600px] p-3 rounded-[2rem] border-2 border-dashed transition-all duration-300",
                    isOver 
                        ? "border-primary/40 bg-primary/5 shadow-inner" 
                        : "border-transparent bg-[#121721]/5 dark:bg-white/5 hover:bg-[#121721]/10 dark:hover:bg-white/10"
                )}
            >
                {children}
            </div>
        </div>
    );
}

export default function LeadPipeline() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeLead, setActiveLead] = useState<Lead | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        source: "",
        value: "0",
        notes: "",
        status: "novo"
    });

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const fetchLeads = useCallback(async () => {
        try {
            const res = await fetch("/api/leads");
            if (!res.ok) throw new Error();
            const data = await res.json();
            setLeads(data);
        } catch {
            toast.error("Erro ao carregar leads");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchLeads(); }, [fetchLeads]);

    const handleSave = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            const method = editingLead ? "PATCH" : "POST";
            const url = editingLead ? `/api/leads/${editingLead.id}` : "/api/leads";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error();
            toast.success(editingLead ? "Lead atualizado!" : "Lead criado!");
            setIsDialogOpen(false);
            fetchLeads();
        } catch {
            toast.error("Erro ao salvar lead");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este lead?")) return;
        try {
            const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            setLeads(prev => prev.filter(l => l.id !== id));
            toast.success("Lead excluído!");
        } catch {
            toast.error("Erro ao excluir lead");
        }
    };

    const openEdit = (lead: Lead) => {
        setEditingLead(lead);
        setForm({
            name: lead.name,
            email: lead.email || "",
            phone: lead.phone || "",
            source: lead.source || "",
            value: lead.value?.toString() || "0",
            notes: lead.notes || "",
            status: lead.status
        });
        setIsDialogOpen(true);
    };

    const openNew = (status = "novo") => {
        setEditingLead(null);
        setForm({ name: "", email: "", phone: "", source: "", value: "0", notes: "", status });
        setIsDialogOpen(true);
    };

    // Drag & Drop
    const onDragStart = ({ active }: DragStartEvent) => {
        setActiveLead(leads.find(l => l.id === active.id) || null);
    };

    const onDragEnd = async ({ active, over }: DragEndEvent) => {
        setActiveLead(null);
        if (!over) return;

        const activeId = String(active.id);
        const overId = String(over.id);

        const lead = leads.find(l => l.id === activeId);
        if (!lead) return;

        // Find if dropped over a stage or another lead
        let newStatus = overId;
        if (!STAGES.find(s => s.id === overId)) {
            const overLead = leads.find(l => l.id === overId);
            if (overLead) newStatus = overLead.status;
            else return;
        }

        if (lead.status === newStatus) return;

        // Optimistic update
        setLeads(prev => prev.map(l => l.id === activeId ? { ...l, status: newStatus } : l));

        try {
            const res = await fetch(`/api/leads/${activeId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error();
        } catch {
            toast.error("Erro ao atualizar status");
            fetchLeads();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <div className="h-full flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight theme-title">Funil de Vendas</h1>
                        <p className="text-muted-foreground text-sm">Gerencie seus leads e oportunidades.</p>
                    </div>
                    <Button size="lg" className="gap-2" onClick={() => openNew()}>
                        <Plus className="h-5 w-5" /> Novo Lead
                    </Button>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar">
                    {STAGES.map((stage) => {
                        const stageLeads = leads.filter(l => l.status === stage.id);
                        return (
                            <DroppableStage key={stage.id} stage={stage} count={stageLeads.length}>
                                <SortableContext items={stageLeads.map(l => l.id)} strategy={verticalListSortingStrategy}>
                                    {stageLeads.map((lead) => (
                                        <SortableLead
                                            key={lead.id}
                                            lead={lead}
                                            onEdit={() => openEdit(lead)}
                                            onDelete={() => handleDelete(lead.id)}
                                        />
                                    ))}
                                </SortableContext>
                                <Button
                                    variant="ghost"
                                    className="w-full text-muted-foreground text-xs hover:text-primary border-none mt-auto"
                                    onClick={() => openNew(stage.id)}
                                >
                                    + Adicionar Lead
                                </Button>
                            </DroppableStage>
                        );
                    })}
                </div>
            </div>

            <DragOverlay>
                {activeLead ? <LeadCard lead={activeLead} /> : null}
            </DragOverlay>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingLead ? "Editar Lead" : "Novo Lead"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome / Empresa</Label>
                            <Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome do contato ou empresa" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input id="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telefone</Label>
                                <Input id="phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-9999" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="value">Valor Estimado</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="value" type="number" className="pl-9" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="source">Origem</Label>
                                <Input id="source" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} placeholder="Ex: Instagram, Indicação" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notas / Observações</Label>
                            <Textarea id="notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Detalhes da negociação..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={saving || !form.name.trim()}>
                            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            {editingLead ? "Salvar Alterações" : "Criar Lead"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DndContext>
    );
}
