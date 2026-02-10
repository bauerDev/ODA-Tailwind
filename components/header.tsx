'use client'

import Link from 'next/link'
import { useUserMenu } from '../hooks/useUserMenu'

export default function Header() {
    const { isMenuOpen, menuRef, toggleMenu } = useUserMenu()
    return (
        <header style={{ backgroundColor: 'var(--primary)' }}>
            <div className="container mx-auto flex items-center justify-between h-20">

                {/* Logo */}

                <Link href="/" className="shrink-0">
                    <h1 className="text-2xl leading-tight" style={{ fontFamily: 'var(--font-family-heading)', color: 'var(--primary-foreground)' }}>
                        Oracle<br />
                        <span className="text-xl" style={{ fontFamily: 'var(--font-family-heading)', color: 'var(--primary-foreground)' }}>of Art</span>
                    </h1>
                </Link>

                {/* Menú de navegación */}

                <nav className="flex items-center gap-10">
                    <Link href="/" className="opacity-80 transition-opacity duration-200 hover:opacity-100" style={{ color: 'var(--primary-foreground)' }}>Home</Link>
                    <Link href="/gallery" className="opacity-80 transition-opacity duration-200 hover:opacity-100" style={{ color: 'var(--primary-foreground)' }}>Gallery</Link>
                    <Link href="/ai-recognition" className="opacity-80 transition-opacity duration-200 hover:opacity-100" style={{ color: 'var(--primary-foreground)' }}>AI / Recognition</Link>
                    <Link href="/my-collection" className="opacity-80 transition-opacity duration-200 hover:opacity-100" style={{ color: 'var(--primary-foreground)' }}>My Collection</Link>
                    <Link href="/contact" className="opacity-80 transition-opacity duration-200 hover:opacity-100" style={{ color: 'var(--primary-foreground)' }}>Contact</Link>
                </nav>

                {/* Menú de usuario */}

                <div className="flex items-center gap-4">

                    <button 
                        className="opacity-80 transition-opacity duration-200 hover:opacity-100 bg-transparent border-none cursor-pointer p-0 flex items-center" 
                        aria-label="Search" 
                        style={{ color: 'var(--primary-foreground)' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                    </button>

                    {/* User menu */}
                    <div className="relative" ref={menuRef} id="user-menu-container">
                        <button
                            onClick={toggleMenu}
                            className="opacity-80 transition-opacity duration-200 hover:opacity-100 bg-transparent border-none cursor-pointer p-0 flex items-center gap-1"
                            aria-label="User menu"
                            style={{ color: 'var(--primary-foreground)' }}
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
                                className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
                            >
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>

                        <div
                            id="user-menu"
                            className={`absolute top-full right-0 mt-2 w-48 min-w-[200px] rounded-md shadow-lg z-50 p-0 ${isMenuOpen ? 'block' : 'hidden'}`}
                            style={{
                                backgroundColor: 'var(--card)',
                                border: '1px solid var(--border)',
                                color: 'var(--foreground)'
                            }}
                        >
                            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
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
                                        style={{ color: 'var(--muted-foreground)' }}
                                    >
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                    <p className="text-sm leading-5 m-0" style={{ fontFamily: 'var(--font-family-heading)' }}>
                                        Sign in as<br />student or teacher
                                    </p>
                                </div>
                            </div>
                            <div className="py-1">
                                <Link
                                    href="/login"
                                    className="block px-4 py-2 text-sm underline transition-colors duration-200 cursor-pointer hover:bg-(--muted)"
                                    style={{ color: 'var(--foreground)' }}
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/register"
                                    className="block px-4 py-2 text-sm underline transition-colors duration-200 cursor-pointer hover:bg-(--muted)"
                                    style={{ color: 'var(--foreground)' }}
                                >
                                    Sign up
                                </Link>
                                <Link
                                    href="/contact"
                                    className="block px-4 py-2 text-sm no-underline transition-colors duration-200 cursor-pointer hover:bg-(--muted)"
                                    style={{ color: 'var(--foreground)' }}
                                >
                                    Help
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}