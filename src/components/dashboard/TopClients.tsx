import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, getInitials } from "@/lib/utils";

interface TopClient {
  id: string;
  name: string;
  totalReceita: number;
  totalServicos: number;
}

interface TopClientsProps {
  clients: TopClient[];
}

export function TopClients({ clients }: TopClientsProps) {
  const maxReceita = Math.max(...clients.map((c) => c.totalReceita), 1);

  return (
    <Card className="premium-card glass border-none overflow-hidden">
      <CardHeader className="pb-6 pt-8 px-8">
        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Melhores Clientes</CardTitle>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <div className="space-y-4">
          {clients.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum cliente encontrado
            </p>
          ) : (
            clients.map((client, index) => (
              <div key={client.id} className="space-y-2">
                <div className="flex items-center gap-4 py-1">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border-2 border-white/20 shadow-sm">
                      <AvatarFallback className="text-xs font-black bg-primary/10 text-primary">
                        {getInitials(client.name)}
                      </AvatarFallback>
                    </Avatar>
                    {index < 3 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#EFE347] flex items-center justify-center text-[10px] text-[#121721] font-black shadow-md border-2 border-white">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black tracking-tight text-[#121721] dark:text-white truncate">{client.name}</p>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground opacity-60">
                      {client.totalServicos} serviço{client.totalServicos !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="text-sm font-black tracking-tight text-primary shrink-0">
                    {formatCurrency(client.totalReceita)}
                  </p>
                </div>
                <Progress
                  value={(client.totalReceita / maxReceita) * 100}
                  className="h-1.5"
                />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
