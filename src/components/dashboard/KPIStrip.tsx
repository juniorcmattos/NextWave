"use client";

import { TrendingUp, Users, Target, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPIItemProps {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ElementType;
  className?: string;
}

function KPIItem({ label, value, change, trend, icon: Icon, className }: KPIItemProps) {
  return (
    <div className={cn("flex items-center gap-4 px-6 py-4 rounded-3xl bg-white dark:bg-[#121721]/40 border border-black/5 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow", className)}>
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full shrink-0",
        trend === "up" ? "bg-accent-mint/40 text-accent-teal" : "bg-rose-500/10 text-rose-500"
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 leading-none mb-1">{label}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-black tracking-tighter">{value}</span>
          <span className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
            trend === "up" ? "bg-accent-mint text-accent-teal" : "bg-rose-500/10 text-rose-500"
          )}>
            {change}
          </span>
        </div>
      </div>
    </div>
  );
}

export function KPIStrip() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-8 animate-in fade-in duration-700">
      <KPIItem 
        label="Novas Leads" 
        value="+24" 
        change="+12 today" 
        trend="up" 
        icon={Users} 
      />
      <KPIItem 
        label="Projetos Ativos" 
        value="18" 
        change="+3 week" 
        trend="up" 
        icon={Target} 
      />
      <KPIItem 
        label="Receita Mensal" 
        value="R$ 42k" 
        change="+11% week" 
        trend="up" 
        icon={DollarSign} 
      />
      <KPIItem 
        label="Conversão" 
        value="32%" 
        change="+2% month" 
        trend="up" 
        icon={TrendingUp} 
      />
    </div>
  );
}
