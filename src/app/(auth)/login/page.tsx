"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Zap, Eye, EyeOff, Loader2, ShieldCheck, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"credentials" | "totp">("credentials");
  const [totpCode, setTotpCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState<LoginForm | null>(null);

  useEffect(() => {
    async function checkSetup() {
      try {
        const res = await fetch("/api/setup");
        const data = await res.json();
        if (data?.isConfigured === false) router.push("/setup");
      } catch { /* ignora */ }
    }
    checkSetup();
  }, [router]);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmitCredentials = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const preLogin = await fetch("/api/auth/pre-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      const preLoginData = await preLogin.json();

      if (!preLogin.ok) {
        toast.error(preLoginData.error || "Email ou senha incorretos");
        return;
      }

      if (preLoginData.requires2FA) {
        setSavedCredentials(data);
        setStep("totp");
        toast.info("Autenticação de dois fatores necessária");
        return;
      }

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!result?.error) {
        toast.success("Login realizado com sucesso!");
        router.push("/");
        router.refresh();
      } else {
        toast.error("Erro ao autenticar. Tente novamente.");
      }
    } catch (e: any) {
      console.error("Login exception:", e);
      toast.error("Erro ao realizar login.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitTotp = async () => {
    if (!savedCredentials) return;
    setIsLoading(true);
    try {
      const verifyRes = await fetch("/api/auth/2fa/login-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: savedCredentials.email, token: totpCode }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        toast.error(verifyData.error || "Código inválido");
        setIsLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: savedCredentials.email,
        password: savedCredentials.password,
        twoFactorCode: totpCode,
        redirect: false,
      });

      if (!result?.error) {
        if (trustDevice) {
          await fetch("/api/auth/trusted-device", { method: "POST" });
        }
        toast.success("Acesso concedido!");
        router.push("/");
        router.refresh();
      } else {
        toast.error("Falha na autenticação final.");
      }
    } catch (error) {
      console.error("TOTP Verification Error:", error);
      toast.error("Erro na verificação.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">

      {/* Painel esquerdo — decorativo */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 60%, #0F172A 100%)" }}
      >
        {/* Orb de luz */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(59,130,246,0.18) 0%, transparent 70%)",
          }}
        />

        {/* Ícone */}
        <div className="relative mb-6">
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-60"
            style={{ background: "rgba(59,130,246,0.4)", transform: "scale(1.4)" }}
          />
          <Zap className="relative h-24 w-24 text-blue-400 drop-shadow-lg" />
        </div>

        <h1 className="text-4xl font-bold text-white tracking-tight">NextWave CRM</h1>
        <p className="text-blue-200/70 mt-3 text-center text-lg">Gestão inteligente e segura para seu negócio.</p>

        {/* Bullets */}
        <ul className="mt-10 space-y-4">
          {["Gestão de clientes", "Controle financeiro", "Relatórios em tempo real"].map((item) => (
            <li key={item} className="flex items-center gap-3 text-slate-300/80 text-sm">
              <CheckCircle className="h-4 w-4 text-blue-400 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-slate-950">
        <div className="w-full max-w-md">

          {step === "credentials" ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8">
              <p className="text-xs text-slate-500 mb-6 text-center uppercase tracking-widest">NextWave CRM</p>
              <h2 className="text-2xl font-bold text-white mb-1">Acesso ao Sistema</h2>
              <p className="text-slate-400 text-sm mb-8">Insira suas credenciais para continuar</p>

              <form onSubmit={handleSubmit(onSubmitCredentials)} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm">Email</Label>
                  <Input
                    {...register("email")}
                    placeholder="seu@email.com"
                    className="bg-white/10 border border-white/20 text-white placeholder:text-slate-400 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-11"
                  />
                  {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm">Senha</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      placeholder="••••••••"
                      className="bg-white/10 border border-white/20 text-white placeholder:text-slate-400 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl font-semibold text-white transition-all"
                  style={{ background: "linear-gradient(90deg, #3B82F6, #2563EB)" }}
                  disabled={isLoading}
                >
                  {isLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Entrando...</> : "Entrar"}
                </Button>
              </form>
            </div>

          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8">
              <p className="text-xs text-slate-500 mb-6 text-center uppercase tracking-widest">NextWave CRM</p>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-5 w-5 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Código 2FA</h2>
              </div>
              <p className="text-slate-400 text-sm mb-8">Insira o código de 6 dígitos do seu app autenticador</p>

              <div className="space-y-5">
                <Input
                  className="text-center text-2xl h-14 bg-white/10 border border-white/20 text-white font-mono rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={totpCode}
                  onChange={e => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  autoFocus
                />

                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={trustDevice} onChange={e => setTrustDevice(e.target.checked)} className="rounded" />
                  Confiar neste dispositivo
                </label>

                <Button
                  onClick={onSubmitTotp}
                  className="w-full h-11 rounded-xl font-semibold text-white transition-all"
                  style={{ background: "linear-gradient(90deg, #3B82F6, #2563EB)" }}
                  disabled={isLoading || totpCode.length < 6}
                >
                  {isLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Verificando...</> : "Confirmar Acesso"}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full text-slate-400 hover:text-white rounded-xl"
                  onClick={() => setStep("credentials")}
                  disabled={isLoading}
                >
                  Voltar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
