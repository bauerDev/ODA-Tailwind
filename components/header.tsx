"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useUserMenu } from "../hooks/useUserMenu";

export default function Header() {
  const { data: session, status } = useSession();
  const { isMenuOpen, menuRef, toggleMenu } = useUserMenu();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Cerrar menú móvil al cambiar de ruta o al redimensionar a desktop
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const navLinks = (
    <>
      <Link href="/" className="opacity-80 transition-opacity duration-200 hover:opacity-100" style={{ color: "var(--primary-foreground)" }} onClick={closeMobileMenu}>Home</Link>
      <Link href="/gallery" className="opacity-80 transition-opacity duration-200 hover:opacity-100" style={{ color: "var(--primary-foreground)" }} onClick={closeMobileMenu}>Gallery</Link>
      <Link href="/ai-recognition" className="opacity-80 transition-opacity duration-200 hover:opacity-100" style={{ color: "var(--primary-foreground)" }} onClick={closeMobileMenu}>AI / Recognition</Link>
      {status === "loading" ? (
        <>
          <span className="invisible select-none" aria-hidden="true" style={{ fontFamily: "var(--font-family-heading)" }}>My Collection</span>
          <span className="invisible select-none" aria-hidden="true" style={{ fontFamily: "var(--font-family-heading)" }}>Contact</span>
        </>
      ) : !session?.user?.isAdmin ? (
        <>
          <Link href="/my-collection" className="opacity-80 transition-opacity duration-200 hover:opacity-100" style={{ color: "var(--primary-foreground)" }} onClick={closeMobileMenu}>My Collection</Link>
          <Link href="/contact" className="opacity-80 transition-opacity duration-200 hover:opacity-100" style={{ color: "var(--primary-foreground)" }} onClick={closeMobileMenu}>Contact</Link>
        </>
      ) : (
        <Link href="/admin" className="opacity-80 transition-opacity duration-200 hover:opacity-100" style={{ color: "var(--primary-foreground)" }} onClick={closeMobileMenu}>Admin</Link>
      )}
    </>
  );

  return (
    <header style={{ backgroundColor: "var(--primary)" }} className="relative">
      <div className="container mx-auto flex h-16 min-h-16 items-center justify-between">
        <Link href="/" className="shrink-0" onClick={closeMobileMenu}>
          <h1 className="text-xl leading-tight sm:text-2xl" style={{ fontFamily: "var(--font-family-heading)", color: "var(--primary-foreground)" }}>
            Oracle<br />
            <span className="text-lg sm:text-xl" style={{ fontFamily: "var(--font-family-heading)", color: "var(--primary-foreground)" }}>of Art</span>
          </h1>
        </Link>

        {/* Navegación desktop: visible solo en lg+ */}
        <nav className="hidden items-center gap-6 lg:flex xl:gap-10">
          {navLinks}
        </nav>

        {/* Botón hamburguesa: solo móvil/tablet */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((o) => !o)}
          className="flex h-10 w-10 shrink-0 items-center justify-center border-none bg-transparent p-0 opacity-90 transition-opacity hover:opacity-100 lg:hidden"
          aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          style={{ color: "var(--primary-foreground)" }}
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            className="hidden cursor-pointer items-center border-none bg-transparent p-0 opacity-80 transition-opacity duration-200 hover:opacity-100 sm:flex"
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
              className={`absolute right-0 top-full z-50 mt-2 block w-48 min-w-[200px] rounded-none p-0 shadow-lg ${isMenuOpen ? "block" : "hidden"}`}
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
                    <div className="m-0">
                      <p className="text-sm leading-5" style={{ fontFamily: "var(--font-family-heading)" }}>
                        {session.user.name || session.user.email}
                      </p>
                      {session.user.role && (
                        <p className="m-0 text-xs leading-4 opacity-80" style={{ color: "var(--muted-foreground)" }}>
                          {session.user.role}
                        </p>
                      )}
                    </div>
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
                    {!session.user.isAdmin && (
                      <Link
                        href="/my-collection"
                        className="block cursor-pointer px-4 py-2 text-sm transition-colors duration-200 hover:bg-(--muted)"
                        style={{ color: "var(--foreground)" }}
                      >
                        My Collection
                      </Link>
                    )}
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
                {!session?.user?.isAdmin && (
                  <Link
                    href="/contact"
                    className="block cursor-pointer px-4 py-2 text-sm no-underline transition-colors duration-200 hover:bg-(--muted)"
                    style={{ color: "var(--foreground)" }}
                  >
                    Help
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menú móvil: panel desplegable */}
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out lg:hidden ${isMobileMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"}`}
        style={{ backgroundColor: "var(--primary)" }}
        aria-hidden={!isMobileMenuOpen}
      >
        <nav className="flex flex-col gap-0 border-t border-[rgba(245,245,245,0.2)] px-4 py-4">
          <Link href="/" className="py-3 text-(--primary-foreground) opacity-90 hover:opacity-100" onClick={closeMobileMenu}>Home</Link>
          <Link href="/gallery" className="py-3 text-(--primary-foreground) opacity-90 hover:opacity-100" onClick={closeMobileMenu}>Gallery</Link>
          <Link href="/ai-recognition" className="py-3 text-(--primary-foreground) opacity-90 hover:opacity-100" onClick={closeMobileMenu}>AI / Recognition</Link>
          {!session?.user?.isAdmin && (
            <>
              <Link href="/my-collection" className="py-3 text-(--primary-foreground) opacity-90 hover:opacity-100" onClick={closeMobileMenu}>My Collection</Link>
              <Link href="/contact" className="py-3 text-(--primary-foreground) opacity-90 hover:opacity-100" onClick={closeMobileMenu}>Contact</Link>
            </>
          )}
          {session?.user?.isAdmin && (
            <Link href="/admin" className="py-3 text-(--primary-foreground) opacity-90 hover:opacity-100" onClick={closeMobileMenu}>Admin</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
