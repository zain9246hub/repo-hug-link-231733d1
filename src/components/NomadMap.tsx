import React, { useState, useCallback, useRef, useMemo, memo } from 'react';
import { Search, X, ZoomIn, ZoomOut, SlidersHorizontal, BedDouble, Bath, Maximize, ChevronRight, MapPin, Star, TrendingUp, Home, Building, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProperties, Property } from '@/hooks/use-properties';

interface AreaMarker {
  id: string;
  name: string;
  score: number;
  propertyCount: number;
  x: number;
  y: number;
  properties: Property[];
}

const AREA_META: { name: string; score: number }[] = [
  { name: 'Adajan', score: 8.7 }, { name: 'Vesu', score: 9.1 },
  { name: 'Piplod', score: 8.5 }, { name: 'Athwa', score: 8.9 },
  { name: 'City Light', score: 9.2 }, { name: 'New City Light', score: 9.0 },
  { name: 'Ghod Dod Road', score: 8.8 }, { name: 'Parle Point', score: 8.6 },
  { name: 'Pal', score: 8.3 }, { name: 'Pal Gam', score: 8.1 },
  { name: 'Palanpur Patia', score: 8.0 }, { name: 'Althan', score: 8.1 },
  { name: 'Bhatar', score: 8.2 }, { name: 'Dumas Road', score: 8.0 },
  { name: 'Magdalla', score: 7.6 }, { name: 'VIP Road', score: 8.4 },
  { name: 'Vesu Canal Road', score: 8.3 }, { name: 'Umra', score: 7.8 },
  { name: 'Dabholi', score: 7.5 }, { name: 'Uttran', score: 7.6 },
  { name: 'Parvat Patia', score: 8.0 }, { name: 'Varachha', score: 7.8 },
  { name: 'Mota Varachha', score: 7.9 }, { name: 'Kapodra', score: 7.4 },
  { name: 'Katargam', score: 7.5 }, { name: 'Sarthana', score: 7.6 },
  { name: 'Singanpore', score: 7.3 }, { name: 'Amroli', score: 7.2 },
  { name: 'Jahangirpura', score: 7.0 }, { name: 'Bamroli', score: 7.1 },
  { name: 'Kosad', score: 7.0 }, { name: 'Dindoli', score: 7.3 },
  { name: 'Udhna', score: 7.2 }, { name: 'Pandesara', score: 7.1 },
  { name: 'Sachin', score: 7.0 }, { name: 'Limbayat', score: 7.3 },
  { name: 'Mora Bhagal', score: 7.4 }, { name: 'Majura Gate', score: 7.9 },
  { name: 'Ring Road', score: 8.4 }, { name: 'Nanpura', score: 7.7 },
  { name: 'Gopipura', score: 7.5 }, { name: 'Lal Darwaja', score: 7.6 },
  { name: 'Chowk Bazaar', score: 7.4 }, { name: 'Mahidharpura', score: 7.6 },
  { name: 'Salabatpura', score: 7.3 }, { name: 'Begampura', score: 7.4 },
  { name: 'Rustampura', score: 7.2 }, { name: 'Nanavat', score: 7.5 },
  { name: 'Sagrampura', score: 7.3 }, { name: 'Bhagal', score: 7.4 },
  { name: 'Ichchhanath', score: 7.7 }, { name: 'Rander', score: 7.9 },
  { name: 'Olpad', score: 6.8 }, { name: 'Hajira', score: 7.0 },
  { name: 'Kim', score: 6.9 }, { name: 'Palsana', score: 6.7 },
  { name: 'Bardoli', score: 7.2 }, { name: 'Kamrej', score: 7.1 },
  { name: 'Kadodara', score: 7.0 }, { name: 'Kansad', score: 7.1 },
  { name: 'Punagam', score: 7.6 }, { name: 'Yogi Chowk', score: 7.7 },
  { name: 'Godadara', score: 7.3 }, { name: 'Gaurav Path', score: 8.0 },
  { name: 'Bhestan', score: 7.2 }, { name: 'Bhimrad', score: 7.5 },
  { name: 'Ved', score: 7.8 }, { name: 'Adajan Patia', score: 8.5 },
  { name: 'Athwalines', score: 9.0 }, { name: 'Khajod', score: 7.4 },
  { name: 'Variav', score: 7.0 }, { name: 'Khatodara', score: 7.3 },
  { name: 'Sosyo Circle', score: 7.8 }, { name: 'Rundh', score: 7.9 },
  { name: 'Someshwara Enclave', score: 8.2 }, { name: 'Green City', score: 8.0 },
];

// Seeded pseudo-random for consistent organic positions
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

// Precompute positions (static, doesn't depend on data)
const AREA_POSITIONS = AREA_META.map((_, i) => {
  const cols = 8;
  const row = Math.floor(i / cols);
  const col = i % cols;
  const baseX = 8 + col * 11;
  const baseY = 6 + row * 9;
  const offsetX = (seededRandom(i * 7 + 3) - 0.5) * 6;
  const offsetY = (seededRandom(i * 13 + 7) - 0.5) * 4;
  return {
    x: Math.max(3, Math.min(97, baseX + offsetX)),
    y: Math.max(3, Math.min(97, baseY + offsetY)),
  };
});

const getScoreColor = (score: number) => {
  if (score >= 9) return 'from-emerald-500 to-emerald-600';
  if (score >= 8) return 'from-primary to-primary-light';
  return 'from-amber-500 to-amber-600';
};

const getScoreRing = (score: number) => {
  if (score >= 9) return 'ring-emerald-400/40';
  if (score >= 8) return 'ring-primary/30';
  return 'ring-amber-400/30';
};

// Clean circular map pin
const AreaPin = memo(({ area, onSelect }: { area: AreaMarker; onSelect: (a: AreaMarker) => void }) => {
  const size = area.score >= 9 ? 48 : area.score >= 8 ? 42 : 36;
  const hasProperties = area.propertyCount > 0;

  return (
    <div
      className="area-marker absolute cursor-pointer z-10 hover:z-20"
      style={{
        left: `${area.x}%`,
        top: `${area.y}%`,
        transform: 'translate(-50%, -50%)',
        opacity: hasProperties ? 1 : 0.5,
      }}
      onClick={(e) => { e.stopPropagation(); onSelect(area); }}
    >
      <div className="relative flex flex-col items-center group">
        <div
          className={`rounded-full overflow-hidden border-[2.5px] border-background shadow-[0_2px_12px_-2px_hsl(var(--primary)/0.3)] group-hover:scale-110 group-hover:shadow-[0_4px_20px_-2px_hsl(var(--primary)/0.4)] transition-all duration-200 bg-muted flex items-center justify-center`}
          style={{ width: size, height: size }}
        >
          {area.properties.length > 0 && area.properties[0].image_url ? (
            <img
              src={area.properties[0].image_url}
              alt={area.name}
              className="w-full h-full object-cover"
              draggable={false}
              loading="lazy"
            />
          ) : (
            <Home className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div
          className={`absolute bg-gradient-to-br ${getScoreColor(area.score)} rounded-full flex items-center justify-center text-white font-bold shadow-md border-[1.5px] border-background`}
          style={{ width: 18, height: 18, fontSize: 8, top: -2, right: -2, zIndex: 2 }}
        >
          {area.score}
        </div>
        <div className="mt-1 flex flex-col items-center">
          <span className="font-bold text-foreground whitespace-nowrap leading-none" style={{ fontSize: 9 }}>
            {area.name}
          </span>
          <span className="text-muted-foreground whitespace-nowrap leading-none mt-px" style={{ fontSize: 7 }}>
            {area.propertyCount} properties
          </span>
        </div>
      </div>
    </div>
  );
});
AreaPin.displayName = 'AreaPin';

const NomadMap = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'sale' | 'rent'>('all');
  const [postedByFilter, setPostedByFilter] = useState<'all' | 'owner' | 'broker' | 'builder'>('all');
  const [selectedArea, setSelectedArea] = useState<AreaMarker | null>(null);

  const transformRef = useRef({ x: 0, y: 0, scale: 1 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef({ dragging: false, startX: 0, startY: 0, lastDistance: 0 });
  const rafRef = useRef<number>(0);
  const [zoomDisplay, setZoomDisplay] = useState(100);

  // Fetch ALL published properties (Surat-focused)
  const { properties, loading } = useProperties({ city: 'Surat' });

  // Build area markers from real data
  const areaMarkers = useMemo<AreaMarker[]>(() => {
    // Group properties by location (case-insensitive matching against area names)
    const areaMap = new Map<string, Property[]>();
    
    for (const prop of properties) {
      const loc = (prop.location || '').toLowerCase();
      for (const meta of AREA_META) {
        if (loc.includes(meta.name.toLowerCase())) {
          const existing = areaMap.get(meta.name) || [];
          existing.push(prop);
          areaMap.set(meta.name, existing);
          break; // assign to first matching area
        }
      }
    }

    return AREA_META.map((meta, i) => {
      const areaProps = areaMap.get(meta.name) || [];
      return {
        id: meta.name.toLowerCase().replace(/\s+/g, '-'),
        name: meta.name,
        score: meta.score,
        propertyCount: areaProps.length,
        x: AREA_POSITIONS[i].x,
        y: AREA_POSITIONS[i].y,
        properties: areaProps,
      };
    });
  }, [properties]);

  const applyTransform = useCallback(() => {
    if (!canvasRef.current) return;
    const { x, y, scale } = transformRef.current;
    canvasRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.area-marker')) return;
    gestureRef.current.dragging = true;
    gestureRef.current.startX = e.clientX - transformRef.current.x;
    gestureRef.current.startY = e.clientY - transformRef.current.y;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!gestureRef.current.dragging) return;
    transformRef.current.x = e.clientX - gestureRef.current.startX;
    transformRef.current.y = e.clientY - gestureRef.current.startY;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(applyTransform);
  }, [applyTransform]);

  const handlePointerUp = useCallback(() => {
    gestureRef.current.dragging = false;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    transformRef.current.scale = Math.max(0.5, Math.min(3, transformRef.current.scale + delta));
    setZoomDisplay(Math.round(transformRef.current.scale * 100));
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(applyTransform);
  }, [applyTransform]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      gestureRef.current.lastDistance = Math.hypot(dx, dy);
    } else if (e.touches.length === 1) {
      if ((e.touches[0].target as HTMLElement).closest('.area-marker')) return;
      gestureRef.current.dragging = true;
      gestureRef.current.startX = e.touches[0].clientX - transformRef.current.x;
      gestureRef.current.startY = e.touches[0].clientY - transformRef.current.y;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (gestureRef.current.lastDistance > 0) {
        const delta = (dist - gestureRef.current.lastDistance) * 0.005;
        transformRef.current.scale = Math.max(0.5, Math.min(3, transformRef.current.scale + delta));
        setZoomDisplay(Math.round(transformRef.current.scale * 100));
      }
      gestureRef.current.lastDistance = dist;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(applyTransform);
    } else if (e.touches.length === 1 && gestureRef.current.dragging) {
      transformRef.current.x = e.touches[0].clientX - gestureRef.current.startX;
      transformRef.current.y = e.touches[0].clientY - gestureRef.current.startY;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(applyTransform);
    }
  }, [applyTransform]);

  const handleTouchEnd = useCallback(() => {
    gestureRef.current.dragging = false;
    gestureRef.current.lastDistance = 0;
  }, []);

  const handleZoom = useCallback((dir: 1 | -1) => {
    transformRef.current.scale = Math.max(0.5, Math.min(3, transformRef.current.scale + dir * 0.3));
    setZoomDisplay(Math.round(transformRef.current.scale * 100));
    applyTransform();
  }, [applyTransform]);

  const filteredAreas = useMemo(() =>
    areaMarkers.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery, areaMarkers]
  );

  const totalProperties = useMemo(() => properties.length, [properties]);
  const areasWithProperties = useMemo(() => filteredAreas.filter(a => a.propertyCount > 0).length, [filteredAreas]);

  const onSelectArea = useCallback((area: AreaMarker) => setSelectedArea(area), []);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Premium Header */}
      <div className="bg-background/95 backdrop-blur-xl border-b border-border/60 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-muted" onClick={() => navigate('/')}>
            <X className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <h1 className="text-base font-bold text-foreground tracking-tight">Surat Area Map</h1>
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </div>
            <p className="text-[11px] text-muted-foreground ml-6">
              {filteredAreas.length} areas · {totalProperties.toLocaleString()} properties
            </p>
          </div>
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="h-8 rounded-xl text-xs gap-1.5"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
        </Button>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-2.5 border-b border-border/40 bg-muted/20 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Surat areas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 rounded-xl bg-background border-border/60 text-sm placeholder:text-muted-foreground/60"
          />
          {searchQuery && (
            <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearchQuery('')}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-border/40 shrink-0"
          >
            <div className="px-4 py-3 flex gap-3 bg-muted/10">
              <div className="flex-1">
                <label className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider mb-1 block">Type</label>
                <Select value={selectedType} onValueChange={(v: any) => setSelectedType(v)}>
                  <SelectTrigger className="h-8 text-xs rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="rent">For Rent</SelectItem>
                    <SelectItem value="sale">For Sale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider mb-1 block">Posted By</label>
                <Select value={postedByFilter} onValueChange={(v: any) => setPostedByFilter(v)}>
                  <SelectTrigger className="h-8 text-xs rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="broker">Broker</SelectItem>
                    <SelectItem value="builder">Builder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Canvas */}
      <div
        className="flex-1 overflow-hidden relative touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: gestureRef.current.dragging ? 'grabbing' : 'grab', backgroundColor: 'hsl(75 18% 87%)' }}
      >
        {/* Zoom Controls */}
        <div className="absolute top-3 right-3 z-30 flex flex-col gap-1.5">
          <Button variant="secondary" size="icon" className="h-9 w-9 rounded-xl shadow-lg bg-background/90 backdrop-blur-md border border-border/50 hover:bg-background" onClick={() => handleZoom(1)}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="text-center text-[10px] font-semibold text-muted-foreground bg-background/90 backdrop-blur-md rounded-lg py-1 px-2 shadow-sm border border-border/50">
            {zoomDisplay}%
          </div>
          <Button variant="secondary" size="icon" className="h-9 w-9 rounded-xl shadow-lg bg-background/90 backdrop-blur-md border border-border/50 hover:bg-background" onClick={() => handleZoom(-1)}>
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>

        {/* GPU-accelerated canvas */}
        <div
          ref={canvasRef}
          className="absolute inset-0 will-change-transform"
          style={{ width: '300%', height: '300%', left: '-100%', top: '-100%', transformOrigin: 'center center' }}
        >
          {/* Realistic map background */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <defs>
              <pattern id="smallGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <rect width="60" height="60" fill="none" />
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="hsl(60 8% 90%)" strokeWidth="1.5" />
              </pattern>
              <pattern id="bigGrid" width="240" height="240" patternUnits="userSpaceOnUse">
                <rect width="240" height="240" fill="url(#smallGrid)" />
                <path d="M 240 0 L 0 0 0 240" fill="none" stroke="hsl(0 0% 94%)" strokeWidth="3.5" />
              </pattern>
              <filter id="waterBlur">
                <feGaussianBlur stdDeviation="3" />
              </filter>
            </defs>
            <rect width="100%" height="100%" fill="url(#bigGrid)" />
            <line x1="0" y1="30%" x2="100%" y2="28%" stroke="hsl(0 0% 97%)" strokeWidth="10" />
            <line x1="0" y1="55%" x2="100%" y2="58%" stroke="hsl(0 0% 97%)" strokeWidth="10" />
            <line x1="0" y1="78%" x2="100%" y2="75%" stroke="hsl(0 0% 97%)" strokeWidth="8" />
            <line x1="0" y1="15%" x2="100%" y2="13%" stroke="hsl(0 0% 97%)" strokeWidth="7" />
            <line x1="20%" y1="0" x2="22%" y2="100%" stroke="hsl(0 0% 97%)" strokeWidth="9" />
            <line x1="50%" y1="0" x2="48%" y2="100%" stroke="hsl(0 0% 97%)" strokeWidth="10" />
            <line x1="75%" y1="0" x2="77%" y2="100%" stroke="hsl(0 0% 97%)" strokeWidth="8" />
            <line x1="35%" y1="0" x2="33%" y2="100%" stroke="hsl(0 0% 97%)" strokeWidth="7" />
            <line x1="88%" y1="0" x2="90%" y2="100%" stroke="hsl(0 0% 96%)" strokeWidth="6" />
            <line x1="8%" y1="0" x2="10%" y2="100%" stroke="hsl(0 0% 96%)" strokeWidth="6" />
            <path d="M 0 20% Q 25% 18%, 40% 24% T 70% 20% T 100% 22%" fill="none" stroke="hsl(0 0% 95%)" strokeWidth="5" />
            <path d="M 0 42% Q 15% 38%, 30% 44% T 55% 40% T 80% 46% T 100% 42%" fill="none" stroke="hsl(0 0% 95%)" strokeWidth="5" />
            <path d="M 0 65% Q 20% 62%, 35% 68% T 60% 64% T 85% 70% T 100% 66%" fill="none" stroke="hsl(0 0% 95%)" strokeWidth="4.5" />
            <path d="M 0 88% Q 18% 85%, 40% 90% T 65% 86% T 100% 89%" fill="none" stroke="hsl(0 0% 95%)" strokeWidth="4" />
            <path d="M 14% 0 Q 12% 20%, 16% 35% T 13% 60% T 15% 85% T 14% 100%" fill="none" stroke="hsl(0 0% 95%)" strokeWidth="4.5" />
            <path d="M 28% 0 Q 30% 15%, 27% 30% T 29% 50% T 26% 70% T 28% 100%" fill="none" stroke="hsl(0 0% 95%)" strokeWidth="4" />
            <path d="M 42% 0 Q 40% 18%, 43% 35% T 41% 55% T 44% 75% T 42% 100%" fill="none" stroke="hsl(0 0% 95%)" strokeWidth="4" />
            <path d="M 58% 0 Q 60% 12%, 57% 28% T 59% 48% T 56% 68% T 58% 100%" fill="none" stroke="hsl(0 0% 95%)" strokeWidth="4.5" />
            <path d="M 68% 0 Q 66% 20%, 69% 40% T 67% 60% T 70% 80% T 68% 100%" fill="none" stroke="hsl(0 0% 95%)" strokeWidth="4" />
            <path d="M 83% 0 Q 85% 15%, 82% 35% T 84% 55% T 81% 78% T 83% 100%" fill="none" stroke="hsl(0 0% 95%)" strokeWidth="4" />
            <path d="M 5% 8% Q 25% 22%, 50% 30% T 80% 50% T 95% 85%" fill="none" stroke="hsl(0 0% 94%)" strokeWidth="5" />
            <path d="M 95% 10% Q 75% 25%, 55% 35% T 25% 55% T 8% 88%" fill="none" stroke="hsl(0 0% 94%)" strokeWidth="4.5" />
            <path d="M 20% 92% Q 35% 80%, 50% 75% T 70% 82% T 85% 92%" fill="none" stroke="hsl(0 0% 94%)" strokeWidth="4" />
            <path d="M 0 48% Q 8% 44%, 15% 46% Q 22% 48%, 30% 44% Q 38% 40%, 45% 43% Q 52% 46%, 60% 42% Q 68% 38%, 75% 41% Q 82% 44%, 90% 40% Q 95% 38%, 100% 40%"
              fill="none" stroke="hsl(200 35% 85%)" strokeWidth="18" strokeLinecap="round" opacity="0.6" filter="url(#waterBlur)" />
            <path d="M 0 48% Q 8% 44%, 15% 46% Q 22% 48%, 30% 44% Q 38% 40%, 45% 43% Q 52% 46%, 60% 42% Q 68% 38%, 75% 41% Q 82% 44%, 90% 40% Q 95% 38%, 100% 40%"
              fill="none" stroke="hsl(200 45% 80%)" strokeWidth="10" strokeLinecap="round" opacity="0.5" />
            <path d="M 0 48% Q 8% 44%, 15% 46% Q 22% 48%, 30% 44% Q 38% 40%, 45% 43% Q 52% 46%, 60% 42% Q 68% 38%, 75% 41% Q 82% 44%, 90% 40% Q 95% 38%, 100% 40%"
              fill="none" stroke="hsl(200 55% 75%)" strokeWidth="4" strokeLinecap="round" opacity="0.35" />
            <path d="M 45% 43% Q 44% 50%, 46% 58% Q 48% 65%, 45% 72% Q 43% 78%, 46% 85%"
              fill="none" stroke="hsl(200 40% 83%)" strokeWidth="6" strokeLinecap="round" opacity="0.4" />
            <ellipse cx="55%" cy="32%" rx="3.5%" ry="2.8%" fill="hsl(120 25% 78%)" opacity="0.5" />
            <ellipse cx="30%" cy="60%" rx="4%" ry="3%" fill="hsl(130 22% 80%)" opacity="0.45" />
            <ellipse cx="72%" cy="22%" rx="3%" ry="2.2%" fill="hsl(110 22% 79%)" opacity="0.45" />
            <ellipse cx="82%" cy="68%" rx="4.5%" ry="3%" fill="hsl(125 25% 77%)" opacity="0.4" />
            <ellipse cx="15%" cy="35%" rx="2.5%" ry="3.5%" fill="hsl(115 20% 80%)" opacity="0.35" />
            <ellipse cx="62%" cy="75%" rx="4%" ry="2.5%" fill="hsl(120 22% 79%)" opacity="0.4" />
            <ellipse cx="38%" cy="18%" rx="3%" ry="2%" fill="hsl(125 20% 81%)" opacity="0.35" />
            <ellipse cx="88%" cy="35%" rx="2.5%" ry="3%" fill="hsl(118 22% 79%)" opacity="0.38" />
            <ellipse cx="22%" cy="82%" rx="3.5%" ry="2.5%" fill="hsl(130 20% 78%)" opacity="0.4" />
            <text x="44%" y="39.5%" fill="hsl(200 30% 60%)" fontSize="9" fontWeight="500" fontFamily="system-ui" opacity="0.7" textAnchor="middle">Tapi River</text>
            <text x="55%" y="30%" fill="hsl(120 20% 55%)" fontSize="7" fontFamily="system-ui" opacity="0.55" textAnchor="middle">Garden</text>
            <text x="30%" y="58%" fill="hsl(120 20% 55%)" fontSize="7" fontFamily="system-ui" opacity="0.55" textAnchor="middle">Park</text>
            <text x="72%" y="20.5%" fill="hsl(120 20% 55%)" fontSize="7" fontFamily="system-ui" opacity="0.55" textAnchor="middle">Green Area</text>
            <text x="82%" y="66.5%" fill="hsl(120 20% 55%)" fontSize="7" fontFamily="system-ui" opacity="0.55" textAnchor="middle">Garden</text>
            <text x="50%" y="29.2%" fill="hsl(0 0% 65%)" fontSize="7.5" fontWeight="600" fontFamily="system-ui" opacity="0.45" textAnchor="middle">Ring Road</text>
            <text x="50%" y="56.5%" fill="hsl(0 0% 65%)" fontSize="7.5" fontWeight="600" fontFamily="system-ui" opacity="0.45" textAnchor="middle">Dumas Road</text>
            <text x="21.5%" y="50%" fill="hsl(0 0% 65%)" fontSize="7" fontWeight="600" fontFamily="system-ui" opacity="0.4" textAnchor="middle" transform="rotate(-90, 21.5%, 50%)">Canal Road</text>
            <text x="49%" y="50%" fill="hsl(0 0% 65%)" fontSize="7" fontWeight="600" fontFamily="system-ui" opacity="0.4" textAnchor="middle" transform="rotate(-90, 49%, 50%)">VIP Road</text>
            <path d="M 0 92% Q 20% 90%, 40% 93% T 65% 90% T 100% 92%" fill="none" stroke="hsl(0 0% 70%)" strokeWidth="3" strokeDasharray="8 4" opacity="0.4" />
            <text x="50%" y="91%" fill="hsl(0 0% 60%)" fontSize="6.5" fontFamily="system-ui" opacity="0.4" textAnchor="middle">Railway Line</text>
          </svg>

          {/* Markers */}
          {filteredAreas.map((area) => (
            <AreaPin key={area.id} area={area} onSelect={onSelectArea} />
          ))}
        </div>
      </div>

      {/* Selected Area Detail Panel */}
      <AnimatePresence>
        {selectedArea && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="absolute bottom-0 left-0 right-0 z-30 bg-background/98 backdrop-blur-xl rounded-t-[28px] shadow-[0_-8px_40px_-10px_hsl(var(--primary)/0.15)] border-t border-border/60 max-h-[65vh] overflow-auto touch-auto"
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerMove={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
          >
            <div className="p-5 space-y-4">
              <div className="w-10 h-1 bg-border rounded-full mx-auto" />

              <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-10 h-8 w-8 rounded-xl" onClick={() => setSelectedArea(null)}>
                <X className="h-4 w-4" />
              </Button>

              {/* Area header */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md bg-muted flex items-center justify-center">
                    {selectedArea.properties.length > 0 && selectedArea.properties[0].image_url ? (
                      <img src={selectedArea.properties[0].image_url} alt={selectedArea.name} className="w-full h-full object-cover" />
                    ) : (
                      <Home className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className={`absolute -top-1.5 -right-1.5 bg-gradient-to-br ${getScoreColor(selectedArea.score)} rounded-full flex items-center justify-center text-white font-bold shadow-md`} style={{ width: 22, height: 22, fontSize: 9 }}>
                    {selectedArea.score}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-foreground tracking-tight">{selectedArea.name}</h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="secondary" className="text-[10px] h-5 rounded-md gap-1">
                      <Home className="h-3 w-3" />
                      {selectedArea.propertyCount} Properties
                    </Badge>
                  </div>
                </div>
                <Button size="sm" className="rounded-xl h-9 text-xs gap-1 shadow-sm" onClick={() => navigate(`/search?location=${encodeURIComponent(selectedArea.name)}&area=${encodeURIComponent(selectedArea.name)}`)}>
                  View All
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Properties */}
              <div className="space-y-3">
                <h3 className="font-semibold text-[11px] text-muted-foreground uppercase tracking-widest">Available Properties</h3>
                {selectedArea.properties.length === 0 ? (
                  <div className="text-center py-8">
                    <Home className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">No properties listed in this area yet.</p>
                    <Button size="sm" variant="outline" className="mt-3 rounded-xl text-xs" onClick={() => navigate('/list-property')}>
                      List a Property
                    </Button>
                  </div>
                ) : (
                  selectedArea.properties
                    .filter(p => {
                      const matchType = selectedType === 'all' || p.property_type === selectedType;
                      const matchPoster = postedByFilter === 'all' || p.listing_type === postedByFilter;
                      return matchType && matchPoster;
                    })
                    .map((property) => (
                      <Card key={property.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 border-border/50 rounded-2xl" onClick={() => navigate(`/property/${property.id}`)}>
                        <div className="flex gap-3 p-3">
                          <div className="relative w-24 h-24 flex-shrink-0">
                            <img src={property.image_url || '/placeholder.svg'} alt={property.title} className="w-full h-full object-cover rounded-xl" loading="lazy" />
                            {property.is_featured && (
                              <Badge className="absolute top-1 left-1 text-[9px] px-1.5 py-0 h-4 rounded-md bg-secondary text-secondary-foreground border-0">
                                <Star className="h-2.5 w-2.5 mr-0.5" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-sm line-clamp-1 text-foreground">{property.title}</h4>
                              <Badge
                                variant={property.property_type === 'rent' ? 'secondary' : 'default'}
                                className="text-[10px] flex-shrink-0 h-5 rounded-md"
                              >
                                {property.property_type === 'rent' ? 'Rent' : 'Sale'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {property.location}
                            </p>
                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-2">
                              <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" />{property.bedrooms}</span>
                              <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{property.bathrooms}</span>
                              <span className="flex items-center gap-1"><Maximize className="h-3 w-3" />{property.area}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 rounded-md capitalize">{property.listing_type}</Badge>
                              <p className="font-bold text-sm text-primary">{property.price}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Stats Bar */}
      {!selectedArea && (
        <div className="bg-background/95 backdrop-blur-xl border-t border-border/60 px-4 py-3 shrink-0">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <p className="text-xl font-bold text-primary">{filteredAreas.length}</p>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Areas</p>
            </div>
            <div className="w-px h-8 bg-border/60" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <Building className="h-3.5 w-3.5 text-primary" />
                <p className="text-xl font-bold text-primary">{totalProperties.toLocaleString()}</p>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Properties</p>
            </div>
            <div className="w-px h-8 bg-border/60" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <p className="text-xl font-bold text-primary">{areasWithProperties}</p>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Active Areas</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NomadMap;
