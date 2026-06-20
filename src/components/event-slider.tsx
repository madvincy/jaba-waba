"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, Calendar } from "lucide-react";

type EventSlide = {
  id: number;
  title: string;
  date: string;
  location: string;
  desc: string;
  img: string;
  color: string;
};

export function EventSlider({ events }: { events: EventSlide[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? 340 : -340, behavior: "smooth" });
    setTimeout(checkScroll, 400);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (trackRef.current?.offsetLeft ?? 0));
    setScrollLeft(trackRef.current?.scrollLeft ?? 0);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (trackRef.current?.offsetLeft ?? 0);
    const walk = (x - startX) * 1.5;
    if (trackRef.current) trackRef.current.scrollLeft = scrollLeft - walk;
    checkScroll();
  };

  const onMouseUp = () => setIsDragging(false);

  return (
    <div className="relative group/slider">
      {/* Left arrow */}
      <button
        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center transition-all duration-200 opacity-0 group-hover/slider:opacity-100 hover:scale-110 disabled:opacity-0"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
      </button>

      {/* Scroll track */}
      <div
        ref={trackRef}
        onScroll={checkScroll}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        className="flex gap-5 overflow-x-auto pb-4 select-none"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        {events.map((event) => (
          <div
            key={event.id}
            onMouseEnter={() => setHoveredId(event.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="relative flex-shrink-0 rounded-2xl overflow-hidden"
            style={{ width: 300, height: 380 }}
          >
            {/* Image */}
            <img
              src={event.img}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
              style={{
                transform: hoveredId === event.id ? "scale(1.08)" : "scale(1)",
              }}
              draggable={false}
            />

            {/* Base gradient — always visible at bottom */}
            <div
              className="absolute inset-0 transition-opacity duration-500"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
                opacity: hoveredId === event.id ? 0 : 1,
              }}
            />

            {/* Hover overlay */}
            <div
              className="absolute inset-0 transition-opacity duration-500 flex flex-col justify-end p-6"
              style={{
                background: `linear-gradient(to top, ${event.color}ee 0%, ${event.color}99 40%, ${event.color}44 70%, transparent 100%)`,
                opacity: hoveredId === event.id ? 1 : 0,
              }}
            >
              <div
                className="transition-all duration-500"
                style={{
                  transform:
                    hoveredId === event.id
                      ? "translateY(0)"
                      : "translateY(16px)",
                  opacity: hoveredId === event.id ? 1 : 0,
                }}
              >
                <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-2">
                  {event.date}
                </p>
                <h3 className="text-white text-xl font-bold mb-3 leading-tight">
                  {event.title}
                </h3>
                <p className="text-white/85 text-sm leading-relaxed mb-4">
                  {event.desc}
                </p>
                <div className="flex items-center gap-1.5 text-white/80 text-xs mb-5">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{event.location}</span>
                </div>
                <Link
                  href="/events"
                  className="inline-block rounded-full px-5 py-2 text-sm font-semibold text-white border border-white/60 hover:bg-white/20 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Get tickets →
                </Link>
              </div>
            </div>

            {/* Always-visible title at bottom when not hovered */}
            <div
              className="absolute bottom-0 left-0 right-0 p-5 transition-opacity duration-300"
              style={{ opacity: hoveredId === event.id ? 0 : 1 }}
            >
              <div
                className="inline-block rounded-full px-2.5 py-1 text-xs font-semibold text-white mb-2"
                style={{ background: `${event.color}cc` }}
              >
                <Calendar className="w-3 h-3 inline-block mr-1 -mt-0.5" />
                {event.date}
              </div>
              <h3 className="text-white font-bold text-lg leading-snug drop-shadow-sm">
                {event.title}
              </h3>
            </div>
          </div>
        ))}

        {/* End CTA card */}
        <div
          className="flex-shrink-0 rounded-2xl border-2 border-dashed border-green-300 dark:border-green-800 flex flex-col items-center justify-center gap-4 text-center p-8 transition-colors hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/30"
          style={{ width: 200, height: 380 }}
        >
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-2xl">
            🎉
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            More events coming soon
          </p>
          <Link
            href="/events"
            className="rounded-full px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            View all
          </Link>
        </div>
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center transition-all duration-200 opacity-0 group-hover/slider:opacity-100 hover:scale-110 disabled:opacity-0"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-200" />
      </button>

      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10 transition-opacity duration-300"
        style={{ opacity: canScrollLeft ? 1 : 0 }} />
      <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10 transition-opacity duration-300"
        style={{ opacity: canScrollRight ? 1 : 0 }} />
    </div>
  );
}