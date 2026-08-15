import type { ReactNode } from "react";
export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display-title text-cocoa mt-2 text-4xl sm:text-5xl">
          {title}
        </h1>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
          {description}
        </p>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
