import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { getSessionUser } from "@/lib/auth";
import { fetchUserProfile } from "@/lib/billing";
import { getActiveTenant, tenantThemeStyle } from "@/lib/tenant";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getActiveTenant();
  if (tenant) {
    return {
      title: `${tenant.brand_name} — Bank auction intelligence`,
      description: tenant.tagline ?? "Distressed property intelligence",
    };
  }
  return {
    title: "AuctionMap — Distressed Property Intelligence",
    description:
      "Map and search bank auction properties across India. Risk-scored listings from SARFAESI, DRT, and NPA sales.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [tenant, user] = await Promise.all([getActiveTenant(), getSessionUser()]);
  const profile = user ? await fetchUserProfile(user.id) : null;
  const themeStyle = tenantThemeStyle(tenant);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      style={themeStyle}
      data-tenant={tenant?.slug}
    >
      <body className="flex h-full min-h-screen flex-col antialiased">
        <Header tenant={tenant} plan={profile?.plan} />
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}