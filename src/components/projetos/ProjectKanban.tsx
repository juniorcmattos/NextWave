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
import { Plus, MoreVertical, Calendar, User, LayoutGrid, ListTodo, Edit, Trash, Loader2, FolderKanban } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type Project = {
    id: string;
    name: string;
    description?: string;
    color?: string;
    status: string;
    dueDate?: string;
    _count?: { tasks: number };
};

const PROJECT_STATUSES = [
    { id: "em_andamento", title: "Em Andamento", color: "bg-blue-500" },
    { id: "pausado", title: "Pausado", color: "bg-amber-500" },
    { id: "concluido", title: "Concluído", color: "bg-green-500" },
    { id: "cancelado", title: "Cancelado", color: "bg-slate-500" },
];

function ProjectCard({ project, onEdit, onDelete }: { project: Project; onEdit?: () => void; onDelete?: () => void }) {
    return (
        <Card className="cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-primary/20 transition-all border-none shadow-sm shadow-black/5 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                        <Link href={`/projetos/${project.id}`} className="hover:underline">
                            <p className="font-bold text-sm leading-tight">{project.name}</p>
                        </Link>
                        {project.description && (
                            <p className="text-[10px] text-muted-foreground line-clamp-1">{project.description}</p>
                        )}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 bg-transparent hover:bg-muted">
                                <MoreVertical className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem asChild>
                                <Link href={`/projetos/${project.id}`} className="gap-2"><ListTodo className="h-4 w-4" /> Ver Tarefas</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={onEdit} className="gap-2"><Edit className="h-4 w-4" /> Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={onDelete} className="gap-2 text-destructive"><Trash className="h-4 w-4" /> Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{project.dueDate ? new Date(project.dueDate).toLocaleDateString("pt-BR") : "S/ Prazo"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-black text-primary">
                        <LayoutGrid className="h-3 w-3" />
                        <span>{project._count?.tasks || 0} Tarefas</span>
                    </div>
                </div>

                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: project.status === "concluido" ? "100%" : "30%", backgroundColor: project.color }} />
                </div>
            </CardContent>
        </Card>
    );
}

function SortableProject({ project, onEdit, onDelete }: { project: Project; onEdit?: () => void; onDelete?: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id });
    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 }}
            {...attributes}
            {...listeners}
        >
            <ProjectCard project={project} onEdit={onEdit} onDelete={onDelete} />
        </div>
    );
}

function DroppableStatus({ status, children, count }: { status: typeof PROJECT_STATUSES[0]; children: React.ReactNode; count: number }) {
    const { setNodeRef, isOver } = useDroppable({ id: status.id });
    return (
        <div className="flex-shrink-0 w-80 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${status.color}`} />
                    <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">{status.title}</h3>
                    <Badge variant="outline" className="rounded-full bg-muted/50 border-none">{count}</Badge>
                </div>
            </div>
            <div
                ref={setNodeRef}
                className={`flex flex-col gap-3 min-h-[500px] p-2 rounded-xl border-2 border-dashed transition-colors ${isOver ? "border-primary/40 bg-primary/5" : "border-transparent bg-muted/10 hover:border-muted/20"}`}
            >
                {children}
            </div>
        </div>
    );
}

export default function ProjectKanban() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeProject, setActiveProject] = useState<Project | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: "", description: "", color: "#3b82f6", dueDate: "", status: "em_andamento" });

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const fetchProjects = useCallback(async () => {
        try {
            const res = await fetch("/api/projetos");
            if (!res.ok) throw new Error();
            const data = await res.json();
            setProjects(data);
        } catch {
            toast.error("Erro ao carregar projetos");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProjects(); }, [fetchProjects]);

    const handleSave = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            const method = editingProject ? "PATCH" : "POST";
            const url = editingProject ? `/api/projetos/${editingProject.id}` : "/api/projetos";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error();
            toast.success(editingProject ? "Projeto atualizado!" : "Projeto criado!");
            setIsDialogOpen(false);
            fetchProjects();
        } catch {
            toast.error("Erro ao salvar projeto");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Excluir projeto e todas as suas tarefas?")) return;
        try {
            const res = await fetch(`/api/projetos/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            setProjects(prev => prev.filter(p => p.id !== id));
            toast.success("Projeto excluído!");
        } catch {
            toast.error("Erro ao excluir projeto");
        }
    };

    const openEdit = (project: Project) => {
        setEditingProject(project);
        setForm({
            name: project.name,
            description: project.description || "",
            color: project.color || "#3b82f6",
            dueDate: project.dueDate ? project.dueDate.split("T")[0] : "",
            status: project.status
        });
        setIsDialogOpen(true);
    };

    const onDragStart = ({ active }: DragStartEvent) => {
        setActiveProject(projects.find(p => p.id === active.id) || null);
    };

    const onDragEnd = async ({ active, over }: DragEndEvent) => {
        setActiveProject(null);
        if (!over) return;

        const activeId = String(active.id);
        const overId = String(over.id);

        const project = projects.find(p => p.id === activeId);
        if (!project) return;

        let newStatus = overId;
        if (!PROJECT_STATUSES.find(s => s.id === overId)) {
            const overProject = projects.find(p => p.id === overId);
            if (overProject) newStatus = overProject.status;
            else return;
        }

        if (project.status === newStatus) return;

        setProjects(prev => prev.map(p => p.id === activeId ? { ...p, status: newStatus } : p));

        try {
            const res = await fetch(`/api/projetos/${activeId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error();
        } catch {
            toast.error("Erro ao atualizar status");
            fetchProjects();
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <div className="h-full flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight theme-title">Kanban de Projetos</h1>
                        <p className="text-muted-foreground text-sm">Visualize o status de todos os seus projetos.</p>
                    </div>
                    <Button size="lg" className="gap-2" onClick={() => { setEditingProject(null); setForm({ name: "", description: "", color: "#3b82f6", dueDate: "", status: "em_andamento" }); setIsDialogOpen(true); }}>
                        <Plus className="h-5 w-5" /> Novo Projeto
                    </Button>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar">
                    {PROJECT_STATUSES.map((status) => {
                        const statusProjects = projects.filter(p => p.status === status.id);
                        return (
                            <DroppableStatus key={status.id} status={status} count={statusProjects.length}>
                                <SortableContext items={statusProjects.map(p => p.id)} strategy={verticalListSortingStrategy}>
                                    {statusProjects.map((project) => (
                                        <SortableProject
                                            key={project.id}
                                            project={project}
                                            onEdit={() => openEdit(project)}
                                            onDelete={() => handleDelete(project.id)}
                                        />
                                    ))}
                                </SortableContext>
                            </DroppableStatus>
                        );
                    })}
                </div>
            </div>

            <DragOverlay>{activeProject ? <ProjectCard project={activeProject} /> : null}</DragOverlay>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingProject ? "Editar Projeto" : "Novo Projeto"}</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="proj-name">Nome do Projeto</Label>
                            <Input id="proj-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="proj-desc">Descrição</Label>
                            <Textarea id="proj-desc" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="proj-date">Prazo</Label>
                                <Input id="proj-date" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="proj-color">Cor Identificadora</Label>
                                <Input id="proj-color" type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="h-10 p-1" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={saving || !form.name.trim()}>
                            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            {editingProject ? "Salvar" : "Criar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DndContext>
    );
}
