const Terms = () => {
  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Terms & Conditions</h1>

        <div className="prose prose-sm text-muted-foreground space-y-4">
          <p className="text-sm">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>By using our platform, users agree to our terms of service and policies. If you do not agree with any part of these terms, please do not use our services.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">2. Use of Services</h2>
            <p>Our platform provides property listing, search, and connection services. Users must provide accurate information when listing properties or creating accounts.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">3. User Responsibilities</h2>
            <p>Users are responsible for maintaining the confidentiality of their account credentials and for all activities under their account. Misuse of the platform may result in account suspension.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">4. Listing Guidelines</h2>
            <p>All property listings must be genuine and accurate. Fraudulent or misleading listings will be removed and may lead to permanent account bans.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">5. Limitation of Liability</h2>
            <p>We act as a platform connecting buyers, sellers, and brokers. We are not responsible for any transactions or disputes between parties.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">6. Contact</h2>
            <p>For questions about these terms, contact us at <a href="mailto:suratpropertyspot@gmail.com" className="text-primary underline">suratpropertyspot@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
