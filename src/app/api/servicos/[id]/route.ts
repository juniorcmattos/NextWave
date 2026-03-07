import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  amount: z.number().positive().optional(),
  status: z.enum(["rascunho", "enviado", "aprovado", "em_andamento", "concluido", "cancelado"]).optional(),
  category: z.string().optional(),
  clientId: z.string().optional().nullable(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    const data = updateSchema.parse(body);

    const result = await prisma.service.updateMany({
      where: { id: params.id, userId: session.user.id },
      data: {
        ...data,
        clientId: data.clientId === null ? null : data.clientId,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });

    if (!result.count) return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    console.error("[SERVICO_PUT]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    await prisma.service.deleteMany({ where: { id: params.id, userId: session.user.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SERVICO_DELETE]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
