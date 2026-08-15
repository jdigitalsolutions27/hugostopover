"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Images,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn, safeMediaUrl } from "@/lib/utils";
import type { MediaItem } from "@/types/domain";

export function MediaPicker({
  name,
  media,
  value,
  multiple = false,
  max = 12,
  label = multiple ? "Gallery images" : "Image",
  hint,
}: {
  name: string;
  media: MediaItem[];
  value?: string | string[] | null;
  multiple?: boolean;
  max?: number;
  label?: string;
  hint?: string;
}) {
  const initial = Array.isArray(value)
    ? value.map(safeMediaUrl).filter(Boolean)
    : safeMediaUrl(value)
      ? [safeMediaUrl(value)]
      : [];
  const [selected, setSelected] = useState<string[]>(initial);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return media;
    return media.filter((item) =>
      `${item.filename} ${item.alt_text} ${item.caption}`
        .toLowerCase()
        .includes(search),
    );
  }, [media, query]);

  function choose(url: string) {
    if (!multiple) {
      setSelected([url]);
      return;
    }
    setSelected((current) =>
      current.includes(url)
        ? current.filter((item) => item !== url)
        : current.length < max
          ? [...current, url]
          : current,
    );
  }

  function move(index: number, direction: -1 | 1) {
    setSelected((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      const currentItem = next[index];
      const targetItem = next[target];
      if (currentItem === undefined || targetItem === undefined) return current;
      next[index] = targetItem;
      next[target] = currentItem;
      return next;
    });
  }

  return (
    <div>
      <input
        type="hidden"
        name={name}
        value={multiple ? selected.join("\n") : (selected[0] ?? "")}
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-cocoa text-sm font-extrabold">{label}</p>
          {hint && <p className="text-muted mt-1 text-xs">{hint}</p>}
        </div>
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <Button type="button" variant="outline" size="sm">
              {multiple ? (
                <Images className="size-4" />
              ) : (
                <ImageIcon className="size-4" />
              )}
              {selected.length
                ? multiple
                  ? `Choose images (${selected.length}/${max})`
                  : "Change image"
                : multiple
                  ? "Choose images"
                  : "Choose image"}
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-sm" />
            <Dialog.Content className="bg-cream fixed top-1/2 left-1/2 z-[90] flex max-h-[88vh] w-[min(940px,94vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[1.75rem] shadow-2xl focus:outline-none">
              <div className="border-cocoa/10 flex items-start justify-between border-b bg-white px-5 py-4 sm:px-7">
                <div>
                  <Dialog.Title className="font-display text-cocoa text-2xl font-bold">
                    Choose from the media library
                  </Dialog.Title>
                  <Dialog.Description className="text-muted mt-1 text-xs">
                    {multiple
                      ? `Select up to ${max} images. Click a selected image again to remove it.`
                      : "Select one owner-approved image for this field."}
                  </Dialog.Description>
                </div>
                <Dialog.Close className="border-cocoa/15 text-cocoa grid size-10 place-items-center rounded-full border bg-white">
                  <X className="size-4" />
                  <span className="sr-only">Close media picker</span>
                </Dialog.Close>
              </div>
              <div className="border-cocoa/10 border-b p-4 sm:px-7">
                <label className="relative block">
                  <span className="sr-only">Search media</span>
                  <Search className="text-muted absolute top-1/2 left-4 size-4 -translate-y-1/2" />
                  <input
                    className="admin-field pl-11"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search filename, alt text, or caption…"
                  />
                </label>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-7">
                {filtered.length ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {filtered.map((item) => {
                      const active = selected.includes(item.public_url);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => choose(item.public_url)}
                          className={cn(
                            "group overflow-hidden rounded-2xl border-2 bg-white text-left transition",
                            active
                              ? "border-ube ring-ube/20 ring-4"
                              : "hover:border-gold border-transparent",
                          )}
                          aria-pressed={active}
                        >
                          <span className="bg-beige relative block aspect-[4/3]">
                            <Image
                              src={item.public_url}
                              alt={item.alt_text || item.filename}
                              fill
                              sizes="(max-width: 640px) 45vw, 220px"
                              className="object-cover"
                            />
                            {active && (
                              <span className="bg-ube absolute top-2 right-2 grid size-7 place-items-center rounded-full text-white shadow">
                                <Check className="size-4" />
                              </span>
                            )}
                          </span>
                          <span className="block p-3">
                            <span className="text-cocoa block truncate text-xs font-extrabold">
                              {item.alt_text || item.filename}
                            </span>
                            <span className="text-muted mt-1 block truncate text-[.65rem]">
                              {item.filename}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="border-cocoa/15 rounded-2xl border border-dashed p-10 text-center">
                    <ImageIcon className="text-muted mx-auto size-8" />
                    <p className="text-cocoa mt-3 text-sm font-bold">
                      {media.length
                        ? "No images match that search."
                        : "The media library is empty."}
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="mt-4"
                    >
                      <Link href="/admin/media" target="_blank">
                        Upload an image
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
              <div className="border-cocoa/10 flex items-center justify-between gap-3 border-t bg-white px-5 py-4 sm:px-7">
                <p className="text-muted text-xs font-bold">
                  {selected.length} {selected.length === 1 ? "image" : "images"}{" "}
                  selected
                </p>
                <Dialog.Close asChild>
                  <Button type="button">Done</Button>
                </Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
      {selected.length ? (
        <div
          className={cn(
            "mt-4 grid gap-3",
            multiple ? "grid-cols-2 sm:grid-cols-4" : "max-w-sm",
          )}
        >
          {selected.map((url, index) => {
            const item = media.find(
              (candidate) => candidate.public_url === url,
            );
            return (
              <div
                key={url}
                className="border-cocoa/10 overflow-hidden rounded-xl border bg-white"
              >
                <div className="bg-beige relative aspect-[4/3]">
                  <Image
                    src={url}
                    alt={item?.alt_text || `${label} preview`}
                    fill
                    sizes="240px"
                    className="object-cover"
                  />
                  {multiple && (
                    <span className="bg-cocoa text-cream absolute top-2 left-2 rounded-full px-2 py-1 text-[.6rem] font-bold">
                      {index + 1}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between px-2 py-2">
                  {multiple && (
                    <span className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                        className="border-cocoa/10 text-cocoa grid size-7 place-items-center rounded-lg border disabled:opacity-30"
                        aria-label={`Move image ${index + 1} earlier`}
                      >
                        <ChevronLeft className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, 1)}
                        disabled={index === selected.length - 1}
                        className="border-cocoa/10 text-cocoa grid size-7 place-items-center rounded-lg border disabled:opacity-30"
                        aria-label={`Move image ${index + 1} later`}
                      >
                        <ChevronRight className="size-3.5" />
                      </button>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setSelected((current) =>
                        current.filter((selectedUrl) => selectedUrl !== url),
                      )
                    }
                    className="text-danger ml-auto flex items-center gap-1 text-xs font-bold"
                  >
                    <Trash2 className="size-3.5" /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border-cocoa/15 text-muted mt-4 rounded-xl border border-dashed p-5 text-center text-xs">
          No image selected. The website will use its branded placeholder.
        </div>
      )}
    </div>
  );
}
