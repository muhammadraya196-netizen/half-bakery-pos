"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface PromoCardData {
  id: string;
  slug: string;
  title: string;
  description: string;
  badge: string;
  image: string;
  gradient: string;
}

interface PromoCardProps {
  promo: PromoCardData;
  onClaim: (slug: string) => void;
}

/**
 * Card promo landing page. Markup, ukuran, radius, overlay gradient, badge,
 * animasi hover, dan tombol "Klaim Promo" dipertahankan persis seperti semula —
 * hanya menambahkan interaksi klik untuk mengarahkan ke halaman kasir.
 */
export function PromoCard({ promo, onClaim }: PromoCardProps) {
  const handleClaim = () => onClaim(promo.slug);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={handleClaim}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClaim();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Klaim promo ${promo.title}`}
      className="group relative h-[380px] md:h-[420px] rounded-3xl overflow-hidden shadow-bakery hover:shadow-bakery-lg transition-shadow cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <Image
        src={promo.image}
        alt={promo.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      <div className={cn("absolute inset-0 bg-gradient-to-t", promo.gradient)} />
      <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
        <span className="inline-flex self-start px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold tracking-wider uppercase mb-3">
          {promo.badge}
        </span>
        <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
          {promo.title}
        </h3>
        <p className="text-white/80 text-sm leading-relaxed mb-4 line-clamp-2">
          {promo.description}
        </p>
        <span className="inline-flex items-center text-white font-medium text-sm group/link">
          Klaim Promo
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
        </span>
      </div>
    </motion.div>
  );
}
