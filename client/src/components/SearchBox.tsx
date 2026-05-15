import { useState, useRef, useEffect } from "react";
import { Search, Loader2, MapPin, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

interface SearchBoxProps {
  onFlyTo: (lat: number, lng: number) => void;
}

export function SearchBox({ onFlyTo }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const search = async (value: string) => {
    if (!value.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=5&countrycodes=jp&accept-language=ja`,
        { headers: { "Accept-Language": "ja" } }
      );
      const data: NominatimResult[] = await res.json();
      setResults(data);
      setIsOpen(data.length > 0);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 400);
  };

  const handleSelect = (result: NominatimResult) => {
    onFlyTo(parseFloat(result.lat), parseFloat(result.lon));
    setQuery(result.display_name.split(",")[0]);
    setIsOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="地名・住所を検索..."
          className="pl-9 pr-9 h-11 bg-background/90 backdrop-blur-md border-border/60 rounded-xl shadow-lg focus-visible:ring-1"
          data-testid="input-place-search"
        />
        {isLoading ? (
          <Loader2 className="absolute right-3 h-4 w-4 text-muted-foreground animate-spin" />
        ) : query ? (
          <button
            onClick={handleClear}
            className="absolute right-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-clear-search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-background/95 backdrop-blur-md border border-border/60 rounded-xl shadow-xl overflow-hidden z-10">
          {results.map((result) => (
            <button
              key={result.place_id}
              onClick={() => handleSelect(result)}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/60 transition-colors text-left border-b border-border/30 last:border-0"
              data-testid={`button-search-result-${result.place_id}`}
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
          ))}
        </div>
      )}
    </div>
  );
}
