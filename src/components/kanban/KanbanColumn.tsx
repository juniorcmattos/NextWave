"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, MoreVertical } from "lucide-react";
import { KanbanCard } from "./KanbanCard";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: any[];
  onAddTask?: (status: string) => void;
}

export function KanbanColumn({ id, title, tasks, onAddTask }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  const statusColors: Record<string, string> = {
    "A Fazer": "bg-slate-500/10 text-slate-600 border-slate-200",
    "Em Andamento": "bg-nw-blue/10 text-nw-blue border-nw-blue/20",
    "Em Revisão": "bg-nw-yellow/10 text-nw-yellow border-nw-yellow/20",
    "Concluído": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  };

  return (
    <div className="flex flex-col w-[320px] shrink-0 h-full">
      {/* Column Header */}
      <div className={cn(
        "flex items-center justify-between p-4 mb-4 rounded-2xl border backdrop-blur-md shadow-sm",
        statusColors[title] || "bg-white/50 text-foreground border-white/40"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn("h-2 w-2 rounded-full", 
            title === "A Fazer" && "bg-slate-400",
            title === "Em Andamento" && "bg-nw-blue",
            title === "Em Revisão" && "bg-nw-yellow",
            title === "Concluído" && "bg-emerald-500"
          )} />
          <h2 className="text-sm font-black uppercase tracking-widest leading-none">
            {title}
          </h2>
          <span className="bg-black/5 px-2 py-0.5 rounded-full text-[10px] font-bold">
            {tasks.length}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onAddTask?.(title)}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button className="p-1 hover:bg-black/5 rounded-lg transition-colors">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div
        ref={setNodeRef}
        className="flex-1 flex flex-col gap-4 p-2 rounded-3xl bg-black/5 border border-black/5 min-h-[500px] transition-colors overflow-y-auto scrollbar-hide"
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-30 border-2 border-dashed border-black/10 rounded-2xl">
            <p className="text-xs font-bold uppercase tracking-widest">Nenhuma tarefa</p>
          </div>
        )}
      </div>
    </div>
  );
}
