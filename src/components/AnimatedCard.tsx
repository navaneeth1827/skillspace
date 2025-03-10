
import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface AnimatedCardProps extends HTMLAttributes<HTMLDivElement> {
  delay?: string;
  direction?: "up" | "right" | "none";
}

const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, children, delay = "0s", direction = "up", ...props }, ref) => {
    return (
      <div
        className={cn(
          "glass-card p-6 opacity-0",
          direction === "up" && "animate-fade-up",
          direction === "right" && "animate-slide-in-right", 
          direction === "none" && "animate-fade-in",
          className
        )}
        style={{ animationDelay: delay, animationFillMode: "forwards" }}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";

export default AnimatedCard;
