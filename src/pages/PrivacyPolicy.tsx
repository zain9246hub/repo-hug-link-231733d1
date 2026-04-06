const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Privacy Policy</h1>

        <div className="prose prose-sm text-muted-foreground space-y-4">
          <p className="text-sm">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
            <p>We collect personal information you provide when creating an account, listing properties, or contacting support — including your name, email, phone number, and property details.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
            <p>Your information is used to provide and improve our services, process transactions, send notifications, and connect buyers with sellers/brokers.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">3. Data Sharing</h2>
            <p>We do not sell your personal data. We may share information with service providers who assist in operating our platform, or when required by law.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">4. Data Security</h2>
            <p>We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">5. Contact Us</h2>
            <p>For privacy-related queries, contact us at <a href="mailto:suratpropertyspot@gmail.com" className="text-primary underline">suratpropertyspot@gmail.com</a> or call <a href="tel:+917786888810" className="text-primary underline">7786888810</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
