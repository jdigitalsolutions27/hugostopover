"use client";
import { ImageUp, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
export function MediaUploader({ replaceId }: { replaceId?: string }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  async function upload(file: File) {
    setUploading(true);
    const body = new FormData();
    body.set("file", file);
    if (replaceId) body.set("replace_id", replaceId);
    else
      body.set(
        "alt_text",
        file.name
          .replace(/[-_]/g, " ")
          .replace(/\.[^.]+$/, "")
          .slice(0, 200),
      );
    const response = await fetch("/api/admin/media", { method: "POST", body });
    const result = (await response.json()) as { message?: string };
    setUploading(false);
    if (!response.ok) {
      toast.error(result.message ?? "Upload failed.");
      return;
    }
    toast.success(
      replaceId
        ? "Image file replaced."
        : "Image uploaded to the media library.",
    );
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }
  return (
    <div
      className={
        replaceId
          ? "text-left"
          : "border-cocoa/15 rounded-2xl border-2 border-dashed bg-white p-8 text-center"
      }
    >
      {!replaceId && (
        <>
          <ImageUp className="text-ube mx-auto size-9" />
          <h2 className="font-display text-cocoa mt-4 text-2xl font-bold">
            Upload an owner-approved image
          </h2>
          <p className="text-muted mx-auto mt-2 max-w-lg text-xs leading-5">
            JPEG, PNG, WebP, or AVIF up to 5 MB. The server verifies both the
            declared MIME type and file signature.
          </p>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        id={`media-upload-${replaceId || "new"}`}
        disabled={uploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />
      <Button
        asChild={false}
        type="button"
        className={replaceId ? "" : "mt-5"}
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <ImageUp className="size-4" />
        )}
        {uploading ? "Uploading…" : replaceId ? "Replace file" : "Choose image"}
      </Button>
    </div>
  );
}
