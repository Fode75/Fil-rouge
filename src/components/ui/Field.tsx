import type { InputHTMLAttributes } from "react";

export function Field({
  label,
  id,
  ...p
}: { label: string; id: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} name={id} {...p} />
    </div>
  );
}

