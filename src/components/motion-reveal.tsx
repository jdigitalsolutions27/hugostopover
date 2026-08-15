"use client";

import { LazyMotion } from "framer-motion";
import * as m from "framer-motion/m";
import type { ReactNode } from "react";

const loadMotionFeatures = () =>
  import("@/components/motion-features").then((module) => module.default);

export function MotionReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <m.div
        className={className}
        initial={false}
        whileInView={{ opacity: [0.92, 1], y: [8, 0] }}
        viewport={{ once: true, margin: "-48px" }}
        transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
