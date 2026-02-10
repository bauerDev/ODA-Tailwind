export default function Ayuda() {
    return (
        <>
        <section className="bg-(--card) py-(--spacing-2xl)">
            <div className="mx-auto w-full max-w-[1280px] px-4">
                <div className="text-center">
                    <h1 className="mb-(--spacing-lg) font-(--font-family-heading) text-4xl md:text-[3rem]">
                        {/* TODO: Agregar lógica condicional para mostrar "Contact" o "Help Center" según request.endpoint */}
                        Help Center
                    </h1>
                    <p className="mx-auto max-w-3xl text-lg text-(--muted-foreground)">
                        {/* TODO: Agregar lógica condicional para mostrar diferentes textos según request.endpoint */}
                        Need help? We&apos;re here to assist you. Send us your inquiry and we&apos;ll respond as soon as possible.
                    </p>
                </div>
            </div>
        </section>

        {/* Main Content */}
        <section className="py-(--spacing-3xl)">
            <div className="mx-auto w-full max-w-[1280px] px-4">
                <div className="grid grid-cols-1 gap-(--spacing-2xl) lg:grid-cols-2">
                    {/* Contact Form */}
                    <div className="order-1 lg:order-0">
                        <div className="border border-(--border) bg-(--card) p-(--spacing-xl)">
                            <h2 className="mb-(--spacing-sm) font-(--font-family-heading) text-2xl">Send us a message</h2>
                            <p className="mb-(--spacing-xl) text-(--muted-foreground)">
                                Fill out the form and we&apos;ll get in touch with you
                            </p>

                            <form className="flex flex-col gap-(--spacing-lg)" method="POST" action="/contact">
                                {/* Name */}
                                <div className="flex flex-col">
                                    <label htmlFor="nombre" className="mb-(--spacing-xs) block font-(--font-family-heading) text-sm text-(--foreground)">
                                        Full name *
                                    </label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        className="w-full border border-(--border) bg-(--card) px-4 py-2 font-inherit text-(--foreground) outline-none transition-colors duration-200 focus:border-(--primary)"
                                        placeholder="Your name"
                                        required
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
                                    />
                                </div>

                                {/* Inquiry type */}
                                <div className="flex flex-col">
                                    <label htmlFor="tipo_consulta" className="mb-(--spacing-xs) block font-(--font-family-heading) text-sm text-(--foreground)">
                                        Inquiry type *
                                    </label>
                                    <select id="tipo_consulta" name="tipo_consulta" className="w-full border border-(--border) bg-(--card) px-4 py-2 font-inherit text-(--foreground) outline-none transition-colors duration-200 focus:border-(--primary)" required>
                                        <option value="">Select an option</option>
                                        <option value="tecnica">Technical issue</option>
                                        <option value="cuenta">Account inquiry</option>
                                        <option value="contenido">Content question</option>
                                        <option value="sugerencia">Suggestion</option>
                                        <option value="otro">Other</option>
                                    </select>
                                </div>

                                {/* Subject */}
                                <div className="flex flex-col">
                                    <label htmlFor="asunto" className="mb-(--spacing-xs) block font-(--font-family-heading) text-sm text-(--foreground)">
                                        Subject *
                                    </label>
                                    <input
                                        type="text"
                                        id="asunto"
                                        name="asunto"
                                        className="w-full border border-(--border) bg-(--card) px-4 py-2 font-inherit text-(--foreground) outline-none transition-colors duration-200 focus:border-(--primary)"
                                        placeholder="Brief summary of your inquiry"
                                        required
                                    />
                                </div>

                                {/* Message */}
                                <div className="flex flex-col">
                                    <label htmlFor="mensaje" className="mb-(--spacing-xs) block font-(--font-family-heading) text-sm text-(--foreground)">
                                        Message *
                                    </label>
                                    <textarea
                                        id="mensaje"
                                        name="mensaje"
                                        rows={6}
                                        className="min-h-[120px] w-full resize-y border border-(--border) bg-(--card) px-4 py-2 font-inherit text-(--foreground) outline-none transition-colors duration-200 focus:border-(--primary)"
                                        placeholder="Describe your inquiry or problem in detail..."
                                        required
                                    ></textarea>
                                </div>

                                {/* Submit Button */}
                                <button type="submit" className="w-full cursor-pointer bg-(--primary) px-(--spacing-xl) py-(--spacing-md) font-(--font-family-heading) text-lg text-(--primary-foreground) transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-[0_4px_12px_rgba(102,20,20,0.3)]">
                                    Send message
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="flex flex-col gap-(--spacing-xl)">
                        <div className="border border-(--border) bg-(--card) p-(--spacing-xl)">
                            <h2 className="mb-(--spacing-lg) font-(--font-family-heading) text-2xl">Frequently asked questions</h2>
                            
                            <div className="flex flex-col gap-(--spacing-lg)">
                                <div className="border-b border-(--border) pb-(--spacing-lg) last:border-b-0 last:pb-0">
                                    <h3 className="mb-(--spacing-sm) font-(--font-family-heading) text-lg text-(--foreground)">How can I create an account?</h3>
                                    <p className="text-[0.9375rem] leading-relaxed text-(--muted-foreground)">
                                        You can create an account by clicking &quot;Sign up&quot; in the top menu. 
                                        The process is quick and free.
                                    </p>
                                </div>

                                <div className="border-b border-(--border) pb-(--spacing-lg) last:border-b-0 last:pb-0">
                                    <h3 className="mb-(--spacing-sm) font-(--font-family-heading) text-lg text-(--foreground)">Do I need to register to use the platform?</h3>
                                    <p className="text-[0.9375rem] leading-relaxed text-(--muted-foreground)">
                                        No, you can explore the gallery and use AI recognition without registering. 
                                        However, creating an account allows you to save your favorite artworks and access additional features.
                                    </p>
                                </div>

                                <div className="border-b border-(--border) pb-(--spacing-lg) last:border-b-0 last:pb-0">
                                    <h3 className="mb-(--spacing-sm) font-(--font-family-heading) text-lg text-(--foreground)">How does AI recognition work?</h3>
                                    <p className="text-[0.9375rem] leading-relaxed text-(--muted-foreground)">
                                        Simply upload an image of an artwork and our artificial intelligence 
                                        will analyze it to provide you with detailed information about the work, its author, and historical context.
                                    </p>
                                </div>

                                <div className="border-b border-(--border) pb-(--spacing-lg) last:border-b-0 last:pb-0">
                                    <h3 className="mb-(--spacing-sm) font-(--font-family-heading) text-lg text-(--foreground)">Can I add my own artworks to the gallery?</h3>
                                    <p className="text-[0.9375rem] leading-relaxed text-(--muted-foreground)">
                                        Yes, registered users can add artworks through the admin panel. 
                                        Artworks will be reviewed before being published.
                                    </p>
                                </div>

                                <div className="border-b border-(--border) pb-(--spacing-lg) last:border-b-0 last:pb-0">
                                    <h3 className="mb-(--spacing-sm) font-(--font-family-heading) text-lg text-(--foreground)">What image formats does recognition accept?</h3>
                                    <p className="text-[0.9375rem] leading-relaxed text-(--muted-foreground)">
                                        We accept images in PNG, JPG, and WEBP formats with a maximum size of 10MB.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="border border-(--border) bg-(--card) p-(--spacing-xl)">
                            <h2 className="mb-(--spacing-lg) font-(--font-family-heading) text-2xl">Contact information</h2>
                            <div className="flex flex-col gap-(--spacing-lg)">
                                <div className="flex items-start gap-(--spacing-md)">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-5 w-5 shrink-0 text-(--primary)">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                        <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                    <div>
                                        <p className="mb-(--spacing-xs) text-sm text-(--muted-foreground)">Email</p>
                                        <p className="text-base font-medium text-(--foreground)">support@oracleofart.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-(--spacing-md)">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-5 w-5 shrink-0 text-(--primary)">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                    <div>
                                        <p className="mb-(--spacing-xs) text-sm text-(--muted-foreground)">Response time</p>
                                        <p className="text-base font-medium text-(--foreground)">24-48 hours</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        </>
    )
} 