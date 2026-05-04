import { motion } from "framer-motion";

interface GentlemanIntroProps {
  onComplete: () => void;
}

/**
 * Animated intro: a gentleman walks in from the left carrying a briefcase,
 * stops in the center, sets the bag down, then signals the login form to appear.
 */
const GentlemanIntro = ({ onComplete }: GentlemanIntroProps) => {
  return (
    <div className="relative w-full h-48 mb-4 overflow-hidden">
      {/* Floor line */}
      <div className="absolute bottom-6 left-0 right-0 h-px bg-border" />

      {/* Gentleman walks in, stops, then bows slightly */}
      <motion.div
        className="absolute bottom-6"
        initial={{ x: "-120%" }}
        animate={{ x: "calc(50% - 40px)" }}
        transition={{ duration: 2, ease: "easeOut" }}
        onAnimationComplete={() => {
          // small delay then trigger login reveal after bag drop animation finishes
          setTimeout(onComplete, 900);
        }}
      >
        <motion.svg
          width="80"
          height="140"
          viewBox="0 0 80 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          // subtle walking bob
          animate={{ y: [0, -2, 0, -2, 0] }}
          transition={{ duration: 0.5, repeat: 3, ease: "easeInOut" }}
        >
          {/* Hat */}
          <ellipse cx="40" cy="22" rx="18" ry="3" fill="hsl(var(--foreground))" />
          <rect x="30" y="8" width="20" height="14" rx="2" fill="hsl(var(--foreground))" />
          {/* Head */}
          <circle cx="40" cy="32" r="9" fill="hsl(var(--muted-foreground))" />
          {/* Body / suit */}
          <path
            d="M28 42 L52 42 L56 90 L24 90 Z"
            fill="hsl(var(--primary))"
          />
          {/* Shirt + tie */}
          <path d="M36 42 L44 42 L42 60 L38 60 Z" fill="hsl(var(--background))" />
          <path d="M40 44 L42 52 L40 58 L38 52 Z" fill="hsl(var(--destructive))" />
          {/* Legs */}
          <rect x="30" y="90" width="8" height="30" fill="hsl(var(--foreground))" />
          <rect x="42" y="90" width="8" height="30" fill="hsl(var(--foreground))" />
          {/* Shoes */}
          <ellipse cx="34" cy="122" rx="6" ry="3" fill="hsl(var(--foreground))" />
          <ellipse cx="46" cy="122" rx="6" ry="3" fill="hsl(var(--foreground))" />
          {/* Arm holding bag (right side) */}
          <motion.g
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, 0, 70] }}
            transition={{ duration: 1.2, delay: 2, times: [0, 0.5, 1], ease: "easeInOut" }}
            style={{ transformOrigin: "54px 46px" }}
          >
            <rect x="52" y="46" width="6" height="30" rx="2" fill="hsl(var(--primary))" />
          </motion.g>
        </motion.svg>
      </motion.div>

      {/* Briefcase — falls from the gentleman's hand to the floor */}
      <motion.div
        className="absolute"
        initial={{ x: "-120%", bottom: 70 }}
        animate={{
          x: ["−120%", "calc(50% + 6px)", "calc(50% + 6px)"],
          bottom: [70, 70, 8],
        }}
        transition={{
          duration: 3.2,
          times: [0, 0.62, 1],
          ease: ["easeOut", "easeOut", "easeIn"],
        }}
      >
        <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
          <rect x="1" y="6" width="26" height="15" rx="2" fill="hsl(var(--foreground))" />
          <rect x="10" y="2" width="8" height="5" rx="1" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" />
          <circle cx="14" cy="14" r="1.2" fill="hsl(var(--background))" />
        </svg>
      </motion.div>
    </div>
  );
};

export default GentlemanIntro;
