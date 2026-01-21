import { type Location } from "@shared/schema";
import { useLocation } from "@/hooks/use-locations";
import { ReviewList } from "./ReviewList";
import { AddReviewForm } from "./AddReviewForm";
import { Button } from "@/components/ui/button";
import { X, MapPin, Navigation2, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface LocationSidebarProps {
  locationId: number | null;
  onClose: () => void;
}

export function LocationSidebar({ locationId, onClose }: LocationSidebarProps) {
  const { data: locationDetails, isLoading, error } = useLocation(locationId);

  if (!locationId) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-full md:w-[450px] bg-background/95 backdrop-blur-md shadow-2xl border-l border-border z-[500] flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-6 border-b border-border flex items-start justify-between bg-card/50">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            {isLoading ? <Skeleton className="h-8 w-48 mb-2" /> : locationDetails?.name}
          </h2>
          <div className="flex items-center text-sm text-muted-foreground gap-1">
            <MapPin className="h-3 w-3" />
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <span>
                {locationDetails?.latitude.toFixed(4)}, {locationDetails?.longitude.toFixed(4)}
              </span>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p>Failed to load location details.</p>
            </div>
          ) : locationDetails ? (
            <>
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">概要</h3>
                <p className="text-foreground/90 leading-relaxed text-lg font-light">
                  {locationDetails.description}
                </p>
              </div>

              <Separator />

              {/* Reviews Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold font-display flex items-center gap-2">
                    レビュー
                    <span className="text-sm font-normal text-muted-foreground font-sans bg-muted px-2 py-0.5 rounded-full">
                      {locationDetails.reviews?.length || 0}
                    </span>
                  </h3>
                  {locationDetails.reviews && locationDetails.reviews.length > 0 && (
                    <div className="flex items-center text-yellow-500 font-bold">
                      <Star className="h-4 w-4 fill-current mr-1" />
                      {(locationDetails.reviews.reduce((acc, r) => acc + r.rating, 0) / locationDetails.reviews.length).toFixed(1)}
                    </div>
                  )}
                </div>

                <div className="space-y-8">
                  <AddReviewForm locationId={locationDetails.id} />
                  <ReviewList reviews={locationDetails.reviews || []} />
                </div>
              </div>
            </>
          ) : null}
        </div>
      </ScrollArea>
    </div>
  );
}
