import { useScroll, useTransform, MotionValue } from "framer-motion";
import { RefObject } from "react";

export const useParallax = (
  ref: RefObject<HTMLElement>,
  distance: number = 100
): MotionValue<number> => {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  return useTransform(scrollYProgress, [0, 1], [-distance, distance]);
};

export const useParallaxOpacity = (
  ref: RefObject<HTMLElement>
): MotionValue<number> => {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  return useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);
};

export const useParallaxScale = (
  ref: RefObject<HTMLElement>
): MotionValue<number> => {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  return useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
};
