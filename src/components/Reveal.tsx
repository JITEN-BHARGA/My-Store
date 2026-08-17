"use client";

import { useEffect, useRef, useState, ReactNode, ElementType } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms. */
  delay?: number;
  as?: ElementType;
  once?: boolean;
};

/**
 * Scroll-reveal wrapper using IntersectionObserver.
 * Adds `.is-visible` (see globals.css `.reveal`) when the element enters view.
 * No-op visual under prefers-reduced-motion (handled in CSS).
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
  once = true,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [once]);

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
