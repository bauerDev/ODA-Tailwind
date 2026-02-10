export default function Footer() {
    return (
        <footer className="bg-(--primary) text-(--primary-foreground) py-(--spacing-2xl)">
            <div className="container">
                <div className="grid grid-cols-1 gap-(--spacing-6xl) md:grid-cols-4">
                    <div className="md:col-span-2">
                        <h2 className="font-(--font-family-heading) text-2xl mb-(--spacing-lg)">
                            Oracle<br />of Arts
                        </h2>
                        <p className="text-[#f5f5f5cc] max-w-md">
                            Educational platform dedicated to the exploration and learning
                            of Art History. Discover masterpieces from all eras.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-(--font-family-heading) text-lg mb-(--spacing-sm)">
                            Navigation
                        </h3>
                        <ul className="list-none flex flex-col gap-(--spacing-sm) text-[#f5f5f5cc] [&>li>a]:text-[#f5f5f5cc] [&>li>a]:no-underline [&>li>a]:hover:text-(--primary-foreground)">
                            <li><a href="/gallery">Gallery</a></li>
                            <li><a href="/ai-recognition">AI / Recognition</a></li>
                            <li><a href="/contact">Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-(--font-family-heading) text-lg mb-(--spacing-sm)">
                            Legal
                        </h3>
                        <ul className="list-none flex flex-col gap-(--spacing-sm) text-[#f5f5f5cc] [&>li>a]:text-[#f5f5f5cc] [&>li>a]:no-underline [&>li>a]:hover:text-(--primary-foreground)">
                            <li><a href="/politica-de-privacidad">Privacy Policy</a></li>
                            <li><a href="/terminos-de-uso">Terms of Use</a></li>
                            <li><a href="/accesibilidad">Accessibility</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-(--spacing-2xl) pt-(--spacing-xl) border-t border-[#f5f5f533] text-[#f5f5f599] text-center">
                    <p>© 2026 Oracle of Art. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
};