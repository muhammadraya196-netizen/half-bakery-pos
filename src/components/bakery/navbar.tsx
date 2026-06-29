"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ShoppingBag, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BRAND, NAV_LINKS } from "@/lib/bakery-data";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onCartOpen: () => void;
}

export function Navbar({ onCartOpen }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const itemCount = useCartStore((s) => s.getItemCount());

  // Navbar tampil di atas hero (transparan) atau setelah di-scroll (solid).
  const overHero = !isScrolled;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll-spy: tandai menu yang sedang dibuka.
  useEffect(() => {
    const sections = NAV_LINKS.map((l) =>
      document.getElementById(l.href.replace("#", ""))
    ).filter((el): el is HTMLElement => Boolean(el));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-cream/95 backdrop-blur-md shadow-bakery border-b border-primary/10 py-3"
            : "bg-transparent py-4 md:py-5"
        )}
      >
        <div className="container mx-auto px-4 md:px-6">
          <nav className="flex items-center justify-between">
            <Link href="#home" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg shadow-bakery ring-1 ring-white/30 transition-transform group-hover:scale-105">
                H
              </div>
              <div className="hidden sm:block">
                <span
                  className={cn(
                    "font-display text-xl font-bold transition-colors",
                    overHero
                      ? "text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.45)]"
                      : "text-bakery-dark"
                  )}
                >
                  {BRAND.shortName}
                </span>
                <span
                  className={cn(
                    "block text-[10px] tracking-widest uppercase -mt-0.5 transition-colors",
                    overHero
                      ? "text-white/75 [text-shadow:0_1px_3px_rgba(0,0,0,0.4)]"
                      : "text-muted-foreground"
                  )}
                >
                  Bakery
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.href.replace("#", "");
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative text-sm font-medium py-1 transition-colors duration-200",
                      "after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:rounded-full after:transition-all after:duration-300",
                      isActive ? "after:w-full" : "after:w-0 hover:after:w-full",
                      overHero
                        ? cn(
                            "after:bg-secondary [text-shadow:0_1px_3px_rgba(0,0,0,0.45)] hover:text-secondary",
                            isActive ? "text-secondary" : "text-white/90"
                          )
                        : cn(
                            "after:bg-primary hover:text-primary",
                            isActive ? "text-primary" : "text-bakery-dark/80"
                          )
                    )}
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "hidden md:flex transition-colors",
                    overHero
                      ? "text-white hover:text-secondary hover:bg-white/10 [text-shadow:0_1px_3px_rgba(0,0,0,0.4)]"
                      : "text-bakery-dark hover:text-primary hover:bg-accent"
                  )}
                >
                  <User className="h-4 w-4 mr-1.5" />
                  Login
                </Button>
              </Link>

              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "relative rounded-xl transition-colors",
                  overHero
                    ? "border-white/40 bg-white/10 hover:bg-white/20 hover:border-white/60"
                    : "border-primary/20 hover:bg-accent hover:border-primary/40"
                )}
                onClick={onCartOpen}
                aria-label="Buka keranjang"
              >
                <ShoppingBag
                  className={cn(
                    "h-4 w-4",
                    overHero ? "text-white" : "text-primary"
                  )}
                />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-cream"
                  >
                    {itemCount > 9 ? "9+" : itemCount}
                  </motion.span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "lg:hidden rounded-xl transition-colors",
                  overHero
                    ? "text-white hover:bg-white/10"
                    : "text-bakery-dark hover:bg-accent"
                )}
                onClick={() => setIsMobileOpen(true)}
                aria-label="Buka menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-bakery-dark/40 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-80 max-w-[85vw] bg-white shadow-bakery-lg lg:hidden"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <span className="font-display text-xl font-bold text-bakery-dark">
                  Menu
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex flex-col p-6 gap-1">
                {NAV_LINKS.map((link, i) => {
                  const isActive = activeSection === link.href.replace("#", "");
                  return (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setIsMobileOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "px-4 py-3 rounded-xl font-medium transition-colors",
                        isActive
                          ? "bg-accent text-primary border-l-2 border-primary"
                          : "text-bakery-dark hover:bg-accent hover:text-primary"
                      )}
                    >
                      {link.label}
                    </motion.a>
                  );
                })}
                <Link
                  href="/login"
                  onClick={() => setIsMobileOpen(false)}
                  className="mt-4"
                >
                  <Button className="w-full rounded-xl">
                    <User className="h-4 w-4 mr-2" />
                    Login Staff
                  </Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
