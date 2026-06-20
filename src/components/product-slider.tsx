// components/product-slider.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useAppDispatch } from "@/lib/redux-hooks";
import { addToCart } from "@/lib/store";

const slides = [
  {
    id: "jaba-original",
    name: "Jaba Waba Original",
    tagline: "Pure Sunshine in a Bottle",
    desc: "Tropical pineapple, mango & orange — handcrafted fresh daily.",
    price: "KSh 6.50",
    tag: "Best Seller",
    emoji: "🧃",
    fruits: ["🍊", "🥭", "🍍"],
    theme: {
      bg: "#fff7ed",
      bgDark: "#1c0a00",
      from: "#ea580c",
      to: "#f97316",
      mid: "#fed7aa",
      soft: "#ffedd5",
      blob1: "#fb923c",
      blob2: "#ea580c",
    },
  },
  {
    id: "green-boost",
    name: "Green Boost",
    tagline: "Your Daily Clean Energy",
    desc: "Spinach, apple, celery & lime — nutrient-rich and refreshing.",
    price: "KSh 7.50",
    tag: "Detox",
    emoji: "🥤",
    fruits: ["🥬", "🍏", "🍋"],
    theme: {
      bg: "#f0fdf4",
      bgDark: "#00150a",
      from: "#16a34a",
      to: "#15803d",
      mid: "#4ade80",
      soft: "#dcfce7",
      blob1: "#4ade80",
      blob2: "#16a34a",
    },
  },
  {
    id: "party-pack-6",
    name: "Berry Blast Pack",
    tagline: "Bold, Vibrant, Unforgettable",
    desc: "Six mixed berry bottles for any celebration. The life of the party.",
    price: "KSh 36.00",
    tag: "Party Pack",
    emoji: "🍹",
    fruits: ["🍓", "🫐", "🍇"],
    theme: {
      bg: "#fdf2f8",
      bgDark: "#1a0010",
      from: "#db2777",
      to: "#be185d",
      mid: "#f9a8d4",
      soft: "#fce7f3",
      blob1: "#f472b6",
      blob2: "#db2777",
    },
  },
  {
    id: "jaba-hoodie",
    name: "Hibiscus Tea",
    tagline: "Floral, Caffeine-Free, Bliss",
    desc: "Handas hibiscus tea bags — rich floral notes and natural sweetness.",
    price: "KSh 4.00",
    tag: "Limited",
    emoji: "🍵",
    fruits: ["🌺", "🫖", "✨"],
    theme: {
      bg: "#f5f3ff",
      bgDark: "#0d0820",
      from: "#7c3aed",
      to: "#6d28d9",
      mid: "#c4b5fd",
      soft: "#ede9fe",
      blob1: "#a78bfa",
      blob2: "#7c3aed",
    },
  },
];

function useThemeColor(theme: (typeof slides)[0]["theme"]) {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--slider-from", theme.from);
    root.style.setProperty("--slider-to", theme.to);
    return () => {
      root.style.removeProperty("--slider-from");
      root.style.removeProperty("--slider-to");
    };
  }, [theme]);
}

export function ProductSlider() {
  const dispatch = useAppDispatch();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slide = slides[current];

  useThemeColor(slide.theme);

  // Set mounted after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const goTo = useCallback(
    (idx: number, dir: "left" | "right" = "right") => {
      if (animating) return;
      setDirection(dir);
      setAnimating(true);
      setTimeout(() => {
        setCurrent((idx + slides.length) % slides.length);
        setAnimating(false);
      }, 400);
    },
    [animating]
  );

  const next = useCallback(() => goTo(current + 1, "right"), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1, "left"), [current, goTo]);

  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next]);

  const pause = () => { if (timerRef.current) clearInterval(timerRef.current); };
  const resume = () => { timerRef.current = setInterval(next, 5000); };

  const t = slide.theme;

  // Determine dark mode only after mounting
  const isDark = mounted && window.matchMedia("(prefers-color-scheme: dark)").matches;
  
  // Use light theme as default during SSR to avoid hydration mismatch
  const backgroundColor = !mounted ? t.bg : (isDark ? t.bgDark : t.bg);

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl transition-colors duration-700"
      style={{ background: backgroundColor, minHeight: 520 }}
      onMouseEnter={pause}
      onMouseLeave={resume}
      suppressHydrationWarning
    >
      {/* Animated blobs */}
      <div
        className="pointer-events-none absolute rounded-full transition-all duration-700"
        style={{
          width: 340,
          height: 340,
          top: -100,
          right: -80,
          background: t.blob1,
          opacity: 0.18,
          filter: "blur(60px)",
        }}
      />
      <div
        className="pointer-events-none absolute rounded-full transition-all duration-700"
        style={{
          width: 220,
          height: 220,
          bottom: -60,
          left: 60,
          background: t.blob2,
          opacity: 0.15,
          filter: "blur(50px)",
        }}
      />

      {/* Slide content */}
      <div
        className="flex items-center gap-8 px-8 py-16 md:px-20 md:py-20 transition-all duration-400"
        style={{
          opacity: animating ? 0 : 1,
          transform: animating
            ? `translateX(${direction === "right" ? "-40px" : "40px"})`
            : "translateX(0)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        {/* Drink visual */}
        <div className="relative flex-shrink-0 hidden sm:flex items-center justify-center" style={{ width: 280, height: 300 }}>
          {/* Orbiting fruits */}
          <div
            className="absolute"
            style={{
              width: 280,
              height: 280,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              animation: "sliderOrbit 7s linear infinite",
            }}
          >
            {slide.fruits.map((fruit, i) => (
              <span
                key={i}
                className="absolute flex items-center justify-center rounded-full text-lg"
                style={{
                  width: 36,
                  height: 36,
                  background: "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(4px)",
                  top: i === 0 ? 0 : i === 1 ? "auto" : "50%",
                  bottom: i === 1 ? 0 : "auto",
                  left: i === 2 ? 0 : "50%",
                  transform:
                    i === 0
                      ? "translateX(-50%)"
                      : i === 1
                      ? "translateX(-50%)"
                      : "translateY(-50%)",
                }}
              >
                {fruit}
              </span>
            ))}
          </div>
          {/* Main drink circle */}
          <div
            className="relative z-10 flex items-center justify-center rounded-full text-6xl"
            style={{
              width: 210,
              height: 210,
              fontSize: 80,
              background: `linear-gradient(135deg, ${t.soft}, ${t.mid})`,
              boxShadow: `0 12px 40px ${t.from}33`,
              animation: "sliderFloat 3s ease-in-out infinite",
            }}
          >
            {slide.emoji}
          </div>
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <span
            className="inline-block mb-3 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
            style={{ background: `${t.from}22`, color: t.from }}
          >
            {slide.tag}
          </span>
          <h2
            className="text-4xl md:text-4xl font-bold mb-2 leading-tight"
            style={{ color: t.from }}
          >
            {slide.name}
          </h2>
          <p
            className="text-base md:text-lg font-medium mb-2"
            style={{ color: t.to }}
          >
            {slide.tagline}
          </p>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mb-5 max-w-sm leading-relaxed">
            {slide.desc}
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <span
              className="text-3xl font-bold"
              style={{ color: t.from }}
            >
              {slide.price}
            </span>
            <button
              onClick={() => dispatch(addToCart(slide.id))}
              className="rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95"
              style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
            >
              Add to cart
            </button>
            <Link
              href={`/products`}
              className="rounded-full px-5 py-2 text-sm font-semibold border transition-colors"
              style={{ borderColor: t.from, color: t.from }}
            >
              View all
            </Link>
          </div>
        </div>
      </div>

      {/* Arrow nav */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white text-lg transition-transform hover:scale-110"
        style={{ background: `${t.from}cc` }}
        aria-label="Previous"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white text-lg transition-transform hover:scale-110"
        style={{ background: `${t.from}cc` }}
        aria-label="Next"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? "right" : "left")}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? 24 : 8,
              height: 8,
              background: i === current ? t.from : `${t.from}55`,
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-1 rounded-b-3xl transition-all duration-700"
        style={{
          width: `${((current + 1) / slides.length) * 100}%`,
          background: `linear-gradient(90deg, ${t.from}, ${t.to})`,
        }}
      />

      {/* Keyframe styles */}
      <style>{`
        @keyframes sliderFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes sliderOrbit {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
