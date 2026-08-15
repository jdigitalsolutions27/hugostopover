import Image from "next/image";
import { CATEGORY_ART } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ProductVisual({
  name,
  categorySlug,
  imageUrl,
  priority = false,
  className,
}: {
  name: string;
  categorySlug: string;
  imageUrl: string | null;
  priority?: boolean;
  className?: string;
}) {
  const art = CATEGORY_ART[categorySlug] ?? {
    emoji: "🍽️",
    tone: "from-[#8b5a2b] to-[#d99b3d]",
  };
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br",
        art.tone,
        className,
      )}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          loading={priority ? "eager" : "lazy"}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
        />
      ) : (
        <div
          className="native-pattern absolute inset-0 grid place-items-center"
          role="img"
          aria-label={`${name} image placeholder`}
        >
          <span className="text-7xl drop-shadow-lg" aria-hidden="true">
            {art.emoji}
          </span>
          <span className="bg-cocoa/70 text-cream absolute bottom-4 rounded-full px-3 py-1 text-[0.65rem] font-bold tracking-widest uppercase">
            Photo coming soon
          </span>
        </div>
      )}
      <div className="from-cocoa/25 pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent to-white/5" />
    </div>
  );
}
