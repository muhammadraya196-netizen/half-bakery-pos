"use client";

import { useState } from "react";
import { Navbar } from "@/components/bakery/navbar";
import { Hero } from "@/components/bakery/hero";
import { MenuSection } from "@/components/bakery/menu-section";
import { PromoSection } from "@/components/bakery/promo-section";
import { AboutSection } from "@/components/bakery/about-section";
import { OutletSection } from "@/components/bakery/outlet-section";
import { TestimonialSection } from "@/components/bakery/testimonial-section";
import { Footer } from "@/components/bakery/footer";
import { CartDrawer } from "@/components/bakery/cart-drawer";

export default function HomePage() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <Hero />
      <MenuSection />
      <PromoSection />
      <AboutSection />
      <OutletSection />
      <TestimonialSection />
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </main>
  );
}
