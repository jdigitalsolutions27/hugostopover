import Image from "next/image";
import { cn, safeMediaUrl } from "@/lib/utils";

const OFFICIAL_LOGO = "/images/hugo-official-logo.jpg";

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
  const imageUrl = safeMediaUrl(logoUrl) || OFFICIAL_LOGO;
  return (
    <span
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label={name}
    >
      <span
        className={cn(
          "border-gold/65 bg-cream relative grid shrink-0 place-items-center overflow-hidden rounded-full border-2 shadow-[0_5px_16px_rgba(58,36,24,.16)]",
          compact ? "size-11" : "size-12",
        )}
      >
        <Image
          src={imageUrl}
          alt=""
          fill
          loading="eager"
          sizes={compact ? "44px" : "48px"}
          className="object-cover"
        />
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
