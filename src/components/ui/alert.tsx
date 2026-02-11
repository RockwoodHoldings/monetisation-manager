import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-[10px] border p-4 text-sm",
  {
    variants: {
      variant: {
        default: "border-border bg-secondary text-foreground",
        destructive: "border-destructive/50 bg-destructive/10 text-destructive",
        success: "border-success/50 bg-success/10 text-success",
        info: "border-primary/30 bg-primary/10 text-primary-light",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = "Alert";

export { Alert };
