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
  const itemCount = useCartStore((s) => s.getItemCount());

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
            ? "glass shadow-bakery py-3"
            : "bg-transparent py-4 md:py-5"
        )}
      >
        <div className="container mx-auto px-4 md:px-6">
          <nav className="flex items-center justify-between">
            <Link href="#home" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg shadow-bakery transition-transform group-hover:scale-105">
                H
              </div>
              <div className="hidden sm:block">
                <span className="font-display text-xl font-bold text-bakery-dark">
                  {BRAND.shortName}
                </span>
                <span className="block text-[10px] tracking-widest uppercase text-muted-foreground -mt-0.5">
                  Bakery
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-bakery-dark/80 hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:flex text-bakery-dark hover:text-primary hover:bg-accent"
                >
                  <User className="h-4 w-4 mr-1.5" />
                  Login
                </Button>
              </Link>

              <Button
                variant="outline"
                size="icon"
                className="relative rounded-xl border-primary/20 hover:bg-accent hover:border-primary/40"
                onClick={onCartOpen}
              >
                <ShoppingBag className="h-4 w-4 text-primary" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                  >
                    {itemCount > 9 ? "9+" : itemCount}
                  </motion.span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-xl"
                onClick={() => setIsMobileOpen(true)}
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
                {NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setIsMobileOpen(false)}
                    className="px-4 py-3 rounded-xl text-bakery-dark font-medium hover:bg-accent hover:text-primary transition-colors"
                  >
                    {link.label}
                  </motion.a>
                ))}
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
