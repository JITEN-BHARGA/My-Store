"use client";

import {
  useRef,
  useCallback,
  useState,
  useEffect,
  ReactNode,
  CSSProperties,
} from "react";

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Max rotation in degrees. */
  max?: number;
  /** Lift toward viewer on hover (px). */
  lift?: number;
  /** Adds a moving glare highlight. */
  glare?: boolean;
  onClick?: () => void;
};

/**
 * Reusable cursor-based 3D tilt wrapper.
 * - GPU-friendly (transform only).
 * - Auto-disabled on touch devices & when prefers-reduced-motion is set,
 *   so it never interferes with taps, clicks, links or accessibility.
 */
export default function Tilt3D({
  children,
  className = "",
  style,
  max = 10,
  lift = 6,
  glare = false,
  onClick,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [transform, setTransform] = useState("");
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, on: false });

  useEffect(() => {
    const mq = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const handleMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!enabled || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * max * 2;
      const rotateX = (0.5 - py) * max * 2;
      setTransform(
        `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(
          2,
        )}deg) translateZ(${lift}px)`,
      );
      if (glare) setGlarePos({ x: px * 100, y: py * 100, on: true });
    },
    [enabled, max, lift, glare],
  );

  const handleLeave = useCallback(() => {
    setTransform("");
    setGlarePos((g) => ({ ...g, on: false }));
  }, []);

  return (
    <div
      ref={ref}
      onClick={onClick}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={className}
      style={{
        ...style,
        transform: transform || undefined,
        transformStyle: "preserve-3d",
        transition:
          "transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease",
        willChange: "transform",
      }}
    >
      {children}
      {glare && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            pointerEvents: "none",
            opacity: glarePos.on ? 1 : 0,
            transition: "opacity 0.3s ease",
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.35), transparent 45%)`,
          }}
        />
      )}
    </div>
  );
}
