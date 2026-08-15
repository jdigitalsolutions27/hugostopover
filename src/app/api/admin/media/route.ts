import { randomUUID } from "node:crypto";
import { getAdminSession } from "@/lib/auth";
import { imageUploadSchema } from "@/lib/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeText, slugify } from "@/lib/utils";
import { allowedImageExtensions, detectImageMime } from "@/lib/upload";

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin)
    return Response.json({ message: "Unauthorized." }, { status: 401 });
  const declaredSize = Number(request.headers.get("content-length") ?? 0);
  if (declaredSize > 5.5 * 1024 * 1024)
    return Response.json(
      { message: "The upload is too large." },
      { status: 413 },
    );
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File))
    return Response.json(
      { message: "Choose an image to upload." },
      { status: 400 },
    );
  const parsed = imageUploadSchema.safeParse({
    filename: file.name,
    mimeType: file.type,
    size: file.size,
  });
  if (!parsed.success)
    return Response.json(
      { message: "Use a JPEG, PNG, WebP, or AVIF image no larger than 5 MB." },
      { status: 422 },
    );
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  if (detectImageMime(bytes) !== file.type)
    return Response.json(
      { message: "The file content does not match its image type." },
      { status: 422 },
    );
  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "image";
  const supabase = await createSupabaseServerClient();
  const replaceId = safeText(formData.get("replace_id"), 36);
  if (replaceId) {
    const { data: existing } = await supabase
      .from("media")
      .select("id, storage_path, mime_type, alt_text, caption, uploaded_by")
      .eq("id", replaceId)
      .is("deleted_at", null)
      .maybeSingle();
    if (!existing)
      return Response.json(
        { message: "The media item was not found." },
        { status: 404 },
      );
    if (admin.role === "staff" && existing.uploaded_by !== admin.id)
      return Response.json(
        { message: "Staff can only replace images they uploaded." },
        { status: 403 },
      );
    if (existing.mime_type !== file.type)
      return Response.json(
        {
          message:
            "Replacement images must use the same file type so existing references remain valid.",
        },
        { status: 422 },
      );
    const { error: replaceError } = await supabase.storage
      .from("media")
      .upload(existing.storage_path, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: true,
      });
    if (replaceError)
      return Response.json(
        { message: "The image could not be replaced." },
        { status: 500 },
      );
    const { error: updateError } = await supabase
      .from("media")
      .update({ filename: file.name, size_bytes: file.size })
      .eq("id", replaceId);
    if (updateError)
      return Response.json(
        { message: "The media record could not be updated." },
        { status: 500 },
      );
    return Response.json({ message: "Image replaced." }, { status: 200 });
  }
  const path = `${admin.id}/${Date.now()}-${randomUUID()}-${base}.${allowedImageExtensions[file.type]}`;
  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(path, buffer, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });
  if (uploadError)
    return Response.json(
      { message: "The image could not be stored." },
      { status: 500 },
    );
  const { data: publicData } = supabase.storage
    .from("media")
    .getPublicUrl(path);
  const { data, error } = await supabase
    .from("media")
    .insert({
      storage_path: path,
      public_url: publicData.publicUrl,
      filename: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      alt_text: safeText(formData.get("alt_text"), 200),
      caption: safeText(formData.get("caption"), 500),
      uploaded_by: admin.id,
    })
    .select("id, public_url")
    .single();
  if (error) {
    await supabase.storage.from("media").remove([path]);
    return Response.json(
      { message: "The media record could not be created." },
      { status: 500 },
    );
  }
  return Response.json({ message: "Uploaded.", media: data }, { status: 201 });
}
