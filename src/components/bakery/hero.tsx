"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/bakery-data";

export function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920&q=80"
          alt="HALF Bakery - Artisan bread and premium cakes"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bakery-dark/85 via-bakery-dark/70 to-bakery-dark/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-bakery-dark/60 via-transparent to-transparent" />
        {/* Scrim atas khusus area navbar agar menu tetap terbaca penuh selebar layar */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 pt-24 pb-16">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-secondary font-medium tracking-widest uppercase text-sm mb-4"
          >
            {BRAND.tagline}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6"
          >
            Freshly Baked
            <br />
            <span className="text-secondary">Every Day</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-white/85 text-base md:text-lg lg:text-xl leading-relaxed max-w-xl mb-8"
          >
            Nikmati roti artisan, cake premium, pastry, dan dessert terbaik yang
            dibuat fresh setiap hari menggunakan bahan berkualitas.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              size="lg"
              className="rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-bakery-lg h-12 px-8 text-base group"
              asChild
            >
              <a href="#outlet">
                Pesan Sekarang
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-2xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm h-12 px-8 text-base"
              asChild
            >
              <a href="#menu">Lihat Menu</a>
            </Button>
          </motion.div>
        </div>
      </div>

      <motion.a
        href="#menu"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors"
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.a>
    </section>
  );
}
