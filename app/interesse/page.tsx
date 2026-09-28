"use client";
import { useState } from "react";
import { CATEGORIES } from "@/lib/domain";
import { AccountGate, Shell, Field, Choice, post, Alert } from "../ui";
export default function Page() {
  const [category, setCategory] = useState(CATEGORIES[0]),
    [description, setDescription] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <AccountGate>
      {(me: any) => (
        <Shell>
          <h1>Qual profissional você procura?</h1>
          <p>
            Registre seu interesse para ajudar a priorizar as próximas
            categorias.
          </p>
          <form
            className="panel"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                await post({ action: "interest", category, description });
                setNotice(
                  "Interesse registrado. A equipe poderá entrar em contato quando houver profissionais.",
                );
              } catch (e: any) {
                setNotice(e.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <Choice
              label="Categoria"
              value={category}
              onChange={setCategory}
              options={CATEGORIES}
            />
            <Field
              label="Descreva o que precisa"
              multiline
              required
              minLength={3}
              value={description}
              onChange={(e: any) => setDescription(e.target.value)}
            />
            <p className="muted">
              Contato: {me.user.email}. Os avisos dependem de acompanhamento da
              equipe; não há envio automático nesta versão.
            </p>
            <button className="button" disabled={busy}>
              Registrar interesse
            </button>
            <Alert text={notice} />
          </form>
        </Shell>
      )}
    </AccountGate>
  );
}
