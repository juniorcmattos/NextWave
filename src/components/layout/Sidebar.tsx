"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Briefcase,
  BarChart3, Calendar, Settings, ChevronLeft, ChevronRight, ChevronDown,
  Zap, Database, MessageSquare, Paintbrush, Clock, PieChart, Phone, Server,
  CheckSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { useColorTheme } from "@/components/providers/ColorProvider";
import { useSession } from "next-auth/react";
import { getInitials } from "@/lib/utils";
import packageInfo from "../../../package.json";

const dashboardSubItems = [
  { href: "/financeiro", label: "Financeiro", module: "financeiro" },
  { href: "/dashboard/clientes", label: "Clientes", module: "clientes" },
  { href: "/dashboard/whatsapp", label: "WhatsApp", module: "whatsapp" },
  { href: "/dashboard/pbx", label: "Telefonia", module: "pbx" },
];

type SubItem = { href: string; label: string; module?: string };
type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  module?: string;
  subItems?: SubItem[];
};


const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, subItems: dashboardSubItems },
  { href: "/leads", label: "Leads", icon: Zap, module: "leads" },
  { href: "/clientes", label: "Clientes", icon: Users, module: "clientes" },
  { href: "/usuarios", label: "Usuários", icon: Users },
  { href: "/projetos/kanban", label: "Projetos", icon: Briefcase, module: "projetos" },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/agenda", label: "Agenda", icon: Calendar, module: "agenda" },
  { href: "/tarefas", label: "Tarefas", icon: CheckSquare, module: "tarefas" },
  { href: "/whatsapp", label: "WhatsApp", icon: MessageSquare, module: "whatsapp" },
  { href: "/configuracoes/pbx", label: "Telefonia", icon: Phone, module: "pbx" },
];

const bottomItems = [
  { href: "/configuracoes/aparencia", label: "Aparência", icon: Paintbrush },
  { href: "/configuracoes/agendador", label: "Agendador", icon: Clock },
  { href: "/configuracoes/mcp", label: "MCP Server", icon: Server },
  { href: "/configuracoes", label: "Sistema", icon: Settings },
  { href: "/configuracoes/manutencao", label: "Manutenção", icon: Database },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { layoutTheme } = useColorTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [activeModules, setActiveModules] = useState<string[]>([]);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const isProfessional = layoutTheme === "professional";

  useEffect(() => {
    if (pathname.startsWith("/dashboard/")) setOpenMenus(prev => ({ ...prev, "/": true }));
    if (pathname.startsWith("/financeiro")) setOpenMenus(prev => ({ ...prev, "/": true }));
  }, [pathname]);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) setCollapsed(saved === "true");

    fetch("/api/sistema/modulos")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data))
          setActiveModules(data.filter((m: { enabled: boolean }) => m.enabled).map((m: { key: string }) => m.key));
      })
      .catch(() => {
        setActiveModules(["clientes", "leads", "financeiro", "projetos", "servicos", "agenda", "usuarios", "whatsapp"]);
      });
  }, []);

  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  const toggleMenu = (href: string) => {
    setOpenMenus(prev => ({ ...prev, [href]: !prev[href] }));
  };

  const moduleMapping: Record<string, string> = {
    "/clientes": "clientes",
    "/leads": "leads",
    "/financeiro": "financeiro",
    "/projetos": "projetos",
    "/servicos": "servicos",
    "/agenda": "agenda",
    "/usuarios": "usuarios",
    "/whatsapp": "whatsapp",
    "/configuracoes/pbx": "pbx",
  };

  const filteredNavItems = navItems.filter(item => {
    if (!item.module) return true;
    const key = moduleMapping[item.href];
    return !key || activeModules.includes(key);
  });

  function getLinkClass(isActive: boolean, isCollapsed: boolean) {
    if (isCollapsed) {
      return cn(
        "flex h-12 w-12 mx-auto items-center justify-center transition-all duration-300 rounded-[1rem]",
        isActive
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/40 scale-105"
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
      );
    }
    return cn(
      "flex h-11 items-center gap-3 rounded-[1rem] px-4 text-sm font-medium transition-all duration-200",
      isActive
        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
    );
  }

  function renderNavItem(item: NavItem) {
    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
    const Icon = item.icon;
    const hasSubItems = !!item.subItems?.length;
    const subActive = hasSubItems && item.subItems!.some(s => pathname.startsWith(s.href));

    if (collapsed) {
      return (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>
            <Link 
              href={item.href} 
              className={cn(
                "flex h-12 w-12 mx-auto items-center justify-center transition-all duration-300 rounded-xl",
                isActive || subActive
                  ? "bg-primary text-white shadow-lg shadow-primary/40 scale-105"
                  : "text-white/40 hover:bg-white/5 hover:text-white"
              )} 
              onClick={onClose}
            >
              <Icon className="h-4 w-4" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      );
    }

    if (hasSubItems) {
      const subs = item.subItems!.filter(s => !s.module || activeModules.includes(s.module));
      const isOpen = openMenus[item.href];

      return (
        <div key={item.href} className="flex flex-col gap-1">
          <div 
            className={cn(
              "group flex h-11 items-center justify-between gap-3 rounded-xl px-3 text-sm font-semibold transition-all duration-200 cursor-pointer",
              subActive || isActive
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-white/40 hover:bg-white/5 hover:text-white"
            )}
            onClick={() => toggleMenu(item.href)}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </div>
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300", isOpen && "rotate-180")} />
          </div>

          {isOpen && subs.length > 0 && (
            <div className="ml-6 flex flex-col gap-1 mt-1 border-l border-white/10 pl-4 animate-in fade-in slide-in-from-top-1 duration-300">
              {subs.map(sub => {
                const isSubActive = pathname === sub.href;
                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className={cn(
                      "flex h-8 items-center gap-2 rounded-lg px-2 text-xs transition-all",
                      isSubActive
                        ? "text-primary font-bold bg-white/10"
                        : "text-white/30 hover:text-white hover:bg-white/5"
                    )}
                    onClick={onClose}
                  >
                    <div className={cn("h-1 w-1 rounded-full", isSubActive ? "bg-primary" : "bg-white/20")} />
                    {sub.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link 
        key={item.href} 
        href={item.href} 
        className={cn(
          "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-all duration-200",
          isActive
            ? "bg-primary text-white shadow-md shadow-primary/20"
            : "text-white/40 hover:bg-white/5 hover:text-white"
        )} 
        onClick={onClose}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      {/* Overlay Mobile */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm sm:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-4 left-4 z-50 flex flex-col rounded-[2rem] bg-[#121721] text-white shadow-2xl shadow-black/40 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] sm:relative sm:flex my-4 ml-4 overflow-hidden",
          collapsed ? "w-20" : "w-64",
          open ? "translate-x-0" : "-translate-x-[calc(100%+2rem)] sm:translate-x-0"
        )}
      >
        {/* Logo Section */}
        <div className={cn("flex h-20 items-center px-6 mb-6 transition-all", collapsed ? "justify-center" : "gap-3")}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-primary rounded-xl shadow-lg shadow-primary/40 rotate-3 group-hover:rotate-0 transition-transform">
            <Zap className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="animate-in fade-in duration-500">
              <p className="text-sm font-black tracking-tight text-white leading-none uppercase">NextWave</p>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-80 mt-1">CRM Premium</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-4">
          <nav className="flex flex-col gap-2 py-2">
            {filteredNavItems.map((item) => renderNavItem(item))}
          </nav>
        </ScrollArea>

        {/* Bottom Section with Avatar */}
        <div className="p-4 mt-auto border-t border-white/5 bg-black/20">
          {!collapsed ? (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
              <Avatar className="h-9 w-9 border-2 border-primary/20 group-hover:border-primary/50 transition-colors">
                <AvatarImage src={session?.user?.image ?? ""} />
                <AvatarFallback className="text-xs bg-nw-dark text-white font-bold">
                  {getInitials(session?.user?.name ?? "U")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <p className="text-xs font-black text-white truncate truncate uppercase tracking-tighter">{session?.user?.name}</p>
                <p className="text-[9px] text-white/40 truncate font-medium">{session?.user?.email}</p>
              </div>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center p-1 cursor-pointer">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage src={session?.user?.image ?? ""} />
                    <AvatarFallback className="text-xs bg-nw-dark text-white font-bold">
                      {getInitials(session?.user?.name ?? "U")}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-bold">{session?.user?.name}</p>
                <p className="text-[10px] opacity-70">{session?.user?.email}</p>
              </TooltipContent>
            </Tooltip>
          )}

          <nav className="flex flex-col gap-1 mt-4">
            {bottomItems.slice(0, 3).map(item => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link 
                      href={item.href} 
                      className={cn(
                        "group flex items-center transition-all duration-300 rounded-lg",
                        collapsed ? "justify-center h-10 w-10 mx-auto" : "h-10 w-full px-3",
                        isActive ? "bg-white/10 text-white" : "text-white/30 hover:bg-white/5 hover:text-white"
                      )} 
                      onClick={onClose}
                    >
                      <Icon className={cn("shrink-0", collapsed ? "h-4 w-4" : "h-3.5 w-3.5")} />
                      {!collapsed && (
                        <span className="ml-3 text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                </Tooltip>
              );
            })}
          </nav>
        </div>

        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-24 z-10 h-6 w-6 flex items-center justify-center bg-white rounded-full shadow-xl border border-black/5 text-[#121721] hover:scale-110 transition-transform hidden sm:flex"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>
    </TooltipProvider>
  );
}
