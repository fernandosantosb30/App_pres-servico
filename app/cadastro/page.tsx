"use client";
import { useState } from "react";
import { CATEGORIES } from "@/lib/domain";
import {
  AccountGate,
  Shell,
  Field,
  Choice,
  Check,
  post,
  Alert,
  money,
} from "../ui";
function Form({ me }: any) {
  const previous = me.profile ? JSON.parse(me.profile.data) : {};
  const [f, setF] = useState<any>({
    name: me.profile?.name || me.user.fullName || "",
    category: me.profile?.category || CATEGORIES[0],
    description: "",
    specialties: "",
    neighborhood: "",
    phone: "",
    price: 0,
    priceType: "Sob orçamento",
    mode: "Presencial",
    availability: "",
    registration: "",
    photo: "",
    portfolio: [],
    publicPhone: false,
    ...previous,
  });
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: any) => setF((s: any) => ({ ...s, [k]: v }));
  async function upload(file: File | undefined, portfolio = false) {
    if (!file) return;
    setBusy(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: data });
      const j: any = await r.json();
      if (!r.ok) throw Error(j.error);
      set(
        portfolio ? "portfolio" : "photo",
        portfolio ? [...f.portfolio, j.id] : j.id,
      );
      setNotice("Imagem enviada. Salve o perfil para publicar.");
    } catch (e: any) {
      setNotice(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Shell>
      <div className="eyebrow">PARA QUEM FAZ ACONTECER</div>
      <h1>Seu trabalho merece ser encontrado.</h1>
      <p>Cadastre seu perfil gratuitamente e comece em Santa Maria.</p>
      <div className="notice">
        Sem mensalidade. Comissão de {(me.commission / 100).toFixed(2)}% em
        pagamentos simulados nesta versão. Em um serviço de R$ 100,00, o líquido
        seria {money(10000 - Math.round((10000 * me.commission) / 10000))}.
        Custos reais de pagamento ainda não definidos.
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await post({
              action: "profile",
              ...f,
              source:
                new URLSearchParams(location.search).get("utm_source") || "",
            });
            setNotice("Perfil salvo! Ele já pode ser encontrado na busca.");
          } catch (e: any) {
            setNotice(e.message);
          } finally {
            setBusy(false);
          }
        }}
        className="panel"
      >
        <h2>Seu perfil profissional</h2>
        <Field
          label="Nome ou nome comercial"
          required
          minLength={2}
          maxLength={100}
          value={f.name}
          onChange={(e: any) => set("name", e.target.value)}
        />
        <Choice
          label="Categoria"
          options={CATEGORIES}
          value={f.category}
          onChange={(v) => set("category", v)}
        />
        <Field
          label="Especialidades e serviços"
          placeholder="Ex.: reparo de vazamentos, instalação de torneiras"
          required
          value={f.specialties}
          onChange={(e: any) => set("specialties", e.target.value)}
        />
        <Field
          label="Conte sobre seu trabalho"
          multiline
          required
          minLength={20}
          maxLength={2000}
          value={f.description}
          onChange={(e: any) => set("description", e.target.value)}
        />
        <div className="cards">
          <Field label="Cidade / UF" value="Santa Maria / RS" disabled />
          <Field
            label="Bairros atendidos"
            placeholder="Centro, Camobi ou toda a cidade"
            required
            value={f.neighborhood}
            onChange={(e: any) => set("neighborhood", e.target.value)}
          />
        </div>
        <Choice
          label="Tipo de atendimento"
          options={["Presencial", "Remoto", "Ambos"]}
          value={f.mode}
          onChange={(v) => set("mode", v)}
        />
        <Field
          label="Telefone / WhatsApp"
          type="tel"
          minLength={8}
          maxLength={25}
          required
          value={f.phone}
          onChange={(e: any) => set("phone", e.target.value)}
        />
        <Check
          label="Exibir meu telefone publicamente"
          checked={f.publicPhone}
          onChange={(v) => set("publicPhone", v)}
        />
        <Field
          label="Dias, horários e disponibilidade"
          required
          value={f.availability}
          onChange={(e: any) => set("availability", e.target.value)}
        />
        <Choice
          label="Forma de preço"
          options={[
            "Sob orçamento",
            "A partir de",
            "Por hora",
            "Por diária",
            "Preço fixo",
          ]}
          value={f.priceType}
          onChange={(v) => set("priceType", v)}
        />
        {f.priceType !== "Sob orçamento" && (
          <Field
            label="Preço em reais"
            type="number"
            min="0"
            max="1000000"
            step="0.01"
            required
            value={f.price}
            onChange={(e: any) => set("price", e.target.value)}
          />
        )}
        <Field
          label="Registro profissional (quando aplicável)"
          value={f.registration}
          onChange={(e: any) => set("registration", e.target.value)}
        />
        <p className="muted">
          O registro será exibido como autodeclarado, sem selo de verificação.
        </p>
        <Field
          label="Foto pública do perfil · JPG, PNG ou WebP, até 5 MB"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e: any) => upload(e.target.files[0])}
        />
        {f.photo && (
          <img
            src={"/api/files/" + f.photo}
            width="90"
            height="90"
            alt="Foto do perfil"
          />
        )}
        <Field
          label="Fotos públicas de trabalhos · até 6 imagens"
          type="file"
          disabled={f.portfolio.length >= 6}
          accept="image/jpeg,image/png,image/webp"
          onChange={(e: any) => upload(e.target.files[0], true)}
        />
        <div className="row">
          {f.portfolio.map((id: string) => (
            <img
              key={id}
              src={"/api/files/" + id}
              width="90"
              height="90"
              alt="Trabalho realizado"
            />
          ))}
        </div>
        <p className="muted">
          Não envie documentos pessoais nestes campos públicos.
        </p>
        <button disabled={busy} className="button">
          {busy ? "Salvando…" : "Salvar meu perfil"}
        </button>
        <Alert text={notice} />
      </form>
    </Shell>
  );
}
export default function Page() {
  return <AccountGate>{(me: any) => <Form me={me} />}</AccountGate>;
}
