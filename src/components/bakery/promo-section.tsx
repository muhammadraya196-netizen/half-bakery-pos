"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/bakery/section-heading";
import { MotionWrapper, MotionStagger, MotionItem } from "@/components/bakery/motion";
import { PROMOS } from "@/lib/bakery-data";
import { cn } from "@/lib/utils";

export function PromoSection() {
  return (
    <section id="promo" className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <MotionWrapper>
          <SectionHeading
            subtitle="Special Offers"
            title="Promo Spesial"
            description="Nikmati penawaran terbaik untuk cake, roti, pastry, dan minuman favoritmu."
          />
        </MotionWrapper>

        <MotionStagger className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {PROMOS.map((promo) => (
            <MotionItem key={promo.id}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="group relative h-[380px] md:h-[420px] rounded-3xl overflow-hidden shadow-bakery hover:shadow-bakery-lg transition-shadow cursor-pointer"
              >
                <Image
                  src={promo.image}
                  alt={promo.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-t",
                    promo.gradient
                  )}
                />
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
                  <a
                    href="#outlet"
                    className="inline-flex items-center text-white font-medium text-sm group/link"
                  >
                    Klaim Promo
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                  </a>
                </div>
              </motion.div>
            </MotionItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  );
}
