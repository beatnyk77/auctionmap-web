import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
        <p className="mt-2 text-sm text-slate-500">
          Access your deal pipeline, saved searches, and private notes.
        </p>

        {params.error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Sign-in failed. Please try again.
          </p>
        )}

        <LoginForm redirect={params.redirect ?? "/deals"} />

        <p className="mt-6 text-center text-sm text-slate-500">
          No account?{" "}
          <Link
            href={`/signup${params.redirect ? `?redirect=${encodeURIComponent(params.redirect)}` : ""}`}
            className="font-medium text-slate-900 hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}