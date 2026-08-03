import { prisma } from "@/lib/prisma";
import PipelineBoard from "@/components/pipeline/PipelineBoard";

export default async function PipelinePage() {
  const orgs = await prisma.organisation.findMany({
    include: { contacts: { take: 1, orderBy: { createdAt: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });

  const cards = orgs.map((org) => ({
    id: org.id,
    name: org.name,
    contactName: org.contacts[0]?.name ?? null,
    stage: org.pipelineStage,
    dealValueNzd: org.dealValueNzd ? Number(org.dealValueNzd) : null,
    invoiced: org.invoiced,
    paidStatus: org.paidStatus,
  }));

  return <PipelineBoard initialCards={cards} />;
}
