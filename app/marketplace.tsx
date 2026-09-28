"use client";
import { useState, useEffect } from "react";
import { Choice, api, money } from "./ui";
import { normalize } from "@/lib/domain";
import {
  Search,
  MapPin,
  ArrowUpRight,
  Hammer,
  Wrench,
  Zap,
  Paintbrush,
  Code,
  Calculator,
  Sparkles,
  Flower2,
  ChevronRight,
  ShieldCheck,
  MessageCircle,
  Users,
} from "lucide-react";
const categories = [
  ["Reformas e construção", Hammer, "Pedreiros, reformas e reparos"],
  ["Encanamento", Wrench, "Instalações e vazamentos"],
  ["Elétrica", Zap, "Instalações e manutenção"],
  ["Pintura", Paintbrush, "Interiores e fachadas"],
  ["Tecnologia", Code, "Sites, sistemas e suporte"],
  ["Contabilidade", Calculator, "Pessoa física e empresas"],
  ["Limpeza", Sparkles, "Residencial e comercial"],
  ["Jardinagem", Flower2, "Jardins e áreas externas"],
] as const;
export default function Marketplace() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [profiles, setProfiles] = useState<any[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [neighborhood, setNeighborhood] = useState(""),
    [maxPrice, setMaxPrice] = useState(""),
    [mode, setMode] = useState("Todos"),
    [minRating, setMinRating] = useState("Todas"),
    [availability, setAvailability] = useState("");
  useEffect(() => {
    api("kind=public")
      .then((d) => setProfiles(d.profiles))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    if ("serviceWorker" in navigator)
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    const ctx = (document as any).modelContext;
    const controller = new AbortController();
    if (ctx?.registerTool)
      Promise.resolve(
        ctx.registerTool(
          {
            name: "search_professionals",
            description:
              "Filtra os profissionais por texto e atualiza a busca visível.",
            inputSchema: {
              type: "object",
              properties: { query: { type: "string" } },
              required: ["query"],
              additionalProperties: false,
            },
            annotations: { readOnlyHint: true },
            execute: (input: any) => {
              if (typeof input.query !== "string" || input.query.length > 200)
                throw Error("Consulta inválida");
              setQuery(input.query);
              return { query: input.query };
            },
          },
          { signal: controller.signal },
        ),
      ).catch(() => {});
    return () => controller.abort();
  }, []);
  const aliases: Record<string, string> = {
    vazamento: "encanamento",
    pedreiro: "reformas",
    eletricista: "eletrica",
    diarista: "limpeza",
    "criacao de site": "tecnologia",
  };
  const q = normalize(query),
    term = aliases[q] || q;
  const filtered = profiles.filter(
    (p) =>
      (category === "Todos" || p.category === category) &&
      normalize(
        [p.name, p.category, p.description, p.specialties].join(" "),
      ).includes(term) &&
      normalize(p.neighborhood).includes(normalize(neighborhood)) &&
      (!maxPrice ||
        (p.priceType !== "Sob orçamento" && p.price <= Number(maxPrice))) &&
      (mode === "Todos" || p.mode === mode || p.mode === "Ambos") &&
      (minRating === "Todas" || p.rating >= Number(minRating)) &&
      normalize(p.availability).includes(normalize(availability)),
  );
  return (
    <>
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-icon">
            c<span>•</span>
          </span>
          <span>
            conecta<small>SANTA MARIA</small>
          </span>
        </a>
        <nav>
          <a href="/">Encontrar profissionais</a>
          <a href="/pedidos">Meus pedidos</a>
        </nav>
        <a className="login" href="/conta">
          Entrar
        </a>
        <a className="button small" href="/cadastro">
          Oferecer meus serviços <ArrowUpRight size={17} />
        </a>
      </header>
      <main>
        <div className="location">
          <MapPin size={16} /> Santa Maria, RS <span>•</span> Feito para
          conectar nossa cidade
        </div>
        <section className="search-area">
          <div className="eyebrow">QUEM SABE FAZER ESTÁ MAIS PERTO.</div>
          <h1>Qual serviço você precisa?</h1>
          <p>Encontre o profissional certo, aqui em Santa Maria.</p>
          <form
            className="searchbox"
            onSubmit={(e) => {
              e.preventDefault();
              document
                .getElementById("resultados")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Search />
            <input
              aria-label="Buscar serviço"
              placeholder="Experimente “vazamento” ou “criação de site”"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className="search-city">
              <MapPin size={18} /> Santa Maria, RS
            </span>
            <button className="button">Buscar profissionais</button>
          </form>
          <div className="popular">
            Buscas frequentes:{" "}
            {["Pedreiro", "Eletricista", "Diarista", "Criação de site"].map(
              (x) => (
                <button key={x} onClick={() => setQuery(x)}>
                  {x}
                </button>
              ),
            )}
          </div>
        </section>
        <section className="categories">
          <div className="section-head">
            <h2>Encontre por categoria</h2>
            <button
              className="text-button"
              onClick={() => {
                setCategory("Todos");
                setQuery("");
              }}
            >
              Ver todas <ChevronRight size={16} />
            </button>
          </div>
          <div className="category-grid">
            {categories.map(([name, Icon, desc]) => (
              <button
                className={"category " + (category === name ? "selected" : "")}
                key={name}
                onClick={() => setCategory(category === name ? "Todos" : name)}
              >
                <span className="category-icon">
                  <Icon size={25} />
                </span>
                <strong>{name}</strong>
                <small>{desc}</small>
              </button>
            ))}
          </div>
        </section>
        <section id="resultados">
          <div className="section-head">
            <div>
              <div className="eyebrow">TALENTOS DA NOSSA CIDADE</div>
              <h2>Profissionais perto de você</h2>
            </div>
            <span className="tag">Santa Maria · RS</span>
          </div>
          <div className="results-layout">
            <aside className="filters">
              <h3>Filtrar profissionais</h3>
              <label>
                Bairro
                <input
                  placeholder="Ex.: Centro, Camobi"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                />
              </label>
              <label>
                Preço máximo (R$)
                <input
                  type="number"
                  min="0"
                  placeholder="Sem limite"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </label>
              <Choice
                label="Atendimento"
                options={["Todos", "Presencial", "Remoto"]}
                value={mode}
                onChange={setMode}
              />
              <Choice
                label="Avaliação mínima"
                options={["Todas", "3", "4", "5"]}
                value={minRating}
                onChange={setMinRating}
              />
              <label>
                Disponibilidade
                <input
                  placeholder="Ex.: segunda, manhã"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                />
              </label>
              <p>Categoria selecionada</p>
              <strong>{category}</strong>
              <button
                className="text-button"
                onClick={() => {
                  setQuery("");
                  setCategory("Todos");
                  setNeighborhood("");
                  setMaxPrice("");
                  setMode("Todos");
                  setMinRating("Todas");
                  setAvailability("");
                }}
              >
                Limpar filtros
              </button>
            </aside>
            {loading ? (
              <div className="empty-state" role="status">
                Carregando profissionais…
              </div>
            ) : error ? (
              <div className="empty-state">
                <h3>Não foi possível carregar os profissionais</h3>
                <p>{error}</p>
                <button className="button" onClick={() => location.reload()}>
                  Tentar novamente
                </button>
              </div>
            ) : filtered.length ? (
              <div className="cards">
                {filtered.map((p) => (
                  <a className="card" key={p.id} href={"/profissional/" + p.id}>
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
                        <h3>{p.name}</h3>
                        <span className="muted">{p.category}</span>
                      </div>
                    </div>
                    <p>{p.specialties}</p>
                    <span className="muted">Santa Maria, RS · {p.mode}</span>
                    <p>
                      {p.reviewCount
                        ? `${Number(p.rating).toFixed(1)} / 5 · ${p.reviewCount} avaliações`
                        : "Ainda sem avaliações"}
                    </p>
                    <div className="price">
                      {p.priceType === "Sob orçamento"
                        ? "Sob orçamento"
                        : `${p.priceType}: ${money(p.price * 100)}`}
                    </div>
                    <span className="text-button">
                      Ver perfil e solicitar orçamento{" "}
                      <ChevronRight size={16} />
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">
                  <Users size={32} />
                </span>
                <h3>As primeiras conexões começam aqui</h3>
                <p>
                  Estamos reunindo os primeiros profissionais de Santa Maria.{" "}
                  {query
                    ? `Ainda não há resultados para “${query}”.`
                    : "Cadastre seus serviços e faça parte desde o início."}
                </p>
                <a className="button" href="/cadastro">
                  Quero oferecer meus serviços <ArrowUpRight size={17} />
                </a>
                <a className="text-button" href="/interesse">
                  Avise-me quando houver profissionais
                </a>
              </div>
            )}
          </div>
        </section>
        <section className="provider-banner">
          <div>
            <span className="eyebrow">SEU TALENTO, MAIS CONEXÕES</span>
            <h2>
              Você faz um bom trabalho.
              <br />
              Vamos ajudar a encontrar seus clientes.
            </h2>
            <p>
              Perfil gratuito. Você só paga comissão em serviços pagos pela
              plataforma.
            </p>
            <a className="button light" href="/cadastro">
              Cadastrar meus serviços <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="banner-details">
            <div>
              <Users />
              <span>
                <strong>Comece sem mensalidade</strong>
                <small>Seu perfil e seus serviços em um só lugar.</small>
              </span>
            </div>
            <div>
              <MessageCircle />
              <span>
                <strong>Converse e envie orçamentos</strong>
                <small>Combine o escopo antes de começar.</small>
              </span>
            </div>
            <div>
              <ShieldCheck />
              <span>
                <strong>Saiba quanto vai receber</strong>
                <small>Taxas apresentadas antes de cada contratação.</small>
              </span>
            </div>
          </div>
        </section>
      </main>
      <footer>
        <a className="brand" href="/">
          conecta <small>SANTA MARIA</small>
        </a>
        <span>Conexões locais. Trabalho de verdade.</span>
        <a href="/termos">Termos de uso</a>
        <a href="/privacidade">Privacidade</a>
        <small>Pré-lançamento · Pagamentos em simulação</small>
      </footer>
    </>
  );
}
