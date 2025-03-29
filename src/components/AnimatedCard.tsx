
import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface AnimatedCardProps extends HTMLAttributes<HTMLDivElement> {
  delay?: string;
  direction?: "up" | "right" | "none";
  neon?: boolean;
}

const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, children, delay = "0s", direction = "up", neon = false, ...props }, ref) => {
    return (
      <div
        className={cn(
          neon 
            ? "neon-card p-6 opacity-0" 
            : "glass-card p-6 opacity-0",
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
