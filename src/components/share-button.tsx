"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ShareButton({
  title,
  url,
  compact = false,
}: {
  title: string;
  url: string;
  compact?: boolean;
}) {
  async function share() {
    const absolute = url.startsWith("http")
      ? url
      : `${window.location.origin}${url}`;
    if (navigator.share) {
      await navigator.share({ title, url: absolute }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(absolute);
    toast.success("Product link copied.");
  }
  return (
    <Button
      type="button"
      variant="outline"
      size={compact ? "sm" : "md"}
      onClick={share}
      aria-label={`Share ${title}`}
    >
      <Share2 className="size-4" />
      {compact ? null : "Share"}
    </Button>
  );
}
