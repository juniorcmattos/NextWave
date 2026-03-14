import { User, Mail, Phone, MapPin, Building2, FileText, QrCode, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ClientCadastroTabProps {
  client: any;
  onSave?: (data: any) => void;
}

export function ClientCadastroTab({ client, onSave }: ClientCadastroTabProps) {
  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-border/50">
            <h4 className="text-sm font-bold flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-indigo-500" />
              Informações Pessoais
            </h4>
            <div className="space-y-3">
              <div>
                <Label className="text-[10px] uppercase text-muted-foreground">Nome Completo</Label>
                <p className="text-sm font-semibold">{client?.name}</p>
              </div>
              <div>
                <Label className="text-[10px] uppercase text-muted-foreground">CPF / CNPJ</Label>
                <p className="text-sm font-semibold">{client?.document || "Não informado"}</p>
              </div>
              <div>
                <Label className="text-[10px] uppercase text-muted-foreground">Empresa</Label>
                <p className="text-sm font-semibold">{client?.company || "Autônomo / PF"}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-border/50">
            <h4 className="text-sm font-bold flex items-center gap-2 mb-4">
              <Mail className="h-4 w-4 text-emerald-500" />
              Contatos
            </h4>
            <div className="space-y-3">
              <div>
                <Label className="text-[10px] uppercase text-muted-foreground">E-mail</Label>
                <p className="text-sm font-semibold truncate">{client?.email || "N/A"}</p>
              </div>
              <div>
                <Label className="text-[10px] uppercase text-muted-foreground">Telefones</Label>
                <p className="text-sm font-semibold">{client?.phone || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-border/50">
            <h4 className="text-sm font-bold flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-amber-500" />
              Endereço
            </h4>
            <div className="space-y-3">
              <div>
                <Label className="text-[10px] uppercase text-muted-foreground">Logradouro</Label>
                <p className="text-sm font-semibold">{client?.address || "N/A"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[10px] uppercase text-muted-foreground">Cidade</Label>
                  <p className="text-sm font-semibold">{client?.city || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-[10px] uppercase text-muted-foreground">Estado</Label>
                  <p className="text-sm font-semibold">{client?.state || "N/A"}</p>
                </div>
              </div>
              <div>
                <Label className="text-[10px] uppercase text-muted-foreground">CEP</Label>
                <p className="text-sm font-semibold">{client?.zipCode || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-border/50">
            <h4 className="text-sm font-bold flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-slate-500" />
              Observações Internas
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed italic">
              {client?.notes || "Nenhuma observação cadastrada para este cliente."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" className="rounded-xl font-bold">
          <QrCode className="h-4 w-4 mr-2" /> Cartão Digital
        </Button>
        <Button size="sm" className="rounded-xl font-bold">
          <Save className="h-4 w-4 mr-2" /> Editar Dados
        </Button>
      </div>
    </div>
  );
}
