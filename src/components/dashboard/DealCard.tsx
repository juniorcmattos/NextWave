"use client";

import { cn } from "@/lib/utils";
import { MoreVertical, Clock, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type DealVariant = "blue" | "yellow" | "teal" | "black" | "white";

interface DealCardProps {
  title: string;
  client: string;
  amount: string;
  date: string;
  variant?: DealVariant;
  className?: string;
}

const variantStyles: Record<DealVariant, string> = {
  blue: "bg-accent-blue text-white",
  yellow: "bg-accent-yellow text-slate-900",
  teal: "bg-accent-teal text-white",
  black: "bg-[#121721] text-white",
  white: "bg-white text-[#121721] border border-black/5",
};

const badgeStyles: Record<DealVariant, string> = {
  blue: "bg-white/20 text-white",
  yellow: "bg-black/10 text-slate-800",
  teal: "bg-white/20 text-white",
  black: "bg-white/10 text-white",
  white: "bg-black/5 text-[#121721]",
};

export function DealCard({ title, client, amount, date, variant = "blue", className }: DealCardProps) {
  return (
    <div className={cn(
      "group relative p-6 rounded-[2rem] transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl overflow-hidden",
      variantStyles[variant],
      className
    )}>
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest", badgeStyles[variant])}>
            Oportunidade
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="opacity-40 hover:opacity-100 transition-opacity p-1">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl border-white/10 bg-[#121721] text-white">
              <DropdownMenuItem className="cursor-pointer focus:bg-white/10">Ver Detalhes</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer focus:bg-white/10">Editar</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer focus:bg-white/10 text-rose-400">Excluir</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="text-xl font-black tracking-tighter leading-tight mb-2 uppercase">
          {title}
        </h3>
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 opacity-60">
            <User className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{client}</span>
          </div>

          {/* Avatar Stack */}
          <div className="flex -space-x-2">
            {[1, 2].map((i) => (
              <Avatar key={i} className="h-6 w-6 border-2 border-current">
                <AvatarFallback className="text-[8px] bg-white/10">U</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-current/10 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black tracking-widest opacity-40 leading-none mb-1">Valor</span>
            <span className="text-lg font-black tracking-tighter">{amount}</span>
          </div>
          <div className="flex items-center gap-1.5 opacity-40 text-[10px] font-bold uppercase tracking-widest">
            <Clock className="h-3 w-3" />
            {date}
          </div>
        </div>
      </div>

      {/* Background Decorative Element */}
      <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-current opacity-5 blur-3xl pointer-events-none" />
    </div>
  );
}
