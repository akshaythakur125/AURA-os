import type { Audit } from "@/types/audit";
import type { GoalStrategy, PersonalizationResult } from "@/types/personalization";

export function generateGoalStrategy(
  audit: Audit,
  _personalization: PersonalizationResult
): GoalStrategy {
  void(_personalization);
  const goal = audit.goal;
  const d = audit.deepInput;
  const style = d?.styleIntent;
  const concern = d?.biggestConcern;

  switch (goal) {
    case "dating":
      return {
        goal: "Dating Profile Optimization",
        strategyTitle: "Warm, clear, easy to read",
        whatToOptimize:
          "Go warm and real. The best dating pics are well-lit, focused on your face, and easy to read. A relaxed, natural look beats a posed one every single time.",
        whatToAvoid:
          "Skip heavy filters, busy backgrounds, group pics as your first photo, and over-flexing. Try-hard energy kills the trust instantly.",
        bestNextMove:
          concern === "low_matches"
            ? "Swap your main pic for a well-lit chest-up shot — natural smile, simple background. That's the one that gets the swipe."
            : concern === "weak_photos"
              ? "Fix your lighting and framing before you retake the main pic."
              : "Make your first photo a clear, warm solo shot. Good light, simple background.",
        suggestedPhotoDirection:
          "Chest-up, window light, simple background, relaxed smile, solid neutral top.",
        suggestedStyleDirection:
          "Clean and intentional, not overdone. 'Put together without trying' — solid colours, minimal accessories, good grooming.",
      };

    case "instagram":
      return {
        goal: "Instagram Profile Cohesion",
        strategyTitle: "A feed that screams you",
        whatToOptimize:
          "Make the whole feed feel like one thing. Same colours, same lighting, same framing — that's what makes it look curated instead of random.",
        whatToAvoid:
          "Don't mix random photo quality or bounce between heavy filters and raw shots. A messy mix drags the whole feed down.",
        bestNextMove:
          style === "creator"
            ? "Pick 2-3 signature colours and run them in every post."
            : "Pick one lighting setup (window light or golden hour) and use it for your next 5 posts.",
        suggestedPhotoDirection:
          "Same vertical framing, same light across posts. One preset, on everything.",
        suggestedStyleDirection:
          "Find a signature — a colour, an angle, a background — and repeat it till people know it's you on sight.",
      };

    case "college":
      return {
        goal: "College / University Social Presence",
        strategyTitle: "Relaxed but intentional",
        whatToOptimize:
          "Effortless-but-intentional is the goal. On campus, looking put-together without trying too hard just wins. Good grooming and a clean frame carry you.",
        whatToAvoid:
          "Don't over-formal it or stack accessories. Skip staged shots, messy rooms, and crowded group pics.",
        bestNextMove:
          concern === "looking_average"
            ? "Upgrade your everyday fit to a well-fitted solid tee or shirt — changes how put-together you look instantly."
            : "Clear the clutter behind you before you shoot.",
        suggestedPhotoDirection:
          "Natural, relaxed framing. Campus outdoors or a clean corner with good window light.",
        suggestedStyleDirection:
          "Casual but intentional. Well-fitted basics — solid tees, clean sneakers, a simple jacket — read confident with zero effort.",
      };

    case "office":
      return {
        goal: "Professional / LinkedIn Presentation",
        strategyTitle: "Clean, mature, reliable",
        whatToOptimize:
          "Keep it understated and pro. Neutral colours, clean background, even light = reliable and prepared. Every detail should say you've got it handled.",
        whatToAvoid:
          "Skip loud colours, busy backgrounds, casual outfit stuff, and heavy filters. No selfie angles — look at the camera.",
        bestNextMove:
          concern === "weak_photos"
            ? "Retake with a solid neutral background (white or grey) and even light on your face."
            : "Swap your pic for a well-lit, neutral-background shot in proper clothes.",
        suggestedPhotoDirection:
          "Chest-up, solid neutral background, even front light, chill expression with a slight smile.",
        suggestedStyleDirection:
          "Solid, well-fitted shirt or blazer in neutral tones. Minimal accessories, clean grooming. Less is more here.",
      };

    case "linkedin":
      return {
        goal: "LinkedIn / Professional Branding",
        strategyTitle: "Approachable and competent",
        whatToOptimize: "Polished but not stiff. Clean background, good light, a real expression — that combo makes you look approachable AND professional.",
        whatToAvoid: "No mirror selfies, vacation pics, or group shots. Nothing you'd cringe showing a recruiter. Skip the heavy filters.",
        bestNextMove: "Retake with a solid background (white, grey, or blurred office) and even front light. Solid neutral top.",
        suggestedPhotoDirection: "Chest-up, solid background, even light, slight smile. The classic headshot works for a reason.",
        suggestedStyleDirection: "Solid shirt or blazer, neutral tones. Minimal jewellery, clean grooming. One look that says you've got your life together.",
      };

    case "content":
      return {
        goal: "Content Creator / Influencer",
        strategyTitle: "A look people clock instantly",
        whatToOptimize: "Pick a look and stick to it. Same colours, same lighting, same framing — till people know it's your content before they even see your name.",
        whatToAvoid: "Don't chase every trend or switch up your style every post. Consistency beats going viral once.",
        bestNextMove: "Pick 2-3 colours that suit you and use them in every post. Consistency over perfection.",
        suggestedPhotoDirection: "Find your signature angle and lighting, then use it on everything. People should clock your content instantly.",
        suggestedStyleDirection: "Build a look with colour, texture, and a few recurring elements. Outfit, background, editing — all should feel like they belong together.",
      };

    case "festival":
      return {
        goal: "Festival / Party Look",
        strategyTitle: "Bold and memorable",
        whatToOptimize: "Go for impact. Parties are about standing out — bold colour, confident posing, and decent light (even phone flash) make a way stronger shot.",
        whatToAvoid: "Skip washed-out colours, blurry shots, and dark backgrounds where you disappear. Don't over-accessorize — one statement piece, not five.",
        bestNextMove: "Wear one bold-colour piece and stand near a light. Get someone to shoot from slightly above eye level.",
        suggestedPhotoDirection: "Eye-level or slightly above, good light on your face, bold outfit as the anchor. Portrait mode if you've got it.",
        suggestedStyleDirection: "One statement piece — bold colour, cool texture, standout accessory — with simple basics. Let one thing be the star.",
      };

    case "travel":
      return {
        goal: "Travel / Adventure",
        strategyTitle: "Real and vivid",
        whatToOptimize: "Tell a story. Travel shots hit when they feel real — natural light, clean composition, genuine expression. The place is the backdrop; you're the main character.",
        whatToAvoid: "Don't pose stiff in front of landmarks. Skip dark, blurry, or over-filtered shots that kill the natural beauty.",
        bestNextMove: "Use natural light (golden hour is unreal). Stand a bit off-center. Let the place breathe around you.",
        suggestedPhotoDirection: "Wide enough to show where you are, close enough to see your face. Natural light, real moment.",
        suggestedStyleDirection: "Dress for the place — practical but intentional. Colours that suit the surroundings. Comfy doesn't mean sloppy.",
      };

    case "confidence":
      return {
        goal: "Confidence / Self-Image",
        strategyTitle: "The best version of you",
        whatToOptimize: "Do this for how YOU wanna feel, not to impress anyone. Show up the way you see yourself at your best — good light, clean frame, real expression.",
        whatToAvoid: "Don't compare yourself to anyone. Don't over-edit into someone you're not. The goal is the best YOU, not a different person.",
        bestNextMove: "Take 10 shots with different expressions. Pick the one that looks most like you — not the most 'perfect' one.",
        suggestedPhotoDirection: "Natural light, simple background, real expression. Try a few angles, keep what feels like you.",
        suggestedStyleDirection: "Wear what makes you feel most like you. Confidence comes from comfort and being real, not from trends.",
      };

    case "glowup":
    default:
      return {
        goal: "Overall Glow-Up / Personal Upgrade",
        strategyTitle: "Basics first, then build",
        whatToOptimize:
          "Get the basics locked. A glow-up works best when you fix lighting, grooming, and background before spending on accessories or big changes.",
        whatToAvoid:
          "Don't drop money on expensive stuff before the lighting and background are sorted. Don't switch up everything at once — one area a week.",
        bestNextMove:
          concern === "grooming_issue"
            ? "Book a grooming session (haircut, brows, skin). Highest-payoff first move."
            : concern === "background_issue"
              ? "Clean up your go-to photo background. Free, and it upgrades every photo you take there."
              : "Sort your lighting — window light or a cheap ring light. This one change improves every single photo.",
        suggestedPhotoDirection:
          "Start with well-lit, clean-background shots. Once the basics are solid, play with different settings.",
        suggestedStyleDirection:
          "Build a small set of well-fitted basics first, then add a statement piece or two. Grooming before accessories.",
      };
  }
}
