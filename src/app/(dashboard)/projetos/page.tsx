"use client";

import { useState, useEffect } from "react";
import ProjectKanban from "@/components/projetos/ProjectKanban";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, MoreVertical, Calendar, User, FolderKanban, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";

function ProjectList() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/projetos")
            .then(res => res.json())
            .then(data => {
                setProjects(data);
                setLoading(false);
            })
            .catch(() => {
                toast.error("Erro ao carregar lista");
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-4 max-w-5xl mx-auto py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {projects.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
                    <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground font-bold">Nenhum projeto encontrado.</p>
                </div>
            ) : (
                projects.map((project) => (
                    <Card key={project.id} className="group hover:shadow-xl hover:shadow-primary/5 transition-all border-none bg-card/60 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between gap-6">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg" style={{ backgroundColor: project.color || "#3b82f6" }}>
                                        {project.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="space-y-1">
                                        <Link href={`/projetos/${project.id}`} className="font-extrabold text-lg hover:text-primary transition-colors">
                                            {project.name}
                                        </Link>
                                        <p className="text-sm text-muted-foreground line-clamp-1">{project.description || "Sem descrição"}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-8 text-sm">
                                    <div className="hidden md:flex flex-col items-center">
                                        <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Status</p>
                                        <Badge variant="outline" className="mt-1 capitalize rounded-full py-0 px-3 bg-muted/50 border-none font-bold">
                                            {project.status.replace("_", " ")}
                                        </Badge>
                                    </div>
                                    <div className="hidden sm:flex flex-col items-center">
                                        <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Prazo</p>
                                        <p className="font-bold mt-1 flex items-center gap-1.5">
                                            <Calendar className="h-3 w-3" />
                                            {project.dueDate ? new Date(project.dueDate).toLocaleDateString("pt-BR") : "N/A"}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/projetos/${project.id}`}>
                                            <MoreVertical className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
}

export default function ProjetosPage() {
    const [view, setView] = useState<"kanban" | "list">("kanban");

    return (
        <div className="p-6 h-[calc(100vh-64px)] overflow-hidden flex flex-col gap-6 bg-slate-50/50 dark:bg-slate-950/20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <FolderKanban className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Meus Projetos</h1>
                        <p className="text-xs text-muted-foreground font-medium">Gerencie e acompanhe sua produtividade.</p>
                    </div>
                </div>

                <div className="bg-muted p-1 rounded-xl flex gap-1 shadow-inner border border-black/5">
                    <Button 
                        variant={view === "kanban" ? "default" : "ghost"} 
                        size="sm" 
                        onClick={() => setView("kanban")}
                        className={`gap-2 rounded-lg font-bold px-4 ${view === "kanban" ? "shadow-md" : ""}`}
                    >
                        <LayoutGrid className="h-4 w-4" /> Kanban
                    </Button>
                    <Button 
                        variant={view === "list" ? "default" : "ghost"} 
                        size="sm" 
                        onClick={() => setView("list")}
                        className={`gap-2 rounded-lg font-bold px-4 ${view === "list" ? "shadow-md" : ""}`}
                    >
                        <List className="h-4 w-4" /> Lista
                    </Button>
                </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
                {view === "kanban" ? (
                    <ProjectKanban />
                ) : (
                    <div className="h-full overflow-auto custom-scrollbar">
                        <ProjectList />
                    </div>
                )}
            </div>
        </div>
    );
}
