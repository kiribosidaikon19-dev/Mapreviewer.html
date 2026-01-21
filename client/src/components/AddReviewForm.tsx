import { useState } from "react";
import { useCreateReview } from "@/hooks/use-reviews";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface AddReviewFormProps {
  locationId: number;
}

export function AddReviewForm({ locationId }: AddReviewFormProps) {
  const { isAuthenticated } = useAuth();
  const createReview = useCreateReview(locationId);
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  if (!isAuthenticated) {
    return (
      <div className="p-6 rounded-xl bg-muted/30 border border-border text-center">
        <h4 className="font-semibold text-foreground mb-2">Have you visited?</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Log in to share your experience and help others discover great places.
        </p>
        <Button variant="outline" asChild>
          <a href="/api/login">Log in to Review</a>
        </Button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    
    createReview.mutate({
      rating,
      comment: comment.trim(),
    }, {
      onSuccess: () => {
        setRating(0);
        setComment("");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5 rounded-xl border border-border bg-card shadow-sm">
      <div className="space-y-2">
        <Label>Your Rating</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none transition-transform hover:scale-110"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={cn(
                  "h-8 w-8 transition-colors",
                  (hoverRating || rating) >= star
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-muted text-muted-foreground/30"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Comment</Label>
        <Textarea
          id="comment"
          placeholder="Tell us about your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[100px] resize-none"
        />
      </div>

      <Button 
        type="submit" 
        disabled={rating === 0 || createReview.isPending}
        className="w-full"
      >
        {createReview.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Posting...
          </>
        ) : (
          "Post Review"
        )}
      </Button>
    </form>
  );
}
