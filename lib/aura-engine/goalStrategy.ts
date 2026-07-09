import type { Audit } from "@/types";
import type { PersonalizationResult } from "@/types/personalization";

export function generateGoalStrategy(audit: Audit, personalization: PersonalizationResult): string {
  const goal = audit.goal;
  const archetype = personalization.archetype;
  const tone = personalization.tonePreference === "direct" ? "" : "consider ";

  const strategies: Record<string, string[]> = {
    dating: [
      "Optimize for warmth and approachability — smiling naturally and making eye contact with the camera creates connection.",
      `${tone}avoiding heavy filters and cluttered backgrounds — they reduce trust signals.`,
      "One visible signal per photo is enough — multiple status props can feel intimidating in dating contexts.",
      "Consistency across all photos matters — if one photo is premium and another is low-effort, the mismatch weakens trust.",
      "Clarity and natural lighting are the highest-ROI upgrades for dating profile photos.",
    ],
    instagram: [
      "Consistency is the most important signal on Instagram — a cohesive color palette and repeating visual style builds recognition.",
      `${tone}avoiding random styles — every post should feel like it belongs to the same person.`,
      "Quality over quantity — one well-composed photo per week signals intentionality better than daily low-effort posts.",
      "Clean backgrounds and good lighting create a premium feed aesthetic without expensive equipment.",
      "Your profile grid is your first impression — the top 6 photos should tell a coherent story.",
    ],
    college: [
      `${tone}balancing authenticity with intentionality — college photos can be relaxed but should still show effort.`,
      "Grooming and basic styling go a long way in campus settings where most people put in minimal effort.",
      "Background control matters even in casual settings — a messy hostel room or cluttered desk distracts from you.",
      "A well-fitted basic outfit (solid t-shirt, clean shoes) outperforms expensive but poorly coordinated looks.",
      "Natural light and a clean phone lens are free upgrades that work anywhere on campus.",
    ],
    office: [
      "Clean, mature, and reliable presentation creates the strongest professional first impression.",
      `${tone}avoiding loud status signaling — in professional contexts, understated quality reads as more confident than visible branding.`,
      "Grooming and fit matter more than brand names — a well-fitted shirt signals attention to detail.",
      "Background should be neutral and uncluttered — bookshelves or plain walls work well for professional profiles.",
      "Consistency across LinkedIn, email, and team photos builds a reliable personal brand.",
    ],
    glowup: [
      "Start with the highest-ROI changes first: lighting, grooming, and background control.",
      `${tone}avoiding expensive purchases before fixing the basics — a premium outfit looks weak against a bad background.`,
      "Build a consistent routine: weekly progress photos help track what is working.",
      "Target one area at a time — trying to change everything at once leads to inconsistent results.",
      "The glow-up is about intentionality, not perfection. Small consistent improvements compound over time.",
    ],
  };

  const goalText = strategies[goal] || strategies.glowup;
  const archetypeNote = getArchetypeStrategyNote(archetype, tone);

  return [...goalText, archetypeNote].join(" ");
}

function getArchetypeStrategyNote(archetype: string, tone: string): string {
  const notes: Record<string, string> = {
    "Clean Basic": `${tone}adding one intentional style element per photo — it is enough to elevate the presentation without losing the clean vibe.`,
    "Urban Aspirational": `${tone}making sure the visual fundamentals (lighting, clarity, background) are strong enough to support the lifestyle signals.`,
    "Premium Minimalist": `Maintain consistency across all photos — this archetype works best when every frame feels intentional.`,
    "Loud Flex": `${tone}reducing the number of visible signals per photo — one strong signal is more memorable than five competing ones.`,
    "Soft Luxury": `Your current presentation is strong — focus on subtle refinements and consistency across all contexts.`,
    "Creator Vibe": `Invest in technical quality to match the creative intent — good lighting turns good concepts into great content.`,
    "College Casual": `${tone}adding one upgrade — better lighting or a structured outfit — without losing the authentic casual feel.`,
    "Corporate Sharp": `Your professional signal is strong. Ensure it translates across photos, video calls, and in-person settings.`,
    "Try-Hard Signal": `${tone}subtracting one element per frame — removing is more powerful than adding when the goal is to look effortless.`,
    "Mismatched Flex": `Fix background and lighting first — once the basics are solid, the same status signals will land much more effectively.`,
    "Low-Clarity Potential": `Technical quality is the priority — improving lighting and sharpness will unlock the underlying presentation signal.`,
  };
  return notes[archetype] || "";
}

export function generateGoalStrategyTitle(audit: Audit): string {
  const titles: Record<string, string> = {
    dating: "Dating Profile Strategy",
    instagram: "Instagram Feed Strategy",
    college: "College Presence Strategy",
    office: "Professional Profile Strategy",
    glowup: "Glow-Up Strategy",
  };
  return titles[audit.goal] || "Presentation Strategy";
}
