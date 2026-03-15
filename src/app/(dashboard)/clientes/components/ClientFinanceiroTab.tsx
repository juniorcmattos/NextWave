import { Plus, DollarSign, CreditCard, TrendingUp, TrendingDown, Receipt, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";

interface ClientFinanceiroTabProps {
  transactions: any[];
  totalReceita: number;
  totalDespesa: number;
  totalPendente: number;
  openCreateTx: (type: "receita" | "despesa") => void;
  openEditTx: (tx: any) => void;
  setDeleteTxId: (id: string) => void;
  formatCurrency: (value: number) => string;
}

export function ClientFinanceiroTab({
  transactions,
  totalReceita,
  totalDespesa,
  totalPendente,
  openCreateTx,
  openEditTx,
  setDeleteTxId,
  formatCurrency
}: ClientFinanceiroTabProps) {
  return (
    <div className="space-y-6">
      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30">
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1">Total Receita</p>
          <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">{formatCurrency(totalReceita)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30">
          <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider mb-1">Total Despesa</p>
          <p className="text-xl font-black text-rose-700 dark:text-rose-300">{formatCurrency(totalDespesa)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30">
          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider mb-1">Pendente</p>
          <p className="text-xl font-black text-amber-700 dark:text-amber-300">{formatCurrency(totalPendente)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30">
          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">Saldo Atual</p>
          <p className={cn("text-xl font-black", totalReceita - totalDespesa >= 0 ? "text-blue-700 dark:text-blue-300" : "text-rose-700 dark:text-rose-300")}>
            {formatCurrency(totalReceita - totalDespesa)}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-border/50">
        <h3 className="font-bold text-slate-800 dark:text-slate-200">Histórico de Transações</h3>
        <div className="flex gap-2">
          <p className="text-[10px] text-muted-foreground uppercase font-medium">Gestão automatizada via Serviços</p>
        </div>
      </div>

      <div className="space-y-3">
        {transactions.length > 0 ? (
          transactions.map((tx: any) => (
            <div key={tx.id} className="group flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-border/50 hover:border-indigo-500/30 transition-all">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center",
                  tx.type === "receita" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                )}>
                  {tx.type === "receita" ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{tx.description}</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">{tx.category} • {tx.dueDate ? formatDate(tx.dueDate) : "S/ data"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={cn("text-base font-black", tx.type === "receita" ? "text-emerald-500" : "text-rose-500")}>
                    {tx.type === "receita" ? "+" : "-"} {formatCurrency(tx.amount)}
                  </p>
                  <Badge variant={tx.status === "pago" ? "success" : "secondary"} className="text-[8px] h-4 uppercase">
                    {tx.status}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditTx(tx)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTxId(tx.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-3xl opacity-60">
            <Receipt className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">Nenhuma transação registrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}
