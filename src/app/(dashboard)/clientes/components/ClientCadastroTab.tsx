"use client";

import { User, Mail, Phone, MapPin, Building2, FileText, QrCode, Save, MessageCircle, Linkedin, Slack, Globe, Edit2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ClientCadastroTabProps {
  client: any;
  onSave?: (data: any) => void;
  onEdit?: () => void;
}

export function ClientCadastroTab({ client, onSave, onEdit }: ClientCadastroTabProps) {
  const [isEditing, setIsEditing] = useState(false);

  const InfoCard = ({ title, icon: Icon, children, colorClass }: any) => (
    <div className="premium-card p-6 relative group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center bg-opacity-10", colorClass)}>
            <Icon className="h-4 w-4" />
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">{title}</h4>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-40 hover:opacity-100 transition-opacity">
            <Edit2 className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const EditField = ({ label, value, name }: any) => (
    <div>
      <label className="text-[10px] uppercase font-black tracking-widest opacity-40 mb-1 block">{label}</label>
      {isEditing ? (
        <Input defaultValue={value} className="bg-white/50 border-black/5 rounded-xl h-10 font-bold" />
      ) : (
        <p className="text-sm font-black tracking-tight text-[#121721] dark:text-white truncate uppercase">{value || "---"}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <InfoCard title="Informações Pessoais" icon={User} colorClass="bg-accent-blue text-accent-blue font-bold">
            <EditField label="Nome Completo" value={client?.name} />
            <EditField label="CPF / CNPJ" value={client?.document} />
            <EditField label="Empresa" value={client?.company} />
          </InfoCard>

          <InfoCard title="Contatos & Redes" icon={Mail} colorClass="bg-accent-teal text-accent-teal font-bold">
            <EditField label="E-mail Principal" value={client?.email} />
            <EditField label="Telefone" value={client?.phone} />
            
            <div className="pt-4 border-t border-black/5">
              <label className="text-[10px] uppercase font-black tracking-widest opacity-40 mb-3 block">Fontes & Social</label>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-2xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366] cursor-pointer hover:scale-110 transition-transform shadow-sm">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="h-10 w-10 rounded-2xl bg-[#0A66C2]/10 flex items-center justify-center text-[#0A66C2] cursor-pointer hover:scale-110 transition-transform shadow-sm">
                  <Linkedin className="h-5 w-5" />
                </div>
                <div className="h-10 w-10 rounded-2xl bg-[#4A154B]/10 flex items-center justify-center text-[#4A154B] cursor-pointer hover:scale-110 transition-transform shadow-sm">
                  <Slack className="h-5 w-5" />
                </div>
                <div className="h-10 w-10 rounded-2xl bg-black/5 flex items-center justify-center text-slate-900 cursor-pointer hover:scale-110 transition-transform shadow-sm">
                  <Globe className="h-5 w-5" />
                </div>
              </div>
            </div>
          </InfoCard>
        </div>

        <div className="space-y-8">
          <InfoCard title="Endereço de Faturamento" icon={MapPin} colorClass="bg-accent-yellow text-accent-yellow font-bold">
            <EditField label="Logradouro" value={client?.address} />
            <div className="grid grid-cols-2 gap-4">
              <EditField label="Cidade" value={client?.city} />
              <EditField label="Estado" value={client?.state} />
            </div>
            <EditField label="CEP" value={client?.zipCode} />
          </InfoCard>

          <InfoCard title="Notas & Observações" icon={FileText} colorClass="bg-slate-900 text-slate-900 font-bold">
            {isEditing ? (
              <Textarea defaultValue={client?.notes} className="min-h-[120px] bg-white/50 border-black/5 rounded-2xl font-medium" />
            ) : (
              <p className="text-sm font-medium text-muted-foreground leading-relaxed italic">
                {client?.notes || "Nenhuma observação cadastrada."}
              </p>
            )}
          </InfoCard>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-black/5">
        {isEditing ? (
          <>
            <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-2xl font-black uppercase tracking-widest text-[10px]">Cancelar</Button>
            <Button onClick={() => setIsEditing(false)} className="bg-accent-blue text-white rounded-2xl px-8 font-black uppercase tracking-widest text-[10px] h-12">Salvar Alterações</Button>
          </>
        ) : (
          <>
            <Button variant="outline" className="rounded-2xl border-white/40 font-black uppercase tracking-widest text-[10px] h-12 px-6">
              <QrCode className="h-4 w-4 mr-2" /> Cartão Digital
            </Button>
            <Button onClick={() => setIsEditing(true)} className="bg-[#121721] text-white rounded-2xl px-8 font-black uppercase tracking-widest text-[10px] h-12 shadow-xl shadow-black/10">
              <Edit2 className="h-4 w-4 mr-2" /> Editar Perfil
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
