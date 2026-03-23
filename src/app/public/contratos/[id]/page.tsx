import { prisma } from "@/lib/db";
import { ContractPublicView } from "@/components/contracts/ContractPublicView";
import { notFound } from "next/navigation";

export default async function PublicContractPage({ params }: { params: { id: string } }) {
    const contract = await prisma.contract.findFirst({
        where: {
            OR: [
                { id: params.id },
                { quoteId: params.id }
            ]
        },
        include: {
            client: true,
            quote: true,
        }
    });

    if (!contract) return notFound();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <ContractPublicView contract={contract} />
        </div>
    );
}
