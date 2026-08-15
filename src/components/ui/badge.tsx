import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "bg-gold/18 text-cocoa inline-flex items-center rounded-full px-2.5 py-1 text-[0.68rem] font-extrabold tracking-wider uppercase",
        className,
      )}
      {...props}
    />
  );
}
