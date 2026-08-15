"use client";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="bg-cream grid min-h-screen place-items-center p-6 text-center">
      <div className="paper-card max-w-lg p-10">
        <TriangleAlert className="text-danger mx-auto size-10" />
        <h1 className="display-title text-cocoa mt-5 text-4xl">
          Something spilled.
        </h1>
        <p className="text-muted mt-4 text-sm leading-6">
          We couldn’t load this page. Please try again; if the problem
          continues, message Hugo’s Stop Over on Facebook.
        </p>
        <Button type="button" onClick={reset} className="mt-7">
          <RotateCcw className="size-4" />
          Try again
        </Button>
      </div>
    </main>
  );
}
