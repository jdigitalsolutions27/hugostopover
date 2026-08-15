"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Category, Product } from "@/types/domain";

type FlagFilter = "all" | "best" | "featured" | "available";

export function MenuExplorer({
  products,
  categories,
  copy,
}: {
  products: Product[];
  categories: Category[];
  copy?: Partial<{
    searchPlaceholder: string;
    allLabel: string;
    bestLabel: string;
    featuredLabel: string;
    availableLabel: string;
    categoryLabel: string;
    resultsLabel: string;
    clearLabel: string;
    emptyHeading: string;
    emptyBody: string;
    showAllLabel: string;
  }>;
}) {
  const labels = {
    searchPlaceholder: "Search batchoy, buko pie, kakanin…",
    allLabel: "All",
    bestLabel: "Best sellers",
    featuredLabel: "Featured",
    availableLabel: "Available",
    categoryLabel: "Categories",
    resultsLabel: "Showing {shown} of {total} products",
    clearLabel: "Clear filters",
    emptyHeading: "No matches yet",
    emptyBody: "Try a broader search or clear the current filters.",
    showAllLabel: "Show all products",
    ...copy,
  };
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [flag, setFlag] = useState<FlagFilter>("all");

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return products.filter((product) => {
      const matchesQuery =
        !query ||
        [
          product.name,
          product.short_description,
          product.category?.name,
          ...product.tags,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesCategory =
        category === "all" || product.category?.slug === category;
      const matchesFlag =
        flag === "all" ||
        (flag === "best" && product.is_best_seller) ||
        (flag === "featured" && product.is_featured) ||
        (flag === "available" && product.availability === "available");
      return matchesQuery && matchesCategory && matchesFlag;
    });
  }, [products, search, category, flag]);

  const active = search || category !== "all" || flag !== "all";
  function clear() {
    setSearch("");
    setCategory("all");
    setFlag("all");
  }

  return (
    <div>
      <div className="paper-card mb-8 overflow-hidden">
        <div className="grid gap-4 p-4 sm:p-6 xl:grid-cols-[minmax(22rem,1fr)_auto] xl:items-center">
          <label className="relative block min-w-0">
            <span className="sr-only">Search products</span>
            <Search
              className="text-muted pointer-events-none absolute top-1/2 left-4 z-10 size-5 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={labels.searchPlaceholder}
              className="admin-field min-h-14 !rounded-2xl !pr-12 !pl-12 text-base shadow-[0_6px_20px_rgba(58,36,24,0.05)]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="text-muted hover:bg-beige hover:text-cocoa focus-visible:ring-ube absolute top-1/2 right-2.5 grid size-9 -translate-y-1/2 place-items-center rounded-xl transition focus-visible:ring-2 focus-visible:outline-none"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </label>
          <div
            className="border-cocoa/10 bg-beige/30 grid grid-cols-2 gap-1.5 rounded-2xl border p-1.5 sm:flex sm:w-fit sm:flex-wrap"
            role="group"
            aria-label="Product filters"
          >
            {(
              [
                ["all", labels.allLabel],
                ["best", labels.bestLabel],
                ["featured", labels.featuredLabel],
                ["available", labels.availableLabel],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFlag(value)}
                aria-pressed={flag === value}
                className={cn(
                  "focus-visible:ring-ube min-h-11 rounded-xl border px-4 text-xs font-extrabold transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:shrink-0",
                  flag === value
                    ? "border-cocoa bg-cocoa text-cream shadow-[0_5px_14px_rgba(58,36,24,0.2)]"
                    : "text-cocoa/75 hover:border-cocoa/10 hover:text-cocoa border-transparent bg-white/80 hover:bg-white",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="border-cocoa/10 bg-beige/20 border-t px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-5">
            <span className="text-cocoa flex shrink-0 items-center gap-2 pt-2 text-xs font-extrabold tracking-[0.08em] uppercase lg:min-w-28">
              <SlidersHorizontal
                className="text-gold size-4"
                aria-hidden="true"
              />
              {labels.categoryLabel}
            </span>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Product categories"
            >
              <button
                type="button"
                onClick={() => setCategory("all")}
                aria-pressed={category === "all"}
                className={cn(
                  "focus-visible:ring-ube min-h-9 rounded-xl border px-3.5 py-2 text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                  category === "all"
                    ? "border-gold bg-gold text-cocoa shadow-[0_4px_12px_rgba(217,155,61,0.22)]"
                    : "border-cocoa/10 text-cocoa/70 hover:border-gold/50 hover:text-cocoa bg-white/80 hover:bg-white",
                )}
              >
                {labels.allLabel}
              </button>
              {categories.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategory(item.slug)}
                  aria-pressed={category === item.slug}
                  className={cn(
                    "focus-visible:ring-ube min-h-9 rounded-xl border px-3.5 py-2 text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                    category === item.slug
                      ? "border-gold bg-gold text-cocoa shadow-[0_4px_12px_rgba(217,155,61,0.22)]"
                      : "border-cocoa/10 text-cocoa/70 hover:border-gold/50 hover:text-cocoa bg-white/80 hover:bg-white",
                  )}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-muted text-sm font-bold" aria-live="polite">
          {labels.resultsLabel
            .replace("{shown}", String(filtered.length))
            .replace("{total}", String(products.length))}
        </p>
        {active && (
          <Button type="button" variant="ghost" size="sm" onClick={clear}>
            <X className="size-4" />
            {labels.clearLabel}
          </Button>
        )}
      </div>
      {filtered.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 3}
            />
          ))}
        </div>
      ) : (
        <div className="paper-card grid min-h-64 place-items-center p-8 text-center">
          <div>
            <div className="bg-beige/60 mx-auto grid size-16 place-items-center rounded-full text-3xl">
              🍽️
            </div>
            <h2 className="font-display text-cocoa mt-5 text-2xl font-bold">
              {labels.emptyHeading}
            </h2>
            <p className="text-muted mt-2 text-sm">{labels.emptyBody}</p>
            <Button
              type="button"
              variant="outline"
              className="mt-5"
              onClick={clear}
            >
              {labels.showAllLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
