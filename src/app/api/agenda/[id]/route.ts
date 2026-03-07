import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  allDay: z.boolean().optional(),
  type: z.enum(["reuniao", "call", "tarefa", "lembrete"]).optional(),
  status: z.enum(["agendado", "concluido", "cancelado"]).optional(),
  location: z.string().optional(),
  clientId: z.string().optional().nullable(),
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    const data = updateSchema.parse(body);

    const result = await prisma.event.updateMany({
      where: { id: params.id, userId: session.user.id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        clientId: data.clientId === null ? null : data.clientId,
      },
    });

    if (!result.count) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    console.error("[AGENDA_PUT]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    await prisma.event.deleteMany({ where: { id: params.id, userId: session.user.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[AGENDA_DELETE]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
