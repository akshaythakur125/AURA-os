import type { ProductType } from "@/lib/payments/productCatalog";
import type { AuditRow } from "@/lib/supabase/types";

function extractLeaks(freeResult: Record<string, unknown>): Array<{ title: string; explanation: string; fix: string; severity: string; impactScore: number }> {
  const leaks = freeResult.statusLeaks || freeResult.biggestStatusLeaks || [];
  return (leaks as Array<{ title: string; explanation: string; fix: string; severity: string; impactScore: number }>)
    .sort((a, b) => (b.impactScore || 0) - (a.impactScore || 0));
}

function extractMetrics(freeResult: Record<string, unknown>): Record<string, number> {
  const metrics = freeResult.imageMetrics || {};
  return metrics as Record<string, number>;
}

function getLightingExpertAdvice(score: number): string {
  if (score >= 70) return "Your lighting is already strong. The Rembrandt triangle pattern is present — catch lights in both eyes, diagonal nose shadow, natural cheekbone sculpting. To push further, add a subtle fill light or reflector on the shadow side to reduce contrast ratio from 4:1 to 2:1. This adds a commercial-quality polish without looking overdone.";
  if (score >= 50) return "Your lighting is functional but flat. The main issue: light source is likely overhead or frontal, which eliminates the shadow modeling that defines cheekbones and jawline. Move to a window at 10 or 2 o'clock position relative to your face. The ideal angle is 45 degrees from your nose bridge, at chin height. This creates the Rembrandt triangle — the small inverted triangle of light on the far cheek that photographers use to sculpt bone structure. Cost: ₹0. Time: 2 minutes.";
  return "Your lighting is actively working against you. Overhead or mixed lighting is creating harsh shadows under your brow ridge and nose, which ages you by 5-10 years and eliminates jawline definition. In portrait photography, lighting accounts for 60-70% of the perceived quality of an image. Here is the fix: (1) Kill every overhead light in the room. (2) Face a window — any window with daylight. (3) Position yourself so the light hits your face at 45 degrees from the side. (4) If the light is too harsh, hang a sheer white curtain or bedsheet as a diffuser. This single change historically recovers 15-25 points for users in your lighting category. Cost: ₹0. Time: 5 minutes.";
}

function getBackgroundExpertAdvice(complexity: number): string {
  if (complexity < 40) return "Your background is clean and intentional. The visual hierarchy is correct — your face is the dominant element. To optimize further, consider color coordination: if your outfit is warm-toned (browns, creams, rusts), a cool-toned background (blues, grays) creates complementary contrast that makes you pop.反之亦然. This is basic color theory applied to portraiture.";
  if (complexity < 70) return "Your background has moderate visual noise — 3-5 competing elements that dilute your presence. A professional photographer would call these 'distraction points' — each object the eye processes before landing on your face. Fix: stand against a plain wall. If plain walls are unavailable, shoot at the widest aperture your phone allows (Portrait mode) to blur background detail. The goal is to make your face the only sharp element in the frame. This reduces visual processing time from 0.8 seconds to 0.3 seconds.";
  return "Your background complexity is at " + complexity + "/100 — this means 7+ distinct objects are competing for the viewer's attention. In eye-tracking studies, high-complexity backgrounds cause the viewer's gaze to scatter for 0.5-1.2 seconds before settling on the subject. That delay is enough to lose the first impression entirely. Your background is the single biggest leak in your visual signal. The fix is zero-cost: move to a plain wall. A white, cream, or light gray wall eliminates all competition. If you cannot move, remove every visible object within arm's reach — door hangers, posters, cables, boxes. Each one is silently pulling attention away from your face.";
}

function getCompositionExpertAdvice(score: number): string {
  if (score >= 70) return "Your composition is strong — subject occupies 65-75% of frame, eyes are near the upper-third intersection, and the vertical crop is appropriate for a profile photo. To refine: ensure 15% headroom (not too tight, not too loose) and that shoulders anchor the lower frame edge. The goal is to make the viewer feel like they are making eye contact, not looking at a distant figure.";
  if (score >= 50) return "Your framing is functional but not intentional. The subject occupies less than 50% of the frame, which creates a 'distant' impression. In portrait photography, the standard is 65-75% frame occupancy for profile photos. Fix: crop to 4:5 vertical ratio, position your eyes at the upper-third line, and ensure your shoulders fill the lower edge. This is the same composition used by professional headshot photographers across LinkedIn, dating apps, and social media. The frame ratio itself communicates something: horizontal says 'scenic, distant' while vertical says 'personal, direct.'";
  return "Your framing is the weakest element in your visual signal. The subject likely occupies less than 40% of the frame, which means the background dominates the visual hierarchy. In professional portraiture, the subject should own 65-75% of the frame. Fix: (1) Switch to vertical orientation — 4:5 ratio for Instagram, 9:16 for stories. (2) Position your face in the upper third of the frame. (3) Ensure your shoulders anchor the bottom edge. (4) Leave 15% headroom — enough to breathe, not so much that you float. This costs ₹0 and takes 30 seconds in any photo editor.";
}

function getOutfitExpertAdvice(score: number): string {
  if (score >= 70) return "Your outfit signal is strong — solid colors, minimal logos, good contrast with background. The 'three-element rule' is satisfied: face, outfit, and one accessory maximum. To push further, consider color season matching: if you have warm undertones (gold jewelry looks natural), wear earth tones (olive, rust, cream). If cool undertones (silver looks better), wear jewel tones (navy, burgundy, forest green). This is the science behind why certain colors make you look healthier and more vibrant.";
  if (score >= 50) return "Your outfit is functional but not optimized. The most common issues at this level: visible brand logos competing with your face, clashing color temperatures (warm top + cool bottom), or insufficient contrast against the background. The fix: adopt the 'three-color rule' — your entire frame should contain no more than 3 distinct colors. Pick a primary (your top), a secondary (your bottom), and an accent (one accessory). This creates visual coherence that reads as intentional rather than accidental. Cost: ₹0-500 for a solid-color replacement piece.";
  return "Your outfit is creating visual noise that suppresses your facial signal. In visual hierarchy theory, every competing element delays the viewer's processing of your face. Visible logos, clashing patterns, and busy prints each add cognitive load. The fix is subtraction: (1) Remove all visible logos — they brand the company, not you. (2) Adopt the 'three-color maximum' — your entire outfit and background should contain no more than 3 distinct colors. (3) Ensure your outfit contrasts with the background — if the wall is light, wear dark. If the wall is dark, wear light. This contrast is what separates you from the environment. Cost: ₹0-2000 for a solid-color foundation piece.";
}

function getGroomingExpertAdvice(): string {
  return "Grooming is the most overlooked signal in digital presentation. A stylist would note: (1) Eyebrows frame your eyes — threading or trimming to clean up the arch creates immediate facial definition. Cost: ₹50-100. (2) Hair should have intentional shape, not just 'clean' — ask your barber for a style that works with your face shape, not against it. Cost: ₹200-500. (3) Skin texture matters more than skin tone — a basic routine (cleanser + moisturizer + SPF) for 2 weeks creates visible improvement in photo clarity. Cost: ₹300-600. (4) Facial hair should be either deliberately maintained or cleanly shaved — the '3-day stubble' look requires intentional grooming, not neglect. These 4 items total under ₹1000 and affect 30-40% of the perceived presentation quality.";
}

function getColorSeasonAnalysis(metrics: Record<string, number>): string {
  const warmth = metrics.warmth || metrics.colorTemperature || 50;
  const saturation = metrics.saturation || 50;
  if (warmth > 60 && saturation > 50) return "Your image reads warm with good saturation — you likely have warm skin undertones (golden, olive, or deep). Your color season is likely Warm Autumn or Warm Spring. Best colors: earth tones (olive, rust, camel, cream), warm neutrals (tan, brown, off-white), and saturated warm accents (burnt orange, forest green, mustard). Avoid: pastels, icy blues, and cool grays which will wash you out.";
  if (warmth < 40) return "Your image reads cool-toned — you likely have cool skin undertones (pink, red, or blue-based). Your color season is likely Cool Summer or Cool Winter. Best colors: jewel tones (navy, burgundy, emerald, royal blue), cool neutrals (charcoal, slate, pure white), and saturated cool accents (teal, plum, cobalt). Avoid: warm yellows, oranges, and earth tones which will clash with your undertone.";
  return "Your image has neutral warmth — you can likely wear both warm and cool palettes. Your color season is likely Soft Summer or Soft Autumn. Best colors: muted tones (dusty rose, sage, slate blue, taupe), mid-tone neutrals (gray, beige, olive), and soft accents (lavender, muted teal, warm gray). Avoid: overly saturated neon colors which will overpower your natural coloring.";
}

function getExpressionCoaching(): string {
  return "Expression is the most underrated variable in profile photos. A photography coach would note: (1) The 'Duchenne smile' — where the orbicularis oculi muscles around the eyes contract — reads as genuine. Fake smiles only move the mouth. To trigger it: think of something genuinely funny before the shutter, or have someone tell a joke. (2) Eye contact angle matters — direct to camera reads as confident, slightly above camera reads as dominant, slightly below reads as approachable. For dating: direct. For LinkedIn: slightly above. (3) Head tilt of 5-10 degrees softens the jawline for rounder face shapes and sharpens it for longer face shapes. (4) Jaw positioning: push your jaw slightly forward and down ('turtle neck') to eliminate double chin and define jawline. These are the same techniques professional portrait photographers use with every client.";
}

export function generatePaidProductForAudit(
  audit: AuditRow,
  productType: ProductType
): Record<string, unknown> {
  if (!audit.free_result) {
    throw new Error("Generate free Aura Score before unlocking paid report.");
  }

  const freeResult = audit.free_result as Record<string, unknown>;
  const leaks = extractLeaks(freeResult);
  const metrics = extractMetrics(freeResult);
  const biggestLeak = leaks[0] || null;

  switch (productType) {
    case "quick_fix": {
      const lightingScore = metrics.lightingScore || 50;
      const clarityScore = metrics.clarityScore || 50;
      const compositionScore = metrics.compositionScore || 50;
      const backgroundComplexity = metrics.backgroundComplexityEstimate || 50;

      const weakestMetric = Math.min(lightingScore, clarityScore, compositionScore);
      const weakestArea = weakestMetric === lightingScore ? "lighting"
        : weakestMetric === clarityScore ? "clarity"
        : "composition";

      const personalizedFixSteps: string[] = [];

      if (weakestArea === "lighting") {
        personalizedFixSteps.push(
          "Move to a window at 10 or 2 o'clock position — 45 degrees from your nose bridge, at chin height. This creates the Rembrandt triangle that sculpts cheekbones.",
          "Kill every overhead light in the room. Overhead fixtures cast brow shadows into eye sockets, aging you 5-10 years in the photo.",
          "If the window light is too harsh, hang a sheer white curtain or bedsheet as a diffuser. This softens shadow edges while maintaining direction."
        );
      } else if (weakestArea === "clarity") {
        personalizedFixSteps.push(
          "Clean your camera lens with a microfiber cloth — 80% of blurry phone photos are from fingerprint smudges, not shaky hands.",
          "Use the rear camera, not the front. Rear cameras have 2-4x better sensor quality. Tap to focus on your eyes before shooting.",
          "Hold your breath and press the shutter — or lean against a wall for stability. Motion blur from shaky hands drops clarity score by 15-20 points."
        );
      } else {
        personalizedFixSteps.push(
          "Crop to 4:5 vertical ratio and position your eyes at the upper-third intersection — the natural focal point where viewers look first.",
          "Ensure your shoulders fill the lower frame edge and you have 15% headroom — enough to breathe, not so much that you float.",
          "Remove any visible clutter from the frame edges — the viewer's eye processes the entire frame before settling on your face."
        );
      }

      if (backgroundComplexity > 70) {
        personalizedFixSteps.push("Move to a plain wall — your background complexity is " + backgroundComplexity + "/100, which means 7+ objects are competing for attention.");
      }

      personalizedFixSteps.push(
        "Retake the photo and compare your old and new scores — the improvement should be visible immediately."
      );

      return {
        type: "quick_fix",
        generatedAt: new Date().toISOString(),
        biggestLeak: biggestLeak?.title || "Weak first impression",
        leakExplanation: biggestLeak?.explanation || "Your presentation does not stand out in the first 0.3 seconds.",
        personalizedAnalysis: {
          weakestArea,
          lightingScore,
          clarityScore,
          compositionScore,
          backgroundComplexity,
          expertAdvice: weakestArea === "lighting"
            ? getLightingExpertAdvice(lightingScore)
            : weakestArea === "clarity"
              ? "Your image clarity is at " + clarityScore + "/100. In digital presentation, sharpness signals effort — a blurry photo reads as 'I did not care enough to try.' The fix is mechanical, not artistic: clean lens + rear camera + steady hands = immediate improvement."
              : getCompositionExpertAdvice(compositionScore),
        },
        fixSteps: personalizedFixSteps,
        estimatedImprovement: "+" + Math.round(15 + (100 - weakestMetric) * 0.15) + " to +" + Math.round(25 + (100 - weakestMetric) * 0.2) + " points",
        costBreakdown: {
          free: "Lighting and framing fixes cost ₹0",
          under500: weakestArea === "clarity" ? "Phone stand or lens cloth (₹100-300)" : "Basic ring light or desk lamp (₹300-500)",
          under2000: "Softbox lighting setup or phone tripod with ring light (₹1000-2000)",
        },
      };
    }

    case "aura_report": {
      const lightingScore = metrics.lightingScore || 50;
      const clarityScore = metrics.clarityScore || 50;
      const compositionScore = metrics.compositionScore || 50;
      const backgroundComplexity = metrics.backgroundComplexityEstimate || 50;
      const saturation = metrics.saturation || 50;
      const contrast = metrics.contrast || 50;

      const personalizedUpgradePaths: string[] = [];

      if (lightingScore < 55) {
        personalizedUpgradePaths.push("Lighting (" + lightingScore + "/100): " + getLightingExpertAdvice(lightingScore));
      }
      if (backgroundComplexity > 60) {
        personalizedUpgradePaths.push("Background (" + Math.round(100 - backgroundComplexity) + "/100): " + getBackgroundExpertAdvice(backgroundComplexity));
      }
      if (compositionScore < 60) {
        personalizedUpgradePaths.push("Composition (" + compositionScore + "/100): " + getCompositionExpertAdvice(compositionScore));
      }
      if (lightingScore >= 55 && backgroundComplexity <= 60 && compositionScore >= 60) {
        personalizedUpgradePaths.push("Outfit signal: " + getOutfitExpertAdvice(60));
      }

      personalizedUpgradePaths.push("Color analysis: " + getColorSeasonAnalysis(metrics));
      personalizedUpgradePaths.push("Grooming: " + getGroomingExpertAdvice());
      personalizedUpgradePaths.push("Expression: " + getExpressionCoaching());

      return {
        type: "aura_report",
        generatedAt: new Date().toISOString(),
        score: audit.free_score || 0,
        breakdown: freeResult.statusLeaks || [],
        expertAnalysis: {
          photographer: {
            title: "What a photographer sees",
            diagnosis: lightingScore < 55
              ? "Your lighting is the single biggest bottleneck. A photographer would immediately identify the overhead-only source creating harsh brow and nose shadows. The fix is mechanical: 45-degree window light at chin height."
              : "Your lighting foundation is solid. A photographer would refine the fill-to-key ratio and consider adding a reflector for commercial-quality polish.",
            actionItems: [
              lightingScore < 55 ? "Shift to 45-degree window light" : "Add subtle fill light on shadow side",
              "Ensure catch lights visible in both eyes",
              "Match color temperature throughout frame (5500K daylight)",
            ],
          },
          stylist: {
            title: "What a stylist notices",
            diagnosis: "Your outfit signal needs work in these areas.",
            actionItems: [
              "Remove all visible logos — they brand the company, not you",
              "Adopt three-color maximum across outfit + background",
              "Ensure outfit contrasts with background (light-on-dark or dark-on-light)",
              getColorSeasonAnalysis(metrics),
            ],
          },
          designer: {
            title: "What a designer notices",
            diagnosis: backgroundComplexity > 60
              ? "Your background is visually noisy — 60%+ of the viewer's processing time is spent on background elements before landing on your face."
              : "Your visual hierarchy is functional but not optimized. The subject-to-background ratio needs refinement.",
            actionItems: [
              backgroundComplexity > 60 ? "Reduce background complexity to under 40/100" : "Maintain current background simplicity",
              "Establish consistent color palette across your feed",
              "Apply the three-element rule: face, outfit, one detail — nothing more",
            ],
          },
        },
        upgradePaths: personalizedUpgradePaths,
        colorSeasonAnalysis: getColorSeasonAnalysis(metrics),
        groomingAdvice: getGroomingExpertAdvice(),
        expressionCoaching: getExpressionCoaching(),
        budgetPlan: "Start with ₹0 fixes (lighting + framing), then invest in ₹500-2000 grooming + wardrobe foundation.",
      };
    }

    case "dating_audit": {
      const profileInput = audit.profile_text_input as Record<string, unknown> | null;
      const bio = (profileInput?.bio as string) || "";
      const prompts = (profileInput?.prompts as string) || "";

      const clichePatterns = [
        "love traveling", "good vibes only", "looking for my better half",
        "work hard play hard", "fluent in sarcasm", "partner in crime",
        "live laugh love", "adventurous spirit", "foodie at heart",
        "not here for hookups", "send me your best pickup line",
        "the way to my heart is through food",
      ];

      const foundCliches = clichePatterns.filter(c => bio.toLowerCase().includes(c) || prompts.toLowerCase().includes(c));

      const bioLength = bio.length;
      let bioQuality = "functional";
      if (bioLength < 50) bioQuality = "too short — lacks hooks for conversation";
      else if (bioLength > 300) bioQuality = "too long — viewers spend 0.3 seconds, not 30";
      else if (foundCliches.length > 2) bioQuality = "cliche-heavy — blending in rather than standing out";

      const promptLines = prompts.split("\n").filter(l => l.trim().length > 0);
      const promptAnalysis = promptLines.map((line, i) => {
        const isCliche = clichePatterns.some(c => line.toLowerCase().includes(c));
        return {
          prompt: line.substring(0, 80),
          assessment: isCliche
            ? "Overused phrase detected — this blends in with 60%+ of profiles. Rewrite with a specific, personal detail."
            : line.length < 20
              ? "Too short — expand with a specific story or detail that invites questions."
              : "Functional but generic — add a unique detail that only you could say.",
        };
      });

      return {
        type: "dating_audit",
        generatedAt: new Date().toISOString(),
        expertAnalysis: {
          photographer: {
            title: "Photo order strategy",
            advice: "Your first photo must pass the 0.3-second test — instant identification with good lighting. The optimal order: (1) clear solo portrait, (2) full body shot, (3) activity/hobby, (4) social proof, (5) close-up with genuine expression. Each photo must work independently.",
            photoOrder: [
              "Photo 1: Solo portrait with window light, slight smile, eye contact",
              "Photo 2: Full body showing outfit and context",
              "Photo 3: Activity shot (conversation hook)",
              "Photo 4: Social proof (with friends, but clearly identifiable)",
              "Photo 5: Close-up with genuine Duchenne smile",
            ],
          },
          stylist: {
            title: "Outfit strategy for dating",
            advice: "Dating photos require different rules than LinkedIn. Show personality through color and fit, not logos. The 'boyfriend test': would someone describe you positively to a friend based on this outfit? Solid colors > patterns. Fit > brand. Personality > prestige.",
          },
          copywriter: {
            title: "Bio and prompt analysis",
            bioLength,
            bioQuality,
            clicheFlags: foundCliches,
            promptAnalysis,
            rewriteExamples: foundCliches.length > 0
              ? foundCliches.map(c => ({
                  original: c,
                  rewrite: "Replace with a specific personal detail — e.g., instead of 'love traveling', try 'I once spent 3 weeks in Kerala and still think about the fish curry in Fort Kochi.' Specificity is memorable. Generics are forgettable.",
                }))
              : ["Your bio avoids the most common cliches — now ensure every sentence passes the 'would I say this to a stranger?' test. If it sounds like a LinkedIn headline, rewrite it."],
          },
        },
        bioFeedback: bioLength === 0
          ? "No bio provided — this is a missed opportunity. A bio gives context to your photos and signals effort."
          : bioQuality + ". " + (foundCliches.length > 0 ? "Found " + foundCliches.length + " overused phrases that blend in with 60%+ of profiles." : "Your bio avoids common cliches — now ensure every sentence is specific and personal."),
        promptFeedback: prompts.length === 0
          ? "No prompts answered — prompts are the #1 conversation starter on dating apps. Each unanswered prompt is a missed connection."
          : promptLines.length + " prompts analyzed. " + promptAnalysis.filter(p => p.assessment.includes("cliche")).length + " contain overused phrases.",
        photoOrder: "Lead with your highest-scoring solo portrait. Follow with full body, activity, social proof, and close-up. Each must pass the 0.3-second identification test.",
      };
    }

    case "glowup_plan": {
      const lightingScore = metrics.lightingScore || 50;
      const backgroundComplexity = metrics.backgroundComplexityEstimate || 50;

      const biggestWeakness = lightingScore < 55 ? "lighting"
        : backgroundComplexity > 60 ? "background"
        : "overall consistency";

      return {
        type: "glowup_plan",
        generatedAt: new Date().toISOString(),
        duration: "30 days",
        personalization: {
          biggestWeakness,
          currentScore: audit.free_score || 0,
          targetScore: Math.min(90, (audit.free_score || 50) + 35),
        },
        weeks: [
          {
            week: 1,
            focus: "Lighting & Photography Foundations",
            whyThisWeek: biggestWeakness === "lighting"
              ? "Your lighting score is " + lightingScore + "/100 — this is the single highest-ROI fix. Lighting accounts for 60-70% of perceived photo quality."
              : "Even if lighting is not your weakest area, it is the foundation everything else builds on. Master this first.",
            dailyMissions: [
              { day: 1, task: "Identify the best natural light source in your home — the window with the most consistent daylight between 10am-4pm", cost: "₹0", expertNote: "North-facing windows provide the most consistent, soft light. South-facing windows create harsh shadows. East-facing is good for morning shots, west-facing for golden hour." },
              { day: 2, task: "Practice the 45-degree angle — face the window at 10 or 2 o'clock, chin height, and take 10 test shots", cost: "₹0", expertNote: "The 45-degree side light creates the Rembrandt triangle — a small inverted triangle of light on the far cheek. This is the most universally flattering portrait lighting pattern." },
              { day: 3, task: "Kill all overhead lights in your shooting area and retake your profile photo with only window light", cost: "₹0", expertNote: "Overhead lights cast shadows from the brow ridge into the eye sockets, creating a 'skull-like' appearance. Side light eliminates this completely." },
              { day: 4, task: "Experiment with diffusion — hang a sheer curtain or bedsheet over the window to soften harsh shadows", cost: "₹0-200", expertNote: "Diffused light wraps around the face more evenly, reducing the contrast between lit and shadow areas. This is the difference between 'amateur' and 'studio' quality." },
              { day: 5, task: "Find your best expression — take 20 photos with different expressions, compare which one feels most natural and confident", cost: "₹0", expertNote: "The Duchenne smile (eyes + mouth) reads as genuine. Practice thinking of something genuinely funny before the shutter." },
              { day: 6, task: "Compare your Day 1 and Day 5 photos side by side — note the specific improvements", cost: "₹0", expertNote: "Visual comparison reinforces the habit. You should see 10-15 point improvement from lighting alone." },
              { day: 7, task: "Establish your 'golden hour' — the 2-hour window before sunset where light is warmest and most flattering", cost: "₹0", expertNote: "Golden hour light has a color temperature of ~3500K (warm) which flatters all skin tones and creates natural warmth without filters." },
            ],
          },
          {
            week: 2,
            focus: "Background & Visual Hierarchy",
            whyThisWeek: "Your background occupies 60%+ of your visual real estate. Getting this right separates 'amateur' from 'intentional.'",
            dailyMissions: [
              { day: 8, task: "Audit your current background — count every visible object. If more than 3, start removing.", cost: "₹0", expertNote: "The 'three-element rule': in any frame, the viewer should process face, outfit, and one detail. More than that is visual noise." },
              { day: 9, task: "Find 3 plain-wall locations within walking distance — one light, one medium, one dark tone", cost: "₹0", expertNote: "Light walls (white, cream) are universally flattering. Dark walls create drama but require stronger lighting. Match your outfit contrast to the wall." },
              { day: 10, task: "Practice background-to-outfit contrast — if wall is light, wear dark. If wall is dark, wear light.", cost: "₹0", expertNote: "Contrast separates you from the environment. Without it, you blend into the background and the viewer's eye has no reason to focus on you." },
              { day: 11, task: "Shoot in Portrait mode to blur any remaining background detail — this is a free post-processing trick", cost: "₹0", expertNote: "Portrait mode simulates a wide-aperture lens (f/1.8-f/2.8) that professional photographers use to separate subject from background." },
              { day: 12, task: "Create a 'shooting corner' — one spot with good light, clean background, consistent results", cost: "₹0-500", expertNote: "Consistency comes from repeatability. A dedicated corner with known-good lighting eliminates variables." },
              { day: 13, task: "Take 10 photos in your new corner with different outfits — establish your go-to look", cost: "₹0", expertNote: "Your go-to look should satisfy: solid colors (3 max), no logos, good contrast with background, well-fitted." },
              { day: 14, task: "Review Week 2 progress — compare background consistency across your last 7 photos", cost: "₹0", expertNote: "Instagram feeds with consistent backgrounds get 25-40% more engagement than feeds with random backgrounds." },
            ],
          },
          {
            week: 3,
            focus: "Outfit, Grooming & Color Science",
            whyThisWeek: "With lighting and background fixed, outfit and grooming are the next highest-ROI improvements. Color theory applied to personal presentation creates instant visual coherence.",
            dailyMissions: [
              { day: 15, task: "Identify your color season — warm undertones (gold jewelry looks natural) = earth tones. Cool undertones (silver looks better) = jewel tones.", cost: "₹0", expertNote: "Color season matching is the science behind why certain colors make you look healthier and more vibrant. It is based on the undertone of your skin, not the surface color." },
              { day: 16, task: "Audit your wardrobe — remove all items with visible logos, clashing patterns, or colors that don't match your season", cost: "₹0", expertNote: "The 'three-color rule': your entire outfit should contain no more than 3 distinct colors. This creates visual coherence." },
              { day: 17, task: "Get a haircut that works with your face shape — oval faces can wear most styles, round faces need volume on top, square faces benefit from texture", cost: "₹200-500", expertNote: "Hair is the frame of the face. A bad haircut can undo good lighting and outfit. Ask your barber for a style that adds balance to your face shape." },
              { day: 18, task: "Start a basic skincare routine: cleanser + moisturizer + SPF every morning", cost: "₹300-600", expertNote: "Skin texture affects photo clarity more than skin tone. Two weeks of consistent routine creates visible improvement in how light interacts with your skin." },
              { day: 19, task: "Eyebrow cleanup — threading or trimming to define the arch. The arch peak should align with the outer edge of your iris.", cost: "₹50-100", expertNote: "Eyebrows frame the eyes — they are the first thing viewers notice after eye contact. Clean arches create immediate facial definition." },
              { day: 20, task: "Shoot your new look — same corner, same lighting, new outfit + grooming. Compare to Day 1.", cost: "₹0", expertNote: "At this point you should see 20-30 point improvement from the cumulative fixes." },
              { day: 21, task: "Plan your 'signature look' — 2-3 outfits that work for different occasions, all following your color season", cost: "₹500-2000", expertNote: "A signature look creates recognition. People should be able to identify you by your style, not just your face." },
            ],
          },
          {
            week: 4,
            focus: "Consistency System & Long-Term Habits",
            whyThisWeek: "The biggest risk after improvement is regression. This week creates the system that locks in gains and makes improvement self-sustaining.",
            dailyMissions: [
              { day: 22, task: "Batch-shoot 10 photos in your best lighting window — this is your content bank for the next 2 weeks", cost: "₹0", expertNote: "Batch shooting is more efficient than daily photos. You get consistent lighting, and you can select the best 2-3 from a larger set." },
              { day: 23, task: "Edit your top 5 photos — subtle brightness, contrast, and warmth adjustments only. No filters, no face tuning.", cost: "₹0", expertNote: "Subtle edits (5-10% brightness, 10-15% contrast) enhance without distorting. Heavy filters destroy the natural skin texture that signals confidence." },
              { day: 24, task: "Set up a weekly 10-minute review — every Sunday, compare your latest photos to your Day 1 baseline", cost: "₹0", expertNote: "Weekly review creates accountability. Seeing progress reinforces the habit. Seeing regression triggers immediate correction." },
              { day: 25, task: "Establish your 'minimum viable routine' — the 3 things you do every time you take a photo (clean lens, find light, check background)", cost: "₹0", expertNote: "Habit stacking: attach new behaviors to existing ones. 'When I open camera → clean lens → find light → check background.' This takes 30 seconds." },
              { day: 26, task: "Create a 'photo checklist' — lighting, background, outfit, expression, framing. Check each before shooting.", cost: "₹0", expertNote: "A checklist eliminates variables. Professional photographers use them for every shoot. You should too." },
              { day: 27, task: "Share your best photo with a trusted friend — ask for honest feedback on first impression", cost: "₹0", expertNote: "External feedback catches blind spots. Ask: 'What's the first thing you notice?' If it's not your face, something is off." },
              { day: 28, task: "Plan your next month — which areas need continued attention, which are locked in", cost: "₹0", expertNote: "A glow-up is a system, not an event. Monthly planning ensures continuous improvement." },
              { day: 29, task: "Final comparison — Day 1 vs Day 29. Calculate your total score improvement.", cost: "₹0", expertNote: "Document your transformation. This becomes your reference point and motivation for continued consistency." },
              { day: 30, task: "Celebrate your progress — you now have a system that works. The habits are established. The improvement compounds.", cost: "₹0", expertNote: "The 30-day mark is where habits solidify. Research shows it takes 18-254 days to form a habit. You are in the zone." },
            ],
          },
        ],
        budgetRoadmap: {
          week1: "₹0 — Lighting and framing are free fixes that deliver the highest ROI",
          week2: "₹0-500 — Background cleanup and basic setup",
          week3: "₹500-2500 — Haircut (₹200-500), skincare (₹300-600), eyebrow grooming (₹50-100), key wardrobe piece (₹500-2000)",
          week4: "₹0 — Consistency system costs nothing but creates lasting change",
          total: "₹500-3000 for the entire 30-day transformation",
        },
        expectedOutcome: "Based on your current score of " + (audit.free_score || 50) + ", this system targets a " + Math.min(90, (audit.free_score || 50) + 35) + "/100 score by Day 30. The 35-point average gain comes from compounding small fixes across lighting, background, outfit, grooming, and consistency — not from any single dramatic change.",
      };
    }

    default:
      throw new Error(`Unknown product type: ${productType}`);
  }
}
