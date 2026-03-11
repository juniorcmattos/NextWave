"use client";

import { useState } from "react";
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
import { Plus, MoreVertical, Calendar, Clock } from "lucide-react";

type Task = {
    id: string;
    title: string;
    priority: "alta" | "media" | "baixa";
    date: string;
};

type Column = {
    id: string;
    title: string;
    tasks: Task[];
};

const INITIAL_DATA: Column[] = [
    {
        id: "col-1", title: "A Fazer", tasks: [
            { id: "task-1", title: "Implementar 2FA", priority: "alta", date: "Hoje" },
            { id: "task-2", title: "Revisar Checkout Pix", priority: "media", date: "Amanhã" },
        ],
    },
    {
        id: "col-2", title: "Em Progresso", tasks: [
            { id: "task-3", title: "Design do Tema Professional", priority: "alta", date: "Em andamento" },
        ],
    },
    {
        id: "col-3", title: "Concluído", tasks: [
            { id: "task-4", title: "Setup Inicial Git", priority: "baixa", date: "Finalizado" },
        ],
    },
];

function TaskCard({ task }: { task: Task }) {
    return (
        <Card className="cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-primary/20 transition-all border-none shadow-sm shadow-black/5">
            <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-sm leading-tight">{task.title}</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="h-3 w-3" />
                    </Button>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{task.date}</span>
                    </div>
                    <Badge
                        variant={task.priority === "alta" ? "destructive" : task.priority === "media" ? "warning" : "secondary"}
                        className="text-[9px] px-1.5 py-0 uppercase font-black"
                    >
                        {task.priority}
                    </Badge>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex -space-x-2">
                        <div className="h-6 w-6 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center text-[10px] font-bold">
                            US
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                        <Clock className="h-3 w-3" /> 2h
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function SortableCard({ task }: { task: Task }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.3 : 1,
            }}
            {...attributes}
            {...listeners}
        >
            <TaskCard task={task} />
        </div>
    );
}

function DroppableColumn({ column, children }: { column: Column; children: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({ id: column.id });
    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col gap-3 min-h-[500px] p-2 rounded-xl border-2 border-dashed transition-colors ${
                isOver ? "border-primary/40 bg-primary/5" : "border-transparent bg-muted/20 hover:border-border"
            }`}
        >
            {children}
        </div>
    );
}

export default function KanbanBoard() {
    const [columns, setColumns] = useState<Column[]>(INITIAL_DATA);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    function findColumnByTaskId(taskId: string) {
        return columns.find((col) => col.tasks.some((t) => t.id === taskId));
    }

    function onDragStart({ active }: DragStartEvent) {
        const col = findColumnByTaskId(String(active.id));
        setActiveTask(col?.tasks.find((t) => t.id === active.id) ?? null);
    }

    function onDragEnd({ active, over }: DragEndEvent) {
        setActiveTask(null);
        if (!over) return;

        const activeId = String(active.id);
        const overId = String(over.id);
        if (activeId === overId) return;

        const sourceCol = findColumnByTaskId(activeId);
        // over pode ser uma tarefa ou uma coluna
        const destCol =
            findColumnByTaskId(overId) ?? columns.find((c) => c.id === overId);

        if (!sourceCol || !destCol) return;

        if (sourceCol.id === destCol.id) {
            // Reordenar dentro da mesma coluna
            const oldIndex = sourceCol.tasks.findIndex((t) => t.id === activeId);
            const newIndex = sourceCol.tasks.findIndex((t) => t.id === overId);
            if (oldIndex === -1 || newIndex === -1) return;
            setColumns((cols) =>
                cols.map((col) =>
                    col.id === sourceCol.id
                        ? { ...col, tasks: arrayMove(col.tasks, oldIndex, newIndex) }
                        : col
                )
            );
        } else {
            // Mover entre colunas
            const task = sourceCol.tasks.find((t) => t.id === activeId)!;
            const overIndex = destCol.tasks.findIndex((t) => t.id === overId);
            const insertAt = overIndex >= 0 ? overIndex : destCol.tasks.length;

            setColumns((cols) =>
                cols.map((col) => {
                    if (col.id === sourceCol.id)
                        return { ...col, tasks: col.tasks.filter((t) => t.id !== activeId) };
                    if (col.id === destCol.id) {
                        const updated = [...col.tasks];
                        updated.splice(insertAt, 0, task);
                        return { ...col, tasks: updated };
                    }
                    return col;
                })
            );
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            <div className="h-full flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight theme-title">Projetos & Tarefas</h1>
                        <p className="text-muted-foreground text-sm">Gerencie seu fluxo de trabalho visualmente.</p>
                    </div>
                    <Button size="lg" className="gap-2">
                        <Plus className="h-5 w-5" /> Novo Quadro
                    </Button>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-6">
                    {columns.map((column) => (
                        <div key={column.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                                        {column.title}
                                    </h3>
                                    <Badge variant="outline" className="rounded-full">
                                        {column.tasks.length}
                                    </Badge>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            <SortableContext
                                items={column.tasks.map((t) => t.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <DroppableColumn column={column}>
                                    {column.tasks.map((task) => (
                                        <SortableCard key={task.id} task={task} />
                                    ))}
                                    <Button
                                        variant="ghost"
                                        className="w-full text-muted-foreground text-xs hover:text-primary border-none"
                                    >
                                        + Adicionar Tarefa
                                    </Button>
                                </DroppableColumn>
                            </SortableContext>
                        </div>
                    ))}
                </div>
            </div>

            <DragOverlay>
                {activeTask ? <TaskCard task={activeTask} /> : null}
            </DragOverlay>
        </DndContext>
    );
}
