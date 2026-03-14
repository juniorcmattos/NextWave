"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Client } from "@/types";

interface ClientSearchSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  clients: Pick<Client, "id" | "name" | "document" | "registrationId" | "address">[];
  placeholder?: string;
}

export function ClientSearchSelect({
  value,
  onValueChange,
  clients,
  placeholder = "Selecionar cliente...",
}: ClientSearchSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedClient = clients.find((client) => client.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selectedClient ? (
            <div className="flex items-center gap-2 truncate">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">
                {selectedClient.registrationId ? `[ID: ${selectedClient.registrationId}] ` : ""}
                {selectedClient.name}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar por Nome, ID, CNPJ ou Endereço..." />
          <CommandList>
            <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="none"
                onSelect={() => {
                  onValueChange("none");
                  setOpen(false);
                }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 opacity-50" />
                  <span>Nenhum / Cortesia</span>
                </div>
                <Check
                  className={cn(
                    "h-4 w-4",
                    value === "none" ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
              {clients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={`${client.name} ${client.document || ""} ${client.registrationId || ""} ${client.address || ""}`}
                  onSelect={() => {
                    onValueChange(client.id);
                    setOpen(false);
                  }}
                  className="flex flex-col items-start gap-0.5 py-2"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium">
                         {client.registrationId ? `#${client.registrationId} - ` : ""}
                         {client.name}
                      </span>
                    </div>
                    <Check
                      className={cn(
                        "h-4 w-4",
                        value === client.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                  {(client.document || client.address) && (
                    <div className="pl-5.5 text-[10px] text-muted-foreground flex flex-col gap-0.5 ml-5">
                      {client.document && <span>Doc: {client.document}</span>}
                      {client.address && <span className="truncate max-w-[250px]">{client.address}</span>}
                    </div>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
