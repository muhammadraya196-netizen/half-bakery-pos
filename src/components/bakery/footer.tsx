"use client";

import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import { BRAND, NAV_LINKS, OUTLETS } from "@/lib/bakery-data";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="kontak" className="bg-bakery-dark text-white">
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-display font-bold text-xl">
                H
              </div>
              <div>
                <p className="font-display text-xl font-bold">{BRAND.shortName}</p>
                <p className="text-xs text-white/50 tracking-widest uppercase">
                  Cake & Bakery
                </p>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Premium artisan bakery & cake shop di Makassar. Fresh daily,
              handmade with love.
            </p>
            <div className="flex gap-3">
              <a
                href={BRAND.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-primary transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href={BRAND.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-primary transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-5">Menu</h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href="/login"
                  className="text-sm text-white/60 hover:text-secondary transition-colors"
                >
                  Login Staff
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-5">
              Jam Operasional
            </h4>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <Clock className="h-4 w-4 text-secondary shrink-0" />
              <span>{BRAND.hours}</span>
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-5">Alamat</h4>
            <ul className="space-y-4">
              {OUTLETS.map((outlet) => (
                <li key={outlet.id} className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white/80">
                      {outlet.name}
                    </p>
                    <p className="text-xs text-white/50 mt-0.5">
                      {outlet.address}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            &copy; {currentYear} {BRAND.name}. All rights reserved.
          </p>
          <p className="text-sm text-white/40">
            Made with love in Makassar
          </p>
        </div>
      </div>
    </footer>
  );
}
