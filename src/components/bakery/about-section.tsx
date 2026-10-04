"use client";

import Image from "next/image";
import {
  Leaf,
  Wheat,
  HandHeart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { SectionHeading } from "@/components/bakery/section-heading";
import { MotionWrapper, MotionStagger, MotionItem } from "@/components/bakery/motion";
import { ABOUT_FEATURES } from "@/lib/bakery-data";

const iconMap = {
  fresh: Leaf,
  ingredients: Wheat,
  handmade: HandHeart,
  halal: ShieldCheck,
  hygienic: Sparkles,
} as const;

export function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-28 bg-bakery-gradient overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <MotionWrapper variant="fadeLeft">
            <div className="relative">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-bakery-lg">
                <Image
                  src="https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80"
                  alt="Interior HALF Bakery Makassar"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="absolute -top-4 -left-4 bg-primary text-primary-foreground rounded-2xl px-5 py-3 shadow-bakery">
                <p className="font-display text-2xl font-bold">Since</p>
                <p className="text-sm opacity-90">2020 Makassar</p>
              </div>
            </div>
          </MotionWrapper>

          <div>
            <MotionWrapper variant="fadeRight">
              <SectionHeading
                subtitle="About Us"
                title="HALF Cake & Bakery"
                description="HALF Bakery adalah artisan bakery premium di Kota Makassar yang menghadirkan roti, cake, pastry, dan dessert berkualitas tinggi. Setiap produk kami dibuat dengan cinta, menggunakan bahan premium, dan dipanggang fresh setiap hari."
                align="left"
                className="mb-8"
              />
            </MotionWrapper>

            <MotionStagger className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ABOUT_FEATURES.map((feature) => {
                const Icon = iconMap[feature.icon];
                return (
                  <MotionItem key={feature.title}>
                    <div className="flex gap-4 p-4 rounded-2xl bg-white/80 backdrop-blur-sm shadow-bakery hover:shadow-bakery-lg transition-shadow">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-bakery-dark mb-1">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </MotionItem>
                );
              })}
            </MotionStagger>
          </div>
        </div>
      </div>
    </section>
  );
}
