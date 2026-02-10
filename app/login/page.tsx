export default function LoginPage() { 
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

                    <form className="flex flex-col gap-(--spacing-lg) border border-(--border) bg-(--card) p-(--spacing-xl)" method="POST" action="/login">
                        {/* Email */}
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

                        {/* Password */}
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

                        {/* Remember me & Forgot password */}
                        <div className="flex flex-wrap items-center justify-between gap-(--spacing-sm)">
                            <label className="flex cursor-pointer items-center gap-(--spacing-xs) text-sm text-(--foreground)">
                                <input type="checkbox" name="remember" id="remember" className="h-4 w-4 cursor-pointer accent-(--primary)" />
                                <span>Remember me</span>
                            </label>
                            <a href="#" className="text-sm text-(--primary) transition-opacity duration-200 hover:opacity-80">Forgot your password?</a>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className="w-full cursor-pointer bg-(--primary) px-(--spacing-xl) py-(--spacing-md) font-(--font-family-heading) text-lg text-(--primary-foreground) transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-[0_4px_12px_rgba(102,20,20,0.3)]">
                            Sign in
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-(--spacing-xl) flex items-center text-center text-(--muted-foreground) before:content-[''] before:flex-1 before:border-b before:border-(--border) after:content-[''] after:flex-1 after:border-b after:border-(--border)">
                        <span className="px-4 text-sm">o</span>
                    </div>

                    {/* Register Link */}
                    <div className="text-center">
                        <p className="text-sm text-(--muted-foreground)">
                            Don&apos;t have an account?
                            <a href="/register" className="font-medium text-(--primary) transition-opacity duration-200 hover:opacity-80"> Sign up here</a>
                        </p>
                    </div>
                </div>
            </div>
        </section>
        </>
    )
}