"use client";
import { useEffect, useState } from "react";
import { AccountGate, Shell, api, post, Field, Alert, money } from "../ui";
function Admin({ me }: any) {
  const [data, setData] = useState<any>(),
    [notice, setNotice] = useState("");
  async function load() {
    try {
      setData(await api("kind=admin"));
    } catch (e: any) {
      setNotice(e.message);
    }
  }
  useEffect(() => {
    if (me.isAdmin) load();
  }, [me.isAdmin]);
  async function act(b: any) {
    try {
      await post(b);
      await load();
      setNotice("Alteração salva.");
    } catch (e: any) {
      setNotice(e.message);
    }
  }
  if (!me.isAdmin)
    return (
      <Shell>
        <h1>Acesso restrito</h1>
        <p>
          A administração precisa ser habilitada para seu identificador de conta
          na configuração do servidor.
        </p>
      </Shell>
    );
  const paid = data?.orders.filter((o: any) => o.data.payment) || [],
    active = paid.filter((o: any) => !o.data.payment.refunded);
  return (
    <Shell>
      <h1>Administração</h1>
      <Alert text={notice} />
      {data && (
        <>
          <div className="notice">
            Indicadores exclusivamente de simulação. Não representam receita
            real.
          </div>
          <div className="cards">
            {[
              [
                "Volume de serviços",
                paid.reduce(
                  (n: number, o: any) => n + o.data.proposal.fees.gross,
                  0,
                ),
              ],
              [
                "Comissões simuladas",
                active.reduce(
                  (n: number, o: any) => n + o.data.proposal.fees.commission,
                  0,
                ),
              ],
              ["Custos de pagamento", 0],
              [
                "Reembolsos simulados",
                paid
                  .filter((o: any) => o.data.payment.refunded)
                  .reduce(
                    (n: number, o: any) => n + o.data.proposal.fees.gross,
                    0,
                  ),
              ],
            ].map(([title, value]) => (
              <div className="card" key={String(title)}>
                <p>{title}</p>
                <h2>{money(Number(value))}</h2>
              </div>
            ))}
          </div>
          <form
            className="panel"
            onSubmit={(e) => {
              e.preventDefault();
              act({
                action: "commission",
                bps: Math.round(
                  Number(new FormData(e.currentTarget).get("commission")) * 100,
                ),
              });
            }}
          >
            <Field
              label="Comissão para novas propostas (%)"
              name="commission"
              type="number"
              min="0"
              max="30"
              step="0.01"
              defaultValue={data.commission / 100}
              required
            />
            <p className="muted">
              Orçamentos existentes preservam a comissão registrada.
            </p>
            <button className="button">Salvar comissão</button>
          </form>
          <h2>Profissionais ({data.profiles.length})</h2>
          {data.profiles.map((p: any) => (
            <div className="panel" key={p.id}>
              <h3>{p.name}</h3>
              <p>
                {p.category} · {p.active ? "Publicado" : "Suspenso"}
              </p>
              <a className="text-button" href={"/profissional/" + p.id}>
                Ver perfil
              </a>
              <button
                className="text-button"
                style={{ marginLeft: 20 }}
                onClick={() =>
                  act({ action: "moderate", id: p.id, active: !p.active })
                }
              >
                {p.active ? "Suspender perfil" : "Reativar perfil"}
              </button>
            </div>
          ))}
          <h2>Denúncias e solicitações ({data.reports.length})</h2>
          {data.reports.map((r: any) => (
            <div className="panel" key={r.id}>
              <strong>
                {r.kind === "deleteAccount" ? "Exclusão de conta" : "Denúncia"}{" "}
                · {r.status}
              </strong>
              <p>{JSON.parse(r.data).reason}</p>
              <p className="muted">Contato: {JSON.parse(r.data).email}</p>
              <button
                className="text-button"
                onClick={() => act({ action: "resolve", id: r.id })}
              >
                Marcar em análise
              </button>
            </div>
          ))}
          <h2>Pedidos ({data.orders.length})</h2>
          {data.orders.map((o: any) => (
            <div className="panel" key={o.id}>
              <strong>{o.status}</strong>
              <p>{o.data.description}</p>
              {o.data.dispute && <p>Disputa: {o.data.dispute}</p>}
              <small>Origem: {o.data.source || "Direta"}</small>
            </div>
          ))}
          <h2>Lista de interesse ({data.interests.length})</h2>
          {data.interests.map((r: any) => {
            const d = JSON.parse(r.data);
            return (
              <div className="panel" key={r.id}>
                <strong>{d.category}</strong>
                <p>{d.description}</p>
                <span>{d.email}</span>
              </div>
            );
          })}
        </>
      )}
    </Shell>
  );
}
export default function Page() {
  return <AccountGate>{(me: any) => <Admin me={me} />}</AccountGate>;
}
