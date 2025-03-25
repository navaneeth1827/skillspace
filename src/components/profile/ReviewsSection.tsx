
import { ReviewItem } from "@/types/profile";
import { Star, Trophy } from "lucide-react";

interface ReviewsSectionProps {
  reviews: ReviewItem[];
}

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="font-semibold mb-6">Client Reviews</h3>
      
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="h-12 w-12 text-navy-accent mx-auto mb-3" />
          <h4 className="text-lg font-medium">No reviews yet</h4>
          <p className="text-muted-foreground mt-1">
            Complete jobs to start collecting client reviews.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review, index) => (
            <div key={review.id || index} className="border-b border-white/10 last:border-0 pb-6 last:pb-0">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{review.job_title}</h4>
                  <p className="text-navy-accent text-sm">{review.client_name || "Client"}</p>
                  <p className="text-muted-foreground text-sm">{review.completed_date}</p>
                </div>
                <div className="flex items-center">
                  <span className="mr-1 font-medium">{review.rating}</span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        className={`${i < Math.floor(review.rating) ? "fill-yellow-500 text-yellow-500" : "text-gray-500"}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-muted-foreground italic">"{review.review_text}"</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
