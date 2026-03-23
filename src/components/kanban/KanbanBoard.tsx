"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Task } from "@/types/kanban";

const COLUMNS = [
  { id: "A Fazer", title: "A Fazer" },
  { id: "Em Andamento", title: "Em Andamento" },
  { id: "Em Revisão", title: "Em Revisão" },
  { id: "Concluído", title: "Concluído" },
];

export function KanbanBoard() {
  const queryClient = useQueryClient();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>([]);

  const { data: serverTasks, isLoading } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await fetch("/api/tarefas");
      if (!res.ok) throw new Error("Erro ao carregar tarefas");
      return res.json();
    },
  });

  // Agrupamento memoizado para performance sênior
  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, Task[]> = {
      "A Fazer": [],
      "Em Andamento": [],
      "Em Revisão": [],
      "Concluído": [],
    };
    localTasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });
    return grouped;
  }, [localTasks]);

  // Sincronizar estado local quando os dados do servidor mudarem
  useEffect(() => {
    if (serverTasks) {
      setLocalTasks(serverTasks);
    }
  }, [serverTasks]);

  // Mutação com Rollback e Feedback Sênior
  const mutation = useMutation({
    mutationFn: async ({ id, status, order }: { id: string; status: string; order: number }) => {
      const res = await fetch(`/api/tarefas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, order }),
      });
      if (!res.ok) throw new Error("Falha ao salvar alteração");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: Error) => {
      // Reverter para o estado do servidor em caso de erro
      if (serverTasks) setLocalTasks(serverTasks);
      toast.error(error.message || "Erro na sincronização");
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const task = localTasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isOverATask = over.data.current?.type === "Task" || localTasks.some(t => t.id === overId);
    const isOverAColumn = COLUMNS.some((col) => col.id === overId);

    // Arrastando sobre outra tarefa
    if (isOverATask) {
      setLocalTasks((prev: Task[]) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        const overIndex = prev.findIndex((t) => t.id === overId);

        if (activeIndex === -1 || overIndex === -1) return prev;

        if (prev[activeIndex].status !== prev[overIndex].status) {
          const newTasks = [...prev];
          newTasks[activeIndex] = { ...newTasks[activeIndex], status: prev[overIndex].status };
          return arrayMove(newTasks, activeIndex, overIndex);
        }

        return arrayMove(prev, activeIndex, overIndex);
      });
    }

    // Arrastando sobre uma coluna vazia
    if (isOverAColumn) {
      setLocalTasks((prev: Task[]) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        if (activeIndex === -1) return prev;
        
        const newTasks = [...prev];
        newTasks[activeIndex] = { ...newTasks[activeIndex], status: overId as string };
        return arrayMove(newTasks, activeIndex, activeIndex);
      });
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const task = localTasks.find((t) => t.id === activeId);

    if (!task) return;

    // Disparar mutação (Sincronização em background)
    mutation.mutate({
      id: task.id,
      status: task.status,
      order: tasksByStatus[task.status].indexOf(task)
    });
  }

  if (isLoading && localTasks.length === 0) {
    return (
      <div className="flex gap-6 h-full overflow-x-auto pb-10 scrollbar-hide">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex flex-col w-80 shrink-0 gap-4">
            <div className="h-10 w-32 bg-slate-200 animate-pulse rounded-xl mb-2" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 w-full bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 h-full overflow-x-auto pb-10 scrollbar-hide">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={(tasksByStatus[col.id] || []) as Task[]}
            onAddTask={(status: string) => {
               // Implementar futuramente ou abrir modal
            }}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: "0.5",
            },
          },
        }),
      }}>
        {activeTask ? <KanbanCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
