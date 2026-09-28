"use client";
import { useEffect, useState } from "react";
import { Shell, Field, api, post, money, Alert } from "@/app/ui";
export default function Profile({
  id,
  initialProfile,
}: {
  id: string;
  initialProfile?: any;
}) {
  const [p, setP] = useState<any>(initialProfile),
    [reviews, setReviews] = useState<any[]>([]),
    [error, setError] = useState(""),
    [me, setMe] = useState<any>(),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    api("kind=public")
      .then((d) => {
        const p = d.profiles.find((x: any) => x.id === id);
        if (!p) throw Error("Profissional não encontrado.");
        setP(p);
      })
      .catch((e) => setError(e.message));
    api("kind=me")
      .then(setMe)
      .catch(() => {});
    api("kind=reviews&id=" + encodeURIComponent(id))
      .then(setReviews)
      .catch(() => {});
  }, [id]);
  if (error)
    return (
      <Shell>
        <h1>{error}</h1>
        <a href="/">Voltar à busca</a>
      </Shell>
    );
  if (!p)
    return (
      <Shell>
        <p>Carregando perfil…</p>
      </Shell>
    );
  return (
    <Shell>
      <a className="text-button" href="/">
        ← Encontrar profissionais
      </a>
      <div className="panel">
        <div className="row">
          {p.photo ? (
            <img
              className="avatar"
              src={"/api/files/" + p.photo}
              alt={p.name}
            />
          ) : (
            <div className="avatar">{p.name.slice(0, 1)}</div>
          )}
          <div>
            <h1 style={{ fontSize: 30 }}>{p.name}</h1>
            <span className="muted">{p.category} · Santa Maria, RS</span>
          </div>
        </div>
        <p>{p.description}</p>
        <div className="price">
          {p.priceType === "Sob orçamento"
            ? p.priceType
            : `${p.priceType}: ${money(p.price * 100)}`}
        </div>
        <p className="muted">
          Preço de referência. O valor final será combinado no orçamento.
        </p>
        <p>
          <strong>Especialidades:</strong> {p.specialties}
        </p>
        <p>
          <strong>Região atendida:</strong> {p.neighborhood}
        </p>
        <p>
          <strong>Atendimento:</strong> {p.mode} · {p.availability}
        </p>
        {p.registration && (
          <div className="notice">
            Registro informado: {p.registration} · Autodeclarado, ainda não
            verificado.
          </div>
        )}
        {p.phone && (
          <a
            className="button"
            href={
              "https://wa.me/55" +
              p.phone.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "")
            }
            target="_blank"
            rel="noreferrer"
          >
            Contato pelo WhatsApp
          </a>
        )}
        <div className="row" style={{ marginTop: 20 }}>
          {p.portfolio?.map((x: string) => (
            <a key={x} href={"/api/files/" + x} target="_blank">
              <img
                src={"/api/files/" + x}
                width="180"
                alt="Trabalho publicado pelo profissional"
              />
            </a>
          ))}
        </div>
        <button
          className="text-button"
          onClick={async () => {
            await navigator.clipboard.writeText(location.href);
            setNotice("Link copiado.");
          }}
        >
          Copiar link do perfil
        </button>
      </div>
      <h2>Solicitar orçamento</h2>
      {!me ? (
        <div className="panel">
          <p>Entre para enviar sua solicitação.</p>
          <a
            className="button"
            href={
              "/signin-with-chatgpt?return_to=" +
              encodeURIComponent("/profissional/" + id)
            }
            target="_top"
          >
            Entrar com ChatGPT
          </a>
        </div>
      ) : me.user.userId === id ? (
        <p>
          Este é o seu perfil. <a href="/cadastro">Editar perfil</a>
        </p>
      ) : (
        <form
          className="panel"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            setBusy(true);
            try {
              await post({
                action: "request",
                provider: id,
                ...Object.fromEntries(f),
              });
              location.href = "/pedidos";
            } catch (e: any) {
              setNotice(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Field
            label="O que você precisa?"
            name="description"
            multiline
            minLength={20}
            maxLength={2000}
            required
          />
          <Field label="Bairro do atendimento" name="neighborhood" required />
          <Field
            label="Data desejada"
            name="date"
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            required
          />
          <p className="muted">
            Informe apenas o bairro. Combine o endereço completo na conversa
            após a contratação.
          </p>
          <button className="button" disabled={busy}>
            Enviar solicitação
          </button>
        </form>
      )}
      <Alert text={notice} />
      <h2>Avaliações ({reviews.length})</h2>
      {reviews.length ? (
        reviews.map((r, i) => (
          <div className="panel" key={i}>
            <strong>{r.rating} / 5</strong>
            <p>{r.body}</p>
          </div>
        ))
      ) : (
        <p>Este profissional ainda não recebeu avaliações.</p>
      )}
      {me && (
        <details className="panel">
          <summary>Denunciar este perfil</summary>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await post({
                  action: "report",
                  target: id,
                  reason: new FormData(e.currentTarget).get("reason"),
                });
                setNotice("Denúncia registrada para análise.");
              } catch (e: any) {
                setNotice(e.message);
              }
            }}
          >
            <Field
              label="Motivo"
              multiline
              name="reason"
              minLength={10}
              required
            />
            <button className="button">Enviar denúncia</button>
          </form>
        </details>
      )}
    </Shell>
  );
}
