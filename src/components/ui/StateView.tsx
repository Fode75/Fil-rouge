import type { ReactNode } from "react";

interface Props {
  loading?: boolean;
  error?: string;
  empty?: boolean;
  emptyTitle?: string;
  emptyText?: string;
  children: ReactNode;
}

export function StateView({
  loading,
  error,
  empty,
  emptyTitle = "Rien à afficher",
  emptyText = "",
  children,
}: Props) {
  if (loading) return <p role="status" className="state">Chargement…</p>;
  if (error) return <p role="alert" className="state state-error">{error}</p>;
  if (empty)
    return (
      <div className="state paper">
        <h3>{emptyTitle}</h3>
        <p>{emptyText}</p>
      </div>
    );
  return <>{children}</>;
}

