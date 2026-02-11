import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative h-2 w-full overflow-hidden rounded-md bg-primary/15", className)}
      {...props}
    >
      <div
        className="h-full rounded-md bg-gradient-to-r from-primary to-primary-light transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  )
);
Progress.displayName = "Progress";

export { Progress };
