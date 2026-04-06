import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface ImageSlide {
  id: string;
  image: string;
  title: string;
  description?: string;
  link: string;
  isExternal?: boolean;
}

interface ImageCarouselProps {
  slides: ImageSlide[];
  autoplayDelay?: number;
  className?: string;
  priorityFirst?: boolean;
}

const ImageCarousel = ({ slides, autoplayDelay = 4000, className = "", priorityFirst = false }: ImageCarouselProps) => {
  const navigate = useNavigate();

  const handleSlideClick = (slide: ImageSlide) => {
    if (slide.isExternal) {
      window.open(slide.link, '_blank', 'noopener,noreferrer');
    } else {
      navigate(slide.link);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Carousel
        plugins={[
          // @ts-ignore - embla-carousel version mismatch between react and autoplay plugins
          Autoplay({
            delay: autoplayDelay,
          }),
        ]}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={slide.id}>
              <div 
                className="relative group cursor-pointer overflow-hidden rounded-lg"
                onClick={() => handleSlideClick(slide)}
              >
                <img
                  src={slide.image || '/placeholder.svg'}
                  alt={slide.title}
                  className="w-full h-64 md:h-80 lg:h-96 object-cover transition-transform duration-300 group-hover:scale-105"
                  loading={priorityFirst && index === 0 ? "eager" : "lazy"}
                  decoding={priorityFirst && index === 0 ? "sync" : "async"}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-xl font-semibold mb-2">{slide.title}</h3>
                  {slide.description && (
                    <p className="text-sm text-white/90 line-clamp-2">{slide.description}</p>
                  )}
                </div>

                {/* Click indicator */}
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg 
                    className="w-4 h-4 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                    />
                  </svg>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </div>
  );
};

export default ImageCarousel;