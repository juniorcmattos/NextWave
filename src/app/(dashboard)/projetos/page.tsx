"use client";

import { useState, useEffect } from "react";
import ProjectKanban from "@/components/projetos/ProjectKanban";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, MoreVertical, Calendar, FolderKanban, Loader2 } from "lucide-react";
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
                projects.map((project: any) => (
                    <Card key={project.id} className="premium-card glass transition-all border-none overflow-hidden group hover:scale-[1.01]">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between gap-6">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg" style={{ backgroundColor: project.color || "#3b82f6" }}>
                                        {project.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="space-y-1">
                                        <Link href={`/projetos/${project.id}`} className="font-extrabold text-lg hover:text-primary transition-colors text-slate-900 dark:text-white">
                                            {project.name}
                                        </Link>
                                        <p className="text-sm text-slate-500 line-clamp-1">{project.description || "Sem descrição"}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-8 text-sm">
                                    <div className="hidden md:flex flex-col items-center">
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Status</p>
                                        <Badge variant="outline" className="mt-1 capitalize rounded-full py-0 px-3 bg-slate-100 dark:bg-slate-800 border-none font-bold text-slate-700 dark:text-slate-300">
                                            {project.status?.replace("_", " ")}
                                        </Badge>
                                    </div>
                                    <div className="hidden sm:flex flex-col items-center">
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Prazo</p>
                                        <p className="font-bold mt-1 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                            <Calendar className="h-3 w-3" />
                                            {project.dueDate ? new Date(project.dueDate).toLocaleDateString("pt-BR") : "N/A"}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
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
        <div className="p-8 h-[calc(100vh-64px)] overflow-hidden flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-primary/10 border border-slate-100 dark:border-slate-800">
                        <FolderKanban className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-[#121721] dark:text-white uppercase italic">Projetos</h1>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Creative Workspaces</p>
                    </div>
                </div>

                <div className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl flex gap-1 border border-slate-200 dark:border-slate-800">
                    <Button 
                        variant={view === "kanban" ? "default" : "ghost"} 
                        size="sm" 
                        onClick={() => setView("kanban")}
                        className={`gap-2 rounded-xl font-black uppercase tracking-widest text-[10px] px-6 h-10 transition-all ${view === "kanban" ? "shadow-lg bg-primary text-white" : "text-slate-500 hover:text-primary"}`}
                    >
                        <LayoutGrid className="h-4 w-4" /> Kanban
                    </Button>
                    <Button 
                        variant={view === "list" ? "default" : "ghost"} 
                        size="sm" 
                        onClick={() => setView("list")}
                        className={`gap-2 rounded-xl font-black uppercase tracking-widest text-[10px] px-6 h-10 transition-all ${view === "list" ? "shadow-lg bg-primary text-white" : "text-slate-500 hover:text-primary"}`}
                    >
                        <List className="h-4 w-4" /> Lista
                    </Button>
                </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
                {view === "kanban" ? (
                    <ProjectKanban />
                ) : (
                    <div className="h-full overflow-auto custom-scrollbar pr-2">
                        <ProjectList />
                    </div>
                )}
            </div>
        </div>
    );
}
