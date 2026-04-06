import { ExternalLink, X, Phone, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AdBannerProps {
  type: "horizontal" | "vertical" | "square";
  title: string;
  description: string;
  ctaText: string;
  imageUrl?: string;
  linkUrl?: string;
  linkType?: "website" | "whatsapp";
  whatsappNumber?: string;
  whatsappMessage?: string;
  onClose?: () => void;
}

const AdBanner = ({ type, title, description, ctaText, imageUrl, linkUrl, linkType, whatsappNumber, whatsappMessage, onClose }: AdBannerProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleCtaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (whatsappNumber) {
      const msg = encodeURIComponent(whatsappMessage || `Hi, I'm interested in: ${title}`);
      window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, "_blank");
    } else if (linkUrl) {
      if (linkType === "whatsapp") {
        window.open(`https://wa.me/${linkUrl}`, "_blank");
      } else {
        window.open(linkUrl, "_blank");
      }
    }
  };

  return (
    <div className="relative" style={{ perspective: "1000px" }}>
      {/* Close Button */}
      {onClose && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 h-6 w-6 opacity-50 hover:opacity-100 z-20"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}

      <div
        className="relative w-full cursor-pointer transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
        onClick={handleFlip}
      >
        {/* Front Side */}
        <div
          className={`p-4 bg-gradient-to-r from-primary/5 to-secondary/10 border border-border/50 rounded-xl ${
            type === "horizontal" ? "flex items-center gap-4" : type === "square" ? "aspect-square flex flex-col justify-center items-center text-center" : "flex flex-col gap-3 max-w-sm"
          }`}
          style={{ backfaceVisibility: "hidden" }}
        >
          {imageUrl && type === "horizontal" && (
            <img src={imageUrl} alt={title} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          )}
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">Sponsored</div>
            <h4 className="font-semibold text-sm text-foreground mb-1">{title}</h4>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{description}</p>
            <div className="flex items-center gap-1 text-xs text-primary font-medium">
              <span>Tap for details</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
          {imageUrl && type !== "horizontal" && (
            <img src={imageUrl} alt={title} className={`object-cover rounded-lg ${type === "vertical" ? "w-full h-24" : "w-20 h-20 mb-3"}`} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          )}
        </div>

        {/* Back Side */}
        <div
          className={`absolute inset-0 p-4 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30 rounded-xl flex flex-col items-center justify-center gap-3 text-center`}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <h4 className="font-bold text-sm text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
          <div className="flex gap-2 mt-1">
            {whatsappNumber && (
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5" onClick={handleCtaClick}>
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </Button>
            )}
            {linkUrl && (
              <Button size="sm" variant="outline" className="gap-1.5" onClick={handleCtaClick}>
                <ExternalLink className="h-3.5 w-3.5" />
                {ctaText}
              </Button>
            )}
            {!whatsappNumber && !linkUrl && (
              <Button size="sm" variant="outline" className="gap-1.5" onClick={handleCtaClick}>
                <Phone className="h-3.5 w-3.5" />
                {ctaText}
              </Button>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Tap to flip back</p>
        </div>
      </div>
    </div>
  );
};

export default AdBanner;
