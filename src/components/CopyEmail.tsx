"use client";

import { useState } from "react";
import { EMAIL } from "@/data/contenido";

/** Botón «Copiar email»: copia al portapapeles y avisa con «Copiado» (aria-live). */
export default function CopyEmail({ email = EMAIL, className = "" }: { email?: string; className?: string }) {
  const [ok, setOk] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setOk(true);
      setTimeout(() => setOk(false), 1800);
    } catch {
      window.location.href = `mailto:${email}`; // sin permiso de portapapeles: abre el correo
    }
  };
  return (
    <button type="button" onClick={copy} className={className}>
      <span aria-live="polite">{ok ? "Copiado ✓" : "Copiar email"}</span>
    </button>
  );
}
