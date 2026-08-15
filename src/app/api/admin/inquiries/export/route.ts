import { assertAdmin } from "@/lib/auth";
import { getInquiries } from "@/data/repository";
function cell(value: unknown) {
  return `"${String(value ?? "")
    .replaceAll('"', '""')
    .replace(/\r?\n/g, " ")}"`;
}
export async function GET() {
  await assertAdmin();
  const items = await getInquiries();
  const header = [
    "Date (Asia/Manila)",
    "Name",
    "Email",
    "Phone",
    "Subject",
    "Message",
    "Status",
    "Read",
    "Private Notes",
  ];
  const rows = items.map((item) => [
    new Intl.DateTimeFormat("en-PH", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "Asia/Manila",
    }).format(new Date(item.created_at)),
    item.name,
    item.email,
    item.phone,
    item.subject,
    item.message,
    item.status,
    item.is_read,
    item.private_notes,
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map(cell).join(","))
    .join("\r\n");
  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="hugos-inquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
