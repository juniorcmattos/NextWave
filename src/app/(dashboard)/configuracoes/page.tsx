"use client";

import { useState } from "react";
import { Moon, Sun, Monitor, User, Bell, Shield, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [notificacoes, setNotificacoes] = useState({
    email: true,
    push: false,
    vencimentos: true,
  });

  const temas = [
    { value: "light", label: "Claro", icon: Sun },
    { value: "dark", label: "Escuro", icon: Moon },
    { value: "system", label: "Sistema", icon: Monitor },
  ];

  return (
    <div className="space-y-6 max-w-3xl animate-in">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie suas preferências e configurações do sistema</p>
      </div>

      {/* Perfil */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Informações do Perfil</CardTitle>
          </div>
          <CardDescription>Suas informações de conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input defaultValue={session?.user?.name ?? ""} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue={session?.user?.email ?? ""} disabled />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success">Admin</Badge>
            <span className="text-sm text-muted-foreground">Perfil de administrador</span>
          </div>
          <Button onClick={() => toast.info("Salvamento de perfil será implementado em breve.")}>
            Salvar Alterações
          </Button>
        </CardContent>
      </Card>

      {/* Tema */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Aparência</CardTitle>
          </div>
          <CardDescription>Escolha o tema da interface</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {temas.map((t) => {
              const Icon = t.icon;
              const isActive = theme === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                    isActive
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30 hover:bg-muted/30"
                  )}
                >
                  <Icon className={cn("h-6 w-6", isActive ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn("text-sm font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
                    {t.label}
                  </span>
                  {isActive && (
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Notificações</CardTitle>
          </div>
          <CardDescription>Configure como deseja receber alertas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "email", label: "Notificações por Email", desc: "Receba alertas no seu email cadastrado" },
            { key: "push", label: "Notificações Push", desc: "Alertas no navegador em tempo real" },
            { key: "vencimentos", label: "Alertas de Vencimento", desc: "Avise quando transações estão próximas do vencimento" },
          ].map(({ key, label, desc }, i, arr) => (
            <div key={key}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Switch
                  checked={notificacoes[key as keyof typeof notificacoes]}
                  onCheckedChange={(v) => setNotificacoes((prev) => ({ ...prev, [key]: v }))}
                />
              </div>
              {i < arr.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Segurança */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Segurança</CardTitle>
          </div>
          <CardDescription>Gerencie sua senha e segurança da conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Senha Atual</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label>Nova Senha</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label>Confirmar Nova Senha</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <Button onClick={() => toast.info("Troca de senha será implementada em breve.")}>
            Alterar Senha
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
