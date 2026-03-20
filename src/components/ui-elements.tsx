import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      outline: "border-2 border-border bg-transparent hover:bg-muted text-foreground",
      ghost: "bg-transparent hover:bg-muted text-foreground",
      danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md shadow-destructive/20",
    };
    
    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-11 px-6 font-medium",
      lg: "h-14 px-8 text-lg font-semibold",
      icon: "h-11 w-11 flex items-center justify-center p-0",
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden", className)} {...props}>
    {children}
  </div>
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-foreground">{label}</label>}
        <input
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-xl border-2 border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus:border-destructive focus:ring-destructive/10",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-destructive font-medium">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";

export const Badge = ({ children, variant = "default", className }: { children: React.ReactNode, variant?: "default" | "success" | "warning" | "danger" | "outline", className?: string }) => {
  const variants = {
    default: "bg-secondary text-secondary-foreground",
    success: "bg-success/15 text-success border border-success/20",
    warning: "bg-warning/15 text-warning-foreground border border-warning/20",
    danger: "bg-destructive/15 text-destructive border border-destructive/20",
    outline: "border border-border text-foreground"
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", variants[variant], className)}>
      {children}
    </span>
  );
};
