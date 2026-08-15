import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-extrabold transition duration-200 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-cocoa text-cream shadow-[0_9px_25px_rgba(58,36,24,.2)] hover:-translate-y-0.5 hover:bg-[#4a2d1d]",
        gold: "bg-gold text-cocoa shadow-[0_9px_25px_rgba(217,155,61,.25)] hover:-translate-y-0.5 hover:bg-[#e7ab50]",
        outline:
          "border border-cocoa/20 bg-white/70 text-cocoa hover:border-cocoa/40 hover:bg-white",
        ghost: "text-cocoa hover:bg-cocoa/7",
        danger: "bg-danger text-white hover:bg-[#872f23]",
      },
      size: {
        sm: "min-h-9 px-3.5 py-1.5 text-xs",
        md: "",
        lg: "min-h-13 px-7 py-3.5 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return (
    <Component
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
