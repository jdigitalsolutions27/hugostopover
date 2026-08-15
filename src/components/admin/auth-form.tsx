"use client";

import Link from "next/link";
import { LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  forgotPasswordAction,
  loginAction,
  resetPasswordAction,
} from "@/actions/auth";
import { initialActionState } from "@/lib/validation";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, action, pending] = useActionState(
    loginAction,
    initialActionState,
  );
  return (
    <form action={action} className="mt-8 space-y-5" noValidate>
      <input type="hidden" name="next" value={nextPath} />
      <AuthField
        label="Email address"
        error={state.errors?.email?.[0]}
        icon={<Mail />}
      >
        <input
          className="admin-field auth-field-input"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </AuthField>
      <AuthField
        label="Password"
        error={state.errors?.password?.[0]}
        icon={<LockKeyhole />}
      >
        <input
          className="admin-field auth-field-input"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </AuthField>
      {state.message && (
        <p
          className="bg-danger/10 text-danger rounded-xl px-4 py-3 text-sm font-bold"
          role="alert"
        >
          {state.message}
        </p>
      )}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/forgot-password"
          className="text-ube text-xs font-extrabold hover:underline"
        >
          Forgot password?
        </Link>
        <Button type="submit" disabled={pending}>
          {pending && <LoaderCircle className="size-4 animate-spin" />}
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </div>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    forgotPasswordAction,
    initialActionState,
  );
  return (
    <form action={action} className="mt-8 space-y-5">
      <AuthField label="Authorized admin email" icon={<Mail />}>
        <input
          className="admin-field auth-field-input"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </AuthField>
      {state.message && (
        <p
          className="bg-leaf/10 text-leaf rounded-xl px-4 py-3 text-sm font-bold"
          role="status"
        >
          {state.message}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <LoaderCircle className="size-4 animate-spin" />}Send reset
        instructions
      </Button>
    </form>
  );
}
export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(
    resetPasswordAction,
    initialActionState,
  );
  return (
    <form action={action} className="mt-8 space-y-5">
      <AuthField label="New password" icon={<LockKeyhole />}>
        <input
          className="admin-field auth-field-input"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
      </AuthField>
      <AuthField label="Confirm password" icon={<LockKeyhole />}>
        <input
          className="admin-field auth-field-input"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          required
        />
      </AuthField>
      {state.message && (
        <p
          className={`rounded-xl px-4 py-3 text-sm font-bold ${state.status === "success" ? "bg-leaf/10 text-leaf" : "bg-danger/10 text-danger"}`}
          role="status"
        >
          {state.message}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <LoaderCircle className="size-4 animate-spin" />}Update
        password
      </Button>
      {state.status === "success" && (
        <Button asChild variant="outline" className="w-full">
          <Link href="/admin">Open dashboard</Link>
        </Button>
      )}
    </form>
  );
}
function AuthField({
  label,
  error,
  icon,
  children,
}: {
  label: string;
  error?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-cocoa mb-2 block text-sm font-extrabold">
        {label}
      </span>
      <span className="relative block">
        <span
          className="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center"
          aria-hidden="true"
        >
          <span className="bg-beige/45 text-ube grid size-7 place-items-center rounded-lg [&_svg]:size-3.5">
            {icon}
          </span>
        </span>
        {children}
      </span>
      {error && (
        <span className="text-danger mt-1 block text-xs font-bold">
          {error}
        </span>
      )}
    </label>
  );
}
