"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Bell, Search, LogOut, User, Menu, Check } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Gerar notificações dinâmicas baseadas em dados reais
  const fetchNotifications = useCallback(async () => {
    try {
      const [txRes, evRes] = await Promise.all([
        fetch("/api/financeiro?limit=3"),
        fetch("/api/agenda?limit=3"),
      ]);

      const notifs: Notification[] = [];

      if (txRes.ok) {
        const txData = await txRes.json();
        const transactions = Array.isArray(txData) ? txData : txData.transactions || [];
        transactions.slice(0, 2).forEach((tx: any) => {
          if (tx.status === "pendente") {
            notifs.push({
              id: `tx-${tx.id}`,
              title: "Pagamento Pendente",
              description: `${tx.description} — R$ ${Number(tx.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
              time: tx.dueDate ? new Date(tx.dueDate).toLocaleDateString("pt-BR") : "Sem data",
              read: false,
            });
          }
        });
      }

      if (evRes.ok) {
        const events = await evRes.json();
        const evList = Array.isArray(events) ? events : [];
        evList.slice(0, 2).forEach((ev: any) => {
          if (ev.status === "agendado") {
            notifs.push({
              id: `ev-${ev.id}`,
              title: "Evento Agendado",
              description: ev.title,
              time: new Date(ev.startDate).toLocaleDateString("pt-BR"),
              read: false,
            });
          }
        });
      }

      if (notifs.length === 0) {
        notifs.push({
          id: "welcome",
          title: "Bem-vindo!",
          description: "Nenhuma notificação pendente no momento.",
          time: "Agora",
          read: true,
        });
      }

      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch {
      setNotifications([{
        id: "fallback",
        title: "Notificações",
        description: "Você está em dia! Nenhum alerta no momento.",
        time: "Agora",
        read: true,
      }]);
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between gap-4 px-8 backdrop-blur-md bg-white/80 dark:bg-black/40 border-b border-white/40 shadow-sm transition-all duration-300">
      {/* Search & Tabs Container */}
      <div className="flex items-center gap-8 flex-1">
        {/* Mobile Menu Trigger */}
        <Button variant="ghost" size="icon" className="h-10 w-10 sm:hidden rounded-full bg-white shadow-sm" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>

        {/* Tabs - Estilo "Contacts" */}
        <nav className="hidden lg:flex items-center bg-white/50 dark:bg-black/20 backdrop-blur-md p-1.5 rounded-full border border-black/5 dark:border-white/5 shadow-inner">
          {[
            { label: "Overview", href: "/", active: pathname === "/" },
            { label: "Leads", href: "/leads", active: pathname === "/leads" },
            { label: "Projetos", href: "/projetos", active: pathname === "/projetos" },
            { label: "Financeiro", href: "/financeiro", active: pathname === "/financeiro" },
          ].map((tab) => (
            <Link 
              key={tab.label} 
              href={tab.href}
              className={cn(
                "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300",
                tab.active 
                  ? "bg-[#121721] text-white shadow-lg shadow-black/20 scale-105" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-sm">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent-blue transition-colors" />
            <Input 
              placeholder="Pesquisar..." 
              className="pl-11 h-11 bg-white/50 dark:bg-black/20 border-black/5 dark:border-white/5 rounded-full focus-visible:ring-accent-blue/20 transition-all placeholder:text-[10px] placeholder:uppercase placeholder:font-black placeholder:tracking-widest" 
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <DropdownMenu onOpenChange={(open) => { if (open) fetchNotifications(); }}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-11 w-11 relative bg-white/50 dark:bg-black/20 rounded-full border border-black/5 dark:border-white/5">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-accent-blue ring-4 ring-white dark:ring-[#121721]" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notificações</span>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={markAllRead}>
                  <Check className="h-3 w-3" /> Marcar lidas
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="max-h-[300px]">
              {notifications.map(n => (
                <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 py-3 cursor-default">
                  <div className="flex items-center gap-2 w-full">
                    {!n.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                    <span className="text-sm font-semibold">{n.title}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{n.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-4">{n.description}</p>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image ?? ""} />
                <AvatarFallback className="text-xs">
                  {getInitials(session?.user?.name ?? "U")}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">{session?.user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/configuracoes/perfil">
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Meu Perfil
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
