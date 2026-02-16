"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useUserMenu } from "../hooks/useUserMenu";

export default function Header() {
  const { data: session, status } = useSession();
  const { isMenuOpen, menuRef, toggleMenu } = useUserMenu();

  return (
    <header style={{ backgroundColor: "var(--primary)" }}>
      <div className="container mx-auto flex h-20 items-center justify-between">
        <Link href="/" className="shrink-0">
          <h1 className="text-2xl leading-tight" style={{ fontFamily: "var(--font-family-heading)", color: "var(--primary-foreground)" }}>
            Oracle<br />
            <span className="text-xl" style={{ fontFamily: "var(--font-family-heading)", color: "var(--primary-foreground)" }}>of Art</span>
          </h1>
        </Link>

        <nav className="flex items-center gap-10">
          <Link href="/" className="opacity-80 transition-opacity duration-200 hover:opacity-100" style={{ color: "var(--primary-foreground)" }}>Home</Link>
          <Link href="/gallery" className="opacity-80 transition-opacity duration-200 hover:opacity-100" style={{ color: "var(--primary-foreground)" }}>Gallery</Link>
          <Link href="/ai-recognition" className="opacity-80 transition-opacity duration-200 hover:opacity-100" style={{ color: "var(--primary-foreground)" }}>AI / Recognition</Link>
          <Link href="/my-collection" className="opacity-80 transition-opacity duration-200 hover:opacity-100" style={{ color: "var(--primary-foreground)" }}>My Collection</Link>
          <Link href="/contact" className="opacity-80 transition-opacity duration-200 hover:opacity-100" style={{ color: "var(--primary-foreground)" }}>Contact</Link>
          {session?.user?.isAdmin && (
            <Link href="/admin" className="opacity-80 transition-opacity duration-200 hover:opacity-100" style={{ color: "var(--primary-foreground)" }}>Admin</Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <button
            className="flex cursor-pointer items-center border-none bg-transparent p-0 opacity-80 transition-opacity duration-200 hover:opacity-100"
            aria-label="Search"
            style={{ color: "var(--primary-foreground)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>

          <div className="relative" ref={menuRef} id="user-menu-container">
            <button
              onClick={toggleMenu}
              className="flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 opacity-80 transition-opacity duration-200 hover:opacity-100"
              aria-label="User menu"
              style={{ color: "var(--primary-foreground)" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <div
              id="user-menu"
              className={`absolute right-0 top-full z-50 mt-2 block w-48 min-w-[200px] rounded-md p-0 shadow-lg ${isMenuOpen ? "block" : "hidden"}`}
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            >
              <div className="border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  {status === "loading" ? (
                    <p className="m-0 text-sm leading-5" style={{ fontFamily: "var(--font-family-heading)" }}>Loading…</p>
                  ) : session?.user ? (
                    <p className="m-0 text-sm leading-5" style={{ fontFamily: "var(--font-family-heading)" }}>
                      {session.user.name || session.user.email}
                    </p>
                  ) : (
                    <p className="m-0 text-sm leading-5" style={{ fontFamily: "var(--font-family-heading)" }}>
                      Sign in as<br />student or teacher
                    </p>
                  )}
                </div>
              </div>
              <div className="py-1">
                {session?.user ? (
                  <>
                    <Link
                      href="/my-collection"
                      className="block cursor-pointer px-4 py-2 text-sm transition-colors duration-200 hover:bg-(--muted)"
                      style={{ color: "var(--foreground)" }}
                    >
                      My Collection
                    </Link>
                    {session.user.isAdmin && (
                      <Link
                        href="/admin"
                        className="block cursor-pointer px-4 py-2 text-sm transition-colors duration-200 hover:bg-(--muted)"
                        style={{ color: "var(--foreground)" }}
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="block w-full cursor-pointer px-4 py-2 text-left text-sm underline transition-colors duration-200 hover:bg-(--muted)"
                      style={{ color: "var(--foreground)" }}
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block cursor-pointer px-4 py-2 text-sm underline transition-colors duration-200 hover:bg-(--muted)"
                      style={{ color: "var(--foreground)" }}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      className="block cursor-pointer px-4 py-2 text-sm underline transition-colors duration-200 hover:bg-(--muted)"
                      style={{ color: "var(--foreground)" }}
                    >
                      Sign up
                    </Link>
                  </>
                )}
                <Link
                  href="/contact"
                  className="block cursor-pointer px-4 py-2 text-sm no-underline transition-colors duration-200 hover:bg-(--muted)"
                  style={{ color: "var(--foreground)" }}
                >
                  Help
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
