"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Zap, ShieldCheck, UserPlus, CheckCircle2, Loader2, ArrowRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const setupSchema = z.object({
    name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

type SetupForm = z.infer<typeof setupSchema>;

export default function SetupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        async function checkStatus() {
            try {
                const res = await fetch("/api/setup");
                const data = await res.json();
                if (data.isConfigured) {
                    router.push("/login");
                }
            } catch (error) {
                console.error("Erro ao verificar status", error);
            } finally {
                setIsChecking(false);
            }
        }
        checkStatus();
    }, [router]);

    const { register, handleSubmit, formState: { errors } } = useForm<SetupForm>({
        resolver: zodResolver(setupSchema),
    });

    const onSubmit = async (data: SetupForm) => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/setup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    password: data.password,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success("Administrador criado com sucesso!");
                setStep(3);
            } else {
                toast.error(result.error || "Erro ao configurar sistema");
            }
        } catch (error) {
            toast.error("Erro na comunicação com o servidor.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
            {/* Background patterns */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
            </div>

            <div className="flex-1 flex items-center justify-center p-4 relative z-10">
                <div className="w-full max-w-xl space-y-8 animate-in delay-150 duration-700 fade-in slide-in-from-bottom-4">

                    {/* Header */}
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-700 shadow-xl shadow-primary/20">
                            <Zap className="h-8 w-8 text-white" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                                Bem-vindo ao NextWave
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-lg">
                                Vamos configurar seu ambiente de trabalho em poucos minutos.
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-4 px-4 sm:px-12">
                        <div className="flex justify-between text-sm font-medium text-slate-500 dark:text-slate-400">
                            <span>Passo {step} de 3</span>
                            <span>{Math.round((step / 3) * 100)}% concluído</span>
                        </div>
                        <Progress value={(step / 3) * 100} className="h-2 rounded-full bg-slate-200 dark:bg-slate-800" />
                        <div className="flex justify-between gap-2 px-2">
                            <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'}`} />
                            <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'}`} />
                            <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'}`} />
                        </div>
                    </div>

                    {/* Wizard Card */}
                    <Card className="border-0 shadow-2xl shadow-slate-200 dark:shadow-slate-900/40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                                {step === 1 && <ShieldCheck className="h-6 w-6 text-primary" />}
                                {step === 2 && <UserPlus className="h-6 w-6 text-primary" />}
                                {step === 3 && <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
                            </div>
                            <CardTitle className="text-xl">
                                {step === 1 && "Verificação de Sistema"}
                                {step === 2 && "Configure sua conta Master"}
                                {step === 3 && "Tudo pronto!"}
                            </CardTitle>
                            <CardDescription>
                                {step === 1 && "O ambiente foi detectado e o servidor está pronto para inicializar."}
                                {step === 2 && "Esta conta terá acesso total a todas as funcionalidades do CRM."}
                                {step === 3 && "Seu NextWave CRM foi instalado com sucesso!"}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="pt-6 sm:px-10">
                            {step === 1 && (
                                <div className="space-y-6 animate-in fade-in duration-500">
                                    <div className="space-y-4">
                                        {[
                                            { label: "Banco de Dados (SQLite)", status: "Pronto" },
                                            { label: "Engine CRM", status: "Instalado" },
                                            { label: "Serviços de Autenticação", status: "Pronto" },
                                        ].map((item) => (
                                            <div key={item.label} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                                <span className="text-slate-600 dark:text-slate-400 font-medium">{item.label}</span>
                                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    {item.status}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button onClick={() => setStep(2)} className="w-full h-12 text-md transition-all hover:gap-3" size="lg">
                                        Começar Configuração <ArrowRight className="h-5 w-5" />
                                    </Button>
                                </div>
                            )}

                            {step === 2 && (
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-in fade-in duration-500">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Seu Nome Completo</Label>
                                        <Input id="name" placeholder="Ex: João Silva" {...register("name")} />
                                        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Administrativo</Label>
                                        <Input id="email" type="email" placeholder="email@dominio.com" {...register("email")} />
                                        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Criar Senha</Label>
                                            <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
                                            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                                            <Input id="confirmPassword" type="password" placeholder="••••••••" {...register("confirmPassword")} />
                                            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-12 w-14">
                                            <ChevronLeft className="h-5 w-5" />
                                        </Button>
                                        <Button type="submit" className="flex-1 h-12 text-md" disabled={isLoading}>
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                                    Finalizando...
                                                </>
                                            ) : (
                                                "Salvar e Continuar"
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {step === 3 && (
                                <div className="text-center space-y-8 animate-in zoom-in-95 duration-700">
                                    <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                                        <p className="text-slate-600 dark:text-slate-400">
                                            Você configurou seu acesso master. Agora você pode entrar no sistema, adicionar clientes e gerenciar sua equipe.
                                        </p>
                                    </div>
                                    <Button onClick={() => router.push("/login")} className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700" size="lg">
                                        Acessar Painel Agora
                                    </Button>
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="justify-center border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 py-4 rounded-b-xl">
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                                Deploy Seguro & Verificado
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            <div className="p-8 text-center relative z-10">
                <p className="text-sm text-slate-500">
                    © 2026 NextWave CRM • Sistema Instalado Localmente
                </p>
            </div>
        </div>
    );
}
