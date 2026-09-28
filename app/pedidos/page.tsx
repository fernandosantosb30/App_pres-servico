"use client";
import { useEffect, useState } from "react";
import {
  AccountGate,
  Shell,
  Field,
  Choice,
  api,
  post,
  money,
  Alert,
} from "../ui";
function Orders({ me }: any) {
  const [orders, setOrders] = useState<any[]>([]),
    [notice, setNotice] = useState(""),
    [loaded, setLoaded] = useState(false);
  async function load() {
    try {
      setOrders(await api("kind=orders"));
      setLoaded(true);
    } catch (e: any) {
      setNotice(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);
  return (
    <Shell>
      <div className="eyebrow">DO PRIMEIRO CONTATO À CONCLUSÃO</div>
      <h1>Meus pedidos</h1>
      <p>Orçamentos, conversas e próximos passos em um só lugar.</p>
      <div className="notice">
        Ambiente de validação: todos os pagamentos são simulados. Não ocorre
        cobrança, transferência ou reembolso de dinheiro real.
      </div>
      <button className="text-button" onClick={load}>
        Atualizar pedidos
      </button>
      <Alert text={notice} />
      {!loaded ? (
        <p>Carregando…</p>
      ) : orders.length ? (
        orders.map((o) => <Order key={o.id} order={o} me={me} reload={load} />)
      ) : (
        <div className="empty-state">
          <h2>Seu próximo serviço começa aqui</h2>
          <p>Os pedidos enviados e recebidos aparecerão nesta página.</p>
          <a className="button" href="/">
            Encontrar profissionais
          </a>
        </div>
      )}
    </Shell>
  );
}
function Order({ order: o, me, reload }: any) {
  const customer = o.customer === me.user.userId;
  const [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [messages, setMessages] = useState<any[]>([]),
    [showChat, setShowChat] = useState(false),
    [amount, setAmount] = useState(""),
    [method, setMethod] = useState("Pix"),
    [rating, setRating] = useState("5");
  const d = o.data,
    proposal = d.proposal;
  async function act(action: string, values: any = {}) {
    setBusy(true);
    try {
      await post({ id: o.id, action, ...values });
      setNotice("Atualização salva.");
      await reload();
      return true;
    } catch (e: any) {
      setNotice(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function chat() {
    try {
      setMessages(await api("kind=messages&id=" + o.id));
    } catch (e: any) {
      setNotice(e.message);
    }
  }
  useEffect(() => {
    if (showChat) chat();
  }, [showChat]);
  return (
    <article className="panel">
      <div className="section-head">
        <h2>{customer ? o.provider_name || "Prestador" : d.customerName}</h2>
        <span className="tag">{o.status}</span>
      </div>
      <p>{d.description}</p>
      <p className="muted">
        {d.neighborhood} · Data desejada:{" "}
        {d.date.split("-").reverse().join("/")}
      </p>
      {proposal && (
        <div className="notice">
          <h3>Orçamento · revisão {proposal.revision}</h3>
          <p>{proposal.scope}</p>
          <p>
            Prazo: {proposal.deadline}
            <br />
            Condições: {proposal.terms}
          </p>
          <strong>Total: {money(proposal.fees.gross)}</strong>
          {!customer && (
            <p>
              Comissão: {money(proposal.fees.commission)} (
              {proposal.fees.bps / 100}%)
              <br />
              Custo de pagamento na simulação: {money(proposal.fees.processing)}
              <br />
              <strong>Você recebe: {money(proposal.fees.net)}</strong>
            </p>
          )}
        </div>
      )}
      {!customer && ["solicitado", "em negociação"].includes(o.status) && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await act(
              "propose",
              Object.fromEntries(new FormData(e.currentTarget)),
            );
          }}
        >
          <h3>Enviar orçamento</h3>
          <Field
            label="Escopo do serviço"
            name="scope"
            multiline
            required
            minLength={10}
            maxLength={2000}
            defaultValue={proposal?.scope || d.description}
          />
          <Field
            label="Valor total (R$)"
            name="amount"
            type="number"
            min="1"
            max="1000000"
            step="0.01"
            required
            value={amount}
            onChange={(e: any) => setAmount(e.target.value)}
          />
          <p className="muted">
            Comissão estimada:{" "}
            {money(Math.round((Number(amount) * 100 * me.commission) / 10000))}.
            Líquido:{" "}
            {money(
              Math.round(Number(amount) * 100) -
                Math.round((Number(amount) * 100 * me.commission) / 10000),
            )}
            . Sem custo de pagamento na simulação.
          </p>
          <Field
            label="Prazo de execução"
            name="deadline"
            required
            minLength={2}
            defaultValue={proposal?.deadline || ""}
          />
          <Field
            label="Condições e o que está incluído"
            name="terms"
            multiline
            required
            minLength={5}
            defaultValue={proposal?.terms || ""}
          />
          <button className="button" disabled={busy}>
            Enviar proposta
          </button>
        </form>
      )}
      {customer && o.status === "em negociação" && proposal && (
        <button
          className="button"
          disabled={busy}
          onClick={() => act("accept", { revision: proposal.revision })}
        >
          Aceitar orçamento de {money(proposal.fees.gross)}
        </button>
      )}
      {customer && o.status === "aguardando pagamento" && (
        <div>
          <Choice
            label="Meio de pagamento simulado"
            options={["Pix", "Cartão"]}
            value={method}
            onChange={setMethod}
          />
          <button
            className="button"
            disabled={busy}
            onClick={() => act("pay", { method })}
          >
            Simular pagamento · nenhuma cobrança
          </button>
        </div>
      )}
      {!customer && o.status === "confirmado" && (
        <button className="button" disabled={busy} onClick={() => act("start")}>
          Informar início do serviço
        </button>
      )}
      {!customer && o.status === "em andamento" && !d.finished && (
        <button
          className="button"
          disabled={busy}
          onClick={() => act("finish")}
        >
          Informar serviço finalizado
        </button>
      )}
      {o.status === "em andamento" &&
        d.finished &&
        (customer ? (
          <button
            className="button"
            disabled={busy}
            onClick={() => act("complete")}
          >
            Confirmar conclusão do serviço
          </button>
        ) : (
          <p>Aguardando o cliente confirmar a conclusão.</p>
        ))}
      {d.payment && (
        <p className="muted">
          Pagamento simulado por {d.payment.method}
          {d.payment.refunded ? " · Reembolso simulado registrado" : ""}.
        </p>
      )}
      {customer && o.status === "concluído" && (
        <details>
          <summary>Avaliar serviço concluído</summary>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await act("review", {
                rating: Number(rating),
                body: new FormData(e.currentTarget).get("body"),
              });
            }}
          >
            <Choice
              label="Nota"
              options={["5", "4", "3", "2", "1"]}
              value={rating}
              onChange={setRating}
            />
            <Field
              name="body"
              label="Como foi o atendimento?"
              multiline
              required
              minLength={3}
            />
            <button className="button" disabled={busy}>
              Publicar avaliação
            </button>
          </form>
        </details>
      )}
      <div className="row" style={{ marginTop: 20 }}>
        <button className="text-button" onClick={() => setShowChat(!showChat)}>
          {showChat ? "Fechar conversa" : "Abrir conversa"}
        </button>
        {[
          "solicitado",
          "em negociação",
          "aguardando pagamento",
          "confirmado",
        ].includes(o.status) && (
          <button
            className="text-button"
            disabled={busy}
            onClick={() => act("cancel")}
          >
            Cancelar pedido{d.payment ? " e simular reembolso" : ""}
          </button>
        )}
      </div>
      {showChat && (
        <section>
          <h3>Conversa do pedido</h3>
          <button className="text-button" onClick={chat}>
            Atualizar mensagens
          </button>
          {messages.length ? (
            messages.map((m) => (
              <div className="message" key={m.id}>
                <small>
                  {m.author === me.user.userId ? "Você" : "Participante"} ·{" "}
                  {new Date(m.created).toLocaleString("pt-BR")}
                </small>
                <p>{m.body}</p>
              </div>
            ))
          ) : (
            <p className="muted">
              Envie a primeira mensagem. Para acompanhar respostas, use
              “Atualizar mensagens”.
            </p>
          )}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const ok = await act("message", {
                body: new FormData(form).get("body"),
              });
              if (ok) {
                form.reset();
                await chat();
              }
            }}
          >
            <Field
              label="Mensagem"
              name="body"
              multiline
              required
              maxLength={2000}
            />
            <button className="button" disabled={busy}>
              Enviar mensagem
            </button>
          </form>
        </section>
      )}
      {["confirmado", "em andamento", "concluído"].includes(o.status) && (
        <details style={{ marginTop: 18 }}>
          <summary>Preciso de ajuda com o serviço</summary>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await act("dispute", {
                reason: new FormData(e.currentTarget).get("reason"),
              });
            }}
          >
            <Field
              label="Explique o problema"
              name="reason"
              multiline
              minLength={10}
              required
            />
            <button className="button" disabled={busy}>
              Abrir disputa
            </button>
          </form>
        </details>
      )}
      {d.dispute && (
        <div className="notice">Disputa registrada: {d.dispute}</div>
      )}
      <details style={{ marginTop: 18 }}>
        <summary>Denunciar mensagem ou conduta</summary>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await post({
                action: "report",
                target: o.id,
                reason: new FormData(e.currentTarget).get("reason"),
              });
              setNotice("Denúncia registrada.");
            } catch (e: any) {
              setNotice(e.message);
            }
          }}
        >
          <Field
            label="Descreva a conduta e a mensagem"
            name="reason"
            multiline
            required
            minLength={10}
          />
          <button className="button">Enviar denúncia</button>
        </form>
      </details>
      <Alert text={notice} />
    </article>
  );
}
export default function Page() {
  return <AccountGate>{(me: any) => <Orders me={me} />}</AccountGate>;
}
