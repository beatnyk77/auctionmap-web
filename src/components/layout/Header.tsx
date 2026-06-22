import Link from "next/link";
import {
  MapPin,
  Search,
  Info,
  Bell,
  BarChart3,
  Kanban,
  Bookmark,
} from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { AuthNav } from "./AuthNav";

const NAV = [
  { href: "/", label: "Map", icon: MapPin },
  { href: "/search", label: "Search", icon: Search },
  { href: "/deals", label: "Deals", icon: Kanban, auth: true },
  { href: "/saved", label: "Saved", icon: Bookmark, auth: true },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/brief", label: "Brief", icon: BarChart3 },
  { href: "/about", label: "About", icon: Info },
];

export async function Header() {
  const user = await getSessionUser();

  return (
    <header className="z-50 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
          AM
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-slate-900">AuctionMap</p>
          <p className="text-[11px] text-slate-500">Distressed property intelligence</p>
        </div>
      </Link>

      <div className="flex items-center gap-2">
        <nav className="hidden items-center gap-1 md:flex">
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
        <AuthNav email={user?.email} />
      </div>
    </header>
  );
}