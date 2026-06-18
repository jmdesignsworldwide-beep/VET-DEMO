"use client";

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "framer-motion";
import { createContext, useContext } from "react";

const StaggerCtx = createContext(false);

/**
 * Contenedor que revela a sus hijos <Reveal> en cascada (stagger).
 * stagger 70ms con muelle (spring) — el efecto "premium" de entrada.
 */
export function Stagger({
  children,
  className,
  delay = 0,
  gap = 0.07,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  gap?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <StaggerCtx.Provider value={true}>
      <motion.div
        className={className}
        initial={reduce ? false : "hidden"}
        animate={reduce ? false : "show"}
        variants={{
          show: {
            transition: { staggerChildren: gap, delayChildren: delay },
          },
        }}
      >
        {children}
      </motion.div>
    </StaggerCtx.Provider>
  );
}

const variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 260, damping: 26 },
  },
};

/** Elemento que entra con fundido + leve subida. Úsalo dentro de <Stagger>. */
export function Reveal({
  children,
  className,
  ...props
}: Omit<HTMLMotionProps<"div">, "children"> & {
  children?: React.ReactNode;
}) {
  const inStagger = useContext(StaggerCtx);
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={variants}
      {...(inStagger
        ? {}
        : { initial: "hidden", animate: "show" })}
      {...props}
    >
      {children}
    </motion.div>
  );
}
