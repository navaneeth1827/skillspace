
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "neon";
  size?: "default" | "sm" | "lg";
  asChild?: boolean;
  children: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(
          "relative inline-flex items-center justify-center rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          
          // Variants
          variant === "default" && 
            "bg-primary text-primary-foreground shadow hover:opacity-90",
          variant === "outline" && 
            "border border-white/10 bg-transparent hover:bg-white/5",
          variant === "ghost" && 
            "hover:bg-accent/10 hover:text-accent",
          variant === "link" && 
            "text-accent underline-offset-4 hover:underline",
          variant === "neon" &&
            "border border-neon-blue bg-black text-white shadow-[0_0_5px_#00f3ff] hover:shadow-[0_0_10px_#00f3ff,0_0_20px_rgba(0,243,255,0.5)]",
          
          // Sizes
          size === "default" && "h-10 px-4 py-2",
          size === "sm" && "h-8 px-3 text-xs",
          size === "lg" && "h-12 px-6 text-base",
          
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
