"use client";

import { Star, Quote } from "lucide-react";
import { SectionHeading } from "@/components/bakery/section-heading";
import { MotionWrapper, MotionStagger, MotionItem } from "@/components/bakery/motion";
import { TESTIMONIALS } from "@/lib/bakery-data";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? "fill-secondary text-secondary"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  );
}

export function TestimonialSection() {
  return (
    <section className="py-20 md:py-28 bg-cream/50">
      <div className="container mx-auto px-4 md:px-6">
        <MotionWrapper>
          <SectionHeading
            subtitle="Testimonials"
            title="Apa Kata Pelanggan Kami"
            description="Ribuan pelanggan telah merasakan kelezatan produk HALF Bakery. Berikut cerita dari mereka."
          />
        </MotionWrapper>

        <MotionStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {TESTIMONIALS.map((testimonial) => (
            <MotionItem key={testimonial.id}>
              <div className="relative bg-white rounded-2xl p-6 md:p-8 shadow-bakery hover:shadow-bakery-lg transition-shadow h-full flex flex-col">
                <Quote className="h-8 w-8 text-accent mb-4" />
                <p className="text-muted-foreground leading-relaxed flex-1 mb-6">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-bakery-dark">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-muted-foreground mb-1">
                      {testimonial.role}
                    </p>
                    <StarRating rating={testimonial.rating} />
                  </div>
                </div>
              </div>
            </MotionItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  );
}
