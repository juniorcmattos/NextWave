"use client";

import { useState, useEffect, Suspense } from "react";
import { ChatList } from "@/components/whatsapp/ChatList";
import { ChatWindow } from "@/components/whatsapp/ChatWindow";
import { MessageSquareOff } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

function ChatPageContent() {
    const searchParams = useSearchParams();
    const phoneParam = searchParams.get("phone");
    const [selectedChat, setSelectedChat] = useState<any>(null);

    useEffect(() => {
        if (phoneParam) {
            setSelectedChat({
                id: "nova-conversa-" + phoneParam,
                phone: phoneParam,
                customerName: null,
                lastMessage: "",
                time: "Agora",
                unread: 0,
            });
        }
    }, [phoneParam]);

    return (
        <div className="h-[calc(100vh-140px)] border border-border rounded-2xl overflow-hidden bg-card/30 backdrop-blur-xl flex shadow-2xl shadow-slate-200/50 dark:shadow-none">
            <div className={cn(
                "w-full md:w-[320px] lg:w-[380px] flex-shrink-0 transition-all duration-300",
                selectedChat ? "hidden md:flex" : "flex"
            )}>
                <ChatList onSelect={setSelectedChat} selectedId={selectedChat?.id} />
            </div>
            <div className={cn(
                "flex-1 overflow-hidden transition-all duration-300",
                !selectedChat ? "hidden md:flex" : "flex"
            )}>
                {selectedChat ? (
                    <ChatWindow chat={selectedChat} onBack={() => setSelectedChat(null)} />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50/30 dark:bg-slate-950/20 animate-in fade-in zoom-in-95 duration-700">
                        <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                            <MessageSquareOff className="h-10 w-10 text-muted-foreground/40" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight mb-2 text-foreground">Selecione uma conversa</h3>
                        <p className="text-muted-foreground max-w-[280px] text-sm leading-relaxed">
                            Clique em um contato na lista ao lado para visualizar o histórico de mensagens e responder seus clientes.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function WhatsAppChatPage() {
    return (
        <Suspense fallback={<div className="h-[calc(100vh-140px)] flex items-center justify-center">Carregando Chat...</div>}>
            <ChatPageContent />
        </Suspense>
    );
}
