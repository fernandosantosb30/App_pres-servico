"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
export function Choice({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  options: string[];
}) {
  return (
    <label className="field">
      {label}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-white h-11">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((x) => (
            <SelectItem key={x} value={x}>
              {x}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
export function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="row muted" style={{ marginBottom: 18 }}>
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onChange(v === true)}
      />
      {label}
    </label>
  );
}
export function Field({ label, ...props }: any) {
  return (
    <label className="field">
      {label}
      {props.multiline ? (
        <textarea {...{ ...props, multiline: undefined }} rows={4} />
      ) : (
        <input {...props} />
      )}
    </label>
  );
}
export async function api(kind: string) {
  const r = await fetch("/api/platform?" + kind);
  const d: any = await r.json();
  if (!r.ok) throw Error(d.error);
  return d;
}
export async function post(body: any) {
  const r = await fetch("/api/platform", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const d: any = await r.json();
  if (!r.ok) throw Error(d.error);
  return d;
}
export const money = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    n / 100,
  );
export function Shell({ children }: any) {
  return (
    <>
      <header className="topbar">
        <a className="brand" href="/">
          conecta<small>SANTA MARIA</small>
        </a>
        <nav>
          <a href="/">Encontrar profissionais</a>
          <a href="/pedidos">Meus pedidos</a>
        </nav>
        <a className="login" href="/conta">
          Minha conta
        </a>
      </header>
      <main>
        <div className="page">{children}</div>
      </main>
      <footer>
        <a href="/">Conecta Santa Maria</a>
        <a href="/termos">Termos de uso</a>
        <a href="/privacidade">Privacidade</a>
        <span>Pré-lançamento · Nenhuma cobrança real</span>
      </footer>
    </>
  );
}
export function AccountGate({ children }: any) {
  const [me, setMe] = useState<any>();
  const [error, setError] = useState("");
  useEffect(() => {
    api("kind=me")
      .then(setMe)
      .catch((e) => setError(e.message));
  }, []);
  if (error)
    return (
      <Shell>
        <h1>Vamos nos conectar?</h1>
        <p>Entre para cadastrar seus serviços e acompanhar contratações.</p>
        <div className="notice">
          Nesta versão de validação, a entrada usa sua conta ChatGPT.
        </div>
        <a
          className="button"
          href={
            "/signin-with-chatgpt?return_to=" +
            encodeURIComponent(
              typeof window !== "undefined"
                ? window.location.pathname
                : "/conta",
            )
          }
          target="_top"
        >
          Entrar com ChatGPT
        </a>
        <p className="muted">{error}</p>
      </Shell>
    );
  if (!me)
    return (
      <Shell>
        <p role="status">Carregando sua conta…</p>
      </Shell>
    );
  return children(me);
}
export function Alert({ text }: any) {
  return text ? (
    <div className="notice" role="status">
      {text}
    </div>
  ) : null;
}
