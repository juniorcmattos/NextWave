"use client";

import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Calendar, GripVertical, MessageSquare, 
  MoreHorizontal, User as UserIcon, Briefcase 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";

import { Task } from "@/types/kanban";

interface KanbanCardProps {
  task: Task;
}

function KanbanCardComponent({ task }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = {
    baixa: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    media: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    alta: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative bg-white/70 backdrop-blur-md border border-white/40 p-4 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 animate-in fade-in zoom-in-95",
        isDragging && "z-50 shadow-2xl border-primary/50"
      )}
    >
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-4 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 hover:bg-black/5 rounded-md"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="pl-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge 
            variant="outline" 
            className={cn("text-[10px] uppercase font-bold px-2 py-0", priorityColors[task.priority as keyof typeof priorityColors])}
          >
            {task.priority}
          </Badge>
          <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        <h3 className="text-sm font-bold text-[#121721] mb-1 line-clamp-2 leading-snug">
          {task.title}
        </h3>
        
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed italic">
            {task.description}
          </p>
        )}

        {/* Links (Client/Project) */}
        {(task.client || task.project) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {task.client && (
              <div className="flex items-center gap-1.5 bg-nw-blue/5 text-nw-blue px-2 py-1 rounded-lg border border-nw-blue/10">
                <UserIcon className="h-3 w-3" />
                <span className="text-[10px] font-bold truncate max-w-[80px]">{task.client.name}</span>
              </div>
            )}
            {task.project && (
              <div className="flex items-center gap-1.5 bg-nw-teal/5 text-nw-teal px-2 py-1 rounded-lg border border-nw-teal/10">
                <Briefcase className="h-3 w-3" />
                <span className="text-[10px] font-bold truncate max-w-[80px]">{task.project.name}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-black/5 mt-auto">
          <div className="flex items-center gap-2 text-muted-foreground">
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className="text-[10px] font-medium">
                  {format(new Date(task.dueDate), "dd MMM", { locale: ptBR })}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex -space-x-2">
            {task.assignee ? (
              <Avatar className="h-6 w-6 border-2 border-white ring-2 ring-primary/10">
                <AvatarImage src={task.assignee.avatar || task.assignee.image} />
                <AvatarFallback className="text-[8px] font-black uppercase">
                  {getInitials(task.assignee.name)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-6 w-6 rounded-full border-2 border-white bg-muted flex items-center justify-center">
                <UserIcon className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const KanbanCard = memo(KanbanCardComponent);
