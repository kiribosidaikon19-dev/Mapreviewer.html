import { type Review, type User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReviewListProps {
  reviews: (Review & { user: User })[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border">
        <Star className="h-8 w-8 mb-3 opacity-20" />
        <p className="font-medium">レビューがまだありません</p>
        <p className="text-sm">あなたの体験を最初に共有しましょう！</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {reviews.map((review) => (
          <div 
            key={review.id} 
            className="p-4 rounded-xl bg-card border border-border/50 hover:border-border transition-colors shadow-sm"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src={review.user.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {review.user.firstName?.[0] || review.user.email?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {review.user.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {review.createdAt && formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: ja })}
                  </p>
                </div>
              </div>
              <div className="flex items-center bg-yellow-400/10 px-2 py-1 rounded-full border border-yellow-400/20">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">{review.rating}</span>
              </div>
            </div>
            {review.comment && (
              <p className="text-sm text-foreground/90 leading-relaxed pl-11">
                {review.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
