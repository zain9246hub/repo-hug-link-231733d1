import { Mail, Phone, MessageCircle, Shield, ReceiptText, HelpCircle, MapPin, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t border-border text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Contact Support */}
        <div className="mb-6">
          <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-primary" />
            Contact Support
          </h3>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <a href="mailto:suratpropertyspot@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail className="h-4 w-4" />
              suratpropertyspot@gmail.com
            </a>
            <a href="tel:+917786888810" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="h-4 w-4" />
              7786888810
            </a>
            <a href="https://wa.me/917786888810" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
              <MessageCircle className="h-4 w-4" />
              WhatsApp Support
            </a>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Surat, Gujarat, India
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-4 text-sm border-t border-border pt-4 mb-4">
          <Link to="/privacy-policy" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
            <Shield className="h-3.5 w-3.5" />
            Privacy Policy
          </Link>
          <Link to="/refund-policy" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
            <ReceiptText className="h-3.5 w-3.5" />
            Refund Policy
          </Link>
          <Link to="/terms" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
            <FileText className="h-3.5 w-3.5" />
            Terms & Conditions
          </Link>
          <Link to="/help" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
            <HelpCircle className="h-3.5 w-3.5" />
            Help & Support
          </Link>
        </div>

{/* Copyright */}
        <div className="text-xs text-muted-foreground text-center border-t border-border pt-4 space-y-1">
          <p>© {new Date().getFullYear()} Surat Property Spot. All rights reserved.</p>
          <p className="mt-2">Owned & Operated by:</p>
          <p className="font-semibold">ABDULRAZZAK MOHAMMAD JAVID KURESHI</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
