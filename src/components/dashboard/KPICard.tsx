import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  isCurrency?: boolean;
  iconColor?: string;
  iconBg?: string;
  description?: string;
}

export function KPICard({
  title,
  value,
  icon: Icon,
  change,
  isCurrency = false,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  description,
}: KPICardProps) {
  const formattedValue = isCurrency
    ? formatCurrency(Number(value))
    : value.toLocaleString("pt-BR");

  const isPositive = change !== undefined && change >= 0;

  return (
    <Card className="premium-card glass overflow-hidden border-none transition-all duration-500 hover:scale-[1.02]">
      <CardContent className="p-8">
        <div className="flex items-start justify-between">
          <div className="space-y-4 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">{title}</p>
            <div className="space-y-1">
                <p className="text-4xl font-black tracking-tighter text-[#121721] dark:text-white">
                {formattedValue}
                </p>
                {description && (
                <p className="text-xs text-muted-foreground font-medium">{description}</p>
                )}
            </div>
            {change !== undefined && (
              <div className={cn(
                "inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-3 py-1 rounded-full",
                isPositive 
                    ? "text-emerald-600 bg-emerald-500/10" 
                    : "text-rose-600 bg-rose-500/10"
              )}>
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{isPositive ? "+" : ""}{change.toFixed(1)}% <span className="opacity-60">vs last month</span></span>
              </div>
            )}
          </div>
          <div className={cn(
            "flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] shadow-lg transition-transform duration-500 group-hover:rotate-12",
            iconBg
          )}>
            <Icon className={cn("h-8 w-8", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
