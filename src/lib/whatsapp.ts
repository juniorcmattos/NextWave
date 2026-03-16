import { prisma } from "@/lib/db";

async function getActiveConfig() {
    const configs: any[] = await prisma.$queryRawUnsafe(
        `SELECT * FROM "WhatsAppConfig" WHERE "id" = 'default' LIMIT 1`
    );
    const config = configs[0];
    if (!config || !config.apiUrl || !config.globalApiKey) return null;

    // Substitui localhost pelo hostname interno do Docker
    const apiUrl = (config.apiUrl.includes("localhost") || config.apiUrl.includes("127.0.0.1"))
        ? "http://evolution-api:8081"
        : config.apiUrl;

    return { apiUrl, apiKey: config.globalApiKey };
}

async function getActiveInstance(): Promise<string | null> {
    // Tenta primeiro um canal conectado
    const connected: any[] = await prisma.$queryRawUnsafe(
        `SELECT "instanceName" FROM "WhatsAppChannel" WHERE "isActive" = 1 AND "status" = 'open' ORDER BY "updatedAt" DESC LIMIT 1`
    );
    if (connected.length > 0) return connected[0].instanceName;

    // Fallback: qualquer canal ativo
    const fallback: any[] = await prisma.$queryRawUnsafe(
        `SELECT "instanceName" FROM "WhatsAppChannel" WHERE "isActive" = 1 ORDER BY "updatedAt" DESC LIMIT 1`
    );
    return fallback[0]?.instanceName ?? null;
}

export async function sendWhatsAppMessage(to: string, message: string) {
    try {
        const config = await getActiveConfig();
        if (!config) {
            console.warn("[WHATSAPP_SERVICE] Configuração ausente ou incompleta.");
            return false;
        }

        const instance = await getActiveInstance();
        if (!instance) {
            console.warn("[WHATSAPP_SERVICE] Nenhum canal ativo encontrado.");
            return false;
        }

        const cleanNumber = to.replace(/\D/g, "");
        const url = `${config.apiUrl}/message/sendText/${instance}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": config.apiKey,
            },
            body: JSON.stringify({
                number: cleanNumber,
                text: message,
            }),
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("[WHATSAPP_SEND_ERROR]", err);
            return false;
        }

        return true;
    } catch (error) {
        console.error("[WHATSAPP_SERVICE_ERROR]", error);
        return false;
    }
}

export async function getWhatsAppMessages(phone: string) {
    try {
        const config = await getActiveConfig();
        if (!config) return [];

        const instance = await getActiveInstance();
        if (!instance) return [];

        const remoteJid = `${phone}@s.whatsapp.net`;
        const url = `${config.apiUrl}/chat/findMessages/${instance}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", "apikey": config.apiKey },
            body: JSON.stringify({
                where: { key: { remoteJid } },
                limit: 50,
            }),
        });

        if (!response.ok) return [];

        const data = await response.json();
        const messages = Array.isArray(data) ? data : data.messages ?? [];

        return messages.map((msg: any) => ({
            id: msg.key?.id || msg.id || String(Date.now()),
            body:
                msg.message?.conversation ||
                msg.message?.extendedTextMessage?.text ||
                msg.message?.imageMessage?.caption ||
                "[mídia]",
            fromMe: msg.key?.fromMe ?? false,
            time: msg.messageTimestamp
                ? new Date(Number(msg.messageTimestamp) * 1000).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                  })
                : "Agora",
            timestamp: msg.messageTimestamp ? Number(msg.messageTimestamp) : 0,
        })).sort((a: any, b: any) => a.timestamp - b.timestamp);
    } catch (error) {
        console.error("[WHATSAPP_GET_MESSAGES_ERROR]", error);
        return [];
    }
}

export async function getWhatsAppChats() {
    try {
        const config = await getActiveConfig();
        if (!config) return [];

        const instance = await getActiveInstance();
        if (!instance) return [];

        const url = `${config.apiUrl}/chat/findMany/${instance}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", "apikey": config.apiKey },
            body: JSON.stringify({ where: {} }),
        });

        if (!response.ok) return [];

        const data = await response.json();

        return (Array.isArray(data) ? data : [])
            .filter((chat: any) => chat.remoteJid && !chat.remoteJid.includes("@g.us")) // exclui grupos
            .map((chat: any) => ({
                id: chat.remoteJid,
                phone: chat.remoteJid.split("@")[0],
                customerName: chat.pushName || chat.name || null,
                lastMessage:
                    chat.lastMessage?.message?.conversation ||
                    chat.lastMessage?.message?.extendedTextMessage?.text ||
                    "",
                time: chat.updatedAt
                    ? new Date(chat.updatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                    : "Agora",
                unread: chat.unreadMessages || 0,
            }));
    } catch (error) {
        console.error("[WHATSAPP_GET_CHATS_ERROR]", error);
        return [];
    }
}
