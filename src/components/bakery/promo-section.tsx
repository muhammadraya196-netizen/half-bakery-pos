"use client";

import { useRouter } from "next/navigation";
import { SectionHeading } from "@/components/bakery/section-heading";
import { MotionWrapper, MotionStagger, MotionItem } from "@/components/bakery/motion";
import { PromoCard } from "@/components/bakery/promo-card";
import { PROMOS } from "@/lib/bakery-data";
import { useSessionStore } from "@/stores/session-store";

export function PromoSection() {
  const router = useRouter();
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);

  /**
   * Alur klaim promo:
   * - Belum login  → arahkan ke /login dengan redirect balik ke POS + promo.
   * - Sudah login  → langsung ke /pos dengan query promo untuk auto-apply.
   */
  const handleClaim = (slug: string) => {
    const target = `/pos?promo=${slug}`;
    if (isAuthenticated) {
      router.push(target);
    } else {
      router.push(`/login?redirect=${encodeURIComponent(target)}`);
    }
  };

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
              <PromoCard promo={promo} onClaim={handleClaim} />
            </MotionItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  );
}
