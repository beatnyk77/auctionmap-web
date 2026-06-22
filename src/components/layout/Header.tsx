import Link from "next/link";
import { MapPin, Search, Info, Bell, BarChart3 } from "lucide-react";

const NAV = [
  { href: "/", label: "Map", icon: MapPin },
  { href: "/search", label: "Search", icon: Search },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/brief", label: "Brief", icon: BarChart3 },
  { href: "/about", label: "About", icon: Info },
];

export function Header() {
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

      <nav className="flex items-center gap-1">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}