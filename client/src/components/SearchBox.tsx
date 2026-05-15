import { useState, useRef, useEffect, useMemo } from "react";
import { Search, Loader2, MapPin, X, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocations } from "@/hooks/use-locations";
import Fuse from "fuse.js";
import type { Location } from "@shared/schema";

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

type SearchResult =
  | { kind: "app"; location: Location }
  | { kind: "nominatim"; result: NominatimResult };

interface SearchBoxProps {
  onFlyTo: (lat: number, lng: number) => void;
  onSelectAppLocation?: (id: number) => void;
}

export function SearchBox({ onFlyTo, onSelectAppLocation }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [nominatimResults, setNominatimResults] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: appLocations = [] } = useLocations();

  const fuse = useMemo(
    () =>
      new Fuse(appLocations, {
        keys: ["name", "description"],
        threshold: 0.4,
        includeScore: true,
        minMatchCharLength: 1,
        ignoreLocation: true,
      }),
    [appLocations]
  );

  const appResults: SearchResult[] = useMemo(() => {
    if (!query.trim()) return [];
    return fuse
      .search(query)
      .slice(0, 3)
      .map((r) => ({ kind: "app" as const, location: r.item }));
  }, [query, fuse]);

  const allResults: SearchResult[] = [
    ...appResults,
    ...nominatimResults
      .slice(0, 5 - appResults.length)
      .map((r) => ({ kind: "nominatim" as const, result: r })),
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchNominatim = async (value: string) => {
    if (!value.trim()) {
      setNominatimResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=5&countrycodes=jp&accept-language=ja`,
        { headers: { "Accept-Language": "ja" } }
      );
      const data: NominatimResult[] = await res.json();
      setNominatimResults(data);
    } catch {
      setNominatimResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (value: string) => {
    setQuery(value);
    setIsOpen(!!value.trim());
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchNominatim(value), 450);
  };

  const handleSelectApp = (location: Location) => {
    onFlyTo(location.latitude, location.longitude);
    if (onSelectAppLocation) onSelectAppLocation(location.id);
    setQuery(location.name);
    setIsOpen(false);
  };

  const handleSelectNominatim = (result: NominatimResult) => {
    onFlyTo(parseFloat(result.lat), parseFloat(result.lon));
    setQuery(result.display_name.split(",")[0]);
    setIsOpen(false);
    setNominatimResults([]);
  };

  const handleClear = () => {
    setQuery("");
    setNominatimResults([]);
    setIsOpen(false);
  };

  const showDropdown = isOpen && (allResults.length > 0 || (isLoading && query.trim()));

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder="地名・スポットを検索..."
          className="pl-9 pr-9 h-11 bg-background/90 backdrop-blur-md border-border/60 rounded-xl shadow-lg focus-visible:ring-1"
          data-testid="input-place-search"
        />
        {isLoading ? (
          <Loader2 className="absolute right-3 h-4 w-4 text-muted-foreground animate-spin" />
        ) : query ? (
          <button
            onClick={handleClear}
            className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-clear-search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {showDropdown && (
        <div className="absolute top-full mt-2 w-full bg-background/97 backdrop-blur-md border border-border/60 rounded-xl shadow-xl overflow-hidden z-10">
          {allResults.length === 0 && isLoading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              検索中...
            </div>
          )}

          {allResults.map((item, i) => {
            if (item.kind === "app") {
              const loc = item.location;
              return (
                <button
                  key={`app-${loc.id}`}
                  onClick={() => handleSelectApp(loc)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/60 transition-colors text-left border-b border-border/30 last:border-0"
                  data-testid={`button-search-app-${loc.id}`}
                >
                  <Star className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {loc.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {loc.description || "登録済みスポット"}
                    </p>
                  </div>
                  <span className="ml-auto shrink-0 text-[10px] bg-primary/10 text-primary font-medium px-1.5 py-0.5 rounded-full self-center">
                    スポット
                  </span>
                </button>
              );
            } else {
              const result = item.result;
              return (
                <button
                  key={`nom-${result.place_id}`}
                  onClick={() => handleSelectNominatim(result)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/60 transition-colors text-left border-b border-border/30 last:border-0"
                  data-testid={`button-search-nominatim-${result.place_id}`}
                >
                  <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {result.display_name.split(",")[0]}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {result.display_name.split(",").slice(1, 3).join(",")}
                    </p>
                  </div>
                </button>
              );
            }
          })}

          {allResults.length === 0 && !isLoading && query.trim() && (
            <div className="px-4 py-3 text-sm text-muted-foreground text-center">
              「{query}」の検索結果が見つかりませんでした
            </div>
          )}
        </div>
      )}
    </div>
  );
}
