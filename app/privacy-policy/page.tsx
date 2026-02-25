export default function privacyPolicy() {
  return (
    <>
      <section className="bg-(--card) py-(--spacing-2xl)">
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-(--spacing-lg) font-(--font-family-heading) text-4xl md:text-[3rem]">
              Privacy Policy
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-(--muted-foreground)">
              Last updated: February 2026. How Oracle of Art collects, uses and protects your information.
            </p>
          </div>
        </div>
      </section>

      <section className="py-(--spacing-2xl) sm:py-(--spacing-3xl)">
        <div className="mx-auto w-full max-w-[800px] px-4 sm:px-6 lg:px-8 prose prose-(--foreground)">
          <h2 className="font-(--font-family-heading) text-2xl mt-(--spacing-2xl) mb-(--spacing-md)">1. Who we are</h2>
          <p className="text-(--muted-foreground) leading-relaxed mb-(--spacing-lg)">
            Oracle of Art (&quot;we&quot;, &quot;our&quot;, &quot;the platform&quot;) is an educational website dedicated to art history. We offer a gallery of artworks, AI-powered recognition tools, and personalised collections for students, teachers and art enthusiasts.
          </p>

          <h2 className="font-(--font-family-heading) text-2xl mt-(--spacing-2xl) mb-(--spacing-md)">2. Information we collect</h2>
          <p className="text-(--muted-foreground) leading-relaxed mb-(--spacing-md)">
            We may collect and process the following data:
          </p>
          <ul className="list-disc pl-6 text-(--muted-foreground) space-y-2 mb-(--spacing-lg)">
            <li><strong className="text-(--foreground)">Account data:</strong> If you register or sign in (including via Google), we store your email, name, and, where applicable, a link to your Google account. Passwords are stored in hashed form and are not readable by us.</li>
            <li><strong className="text-(--foreground)">Usage data:</strong> We may log technical data such as IP address, browser type and pages visited to operate and improve the service.</li>
            <li><strong className="text-(--foreground)">Content you create:</strong> Names and descriptions of collections you create, and which artworks you add to them, are stored so we can display and manage your collections.</li>
            <li><strong className="text-(--foreground)">Images you upload:</strong> Images sent to our AI recognition feature are processed to provide artwork information and are not used for other purposes or stored longer than necessary for the response.</li>
          </ul>

          <h2 className="font-(--font-family-heading) text-2xl mt-(--spacing-2xl) mb-(--spacing-md)">3. How we use your information</h2>
          <p className="text-(--muted-foreground) leading-relaxed mb-(--spacing-lg)">
            We use the information above to: provide and maintain the platform; authenticate you and manage your account; show your collections and preferences; improve our services and security; and, where required by law, comply with legal obligations. We do not sell your personal data to third parties.
          </p>

          <h2 className="font-(--font-family-heading) text-2xl mt-(--spacing-2xl) mb-(--spacing-md)">4. Third-party services</h2>
          <p className="text-(--muted-foreground) leading-relaxed mb-(--spacing-md)">
            Our site may use or link to:
          </p>
          <ul className="list-disc pl-6 text-(--muted-foreground) space-y-2 mb-(--spacing-lg)">
            <li><strong className="text-(--foreground)">Google Sign-In:</strong> If you log in with Google, Google shares with us your email and name in accordance with Google&apos;s privacy policy.</li>
            <li><strong className="text-(--foreground)">AI / recognition:</strong> Images you submit for recognition may be sent to third-party AI providers (e.g. OpenAI) under their respective privacy terms to generate artwork information.</li>
            <li><strong className="text-(--foreground)">Hosting and storage:</strong> Our app and database may be hosted on services (e.g. Render, cloud databases) that process data on our behalf under strict agreements.</li>
          </ul>

          <h2 className="font-(--font-family-heading) text-2xl mt-(--spacing-2xl) mb-(--spacing-md)">5. Data retention and your rights</h2>
          <p className="text-(--muted-foreground) leading-relaxed mb-(--spacing-lg)">
            We retain your account and collection data for as long as your account is active. You may request access, correction or deletion of your personal data by contacting us. If you use Google Sign-In, you can also manage data shared with us via your Google account settings. Applicable data protection laws (including GDPR where relevant) may give you additional rights.
          </p>

          <h2 className="font-(--font-family-heading) text-2xl mt-(--spacing-2xl) mb-(--spacing-md)">6. Security</h2>
          <p className="text-(--muted-foreground) leading-relaxed mb-(--spacing-lg)">
            We use industry-standard measures (including encryption, secure connections and access controls) to protect your data. No method of transmission or storage is 100% secure; we encourage you to use a strong password and to keep your login details private.
          </p>

          <h2 className="font-(--font-family-heading) text-2xl mt-(--spacing-2xl) mb-(--spacing-md)">7. Changes to this policy</h2>
          <p className="text-(--muted-foreground) leading-relaxed mb-(--spacing-lg)">
            We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at the top will be revised, and we encourage you to review this page periodically. Continued use of the platform after changes constitutes acceptance of the updated policy.
          </p>

          <h2 className="font-(--font-family-heading) text-2xl mt-(--spacing-2xl) mb-(--spacing-md)">8. Contact</h2>
          <p className="text-(--muted-foreground) leading-relaxed mb-(--spacing-lg)">
            For privacy-related questions or requests, please use our <a href="/contact" className="text-(--primary) underline hover:no-underline">Contact</a> page or the contact details provided there.
          </p>
        </div>
      </section>
    </>
  );
}
