import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ECardClient } from "../ECardClient";
import { NamecardData } from "@/components/card/cardTemplates";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const card = await prisma.namecard.findFirst({
    where: {
      OR: [{ slug: params.slug }, { id: params.slug }],
    },
  });

  if (!card) {
    return {
      title: "Digital E-Card",
    };
  }

  return {
    title: `${card.fullName} | ${card.title}`,
    description: `${card.fullName} - ${card.position}${
      card.organization ? ` at ${card.organization}` : ""
    }`,
  };
}

export default async function CardSlugPage({ params }: PageProps) {
  const cards = (await prisma.namecard.findMany({
    orderBy: [{ isDefault: "desc" }, { orderIndex: "asc" }, { createdAt: "asc" }],
  })) as unknown as NamecardData[];

  const activeCard = cards.find(
    (c) => c.slug === params.slug || c.id === params.slug
  );

  if (!activeCard) {
    notFound();
  }

  return <ECardClient initialCards={[activeCard]} activeSlug={activeCard.slug} />;
}
