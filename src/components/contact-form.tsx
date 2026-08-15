"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Send, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { contactSchema } from "@/lib/validation";

type ContactInput = z.infer<typeof contactSchema>;

export function ContactForm({
  productId,
  productName,
  copy,
}: {
  productId?: string;
  productName?: string;
  copy?: Partial<{
    nameLabel: string;
    phoneLabel: string;
    phonePlaceholder: string;
    emailLabel: string;
    emailHint: string;
    subjectLabel: string;
    messageLabel: string;
    privacyNote: string;
    submitLabel: string;
    sendingLabel: string;
  }>;
}) {
  const labels = {
    nameLabel: "Your name",
    phoneLabel: "Phone number",
    phonePlaceholder: "09XX XXX XXXX",
    emailLabel: "Email address",
    emailHint: "Add an email or phone so we can reply.",
    subjectLabel: "Subject",
    messageLabel: "How can we help?",
    privacyNote: "Your details are only used to answer this inquiry.",
    submitLabel: "Send inquiry",
    sendingLabel: "Sending…",
    ...copy,
  };
  const [serverMessage, setServerMessage] = useState("");
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: productName ? `Inquiry about ${productName}` : "",
      message: "",
      product_id: productId,
      website: "",
    },
  });

  async function onSubmit(values: ContactInput) {
    setServerMessage("");
    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setServerMessage(
        payload.message ?? "We couldn’t send your message. Please try again.",
      );
      return;
    }
    setSent(true);
    setServerMessage(payload.message ?? "Thanks! Your message has been sent.");
    reset();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="paper-card p-5 sm:p-8"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={labels.nameLabel} error={errors.name?.message}>
          <input
            {...register("name")}
            className="admin-field"
            autoComplete="name"
          />
        </Field>
        <Field label={labels.phoneLabel} error={errors.phone?.message}>
          <input
            {...register("phone")}
            className="admin-field"
            inputMode="tel"
            autoComplete="tel"
            placeholder={labels.phonePlaceholder}
          />
        </Field>
      </div>
      <div className="mt-5">
        <Field
          label={labels.emailLabel}
          hint={labels.emailHint}
          error={errors.email?.message}
        >
          <input
            {...register("email")}
            className="admin-field"
            type="email"
            autoComplete="email"
          />
        </Field>
      </div>
      <div className="mt-5">
        <Field label={labels.subjectLabel} error={errors.subject?.message}>
          <input {...register("subject")} className="admin-field" />
        </Field>
      </div>
      <div className="mt-5">
        <Field label={labels.messageLabel} error={errors.message?.message}>
          <textarea
            {...register("message")}
            className="admin-field min-h-36 resize-y"
          />
        </Field>
      </div>
      <input
        {...register("website")}
        tabIndex={-1}
        autoComplete="off"
        className="sr-only"
        aria-hidden="true"
      />
      <input {...register("product_id")} type="hidden" />
      {serverMessage && (
        <p
          className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${sent ? "bg-leaf/10 text-leaf" : "bg-danger/10 text-danger"}`}
          role="status"
        >
          {serverMessage}
        </p>
      )}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted flex items-center gap-2 text-xs">
          <ShieldCheck className="text-leaf size-4" /> {labels.privacyNote}
        </p>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {isSubmitting ? labels.sendingLabel : labels.submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-cocoa mb-2 block text-sm font-extrabold">
        {label}
      </span>
      {children}
      {hint && !error && (
        <span className="text-muted mt-1.5 block text-xs">{hint}</span>
      )}
      {error && (
        <span
          className="text-danger mt-1.5 block text-xs font-bold"
          role="alert"
        >
          {error}
        </span>
      )}
    </label>
  );
}
