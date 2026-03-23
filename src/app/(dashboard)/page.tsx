import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { DollarSign, Users, Briefcase, TrendingUp, Clock, XCircle, LayoutGrid } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { GrowthChart } from "@/components/dashboard/GrowthChart";
import { TopClients } from "@/components/dashboard/TopClients";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { Badge } from "@/components/ui/badge";
import { FinanceWidget, WhatsAppWidget, BackupWidget, TasksWidget } from "@/components/dashboard/DashboardWidgets";

async function getDashboardData(userId: string) {
  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const inicioMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
  const fimMesAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0);

  const results = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: "receita", status: "pago", paidAt: { gte: inicioMes } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "receita", status: "pago", paidAt: { gte: inicioMesAnterior, lte: fimMesAnterior } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "receita", status: "pendente" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, status: "cancelado", createdAt: { gte: inicioMes } },
      _sum: { amount: true },
    }),
    prisma.client.count({ where: { userId } }),
    prisma.client.count({ where: { userId, createdAt: { lte: fimMesAnterior } } }),
    prisma.service.count({ where: { userId, status: { in: ["em_andamento", "aprovado"] } } }),
    prisma.transaction.findMany({
      where: { userId },
      include: { client: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.$queryRawUnsafe('SELECT * FROM "SystemModule"') as Promise<any[]>,
    prisma.client.findMany({
      where: { userId },
      include: {
        transactions: { where: { type: "receita", status: "pago" } },
        services: true,
      },
    }),
    prisma.whatsAppMessage.count(),
    prisma.whatsAppChannel.count({ where: { status: "connected" } }),
  ]);

  const receitaMesAtual = results[0] as any;
  const receitaMesAnterior = results[1] as any;
  const pendente = results[2] as any;
  const cancelado = results[3] as any;
  const totalClientes = results[4] as number;
  const clientesMesAnterior = results[5] as number;
  const totalServicos = results[6] as number;
  const ultimasTransacoes = results[7] as any;
  const modulesStatus = results[8] as any[];
  const topClientesRaw = results[9] as any[];
  const totalWhatsAppMessages = results[10] as number;
  const activeWhatsAppInstances = results[11] as number;

  // Gráfico dos últimos 12 meses
  const chartData = await Promise.all(
    Array.from({ length: 12 }, (_, i) => 12 - 1 - i).map(async (i) => {
      const dataInicio = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      const dataFim = new Date(agora.getFullYear(), agora.getMonth() - i + 1, 0);
      const [r, d] = await Promise.all([
        prisma.transaction.aggregate({
          where: { userId, type: "receita", paidAt: { gte: dataInicio, lte: dataFim } },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { userId, type: "despesa", paidAt: { gte: dataInicio, lte: dataFim } },
          _sum: { amount: true },
        }),
      ]);
      return {
        mes: dataInicio.toLocaleDateString("pt-BR", { month: "short" })
          .replace(".", "")
          .replace(/^\w/, (c) => c.toUpperCase()),
        receita: r._sum.amount ?? 0,
        despesa: d._sum.amount ?? 0,
      };
    })
  );

  const receitaAtual = receitaMesAtual._sum.amount ?? 0;
  const receitaAnterior = receitaMesAnterior._sum.amount ?? 0;
  const variacaoReceita = receitaAnterior > 0
    ? ((receitaAtual - receitaAnterior) / receitaAnterior) * 100
    : 0;
  const variacaoClientes = clientesMesAnterior > 0
    ? ((totalClientes - clientesMesAnterior) / clientesMesAnterior) * 100
    : 0;

  const topClientes = topClientesRaw
    .map((c: any) => ({
      id: c.id,
      name: c.name,
      totalReceita: c.transactions.reduce((sum: number, t: any) => sum + t.amount, 0),
      totalServicos: c.services.length,
    }))
    .sort((a: any, b: any) => b.totalReceita - a.totalReceita)
    .slice(0, 5);

  return {
    stats: {
      totalReceita: receitaAtual,
      totalPendente: pendente._sum.amount ?? 0,
      totalCancelado: cancelado._sum.amount ?? 0,
      totalClientes,
      totalServicos,
      variacaoReceita,
      variacaoClientes,
    },
    chartData,
    topClientes,
    ultimasTransacoes,
    activeModules: modulesStatus.filter((m: any) => m.enabled).map((m: any) => m.key),
    whatsAppStats: {
      totalMessages: totalWhatsAppMessages,
      activeInstances: activeWhatsAppInstances,
    }
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { stats, chartData, topClientes, ultimasTransacoes, activeModules, whatsAppStats } = await getDashboardData(session.user.id);

  const saudacao = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Bom dia";
    if (hora < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className="relative min-h-screen p-4 md:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 neo-blur">
      {/* Top Section: "Customer Information" Reference Aesthetic */}
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <LayoutGrid className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-[#121721] dark:text-white">
              Painel <span className="text-primary">Geral</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-sm font-medium mt-2">
            {saudacao()}, Bem-vindo ao seu centro de comando operacional.
          </p>
        </div>

        {/* Header Stats Group (similar to search area in prints) */}
        <div className="flex flex-wrap gap-4 items-center">
            <div className="glass px-6 py-3 rounded-3xl flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <DollarSign className="h-4 w-4" />
                </div>
                <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Volume Total</p>
                    <p className="text-lg font-black tracking-tighter">R$ {stats.totalReceita.toLocaleString()}</p>
                </div>
                <div className="ml-4 text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">+11% week</div>
            </div>
            <div className="glass px-6 py-3 rounded-3xl flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                    <Users className="h-4 w-4" />
                </div>
                <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Novos Leads</p>
                    <p className="text-lg font-black tracking-tighter">+{stats.totalClientes}</p>
                </div>
                <div className="ml-4 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">+12 today</div>
            </div>
        </div>
      </div>

      {/* Main Grid: Modular Widgets */}
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {activeModules.includes("financeiro") && <FinanceWidget stats={stats} />}
        {activeModules.includes("whatsapp") && <WhatsAppWidget data={whatsAppStats} />}
        <BackupWidget data={{ lastBackup: "3h atrás" }} />
        <TasksWidget data={{ pendingTasks: 4 }} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Interaction History Style for Charts */}
        <div className="lg:col-span-2 premium-card glass p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black tracking-tighter">Desempenho Comercial</h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase mt-1">Histórico de interações e conversão</p>
                </div>
                <Badge variant="outline" className="rounded-full px-4 py-1 border-primary/20 text-primary bg-primary/5">Mensal</Badge>
            </div>
            <GrowthChart data={chartData} />
        </div>

        {/* Top Clients - Side Profile Card Style */}
        <div className="space-y-8">
            <TopClients clients={topClientes} />
            
            {/* Quick Profile Mockup (as seen in prints) */}
            <div className="premium-card glass p-8 flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-primary to-accent p-1 shadow-xl">
                    <div className="h-full w-full rounded-[1.8rem] bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                        <Users className="h-10 w-10 text-primary opacity-20" />
                    </div>
                </div>
                <h4 className="mt-6 text-xl font-black tracking-tighter">Nova Oportunidade</h4>
                <p className="text-xs text-muted-foreground font-medium uppercase mt-1">Lead Qualificado</p>
                <div className="grid grid-cols-4 gap-2 mt-8 w-full">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="h-10 rounded-2xl bg-muted/30 flex items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      <div className="premium-card glass p-8">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black tracking-tighter">Transações Recentes</h3>
            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Tempo real</span>
        </div>
        <RecentTransactions transactions={ultimasTransacoes as any} />
      </div>
    </div>
  );
}
