import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="display-title text-cocoa mt-3 text-4xl leading-[1.06] sm:text-5xl">
        {title}
      </h2>
      {body && (
        <p className="text-muted mt-4 text-base leading-7 sm:text-lg">{body}</p>
      )}
    </div>
  );
}
