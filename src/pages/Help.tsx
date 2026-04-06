import { MessageCircle, Mail, Phone, FileText, Book, Video } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Help = () => {
  const faqs = [
    {
      question: "How do I list my property?",
      answer: "Click on the 'Post Property' button in the bottom navigation, select whether it's for sale or rent, and fill in the property details. You can add photos, amenities, and pricing information."
    },
    {
      question: "How to verify my property listing?",
      answer: "After posting your property, our team will review it within 24-48 hours. You'll receive a notification once it's verified. Verified properties get better visibility and more inquiries."
    },
    {
      question: "What are the charges for listing?",
      answer: "Basic listings are free for owners. Premium features like featured listing, top placement, and extended visibility are available with our paid plans starting from ₹999."
    },
    {
      question: "How do I contact property owners?",
      answer: "Click on any property card to view details. You'll find contact options including call, WhatsApp, or message buttons to connect directly with owners or brokers."
    },
    {
      question: "Can I save properties for later?",
      answer: "Yes! Click the heart icon on any property to save it to your wishlist. Access all saved properties from the Saved Properties section in your profile."
    },
    {
      question: "How does EMI calculator work?",
      answer: "Go to EMI Calculator from your profile menu. Enter the property price, down payment, interest rate, and loan tenure. The calculator will show you monthly EMI amount and total interest payable."
    }
  ];

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Help & Support</h1>

        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Live Chat</h3>
              <p className="text-sm text-muted-foreground mb-3">Get instant help</p>
              <Button variant="outline" size="sm" className="w-full">
                Start Chat
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Call / WhatsApp</h3>
              <p className="text-sm text-muted-foreground mb-3">Mon-Sat, 9AM-7PM</p>
              <a href="https://wa.me/917786888810" target="_blank" rel="noopener noreferrer" className="block mb-2">
                <Button variant="outline" size="sm" className="w-full">
                  WhatsApp
                </Button>
              </a>
              <a href="tel:+917786888810">
                <Button variant="outline" size="sm" className="w-full">
                  7786888810
                </Button>
              </a>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Email</h3>
              <p className="text-sm text-muted-foreground mb-3">24-48 hr response</p>
              <a href="mailto:suratpropertyspot@gmail.com">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  suratpropertyspot@gmail.com
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Resources */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Resources</CardTitle>
            <CardDescription>Guides and tutorials to help you get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="ghost" className="w-full justify-start h-auto p-4">
              <Book className="h-5 w-5 mr-3 text-muted-foreground" />
              <div className="flex-1 text-left">
                <div className="font-medium">User Guide</div>
                <div className="text-sm text-muted-foreground">Complete guide to using the platform</div>
              </div>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start h-auto p-4">
              <Video className="h-5 w-5 mr-3 text-muted-foreground" />
              <div className="flex-1 text-left">
                <div className="font-medium">Video Tutorials</div>
                <div className="text-sm text-muted-foreground">Watch step-by-step video guides</div>
              </div>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start h-auto p-4">
              <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
              <div className="flex-1 text-left">
                <div className="font-medium">Terms & Policies</div>
                <div className="text-sm text-muted-foreground">Privacy policy and terms of service</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>Find answers to common questions</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Help;
