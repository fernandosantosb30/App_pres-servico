"use client";
import { useState } from "react";
import { AccountGate, Shell, post, Alert } from "../ui";
export default function Page() {
  const [notice, setNotice] = useState("");
  return (
    <AccountGate>
      {(me: any) => (
        <Shell>
          <h1>Minha conta</h1>
          <p>{me.user.displayName}</p>
          <div className="cards">
            <a className="card" href="/pedidos">
              <h2>Meus pedidos</h2>
              <p>Acompanhe orçamentos, mensagens e contratações.</p>
            </a>
            <a className="card" href="/cadastro">
              <h2>{me.profile ? "Editar meu perfil" : "Oferecer serviços"}</h2>
              <p>Seu trabalho disponível para Santa Maria.</p>
            </a>
            {me.isAdmin && (
              <a className="card" href="/admin">
                <h2>Administração</h2>
              </a>
            )}
          </div>
          <div className="panel">
            <p className="muted">
              Seu identificador de acesso: {me.user.userId}
            </p>
            <p>
              Para solicitar exclusão, confirme abaixo. O pedido será
              encaminhado à administração e analisado considerando contratações
              em aberto.
            </p>
            <button
              className="text-button"
              onClick={async () => {
                try {
                  await post({ action: "deleteAccount" });
                  setNotice("Solicitação de exclusão registrada.");
                } catch (e: any) {
                  setNotice(e.message);
                }
              }}
            >
              Solicitar exclusão da conta
            </button>
            <Alert text={notice} />
          </div>
          <a
            className="text-button"
            href="/signout-with-chatgpt?return_to=/"
            target="_top"
          >
            Sair da conta
          </a>
        </Shell>
      )}
    </AccountGate>
  );
}
