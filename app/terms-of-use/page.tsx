export default function termsOfUse() {
  return (
    <>
      <section className="bg-(--card) py-(--spacing-2xl)">
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-(--spacing-lg) font-(--font-family-heading) text-4xl md:text-[3rem]">
              Terms of Use
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-(--muted-foreground)">
              Last updated: February 2026. By using Oracle of Art you agree to these terms.
            </p>
          </div>
        </div>
      </section>

      <section className="py-(--spacing-2xl) sm:py-(--spacing-3xl)">
        <div className="mx-auto w-full max-w-[800px] px-4 sm:px-6 lg:px-8 prose prose-(--foreground)">
          <h2 className="font-(--font-family-heading) text-2xl mt-(--spacing-2xl) mb-(--spacing-md)">1. Acceptance of terms</h2>
          <p className="text-(--muted-foreground) leading-relaxed mb-(--spacing-lg)">
            By accessing or using Oracle of Art (&quot;the platform&quot;, &quot;we&quot;, &quot;our&quot;), you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree, please do not use the platform.
          </p>

          <h2 className="font-(--font-family-heading) text-2xl mt-(--spacing-2xl) mb-(--spacing-md)">2. Description of the service</h2>
          <p className="text-(--muted-foreground) leading-relaxed mb-(--spacing-lg)">
            Oracle of Art is an educational website that provides: a gallery of artworks with filters; AI-powered artwork recognition; personalised collections; and related content for learning and exploring art history. The service is offered &quot;as is&quot; and may be modified or discontinued at any time.
          </p>

          <h2 className="font-(--font-family-heading) text-2xl mt-(--spacing-2xl) mb-(--spacing-md)">3. Account and conduct</h2>
          <p className="text-(--muted-foreground) leading-relaxed mb-(--spacing-md)">
            You may need to register or sign in (including via Google) to use certain features. You are responsible for keeping your account secure and for all activity under your account. You agree to:
          </p>
          <ul className="list-disc pl-6 text-(--muted-foreground) space-y-2 mb-(--spacing-lg)">
            <li>Provide accurate information and update it when necessary.</li>
            <li>Not use the platform for any illegal, harmful or abusive purpose.</li>
            <li>Not attempt to gain unauthorised access to other accounts, systems or data.</li>
            <li>Not upload content that infringes others&apos; rights or that is offensive, misleading or malicious.</li>
          </ul>
          <p className="text-(--muted-foreground) leading-relaxed mb-(--spacing-lg)">
            We may suspend or terminate your account if we reasonably believe you have breached these terms.
          </p>

          <h2 className="font-(--font-family-heading) text-2xl mt-(--spacing-2xl) mb-(--spacing-md)">4. Intellectual property and content</h2>
          <p className="text-(--muted-foreground) leading-relaxed mb-(--spacing-lg)">
            The platform design, text and code are owned or licensed by Oracle of Art. Artwork images and metadata in the gallery may be sourced from third parties and are used for educational purposes; rights remain with their respective owners. By creating collections and adding public comments or content, you grant us a licence to store and display that content in connection with the service. You must not use our content or third-party artwork for commercial or infringing purposes without proper rights.
          </p>

          <h2 className="font-(--font-family-heading) text-2xl mt-(--spacing-2xl) mb-(--spacing-md)">5. AI recognition and disclaimers</h2>
          <p className="text-(--muted-foreground) leading-relaxed mb-(--spacing-lg)">
            Our AI recognition feature is for educational and informational use only. Results may be incomplete or incorrect. Do not rely on them as sole source for academic or professional decisions. You use the feature at your own risk. We are not liable for any loss or damage arising from use of AI-generated information.
          </p>

          <h2 className="font-(--font-family-heading) text-2xl mt-(--spacing-2xl) mb-(--spacing-md)">6. Limitation of liability</h2>
          <p className="text-(--muted-foreground) leading-relaxed mb-(--spacing-lg)">
            To the fullest extent permitted by law, Oracle of Art and its operators shall not be liable for any indirect, incidental, special or consequential damages, or loss of data or profits, arising from your use or inability to use the platform. Our total liability shall not exceed the amount you have paid to us in the twelve months prior to the claim (if any). Some jurisdictions do not allow certain limitations; in such cases our liability will be limited to the maximum permitted by law.
          </p>

          <h2 className="font-(--font-family-heading) text-2xl mt-(--spacing-2xl) mb-(--spacing-md)">7. Links to other sites</h2>
          <p className="text-(--muted-foreground) leading-relaxed mb-(--spacing-lg)">
            The platform may contain links to external websites or services. We do not control and are not responsible for their content or privacy practices. Use of third-party sites is at your own risk.
          </p>

          <h2 className="font-(--font-family-heading) text-2xl mt-(--spacing-2xl) mb-(--spacing-md)">8. Changes to the terms</h2>
          <p className="text-(--muted-foreground) leading-relaxed mb-(--spacing-lg)">
            We may update these Terms of Use at any time. The &quot;Last updated&quot; date will be revised. Your continued use of the platform after changes constitutes acceptance of the new terms. We encourage you to review this page periodically.
          </p>

          <h2 className="font-(--font-family-heading) text-2xl mt-(--spacing-2xl) mb-(--spacing-md)">9. Contact</h2>
          <p className="text-(--muted-foreground) leading-relaxed mb-(--spacing-lg)">
            For questions about these terms, please use our <a href="/contact" className="text-(--primary) underline hover:no-underline">Contact</a> page.
          </p>
        </div>
      </section>
    </>
  );
}
