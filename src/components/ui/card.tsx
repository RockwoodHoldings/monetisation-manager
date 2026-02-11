import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-border bg-card transition-[border-color,box-shadow] duration-200 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(212,168,67,0.06)]",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export { Card };
