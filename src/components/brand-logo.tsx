import Image from "next/image";
import { Soup } from "lucide-react";
import { cn, safeMediaUrl } from "@/lib/utils";

export function BrandLogo({
  compact = false,
  className,
  name = "Hugo’s Stop Over",
  logoUrl,
}: {
  compact?: boolean;
  className?: string;
  name?: string;
  logoUrl?: string | null;
}) {
  const imageUrl = safeMediaUrl(logoUrl);
  return (
    <span
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label={name}
    >
      <span className="bg-gold text-cocoa relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full shadow-[inset_0_0_0_2px_rgba(58,36,24,.16)]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="44px"
            className="object-cover"
          />
        ) : (
          <Soup className="size-6" aria-hidden="true" />
        )}
        <span className="bg-cocoa/15 absolute -bottom-1 h-2 w-7 rounded-[50%]" />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="font-display text-cocoa block max-w-40 text-[1.05rem] leading-tight font-black tracking-[-.03em]">
            {name}
          </span>
        </span>
      )}
    </span>
  );
}
