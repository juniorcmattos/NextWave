import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function PaymentSuccessPage({ searchParams }: { searchParams: { id: string } }) {
    if (!searchParams.id) return notFound();

    const transaction = await prisma.transaction.findUnique({
        where: { id: searchParams.id },
        include: { client: true }
    });

    if (!transaction) return notFound();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
            <Card className="max-w-md w-full border-none shadow-2xl shadow-emerald-500/10 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                <div className="h-32 bg-emerald-500 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 flex items-center justify-center rotate-12 scale-150">
                       <CheckCircle2 size={200} />
                    </div>
                    <div className="bg-white/20 backdrop-blur-md rounded-full p-4">
                        <CheckCircle2 className="h-12 w-12 text-white" />
                    </div>
                </div>
                <CardContent className="p-10 text-center space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Pagamento Confirmado!</h1>
                        <p className="text-slate-500 font-medium italic">Recebemos sua confirmação com sucesso.</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Cliente</span>
                            <span className="font-black text-slate-800 dark:text-slate-200">{transaction.client?.name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Valor</span>
                            <span className="font-mono font-black text-xl text-primary">R$ {Number(transaction.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Status</span>
                            <div className="flex items-center gap-1 text-emerald-500 font-black uppercase text-[10px]">
                                <ShieldCheck className="h-3 w-3" />
                                {transaction.status}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-slate-500 font-medium leading-relaxed px-4">
                            Obrigado por escolher nossa empresa. Seus serviços já estão sendo processados por nossa equipe.
                        </p>
                        <Button className="w-full h-14 rounded-2xl font-black gap-2 text-lg shadow-xl shadow-primary/20" asChild>
                            <Link href="/">
                                ACESSAR MEU PAINEL <ArrowRight className="h-5 w-5" />
                            </Link>
                        </Button>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        <ShoppingBag className="h-3 w-3" /> Transação Segura por NextWave CRM
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
