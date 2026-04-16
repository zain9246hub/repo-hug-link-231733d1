import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ActiveAd {
  id: string;
  title: string;
  description: string;
  cta_text: string;
  ad_type: string;
  image_url: string | null;
  link_url: string | null;
  link_type: string;
  placement: string;
  customer_name: string;
}

export function useAds(placements: string | string[]) {
  const [ads, setAds] = useState<ActiveAd[]>([]);
  const [loading, setLoading] = useState(true);

  const placementKey = Array.isArray(placements) ? placements.join(",") : placements;

  useEffect(() => {
    let cancelled = false;
    const placementList = placementKey.split(",").filter(Boolean);

    const fetchAds = async () => {
      setLoading(true);

      const today = new Date().toISOString().slice(0, 10);
      // NOTE: Cannot chain two .or() — second overwrites first. Filter dates client-side.
      const { data, error } = await supabase
        .from("admin_ads")
        .select("id, title, description, cta_text, ad_type, image_url, link_url, link_type, placement, customer_name, start_date, end_date")
        .eq("status", "active")
        .in("placement", placementList)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error("Ad fetch error:", error);
        setAds([]);
      } else {
        const filtered = (data ?? []).filter((ad: any) => {
          const startOk = !ad.start_date || ad.start_date <= today;
          const endOk = !ad.end_date || ad.end_date >= today;
          return startOk && endOk;
        });
        console.log(`[useAds] placements=${placementKey} fetched=${data?.length ?? 0} active=${filtered.length}`);
        setAds(filtered as ActiveAd[]);
      }

      setLoading(false);
    };

    fetchAds();

    const channel = supabase
      .channel(`ads-${placementKey}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_ads" }, () => {
        fetchAds();
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [placementKey]);

  const getAdsByPlacement = (placement: string) =>
    ads.filter((ad) => ad.placement === placement);

  return { ads, loading, getAdsByPlacement };
}

/** Convert ActiveAd to the shape expected by AdBanner */
export function toAdBannerProps(ad: ActiveAd) {
  const isWhatsapp = ad.link_type === "whatsapp";
  return {
    title: ad.title,
    description: ad.description,
    ctaText: ad.cta_text,
    imageUrl: ad.image_url || undefined,
    linkUrl: isWhatsapp ? undefined : (ad.link_url || undefined),
    whatsappNumber: isWhatsapp ? (ad.link_url || undefined) : undefined,
    whatsappMessage: isWhatsapp ? `Hi, I'm interested in: ${ad.title}` : undefined,
  };
}

/** Convert ActiveAd to the shape expected by PropertyListingWithAds adSpaces */
export function toAdSpace(ad: ActiveAd) {
  return {
    id: ad.id,
    type: (ad.image_url ? "image" : "link") as "image" | "link",
    title: ad.title,
    description: ad.description,
    ctaText: ad.cta_text,
    imageUrl: ad.image_url || undefined,
    linkUrl: ad.link_url || undefined,
    isExternal: true,
  };
}

/** Convert ActiveAd to hero slide shape */
export function toHeroSlide(ad: ActiveAd) {
  return {
    id: ad.id,
    image: ad.image_url || "/placeholder.svg",
    title: ad.title,
    description: ad.description,
    link: ad.link_url || "#",
    isExternal: ad.link_type === "website",
  };
}

/** Convert ActiveAd to sponsored card shape */
export function toSponsoredCard(ad: ActiveAd) {
  return {
    id: ad.id,
    type: "premium" as const,
    title: ad.title,
    sponsor: ad.customer_name,
    description: ad.description,
    ctaText: ad.cta_text,
    imageUrl: ad.image_url || "/placeholder.svg",
    badge: "Sponsored",
    price: "",
  };
}
