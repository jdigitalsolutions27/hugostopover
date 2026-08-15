"use client";
import { Button, type ButtonProps } from "@/components/ui/button";
export function ConfirmButton({
  message,
  children,
  ...props
}: ButtonProps & { message: string }) {
  return (
    <Button
      {...props}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </Button>
  );
}
