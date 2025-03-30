
import { Star } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReviewItem } from "@/types/profile";

interface ReviewCardProps {
  review: ReviewItem;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  // Generate star rating display
  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          size={16} 
          className={i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"} 
        />
      );
    }
    return stars;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div className="flex gap-2 items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={review.client_avatar || "/placeholder.svg"} alt="Client" />
              <AvatarFallback>{review.client_name?.[0] || "C"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{review.client_name}</p>
              <p className="text-xs text-muted-foreground">{review.completed_date}</p>
            </div>
          </div>
          <div className="flex">
            {renderStars()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium mb-1">{review.job_title}</p>
        <p className="text-sm text-muted-foreground">{review.review_text}</p>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground border-t pt-3">
        Project completed: {review.completed_date}
      </CardFooter>
    </Card>
  );
};

export default ReviewCard;
