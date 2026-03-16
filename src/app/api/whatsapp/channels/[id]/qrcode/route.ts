import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    try {
        const channels: any[] = await prisma.$queryRawUnsafe(
            `SELECT * FROM "WhatsAppChannel" WHERE "id" = ? LIMIT 1`,
            params.id
        );

        const channel = channels[0];

        if (!channel) {
            return NextResponse.json({ error: "Canal não encontrado" }, { status: 404 });
        }

        // Buscar configurações para conectar
        const configs: any[] = await prisma.$queryRawUnsafe(
            `SELECT * FROM "WhatsAppConfig" WHERE "id" = 'default' LIMIT 1`
        );
        const config = configs[0];

        if (!config || !config.apiUrl || !config.globalApiKey) {
            return NextResponse.json({ error: "Evolution API não configurada globalmente" }, { status: 400 });
        }

        try {
            const apiUrl = (config.apiUrl.includes('localhost') || config.apiUrl.includes('127.0.0.1')) 
                ? 'http://evolution-api:8081' 
                : config.apiUrl;
            
            // Reduzir timeout para 10s para evitar 504 do servidor Next.js
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const evoRes = await fetch(`${apiUrl}/instance/connect/${channel.instanceName}`, {
                headers: { 'apikey': config.globalApiKey },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            console.log(`[EVOLUTION_DEBUG] Instância: ${channel.instanceName}, Status: ${evoRes.status}`);

            if (evoRes.ok) {
                const data = await evoRes.json();
                console.log(`[EVOLUTION_DEBUG] Resposta:`, JSON.stringify(data));
                
                if (data && data.base64) {
                    return NextResponse.json({ qrcode: data.base64, status: 'ready' });
                }
                if (data && (data.instance?.state === 'open' || data.state === 'open')) {
                    return NextResponse.json({ qrcode: null, status: 'connected' });
                }
                return NextResponse.json({ qrcode: null, status: 'preparing' });
            } else {
                const errText = await evoRes.text();
                console.error(`[EVOLUTION_DEBUG] Erro da API: ${errText}`);
                return NextResponse.json({ qrcode: null, status: 'initializing', message: "Aguardando geração do QR..." });
            }
        } catch (apiErr: any) {
            console.error("[EVOLUTION_API_QUIET] Erro ou Timeout ignorado para polling:", apiErr.message);
            // Retorna status de processamento em vez de erro bruto para o frontend continuar tentando
            return NextResponse.json({ qrcode: null, status: 'pending' });
        }

        return NextResponse.json({ qrcode: null, status: 'unknown' });
    } catch (error) {
        console.error("[WHATSAPP_CHANNEL_QRCODE]", error);
        return NextResponse.json({ error: "Erro ao gerar QR Code" }, { status: 500 });
    }
}
