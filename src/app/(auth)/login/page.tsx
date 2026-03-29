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
    <div className="min-h-screen flex bg-slate-50">

      {/* Painel esquerdo — decorativo clean */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #DBEAFE 100%)" }}
      >
        {/* Ícone */}
        <div className="relative mb-6">
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-40"
            style={{ background: "rgba(59,130,246,0.3)", transform: "scale(1.6)" }}
          />
          <div className="relative bg-blue-600 rounded-2xl p-5 shadow-lg shadow-blue-200">
            <Zap className="h-16 w-16 text-white" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">NextWave CRM</h1>
        <p className="text-slate-500 mt-3 text-center text-lg">Gestão inteligente para seu negócio.</p>

        {/* Bullets */}
        <ul className="mt-10 space-y-4">
          {["Gestão de clientes", "Controle financeiro", "Relatórios em tempo real"].map((item) => (
            <li key={item} className="flex items-center gap-3 text-slate-600 text-sm">
              <CheckCircle className="h-4 w-4 text-blue-500 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Painel direito — formulário clean */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">

          {step === "credentials" ? (
            <div>
              <div className="mb-8">
                <p className="text-xs text-slate-400 mb-4 uppercase tracking-widest">NextWave CRM</p>
                <h2 className="text-2xl font-bold text-slate-800">Bom te ver de volta 👋</h2>
                <p className="text-slate-500 text-sm mt-1">Insira suas credenciais para acessar</p>
              </div>

              <form onSubmit={handleSubmit(onSubmitCredentials)} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-slate-700 text-sm font-medium">Email</Label>
                  <Input
                    {...register("email")}
                    placeholder="seu@email.com"
                    className="bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-11"
                  />
                  {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 text-sm font-medium">Senha</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      placeholder="••••••••"
                      className="bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl font-semibold text-white transition-all bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100"
                  disabled={isLoading}
                >
                  {isLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Entrando...</> : "Entrar"}
                </Button>
              </form>
            </div>

          ) : (
            <div>
              <div className="mb-8">
                <p className="text-xs text-slate-400 mb-4 uppercase tracking-widest">NextWave CRM</p>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="h-5 w-5 text-blue-500" />
                  <h2 className="text-2xl font-bold text-slate-800">Verificação 2FA</h2>
                </div>
                <p className="text-slate-500 text-sm">Insira o código de 6 dígitos do seu autenticador</p>
              </div>

              <div className="space-y-5">
                <Input
                  className="text-center text-2xl h-14 bg-slate-50 border border-slate-200 text-slate-800 font-mono rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={totpCode}
                  onChange={e => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  autoFocus
                />

                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={trustDevice} onChange={e => setTrustDevice(e.target.checked)} className="rounded" />
                  Confiar neste dispositivo
                </label>

                <Button
                  onClick={onSubmitTotp}
                  className="w-full h-11 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100"
                  disabled={isLoading || totpCode.length < 6}
                >
                  {isLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Verificando...</> : "Confirmar Acesso"}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full text-slate-500 hover:text-slate-800 rounded-xl"
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
