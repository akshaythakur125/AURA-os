"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface FadeInViewProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** kept for API compatibility; reveals are always one-shot */
  once?: boolean;
}

/**
 * Reveals its children with a 3D entrance (they lean back in depth, then rotate
 * up flat) as they scroll into view.
 *
 * Robust against every scroll style: an IntersectionObserver handles the normal
 * case, and a throttled scroll/resize check reveals anything at or above the
 * viewport — so fast flicks and instant jumps (End key, anchor links) can never
 * leave content stuck invisible. The observer watches the untransformed OUTER
 * wrapper; the 3D transform lives on the INNER element so it can't project the
 * observed box out of view.
 */
export function FadeInView({ children, className = "", delay = 0 }: FadeInViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const inner = innerRef.current;
    if (!el || !inner) return;

    let revealed = false;
    const show = () => inner.classList.add("visible");
    const reveal = (withDelay: boolean) => {
      if (revealed) return;
      revealed = true;
      teardown();
      if (withDelay && delay) setTimeout(show, delay);
      else show();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) reveal(true);
        else if (entry.boundingClientRect.top < 0) reveal(false);
      },
      { threshold: 0, rootMargin: "0px 0px 80px 0px" },
    );
    observer.observe(el);

    let ticking = false;
    const check = () => {
      ticking = false;
      const r = el.getBoundingClientRect();
      // in view, or scrolled past (top above viewport)
      if (r.top < window.innerHeight * 1.05) reveal(r.top > window.innerHeight * 0.2);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(check);
    };
    // capture so it catches scrolls on any container (this page scrolls the root)
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll, { passive: true });

    function teardown() {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll, { capture: true } as EventListenerOptions);
      window.removeEventListener("resize", onScroll);
    }

    // reveal anything already in view on mount
    const r0 = el.getBoundingClientRect();
    if (r0.top < window.innerHeight * 1.05) reveal(r0.top > window.innerHeight * 0.2);

    return teardown;
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      <div ref={innerRef} className="fade-in-view">
        {children}
      </div>
    </div>
  );
}
