"use client";

const TESTIMONIALS = [
  {
    quote: "The lighting leak was exactly what I needed to fix. Changed my setup, score jumped 18 points.",
    name: "Arjun",
    role: "College student",
    score: "+18",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
  },
  {
    quote: "Worth ₹99 just for the background tips. Saved me thousands on wardrobe I didn't need.",
    name: "Priya",
    role: "Freelance designer",
    score: "+12",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face",
  },
  {
    quote: "My Instagram grid went from messy to cohesive in a week. The color signal advice was spot-on.",
    name: "Rahul",
    role: "Content creator",
    score: "+15",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face",
  },
];

export function Testimonials() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {TESTIMONIALS.map((t, i) => (
        <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="mb-3 flex items-center gap-1 text-amber-400">
            {[...Array(5)].map((_, j) => (
              <svg key={j} className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="mb-4 text-sm leading-relaxed text-gray-300">
            &ldquo;{t.quote}&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/[0.08]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.avatar}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{t.name}</div>
              <div className="text-[10px] text-gray-500">{t.role}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-emerald-400">{t.score}</div>
              <div className="text-[9px] text-gray-600">score gain</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
