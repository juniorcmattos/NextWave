import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { DollarSign, Users, Briefcase, TrendingUp, Clock, XCircle } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { GrowthChart } from "@/components/dashboard/GrowthChart";
import { TopClients } from "@/components/dashboard/TopClients";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";

async function getDashboardData(userId: string) {
  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const inicioMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
  const fimMesAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0);

  const [
    receitaMesAtual,
    receitaMesAnterior,
    pendente,
    cancelado,
    totalClientes,
    clientesMesAnterior,
    totalServicos,
    ultimasTransacoes,
    topClientesRaw,
  ] = await Promise.all([
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
    prisma.client.findMany({
      where: { userId },
      include: {
        transactions: { where: { type: "receita", status: "pago" } },
        services: true,
      },
    }),
  ]);

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
    .map((c) => ({
      id: c.id,
      name: c.name,
      totalReceita: c.transactions.reduce((sum, t) => sum + t.amount, 0),
      totalServicos: c.services.length,
    }))
    .sort((a, b) => b.totalReceita - a.totalReceita)
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
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { stats, chartData, topClientes, ultimasTransacoes } = await getDashboardData(session.user.id);

  const saudacao = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Bom dia";
    if (hora < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header da página */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {saudacao()}, {session.user.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Aqui está um resumo do seu negócio hoje.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
          <KPICard
            title="Receita do Mês"
            value={stats.totalReceita}
            icon={DollarSign}
            isCurrency
            change={stats.variacaoReceita}
            iconColor="text-blue-600"
            iconBg="bg-blue-100 dark:bg-blue-900/30"
          />
        </div>
        <div className="sm:col-span-1 xl:col-span-2">
          <KPICard
            title="A Receber"
            value={stats.totalPendente}
            icon={Clock}
            isCurrency
            iconColor="text-amber-600"
            iconBg="bg-amber-100 dark:bg-amber-900/30"
          />
        </div>
        <div className="sm:col-span-1 xl:col-span-2">
          <KPICard
            title="Cancelados"
            value={stats.totalCancelado}
            icon={XCircle}
            isCurrency
            iconColor="text-red-600"
            iconBg="bg-red-100 dark:bg-red-900/30"
          />
        </div>
        <div className="sm:col-span-1 xl:col-span-2">
          <KPICard
            title="Total de Clientes"
            value={stats.totalClientes}
            icon={Users}
            change={stats.variacaoClientes}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          />
        </div>
        <div className="sm:col-span-1 xl:col-span-2">
          <KPICard
            title="Serviços Ativos"
            value={stats.totalServicos}
            icon={Briefcase}
            iconColor="text-purple-600"
            iconBg="bg-purple-100 dark:bg-purple-900/30"
          />
        </div>
      </div>

      {/* Gráfico de Crescimento */}
      <GrowthChart data={chartData} />

      {/* Top Clientes + Últimas Transações */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopClients clients={topClientes} />
        <RecentTransactions transactions={ultimasTransacoes as Parameters<typeof RecentTransactions>[0]["transactions"]} />
      </div>
    </div>
  );
}
