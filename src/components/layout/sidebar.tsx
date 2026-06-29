"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Receipt,
  Settings,
  ExternalLink,
  Boxes,
  PackagePlus,
  PackageMinus,
  History,
  ChevronDown,
  Users,
  UserPlus,
  List,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-permissions";

interface NavLeaf {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  icon: LucideIcon;
  basePath: string;
  children: NavLeaf[];
}

const navItems: NavLeaf[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pos", label: "Kasir (POS)", icon: ShoppingCart },
  { href: "/products", label: "Produk", icon: Package },
  { href: "/orders", label: "Daftar Penjualan", icon: Receipt },
];

const stockGroup: NavGroup = {
  label: "Manajemen Stok",
  icon: Boxes,
  basePath: "/stock",
  children: [
    { href: "/stock", label: "Dashboard Stok", icon: Boxes },
    { href: "/stock/in", label: "Stok Masuk", icon: PackagePlus },
    { href: "/stock/out", label: "Stok Keluar", icon: PackageMinus },
    { href: "/stock/history", label: "Riwayat Pergerakan Stok", icon: History },
  ],
};

const userGroup: NavGroup = {
  label: "Manajemen User",
  icon: Users,
  basePath: "/users",
  children: [
    { href: "/users", label: "Daftar User", icon: List },
    { href: "/users/new", label: "Tambah User", icon: UserPlus },
  ],
};

const settingsItem: NavLeaf = {
  href: "/settings",
  label: "Pengaturan",
  icon: Settings,
};

export function Sidebar() {
  const pathname = usePathname();
  const { canViewUsers, canMutateUsers } = usePermissions();
  const stockActive = pathname.startsWith(stockGroup.basePath);
  const userActive = pathname.startsWith(userGroup.basePath);
  const [stockOpen, setStockOpen] = useState(stockActive);
  const [userOpen, setUserOpen] = useState(userActive);

  // Cashier tidak dapat melihat submenu "Tambah User".
  const userChildren = canMutateUsers
    ? userGroup.children
    : userGroup.children.filter((c) => c.href !== "/users/new");

  const leafClass = (href: string, exact = false) => {
    const isActive = exact
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);
    return cn(
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
      isActive
        ? "bg-primary text-primary-foreground shadow-bakery"
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    );
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-cream/30">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg shadow-bakery">
          H
        </div>
        <div>
          <h1 className="font-display text-lg font-bold leading-none text-bakery-dark">
            HALF Bakery
          </h1>
          <p className="text-xs text-muted-foreground">Staff Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={leafClass(item.href)}>
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}

        {/* Manajemen Stok (collapsible) */}
        <div>
          <button
            type="button"
            onClick={() => setStockOpen((v) => !v)}
            aria-expanded={stockOpen}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              stockActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <stockGroup.icon className="h-5 w-5" />
            <span className="flex-1 text-left">{stockGroup.label}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                stockOpen && "rotate-180"
              )}
            />
          </button>

          {stockOpen && (
            <div className="mt-1 space-y-1 pl-4">
              {stockGroup.children.map((child) => {
                const Icon = child.icon;
                // Dashboard Stok (/stock) butuh exact match agar tidak selalu aktif
                const exact = child.href === stockGroup.basePath;
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={leafClass(child.href, exact)}
                  >
                    <Icon className="h-4 w-4" />
                    {child.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Manajemen User (collapsible) — hanya Admin & Finance */}
        {canViewUsers && (
          <div>
            <button
              type="button"
              onClick={() => setUserOpen((v) => !v)}
              aria-expanded={userOpen}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                userActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <userGroup.icon className="h-5 w-5" />
              <span className="flex-1 text-left">{userGroup.label}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  userOpen && "rotate-180"
                )}
              />
            </button>

            {userOpen && (
              <div className="mt-1 space-y-1 pl-4">
                {userChildren.map((child) => {
                  const Icon = child.icon;
                  const exact = child.href === userGroup.basePath;
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={leafClass(child.href, exact)}
                    >
                      <Icon className="h-4 w-4" />
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <Link href={settingsItem.href} className={leafClass(settingsItem.href)}>
          <settingsItem.icon className="h-5 w-5" />
          {settingsItem.label}
        </Link>
      </nav>

      <div className="border-t p-4 space-y-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Lihat Website
        </Link>
        <p className="text-xs text-muted-foreground text-center">
          HALF Bakery v1.0.0
        </p>
      </div>
    </aside>
  );
}
