export default function Registro() { 
    return ( 
        <>
            <section className="flex min-h-[calc(100vh-7rem)] items-center py-(--spacing-3xl)">
                <div className="mx-auto w-full max-w-[1280px] px-4">
                    <div className="mx-auto w-full max-w-md">
                        <div className="mb-(--spacing-2xl) text-center">
                            <h1 className="mb-(--spacing-sm) font-(--font-family-heading) text-4xl">Create account</h1>
                            <p className="text-base text-(--muted-foreground)">
                                Join Oracle of Art and access all educational features
                            </p>
                        </div>

                        <form className="flex flex-col gap-(--spacing-lg) border border-(--border) bg-(--card) p-(--spacing-xl)" method="POST" action="/register">
                            {/* Full name */}
                            <div className="flex flex-col">
                                <label htmlFor="nombre" className="mb-(--spacing-xs) block font-(--font-family-heading) text-sm text-(--foreground)">
                                    Full name *
                                </label>
                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    className="w-full border border-(--border) bg-(--card) px-4 py-2 font-inherit text-(--foreground) outline-none transition-colors duration-200 focus:border-(--primary)"
                                    placeholder="Your full name"
                                    required
                                    autoComplete="name"
                                />
                            </div>

                            {/* Email */}
                            <div className="flex flex-col">
                                <label htmlFor="email" className="mb-(--spacing-xs) block font-(--font-family-heading) text-sm text-(--foreground)">
                                    Email address *
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

                            {/* User type */}
                            <div className="flex flex-col">
                                <label htmlFor="tipo_usuario" className="mb-(--spacing-xs) block font-(--font-family-heading) text-sm text-(--foreground)">
                                    User type *
                                </label>
                                <select id="tipo_usuario" name="tipo_usuario" className="w-full border border-(--border) bg-(--card) px-4 py-2 font-inherit text-(--foreground) outline-none transition-colors duration-200 focus:border-(--primary)" required>
                                    <option value="">Select your profile</option>
                                    <option value="alumno">Student</option>
                                    <option value="docente">Teacher</option>
                                </select>
                            </div>

                            {/* Institution */}
                            <div className="flex flex-col">
                                <label htmlFor="institucion" className="mb-(--spacing-xs) block font-(--font-family-heading) text-sm text-(--foreground)">
                                    Educational institution
                                </label>
                                <input
                                    type="text"
                                    id="institucion"
                                    name="institucion"
                                    className="w-full border border-(--border) bg-(--card) px-4 py-2 font-inherit text-(--foreground) outline-none transition-colors duration-200 focus:border-(--primary)"
                                    placeholder="University, school, institute..."
                                    autoComplete="organization"
                                />
                            </div>

                            {/* Password */}
                            <div className="flex flex-col">
                                <label htmlFor="password" className="mb-(--spacing-xs) block font-(--font-family-heading) text-sm text-(--foreground)">
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    className="w-full border border-(--border) bg-(--card) px-4 py-2 font-inherit text-(--foreground) outline-none transition-colors duration-200 focus:border-(--primary)"
                                    placeholder="Minimum 8 characters"
                                    required
                                    autoComplete="new-password"
                                    minLength={8}
                                />
                                <p className="mt-(--spacing-xs) text-xs text-(--muted-foreground)">Password must be at least 8 characters long</p>
                            </div>

                            {/* Confirm Password */}
                            <div className="flex flex-col">
                                <label htmlFor="confirm_password" className="mb-(--spacing-xs) block font-(--font-family-heading) text-sm text-(--foreground)">
                                    Confirm password *
                                </label>
                                <input
                                    type="password"
                                    id="confirm_password"
                                    name="confirm_password"
                                    className="w-full border border-(--border) bg-(--card) px-4 py-2 font-inherit text-(--foreground) outline-none transition-colors duration-200 focus:border-(--primary)"
                                    placeholder="Repeat your password"
                                    required
                                    autoComplete="new-password"
                                    minLength={8}
                                />
                            </div>

                            {/* Terms */}
                            <div className="flex flex-col">
                                <label className="flex cursor-pointer items-center gap-(--spacing-xs) text-sm text-(--foreground)">
                                    <input type="checkbox" name="terms" id="terms" required className="h-4 w-4 cursor-pointer accent-(--primary)" />
                                    <span>
                                        I accept the{' '}
                                        <a href="/terminos" className="text-(--primary) transition-opacity duration-200 hover:opacity-80">
                                            terms and conditions
                                        </a>{' '}
                                        and the{' '}
                                        <a href="/privacidad" className="text-(--primary) transition-opacity duration-200 hover:opacity-80">
                                            privacy policy
                                        </a>
                                    </span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button type="submit" className="w-full cursor-pointer bg-(--primary) px-(--spacing-xl) py-(--spacing-md) font-(--font-family-heading) text-lg text-(--primary-foreground) transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-[0_4px_12px_rgba(102,20,20,0.3)]">
                                Create account
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="my-(--spacing-xl) flex items-center text-center text-(--muted-foreground) before:content-[''] before:flex-1 before:border-b before:border-(--border) after:content-[''] after:flex-1 after:border-b after:border-(--border)">
                            <span className="px-4 text-sm">o</span>
                        </div>

                        {/* Login Link */}
                        <div className="text-center">
                            <p className="text-sm text-(--muted-foreground)">
                                Already have an account?
                                <a href="/login" className="font-medium text-(--primary) transition-opacity duration-200 hover:opacity-80">Sign in here</a>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}