import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, getStatusLabel } from "@/lib/utils";
import { Transaction } from "@/types";
import { cn } from "@/lib/utils";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

function getStatusVariant(status: string): "success" | "warning" | "destructive" | "secondary" {
  if (status === "pago") return "success";
  if (status === "pendente") return "warning";
  if (status === "cancelado") return "destructive";
  return "secondary";
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card className="premium-card glass border-none overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-6 pt-8 px-8">
        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Últimas Transações</CardTitle>
        <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-xl px-4" asChild>
          <Link href="/financeiro">Ver todas</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8 px-6">
            Nenhuma transação encontrada
          </p>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 px-8 py-4 hover:bg-primary/[0.02] transition-colors group">
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-black shadow-sm group-hover:scale-110 transition-transform",
                  tx.type === "receita"
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                )}>
                  {tx.type === "receita" ? "+" : "-"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black tracking-tight text-[#121721] dark:text-white truncate">{tx.description}</p>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground opacity-60">
                    {tx.client?.name ?? tx.category} <span className="mx-2 opacity-30">•</span> {formatDate(tx.createdAt)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={cn(
                    "text-sm font-black tracking-tight",
                    tx.type === "receita" ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {tx.type === "receita" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </p>
                  <Badge variant={getStatusVariant(tx.status)} className="text-[8px] font-black uppercase h-4 mt-1 px-1.5 rounded-full border-none">
                    {getStatusLabel(tx.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
