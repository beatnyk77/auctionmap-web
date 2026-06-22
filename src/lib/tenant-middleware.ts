import { type NextRequest, NextResponse } from "next/server";
import { parseTenantSlugFromHost } from "./tenant";

const TENANT_COOKIE = "am_tenant_slug";

export function applyTenantContext(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const host = request.headers.get("host") ?? "";
  const queryTenant = request.nextUrl.searchParams.get("tenant");
  const slug = queryTenant ?? parseTenantSlugFromHost(host);

  if (slug) {
    response.cookies.set(TENANT_COOKIE, slug, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    response.headers.set("x-tenant-slug", slug);
  } else {
    response.cookies.delete(TENANT_COOKIE);
  }

  return response;
}