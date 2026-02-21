"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/";
  const errorParam = searchParams?.get("error") ?? "";
  const [error, setError] = useState(
    errorParam === "OAuthSignin" || errorParam === "OAuthCallback" || errorParam === "OAuthCreateAccount"
      ? "Google sign-in failed. Check that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in .env.local and that the redirect URI http://localhost:3000/api/auth/callback/google is added in Google Cloud Console."
      : ""
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    await signIn("google", { callbackUrl });
  }

  return (
    <>
      <section className="flex min-h-[calc(100vh-7rem)] items-center py-(--spacing-3xl)">
        <div className="mx-auto w-full max-w-[1280px] px-4">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-(--spacing-2xl) text-center">
              <h1 className="mb-(--spacing-sm) font-(--font-family-heading) text-4xl">Sign In</h1>
              <p className="text-base text-(--muted-foreground)">
                Access your account to manage your favorite artworks and access all features
              </p>
            </div>

            <form
              className="flex flex-col gap-(--spacing-lg) border border-(--border) bg-(--card) p-(--spacing-xl)"
              onSubmit={handleSubmit}
            >
              {error && (
                <p className="rounded-none border border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}
              <div className="flex flex-col">
                <label htmlFor="email" className="mb-(--spacing-xs) block font-(--font-family-heading) text-sm text-(--foreground)">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full border border-(--border) bg-(--card) px-4 py-2 font-inherit text-(--foreground) outline-none transition-colors duration-200 focus:border-(--primary)"
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="password" className="mb-(--spacing-xs) block font-(--font-family-heading) text-sm text-(--foreground)">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full border border-(--border) bg-(--card) px-4 py-2 font-inherit text-(--foreground) outline-none transition-colors duration-200 focus:border-(--primary)"
                  placeholder="Your password"
                  required
                  autoComplete="current-password"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-(--spacing-sm)">
                <label className="flex cursor-pointer items-center gap-(--spacing-xs) text-sm text-(--foreground)">
                  <input type="checkbox" name="remember" id="remember" className="h-4 w-4 cursor-pointer accent-(--primary)" />
                  <span>Remember me</span>
                </label>
                <Link href="#" className="text-sm text-(--primary) transition-opacity duration-200 hover:opacity-80">Forgot your password?</Link>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer bg-(--primary) px-(--spacing-xl) py-(--spacing-md) font-(--font-family-heading) text-lg text-(--primary-foreground) transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-[0_4px_12px_rgba(102,20,20,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="my-(--spacing-xl) flex items-center text-center text-(--muted-foreground) before:content-[''] before:flex-1 before:border-b before:border-(--border) after:content-[''] after:flex-1 after:border-b after:border-(--border)">
              <span className="px-4 text-sm">or</span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleGoogle}
                className="flex w-full items-center justify-center gap-2 border border-(--border) bg-(--card) px-4 py-3 font-(--font-family-heading) text-(--foreground) transition-colors hover:bg-(--muted)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </div>

            <div className="mt-(--spacing-xl) text-center">
              <p className="text-sm text-(--muted-foreground)">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-medium text-(--primary) transition-opacity duration-200 hover:opacity-80">
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
