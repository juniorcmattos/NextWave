import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const serviceSchema = z.object({
  title: z.string().min(2, "Título obrigatório"),
  description: z.string().optional(),
  amount: z.number().positive("Valor deve ser positivo"),
  status: z.enum(["rascunho", "enviado", "aprovado", "em_andamento", "concluido", "cancelado"]).default("rascunho"),
  category: z.string().optional(),
  clientId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "";
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const skip = (page - 1) * limit;

    const where = {
      userId: session.user.id,
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { category: { contains: search } },
        ],
      }),
      ...(status && { status }),
    };

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: { client: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.service.count({ where }),
    ]);

    return NextResponse.json({ services, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("[SERVICOS_GET]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    const data = serviceSchema.parse(body);

    const service = await prisma.service.create({
      data: {
        ...data,
        userId: session.user.id,
        clientId: data.clientId || undefined,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    console.error("[SERVICOS_POST]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
