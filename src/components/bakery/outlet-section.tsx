"use client";

import Image from "next/image";
import { MapPin, Clock, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/bakery/section-heading";
import { MotionWrapper, MotionStagger, MotionItem } from "@/components/bakery/motion";
import { OUTLETS } from "@/lib/bakery-data";

export function OutletSection() {
  return (
    <section id="outlet" className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <MotionWrapper>
          <SectionHeading
            subtitle="Our Locations"
            title="Kunjungi Outlet Kami"
            description="Tiga lokasi strategis di Makassar siap melayani kebutuhan bakery dan dessert Anda."
          />
        </MotionWrapper>

        <MotionStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {OUTLETS.map((outlet) => (
            <MotionItem key={outlet.id}>
              <motion.div
                whileHover={{ y: -4 }}
                className="group bg-white rounded-2xl overflow-hidden shadow-bakery hover:shadow-bakery-lg transition-all border border-border/50"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={outlet.image}
                    alt={outlet.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bakery-dark/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-display text-lg font-bold text-white">
                      {outlet.name}
                    </h3>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{outlet.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">{outlet.hours}</span>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full rounded-xl mt-2 group/btn border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                    asChild
                  >
                    <a
                      href={outlet.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Lihat Maps
                    </a>
                  </Button>
                </div>
              </motion.div>
            </MotionItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  );
}
