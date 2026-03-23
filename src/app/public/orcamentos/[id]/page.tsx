import { prisma } from "@/lib/db";
import { QuotePublicView } from "@/components/quotes/QuotePublicView";
import { notFound } from "next/navigation";

export default async function PublicQuotePage({ params }: { params: { id: string } }) {
    const quote = await prisma.quote.findUnique({
        where: { id: params.id },
        include: {
            client: true,
            items: true,
            user: {
                select: { name: true, email: true, branch: true }
            }
        }
    });

    if (!quote) return notFound();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <QuotePublicView quote={quote} />
        </div>
    );
}
