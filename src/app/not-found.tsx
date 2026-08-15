import Link from "next/link";
import { ArrowLeft, Soup } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { getPageSections } from "@/data/repository";

export default async function NotFound() {
  const sections = await getPageSections("global");
  const content = sections.find(
    (section) => section.section_key === "not_found",
  );
  return (
    <PublicShell>
      <section className="grid min-h-[65vh] place-items-center px-4 py-20 text-center">
        <div>
          <span className="bg-gold/20 text-cocoa mx-auto grid size-20 place-items-center rounded-full">
            <Soup className="size-9" />
          </span>
          <p className="eyebrow mt-7">
            {content?.eyebrow || "404 • Wrong turn"}
          </p>
          <h1 className="display-title text-cocoa mt-3 text-5xl sm:text-7xl">
            {content?.heading || "This stop isn’t on the menu."}
          </h1>
          <p className="text-muted mx-auto mt-5 max-w-xl">
            {content?.body ||
              "The page may have moved, or the address might need another look."}
          </p>
          <Button asChild className="mt-8">
            <Link href={content?.primary_cta_url || "/"}>
              <ArrowLeft className="size-4" />
              {content?.primary_cta_label || "Back to Hugo’s"}
            </Link>
          </Button>
        </div>
      </section>
    </PublicShell>
  );
}
