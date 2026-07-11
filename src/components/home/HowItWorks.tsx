"use client";

import { Container } from "@/components/ui/Container";
import { FadeInView } from "@/components/ui/FadeInView";

const STEPS = [
  {
    num: "01",
    title: "Upload a photo",
    desc: "Take a selfie or upload an existing profile photo. Works with any phone camera.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Analyse presentation signals",
    desc: "Our engine evaluates 7 dimensions — lighting, clarity, composition, background, colour, style, and consistency.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Receive prioritised improvements",
    desc: "Get a ranked action plan — what to fix first, what to buy, and where to shop, all tailored to your goal.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 sm:py-28 bg-[#0a0a12]">
      <Container>
        <FadeInView>
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">How it works</h2>
            <p className="mt-3 text-sm text-gray-500">Three steps to a clearer first impression.</p>
          </div>
        </FadeInView>

        <div className="grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <FadeInView key={step.num} delay={i * 100}>
              <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                    {step.icon}
                  </div>
                  <span className="text-xs font-mono text-gray-600">{step.num}</span>
                </div>
                <h3 className="mb-2 text-base font-semibold text-white">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            </FadeInView>
          ))}
        </div>
      </Container>
    </section>
  );
}
