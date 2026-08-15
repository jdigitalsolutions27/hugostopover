import { contactSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeText } from "@/lib/utils";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json"))
    return Response.json({ message: "Unsupported request." }, { status: 415 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid request." }, { status: 400 });
  }
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success)
    return Response.json(
      {
        message: "Please review the form and try again.",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  if (parsed.data.website)
    return Response.json({ message: "Thanks! Your message has been sent." });

  const forwarded =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const fingerprint = `${forwarded}:${request.headers.get("user-agent")?.slice(0, 80) ?? "agent"}`;
  if (!(await checkRateLimit(`inquiry:${fingerprint}`, 5, 3600)))
    return Response.json(
      {
        message:
          "Too many messages were sent from this connection. Please try again later or contact us on Facebook.",
      },
      { status: 429 },
    );
  if (!hasSupabaseConfig())
    return Response.json(
      {
        message:
          "Online inquiries are not connected yet. Please call or message the Facebook page.",
      },
      { status: 503 },
    );

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("submit_inquiry", {
    p_name: safeText(parsed.data.name, 100),
    p_email: parsed.data.email || "",
    p_phone: safeText(parsed.data.phone, 30),
    p_product_id: parsed.data.product_id || null,
    p_subject: safeText(parsed.data.subject, 120),
    p_message: safeText(parsed.data.message, 2000),
  });
  if (error) {
    console.error("Inquiry insert failed", error.code);
    return Response.json(
      {
        message:
          "We couldn’t send your message just now. Please message us on Facebook instead.",
      },
      { status: 500 },
    );
  }
  return Response.json(
    {
      message:
        "Thanks! Your inquiry was sent. We’ll get back to you as soon as we can.",
    },
    { status: 201 },
  );
}
