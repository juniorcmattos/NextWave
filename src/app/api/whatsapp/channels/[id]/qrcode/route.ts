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
            // Pegar o QR Code real da Evolution API
            const evoRes = await fetch(`${config.apiUrl}/instance/connect/${channel.instanceName}`, {
                headers: {
                    'apikey': config.globalApiKey
                }
            });

            if (evoRes.ok) {
                const data = await evoRes.json();
                if (data && data.base64) {
                    return NextResponse.json({ qrcode: data.base64 });
                }
                // Se já estiver logado, não tem QR Code
                if (data && data.instance && data.instance.state === 'open') {
                    // Podemos retornar um status de conectado
                    return NextResponse.json({ qrcode: null, status: 'connected' });
                }
            } else {
                console.error("[EVOLUTION_API] qr code api failed", await evoRes.text());
                return NextResponse.json({ error: "Instância não encontrada na API ou falha ao gerar" }, { status: 404 });
            }
        } catch (apiErr) {
            console.error("[EVOLUTION_API_CONN]", apiErr);
            return NextResponse.json({ error: "Falha de rede com Evolution API" }, { status: 504 });
        }

        return NextResponse.json({ qrcode: null, status: 'unknown' });
    } catch (error) {
        console.error("[WHATSAPP_CHANNEL_QRCODE]", error);
        return NextResponse.json({ error: "Erro ao gerar QR Code" }, { status: 500 });
    }
}
