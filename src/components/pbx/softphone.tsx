"use client";

import { useState } from "react";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, X, Minus, ChevronUp, History, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Softphone() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [number, setNumber] = useState("");
    const [callStatus, setCallStatus] = useState<"idle" | "calling" | "active" | "incoming">("idle");
    const [isMuted, setIsMuted] = useState(false);

    const addDigit = (digit: string) => {
        setNumber(prev => prev + digit);
    };

    const handleCall = () => {
        if (!number) return;
        setCallStatus("calling");
        // Lógica real de VoIP entrará aqui
        setTimeout(() => setCallStatus("active"), 2000);
    };

    const handleEndCall = () => {
        setCallStatus("idle");
        setNumber("");
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl animate-in zoom-in"
            >
                <Phone className="h-6 w-6" />
            </Button>
        );
    }

    return (
        <Card className={cn(
            "fixed bottom-6 right-6 w-80 shadow-2xl border-primary/20 transition-all duration-300 z-50 overflow-hidden",
            isMinimized ? "h-14" : "h-[480px]"
        )}>
            <CardHeader className="bg-primary text-primary-foreground p-3 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm font-bold">Telefonia PBX</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setIsMinimized(!isMinimized)}>
                        {isMinimized ? <ChevronUp className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            {!isMinimized && (
                <CardContent className="p-4 flex flex-col h-[calc(100%-56px)]">
                    {callStatus === "idle" ? (
                        <div className="space-y-6 flex flex-col flex-1">
                            <Input
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                                placeholder="Digitar número..."
                                className="text-2xl text-center h-16 font-mono tracking-widest border-0 focus-visible:ring-0 bg-secondary/30"
                            />

                            <div className="grid grid-cols-3 gap-2 flex-1 items-center">
                                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map(d => (
                                    <Button
                                        key={d}
                                        variant="outline"
                                        className="h-14 text-xl font-bold rounded-xl hover:bg-primary/10 hover:border-primary/50 transition-all"
                                        onClick={() => addDigit(d)}
                                    >
                                        {d}
                                    </Button>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl">
                                    <History className="h-5 w-5" />
                                </Button>
                                <Button className="flex-1 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 gap-2" onClick={handleCall}>
                                    <Phone className="h-5 w-5" /> Iniciar Chamada
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center space-y-8 flex-1 animate-in slide-in-from-bottom">
                            <div className="space-y-2 text-center">
                                <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto relative">
                                    <User className="h-10 w-10 text-primary" />
                                    <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20" />
                                </div>
                                <h3 className="text-xl font-bold">{number}</h3>
                                <p className="text-sm text-muted-foreground animate-pulse">
                                    {callStatus === "calling" ? "Chamando..." : "Em chamada (00:45)"}
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={cn("h-14 w-14 rounded-full", isMuted && "bg-destructive/10 border-destructive")}
                                    onClick={() => setIsMuted(!isMuted)}
                                >
                                    {isMuted ? <MicOff className="h-6 w-6 text-destructive" /> : <Mic className="h-6 w-6" />}
                                </Button>
                                <Button variant="outline" size="icon" className="h-14 w-14 rounded-full">
                                    <Volume2 className="h-6 w-6" />
                                </Button>
                            </div>

                            <Button
                                variant="destructive"
                                className="w-full h-14 rounded-2xl gap-2 font-bold"
                                onClick={handleEndCall}
                            >
                                <PhoneOff className="h-6 w-6" /> Desligar
                            </Button>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
