'use client';

import type { ReactNode } from 'react';
import { motion } from 'motion/react';

/** Fades and slides its server-rendered children in once on mount. */
export default function FadeIn({
  className,
  y,
  duration,
  delay = 0,
  children,
}: {
  className?: string;
  y: number;
  duration: number;
  delay?: number;
  children: ReactNode;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
}
