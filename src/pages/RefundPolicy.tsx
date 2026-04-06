const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Refund Policy</h1>

        <div className="prose prose-sm text-muted-foreground space-y-4">
          <p className="text-sm">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">1. Subscription Refunds</h2>
            <p>If you are not satisfied with a paid subscription, you may request a refund within 7 days of purchase. Refunds will be processed to the original payment method within 5-10 business days.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">2. Ad Campaign Refunds</h2>
            <p>Refunds for advertising campaigns are available only if the campaign has not started. Once an ad campaign is live, refunds will not be provided for the utilized portion.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">3. Non-Refundable Services</h2>
            <p>Free listing services, verification fees, and fully consumed ad campaigns are non-refundable.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">4. How to Request a Refund</h2>
            <p>To request a refund, contact our support team at <a href="mailto:suratpropertyspot@gmail.com" className="text-primary underline">suratpropertyspot@gmail.com</a> or WhatsApp us at <a href="https://wa.me/917786888810" className="text-primary underline">7786888810</a> with your payment details and reason for the refund.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">5. Dispute Resolution</h2>
            <p>If you have a dispute regarding a refund, please reach out to us and we will work to resolve the issue within 15 business days.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
