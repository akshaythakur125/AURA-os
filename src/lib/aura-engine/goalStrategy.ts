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
        strategyTitle: "Warmth, clarity, and approachability",
        whatToOptimize:
          "Optimize for warmth and authenticity. Dating profile photos perform best when they feel genuine, well-lit, and focused on your face. A clear, friendly expression signals confidence without arrogance.",
        whatToAvoid:
          "Avoid heavy filters, cluttered backgrounds, group photos as primary, and too many status props. Over-edited or try-hard photos reduce trust signals significantly.",
        bestNextMove:
          concern === "low_matches"
            ? "Replace your primary photo with a well-lit chest-up shot with natural smile and simple background."
            : concern === "weak_photos"
              ? "Improve lighting and framing before retaking your main profile photo."
              : "Ensure your first photo is a clear, warm, solo shot with good lighting and minimal background.",
        suggestedPhotoDirection:
          "Use a chest-up frame with natural window light, simple background, relaxed smile, and solid neutral-colored top.",
        suggestedStyleDirection:
          "Clean, intentional, but not overly styled. Aim for 'put together without trying too hard' — solid colors, minimal accessories, good grooming.",
      };

    case "instagram":
      return {
        goal: "Instagram Profile Cohesion",
        strategyTitle: "Visual consistency and identity",
        whatToOptimize:
          "Optimize for visual consistency across your feed. A cohesive color palette, repeatable lighting style, and intentional framing make your profile feel curated and premium.",
        whatToAvoid:
          "Avoid mixing random photo qualities, jumping between heavy filters and natural shots, or posting inconsistent background styles. Visual noise weakens your feed identity.",
        bestNextMove:
          style === "creator"
            ? "Establish 2-3 signature color tones and stick with them across all posts."
            : "Pick a lighting setup (natural window light or golden hour) and use it consistently for your next 5 posts.",
        suggestedPhotoDirection:
          "Consistent vertical framing with similar lighting conditions across posts. Use one editing preset and apply it uniformly.",
        suggestedStyleDirection:
          "Define a personal style signature — it can be colors, angles, or a recurring background element. Repeat it enough to become recognizable.",
      };

    case "college":
      return {
        goal: "College / University Social Presence",
        strategyTitle: "Relaxed intentionality",
        whatToOptimize:
          "Optimize for authentic but intentional presentation. College settings reward being put-together without looking like you tried too hard. Good grooming and clean framing set you apart naturally.",
        whatToAvoid:
          "Avoid overly formal styling, excessive accessories, or backgrounds that look staged. Also avoid messy dorm rooms or overcrowded group shots.",
        bestNextMove:
          concern === "looking_average"
            ? "Upgrade your daily outfit to a well-fitted solid-color tee or shirt — it changes how put-together you look instantly."
            : "Improve your room background by clearing visible clutter before taking photos.",
        suggestedPhotoDirection:
          "Natural, relaxed framing. Outdoor campus shots or clean indoor corners with good window light work best.",
        suggestedStyleDirection:
          "Casual but intentional. Well-fitted basics (solid tees, clean sneakers, simple jacket) read as confident without trying too hard.",
      };

    case "office":
      return {
        goal: "Professional / LinkedIn Presentation",
        strategyTitle: "Clean, mature, reliable",
        whatToOptimize:
          "Optimize for understated professionalism. Neutral colors, clean backgrounds, and even lighting signal reliability and maturity. Every detail should communicate that you are intentional and prepared.",
        whatToAvoid:
          "Avoid loud colors, busy backgrounds, casual outfit details, extreme filters, or casual selfie-style framing. Maintain eye contact with the camera.",
        bestNextMove:
          concern === "weak_photos"
            ? "Retake your profile photo with a solid neutral background (white or grey) and even frontal lighting."
            : "Replace your current profile photo with a well-lit, neutral-background shot in professional attire.",
        suggestedPhotoDirection:
          "Chest-up frame, solid neutral background, even lighting from the front or slightly angled, neutral expression with slight smile.",
        suggestedStyleDirection:
          "Solid well-fitted shirt or blazer in neutral tones. Minimal accessories. Clean, polished grooming. Less is more in professional contexts.",
      };

    case "linkedin":
      return {
        goal: "LinkedIn / Professional Branding",
        strategyTitle: "Executive presence, digital-first",
        whatToOptimize: "Optimize for trust and competence. LinkedIn photos should feel polished but not stiff. Clean background, good lighting, and a genuine expression signal that you're approachable and professional.",
        whatToAvoid: "Avoid mirror selfies, vacation photos, group shots, or anything you'd be embarrassed to show a recruiter. No heavy filters or cropping from casual photos.",
        bestNextMove: "Retake with a solid background (white, grey, or blurred office) and even front lighting. Wear a solid neutral top.",
        suggestedPhotoDirection: "Chest-up, solid background, even lighting, slight smile. The standard LinkedIn headshot formula works for a reason.",
        suggestedStyleDirection: "Solid shirt or blazer in neutral tones. Minimal jewelry. Clean grooming. One look that says 'I have my life together.'",
      };

    case "content":
      return {
        goal: "Content Creator / Influencer",
        strategyTitle: "Signature visual identity",
        whatToOptimize: "Optimize for recognizability. Your visual style IS your brand. Pick a color palette, lighting style, and framing approach — then repeat it until people recognize your content before seeing your name.",
        whatToAvoid: "Don't copy trending aesthetics that don't suit you. Avoid inconsistent quality between posts. Don't sacrifice your visual identity for virality.",
        bestNextMove: "Pick 2-3 colors that complement your skin tone and use them in every post. Consistency beats perfection.",
        suggestedPhotoDirection: "Find your signature angle and lighting setup. Use it for everything. People should recognize your content instantly.",
        suggestedStyleDirection: "Build a visual identity through color, texture, and recurring elements. Your outfit, background, and editing style should all feel like they belong together.",
      };

    case "festival":
      return {
        goal: "Festival / Party Look",
        strategyTitle: "Bold, photogenic, memorable",
        whatToOptimize: "Optimize for impact. Festivals and parties are about standing out — bold colors, confident posing, and good lighting (even phone flash) make a stronger visual impression.",
        whatToAvoid: "Avoid washed-out colors, blurry shots, or dark backgrounds where you disappear. Also avoid over-accessorizing — one statement piece, not five.",
        bestNextMove: "Wear one bold-color piece and stand near a light source. Ask someone to take the photo from slightly above eye level.",
        suggestedPhotoDirection: "Eye-level or slightly above, good lighting on your face, bold outfit as the visual anchor. Use portrait mode if available.",
        suggestedStyleDirection: "One statement piece (bold color, unique texture, or standout accessory) paired with simpler basics. Let one thing be the star.",
      };

    case "travel":
      return {
        goal: "Travel / Adventure",
        strategyTitle: "Authentic, vivid, story-telling",
        whatToOptimize: "Optimize for storytelling. Travel photos should feel authentic and vivid — good natural light, clean composition, and genuine expression. The location is the backdrop, you're the story.",
        whatToAvoid: "Don't pose stiffly in front of landmarks. Avoid dark, blurry, or over-filtered shots that lose the natural beauty of the location.",
        bestNextMove: "Use natural light (golden hour is magic). Stand slightly off-center. Let the location breathe around you.",
        suggestedPhotoDirection: "Wide enough to show context, close enough to see your expression. Natural light, genuine moment.",
        suggestedStyleDirection: "Dress for the location — practical but intentional. Colors that complement the environment. Comfortable doesn't have to mean sloppy.",
      };

    case "confidence":
      return {
        goal: "Confidence / Self-Image",
        strategyTitle: "Authentic self-presentation",
        whatToOptimize: "Optimize for how you want to feel. This isn't about impressing others — it's about presenting yourself in a way that matches how you see yourself at your best. Good lighting, clean framing, genuine expression.",
        whatToAvoid: "Don't compare yourself to others. Avoid over-editing to look like someone you're not. The goal is the best version of YOU, not a different person.",
        bestNextMove: "Take 10 photos with different expressions. Pick the one where you look most like yourself — not the most 'perfect' one.",
        suggestedPhotoDirection: "Natural light, simple background, genuine expression. Shoot multiple angles and pick what feels most like you.",
        suggestedStyleDirection: "Wear what makes you feel most like yourself. Confidence comes from comfort and authenticity, not from following trends.",
      };

    case "glowup":
    default:
      return {
        goal: "Overall Glow-Up / Personal Upgrade",
        strategyTitle: "Fundamentals first, then build up",
        whatToOptimize:
          "Optimize overall presentation consistency. A glow-up works best when you fix the basics (lighting, grooming, background) before spending on accessories or expensive changes.",
        whatToAvoid:
          "Avoid buying expensive items before fixing lighting and background basics. Avoid trying to change everything at once — focus on one area per week.",
        bestNextMove:
          concern === "grooming_issue"
            ? "Book a grooming session (haircut, brows, skin) — this is the highest-ROI first step."
            : concern === "background_issue"
              ? "Clear and simplify your most-used photo background. This is free and changes every photo you take there."
              : "Improve your lighting setup — natural window light or a simple ring light. This single change affects every photo.",
        suggestedPhotoDirection:
          "Start with well-lit, clean-background photos. Once basics are solid, experiment with different settings and styles.",
        suggestedStyleDirection:
          "Build a small capsule wardrobe of well-fitted basics first. Then add one or two statement pieces. Upgrade grooming before upgrading accessories.",
      };
  }
}
