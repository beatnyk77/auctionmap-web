import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Search,
  Info,
  Bell,
  BarChart3,
  Kanban,
  Bookmark,
  CreditCard,
} from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { AuthNav } from "./AuthNav";
import { PlanBadge } from "@/components/billing/PlanBadge";
import type { PlanTier } from "@/lib/plans";
import type { Tenant } from "@/lib/tenant";

const NAV = [
  { href: "/", label: "Map", icon: MapPin },
  { href: "/search", label: "Search", icon: Search },
  { href: "/deals", label: "Deals", icon: Kanban, auth: true },
  { href: "/saved", label: "Saved", icon: Bookmark, auth: true },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/brief", label: "Brief", icon: BarChart3 },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/about", label: "About", icon: Info },
];

interface HeaderProps {
  tenant?: Tenant | null;
  plan?: PlanTier;
}

export async function Header({ tenant = null, plan }: HeaderProps) {
  const user = await getSessionUser();
  const brandName = tenant?.brand_name ?? "AuctionMap";
  const tagline = tenant?.tagline ?? "Distressed property intelligence";
  const primary = tenant?.primary_color ?? "#0f172a";

  return (
    <header className="z-50 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md">
      <Link href="/" className="flex items-center gap-2">
        {tenant?.logo_url ? (
          <Image
            src={tenant.logo_url}
            alt={brandName}
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg object-contain"
            unoptimized
          />
        ) : (
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
            style={{ backgroundColor: primary }}
          >
            {brandName.slice(0, 2).toUpperCase()}
          </span>
        )}
        <div className="leading-tight">
          <p className="text-sm font-semibold text-slate-900">{brandName}</p>
          <p className="text-[11px] text-slate-500">{tagline}</p>
        </div>
      </Link>

      <div className="flex items-center gap-2">
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map(({ href, label, icon: Icon, auth }) => {
            if (auth && !user) return null;
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
        {user && plan && <PlanBadge plan={plan} />}
        <AuthNav email={user?.email} />
      </div>
    </header>
  );
}