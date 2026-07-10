import type { Metadata } from "next";
import { getChallengeBySlug } from "@/config/challenges";
import ChallengeDetailPage from "./ClientPage";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const challenge = getChallengeBySlug(slug);

  if (!challenge) {
    return {
      title: "Challenge Not Found — AuraCheck",
      description: "This challenge could not be found.",
    };
  }

  return {
    title: `${challenge.title} — Aura Challenge`,
    description:
      challenge.description ||
      `Complete the ${challenge.title} challenge to upgrade your visual signal. Track your streak and earn rewards.`,
    openGraph: {
      title: `${challenge.title} — AuraCheck Challenge`,
      description:
        challenge.description ||
        `Complete this challenge to build your streak and earn rewards.`,
      images: [
        {
          url: `/api/og?category=${encodeURIComponent(challenge.title)}&leak=Complete+this+challenge`,
          width: 1200,
          height: 630,
          alt: `${challenge.title} — AuraCheck Challenge`,
        },
      ],
      type: "website",
    },
  };
}

export default async function Page({ params }: Props) {
  await params;
  return <ChallengeDetailPage />;
}
