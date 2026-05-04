import { motion } from "framer-motion";

interface GentlemanIntroProps {
  onComplete: () => void;
}

/**
 * High-end animated intro:
 * A refined gentleman in a tailored suit walks in from the left carrying
 * a leather briefcase, places it down with a small bounce, straightens his
 * jacket, then signals the auth form to appear.
 *
 * Designed as a single inline SVG for crisp rendering at any size, with
 * coordinated framer-motion timelines for limbs, bag, shadow, and accent
 * particles.
 */
const WALK_DURATION = 2.2;
const BAG_DROP_DELAY = WALK_DURATION + 0.05;
const BAG_DROP_DURATION = 0.55;
const SETTLE_DURATION = 0.6;
const TOTAL = BAG_DROP_DELAY + BAG_DROP_DURATION + SETTLE_DURATION;

const GentlemanIntro = ({ onComplete }: GentlemanIntroProps) => {
  return (
    <div className="relative w-full h-56 md:h-64 mb-6 overflow-hidden select-none">
      {/* Soft horizon gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-muted/40" />

      {/* Marble floor line */}
      <div className="absolute bottom-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
      <div className="absolute bottom-7 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-foreground/5 to-transparent blur-sm" />

      {/* Ambient particles */}
      {[...Array(6)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/40"
          style={{ left: `${15 + i * 12}%`, bottom: `${30 + (i % 3) * 18}%` }}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], y: [-4, -16, -4] }}
          transition={{
            duration: 3.5,
            delay: 0.4 + i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Walking figure container */}
      <motion.div
        className="absolute bottom-8"
        initial={{ x: "-30%", left: "0%" }}
        animate={{ left: "50%", x: "-50%" }}
        transition={{ duration: WALK_DURATION, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={() => {
          window.setTimeout(onComplete, (TOTAL - WALK_DURATION) * 1000);
        }}
      >
        {/* Shadow */}
        <motion.div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-2 rounded-full bg-foreground/30 blur-md"
          initial={{ width: 70, opacity: 0.3 }}
          animate={{ width: [70, 70, 90], opacity: [0.3, 0.3, 0.45] }}
          transition={{ duration: TOTAL, times: [0, WALK_DURATION / TOTAL, 1] }}
        />

        <motion.svg
          width="120"
          height="190"
          viewBox="0 0 120 190"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          // gentle walking bob, then settle
          animate={{ y: [0, -3, 0, -3, 0, 0] }}
          transition={{
            duration: WALK_DURATION,
            times: [0, 0.2, 0.4, 0.6, 0.8, 1],
            ease: "easeInOut",
          }}
        >
          <defs>
            <linearGradient id="suit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0.95" />
              <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="0.78" />
            </linearGradient>
            <linearGradient id="leather" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.95" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.7" />
            </linearGradient>
            <radialGradient id="skin" cx="0.5" cy="0.4" r="0.6">
              <stop offset="0%" stopColor="hsl(var(--muted))" />
              <stop offset="100%" stopColor="hsl(var(--muted-foreground))" />
            </radialGradient>
          </defs>

          {/* Hat — fedora */}
          <ellipse cx="60" cy="32" rx="26" ry="3.5" fill="hsl(var(--foreground))" />
          <path
            d="M44 32 Q44 14 60 14 Q76 14 76 32 Z"
            fill="hsl(var(--foreground))"
          />
          <rect x="44" y="28" width="32" height="3" fill="hsl(var(--primary))" opacity="0.6" />

          {/* Head */}
          <ellipse cx="60" cy="44" rx="9" ry="11" fill="url(#skin)" />
          {/* Sharp jawline shadow */}
          <path d="M52 48 Q60 56 68 48 Q66 54 60 56 Q54 54 52 48 Z" fill="hsl(var(--foreground))" opacity="0.15" />

          {/* Neck + collar */}
          <rect x="56" y="54" width="8" height="6" fill="url(#skin)" />
          <path d="M50 60 L60 64 L70 60 L66 70 L54 70 Z" fill="hsl(var(--background))" />
          {/* Tie */}
          <path d="M58 64 L62 64 L63 68 L60 70 L57 68 Z" fill="hsl(var(--primary))" />
          <path d="M57 70 L63 70 L64 88 L60 92 L56 88 Z" fill="hsl(var(--primary))" />

          {/* Jacket / torso */}
          <path
            d="M40 64 Q60 60 80 64 L84 120 Q60 128 36 120 Z"
            fill="url(#suit)"
          />
          {/* Lapels */}
          <path d="M52 64 L60 78 L56 96 L48 80 Z" fill="hsl(var(--foreground))" opacity="0.55" />
          <path d="M68 64 L60 78 L64 96 L72 80 Z" fill="hsl(var(--foreground))" opacity="0.55" />
          {/* Pocket square */}
          <rect x="70" y="82" width="6" height="4" fill="hsl(var(--background))" />

          {/* Left arm (back) — subtle swing while walking */}
          <motion.g
            style={{ transformOrigin: "44px 68px" }}
            animate={{ rotate: [10, -10, 10, -10, 0, 0] }}
            transition={{ duration: WALK_DURATION, times: [0, 0.2, 0.4, 0.6, 0.85, 1] }}
          >
            <path d="M40 68 Q34 92 38 118" stroke="url(#suit)" strokeWidth="10" strokeLinecap="round" fill="none" />
            <circle cx="38" cy="120" r="5" fill="url(#skin)" />
          </motion.g>

          {/* Right arm holding briefcase — drops the bag at the end */}
          <motion.g
            style={{ transformOrigin: "80px 68px" }}
            animate={{ rotate: [-10, 10, -10, 10, 0, -25] }}
            transition={{
              duration: TOTAL,
              times: [
                0,
                0.1,
                0.2,
                0.3,
                WALK_DURATION / TOTAL,
                (WALK_DURATION + 0.4) / TOTAL,
              ],
              ease: "easeInOut",
            }}
          >
            <path d="M80 68 Q88 92 84 122" stroke="url(#suit)" strokeWidth="10" strokeLinecap="round" fill="none" />
            <circle cx="84" cy="124" r="5" fill="url(#skin)" />
          </motion.g>

          {/* Trousers */}
          <motion.g>
            {/* Left leg */}
            <motion.rect
              x="46"
              y="118"
              width="12"
              height="50"
              rx="2"
              fill="hsl(var(--foreground))"
              style={{ transformOrigin: "52px 120px" }}
              animate={{ rotate: [0, 12, 0, -12, 0, 0] }}
              transition={{ duration: WALK_DURATION, times: [0, 0.2, 0.4, 0.6, 0.85, 1] }}
            />
            {/* Right leg */}
            <motion.rect
              x="62"
              y="118"
              width="12"
              height="50"
              rx="2"
              fill="hsl(var(--foreground))"
              style={{ transformOrigin: "68px 120px" }}
              animate={{ rotate: [0, -12, 0, 12, 0, 0] }}
              transition={{ duration: WALK_DURATION, times: [0, 0.2, 0.4, 0.6, 0.85, 1] }}
            />
          </motion.g>

          {/* Oxford shoes */}
          <ellipse cx="52" cy="170" rx="9" ry="3" fill="hsl(var(--foreground))" />
          <ellipse cx="68" cy="170" rx="9" ry="3" fill="hsl(var(--foreground))" />
          <ellipse cx="52" cy="169" rx="6" ry="1.2" fill="hsl(var(--background))" opacity="0.4" />
          <ellipse cx="68" cy="169" rx="6" ry="1.2" fill="hsl(var(--background))" opacity="0.4" />
        </motion.svg>
      </motion.div>

      {/* Briefcase — travels with the gentleman, then drops to floor */}
      <motion.div
        className="absolute"
        initial={{ left: "0%", x: "-30%", bottom: 95 }}
        animate={{
          left: ["0%", "50%", "50%"],
          x: ["-30%", "10%", "10%"],
          bottom: [95, 95, 12],
        }}
        transition={{
          duration: BAG_DROP_DELAY + BAG_DROP_DURATION,
          times: [0, WALK_DURATION / (BAG_DROP_DELAY + BAG_DROP_DURATION), 1],
          ease: ["easeOut", "easeIn"],
        }}
      >
        <motion.svg
          width="42"
          height="34"
          viewBox="0 0 42 34"
          fill="none"
          // tiny squash on landing
          animate={{ scaleY: [1, 1, 0.85, 1] }}
          transition={{
            duration: BAG_DROP_DELAY + BAG_DROP_DURATION + 0.2,
            times: [
              0,
              (BAG_DROP_DELAY + BAG_DROP_DURATION - 0.05) /
                (BAG_DROP_DELAY + BAG_DROP_DURATION + 0.2),
              (BAG_DROP_DELAY + BAG_DROP_DURATION) /
                (BAG_DROP_DELAY + BAG_DROP_DURATION + 0.2),
              1,
            ],
            ease: "easeOut",
          }}
          style={{ transformOrigin: "center bottom" }}
        >
          <defs>
            <linearGradient id="bag" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--foreground))" />
              <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="0.75" />
            </linearGradient>
          </defs>
          {/* Handle */}
          <path d="M15 8 Q21 2 27 8" stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Body */}
          <rect x="3" y="10" width="36" height="22" rx="3" fill="url(#bag)" />
          {/* Stitch */}
          <line x1="3" y1="14" x2="39" y2="14" stroke="hsl(var(--background))" strokeOpacity="0.25" strokeDasharray="2 2" />
          {/* Brass clasp */}
          <rect x="19" y="18" width="4" height="6" rx="1" fill="hsl(var(--primary))" />
          <circle cx="21" cy="21" r="0.8" fill="hsl(var(--background))" />
        </motion.svg>
      </motion.div>
    </div>
  );
};

export default GentlemanIntro;
