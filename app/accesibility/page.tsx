export default function accessibility() {
  return (
    <>
      <section className="bg-(--card) py-(--spacing-2xl)">
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-(--spacing-lg) font-(--font-family-heading) text-4xl md:text-[3rem]">
              Accessibility
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-(--muted-foreground)">
              Our commitment to making Oracle of Art usable for everyone.
            </p>
          </div>
        </div>
      </section>

      <section className="py-(--spacing-2xl) sm:py-(--spacing-3xl)">
        <div className="mx-auto w-full max-w-[800px] px-4 sm:px-6 lg:px-8 prose prose-(--foreground)">
          <h2 className="font-(--font-family-heading) text-2xl mt-(--spacing-2xl) mb-(--spacing-md)">Our commitment</h2>
          <p className="text-(--muted-foreground) leading-relaxed mb-(--spacing-lg)">
            Oracle of Art aims to be accessible to all users, including people with disabilities. We strive to follow widely accepted guidelines such as the Web Content Accessibility Guidelines (WCAG) where practicable, so that our educational content and tools can be used by as many people as possible.
          </p>

          <h2 className="font-(--font-family-heading) text-2xl mt-(--spacing-2xl) mb-(--spacing-md)">What we do</h2>
          <ul className="list-disc pl-6 text-(--muted-foreground) space-y-2 mb-(--spacing-lg)">
            <li><strong className="text-(--foreground)">Semantic structure:</strong> We use headings, lists and landmarks so that screen readers and assistive technologies can navigate the site logically.</li>
            <li><strong className="text-(--foreground)">Text alternatives:</strong> Images of artworks and interface elements include descriptive alternative text (alt attributes) where appropriate.</li>
            <li><strong className="text-(--foreground)">Keyboard navigation:</strong> Core actions (menus, links, buttons, forms) can be operated via keyboard. We avoid relying solely on mouse or touch for essential tasks.</li>
            <li><strong className="text-(--foreground)">Contrast and readability:</strong> We use colour combinations and font sizes intended to be readable. Important information is not conveyed by colour alone.</li>
            <li><strong className="text-(--foreground)">Forms and labels:</strong> Form fields are associated with visible labels so that assistive technologies can identify them correctly.</li>
            <li><strong className="text-(--foreground)">Responsive design:</strong> The layout adapts to different screen sizes and zoom levels to support various devices and user preferences.</li>
          </ul>

          <h2 className="font-(--font-family-heading) text-2xl mt-(--spacing-2xl) mb-(--spacing-md)">Known limitations</h2>
          <p className="text-(--muted-foreground) leading-relaxed mb-(--spacing-lg)">
            Some third-party content (e.g. embedded media or external links) may not meet the same accessibility standards. Our AI recognition feature is based on image analysis and may not be fully usable in all assistive workflows. We are continuously working to improve and will prioritise fixes for issues that affect access to core educational content.
          </p>

          <h2 className="font-(--font-family-heading) text-2xl mt-(--spacing-2xl) mb-(--spacing-md)">Feedback and requests</h2>
          <p className="text-(--muted-foreground) leading-relaxed mb-(--spacing-lg)">
            If you encounter an accessibility barrier on Oracle of Art or have a suggestion for improvement, we would like to hear from you. Please use our <a href="/contact" className="text-(--primary) underline hover:no-underline">Contact</a> page and mention &quot;Accessibility&quot; in your message. We will do our best to respond and, where feasible, address the issue or explain our constraints.
          </p>

          <h2 className="font-(--font-family-heading) text-2xl mt-(--spacing-2xl) mb-(--spacing-md)">Standards and updates</h2>
          <p className="text-(--muted-foreground) leading-relaxed mb-(--spacing-lg)">
            We aim to align our practices with WCAG 2.1 Level AA where possible. This statement may be updated as we make changes to the platform or our accessibility practices. We encourage you to check this page periodically for the latest information.
          </p>
        </div>
      </section>
    </>
  );
}
