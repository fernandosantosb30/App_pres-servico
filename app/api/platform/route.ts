import { NextResponse } from "next/server";
import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { database } from "@/lib/database";
import { calculateFees, transition, CATEGORIES } from "@/lib/domain";
export const dynamic = "force-dynamic";
const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
const fail = (m: string) => {
  throw new Error(m);
};
function txt(v: unknown, min = 1, max = 2000) {
  if (typeof v !== "string" || v.trim().length < min || v.length > max)
    fail("Revise os campos obrigatórios.");
  return (v as string).trim();
}
function admin(id: string) {
  return ((env as unknown as { ADMIN_USER_IDS?: string }).ADMIN_USER_IDS || "")
    .split(",")
    .includes(id);
}
async function rate() {
  const row = await database()
    .prepare("SELECT value FROM settings WHERE key = ?")
    .bind("commission")
    .first<{ value: string }>();
  return row ? Number(row.value) : 800;
}
export async function GET(req: Request) {
  try {
    const db = database(),
      u = await getChatGPTUser(),
      url = new URL(req.url),
      kind = url.searchParams.get("kind");
    if (kind === "public") {
      const rows = await db
        .prepare(
          "SELECT p.*, (SELECT AVG(rating) FROM reviews r WHERE r.provider=p.id) rating, (SELECT COUNT(*) FROM reviews r WHERE r.provider=p.id) review_count FROM profiles p WHERE active=1",
        )
        .all();
      return json({
        profiles: rows.results.map((r: any) => ({
          ...JSON.parse(r.data),
          phone: JSON.parse(r.data).publicPhone
            ? JSON.parse(r.data).phone
            : undefined,
          id: r.id,
          name: r.name,
          category: r.category,
          rating: r.rating,
          reviewCount: r.review_count,
        })),
        commission: await rate(),
      });
    }
    if (kind === "reviews") {
      return json(
        (
          await db
            .prepare("SELECT rating,body FROM reviews WHERE provider=?")
            .bind(url.searchParams.get("id"))
            .all()
        ).results,
      );
    }
    if (!u) return json({ error: "Entre na sua conta para continuar." }, 401);
    if (kind === "me")
      return json({
        user: u,
        isAdmin: admin(u.userId),
        profile: await db
          .prepare("SELECT * FROM profiles WHERE id=?")
          .bind(u.userId)
          .first(),
        commission: await rate(),
      });
    if (kind === "orders") {
      const rows = await db
        .prepare(
          "SELECT o.*,p.name provider_name FROM orders o LEFT JOIN profiles p ON p.id=o.provider WHERE customer=? OR provider=? ORDER BY created DESC",
        )
        .bind(u.userId, u.userId)
        .all();
      return json(
        rows.results.map((r: any) => ({ ...r, data: JSON.parse(r.data) })),
      );
    }
    if (kind === "messages") {
      const id = url.searchParams.get("id");
      const o = await db
        .prepare(
          "SELECT id FROM orders WHERE id=? AND (customer=? OR provider=?)",
        )
        .bind(id, u.userId, u.userId)
        .first();
      if (!o) return json({ error: "Pedido não encontrado." }, 404);
      return json(
        (
          await db
            .prepare("SELECT * FROM messages WHERE order_id=? ORDER BY created")
            .bind(id)
            .all()
        ).results,
      );
    }
    if (kind === "admin") {
      if (!admin(u.userId))
        return json({ error: "Acesso restrito à administração." }, 403);
      return json({
        profiles: (await db.prepare("SELECT * FROM profiles").all()).results,
        orders: (
          await db.prepare("SELECT * FROM orders ORDER BY created DESC").all()
        ).results.map((r: any) => ({ ...r, data: JSON.parse(r.data) })),
        reports: (await db.prepare("SELECT * FROM reports").all()).results,
        interests: (await db.prepare("SELECT * FROM interests").all()).results,
        commission: await rate(),
      });
    }
    return json({ error: "Recurso não encontrado." }, 404);
  } catch (e) {
    console.error(e);
    return json(
      { error: "Não foi possível carregar os dados. Tente novamente." },
      503,
    );
  }
}
export async function POST(req: Request) {
  try {
    const origin = req.headers.get("origin");
    if (!origin || origin !== new URL(req.url).origin)
      return json({ error: "Origem inválida." }, 403);
    const u = await getChatGPTUser();
    if (!u) return json({ error: "Entre na sua conta para continuar." }, 401);
    const db = database();
    const b: any = await req.json();
    const action = b.action;
    if (action === "profile") {
      const name = txt(b.name, 2, 100),
        category = txt(b.category);
      if (!CATEGORIES.includes(category)) fail("Categoria inválida.");
      const amount = Number(b.price);
      if (!Number.isFinite(amount) || amount < 0 || amount > 1000000)
        fail("Preço inválido.");
      if (
        !["Presencial", "Remoto", "Ambos"].includes(b.mode) ||
        ![
          "Sob orçamento",
          "A partir de",
          "Por hora",
          "Por diária",
          "Preço fixo",
        ].includes(b.priceType)
      )
        fail("Escolha as condições do serviço.");
      const data = {
        description: txt(b.description, 20, 2000),
        specialties: txt(b.specialties, 2, 300),
        neighborhood: txt(b.neighborhood, 2, 300),
        city: "Santa Maria",
        state: "RS",
        mode: b.mode,
        price: amount,
        priceType: b.priceType,
        phone: txt(b.phone, 8, 25),
        publicPhone: b.publicPhone === true,
        availability: txt(b.availability, 2, 200),
        registration:
          typeof b.registration === "string"
            ? b.registration.slice(0, 100)
            : "",
        photo: typeof b.photo === "string" ? b.photo : "",
        portfolio: Array.isArray(b.portfolio) ? b.portfolio.slice(0, 6) : [],
        source: typeof b.source === "string" ? b.source.slice(0, 200) : "",
      };
      if (
        data.photo &&
        !(await db
          .prepare(
            "SELECT id FROM files WHERE id=? AND owner=? AND kind='public'",
          )
          .bind(data.photo, u.userId)
          .first())
      )
        fail("Foto inválida.");
      for (const id of data.portfolio)
        if (
          !(await db
            .prepare(
              "SELECT id FROM files WHERE id=? AND owner=? AND kind='public'",
            )
            .bind(id, u.userId)
            .first())
        )
          fail("Foto inválida.");
      await db
        .prepare(
          "INSERT INTO profiles (id,name,category,data,active) VALUES (?,?,?,?,1) ON CONFLICT(id) DO UPDATE SET name=excluded.name,category=excluded.category,data=excluded.data",
        )
        .bind(u.userId, name, category, JSON.stringify(data))
        .run();
      return json({ ok: true });
    }
    if (action === "interest") {
      const data = {
        category: txt(b.category),
        email: u.email,
        description: txt(b.description, 3, 1000),
      };
      await db
        .prepare("INSERT INTO interests (id,user_id,data) VALUES (?,?,?)")
        .bind(crypto.randomUUID(), u.userId, JSON.stringify(data))
        .run();
      return json({ ok: true });
    }
    if (action === "report" || action === "deleteAccount") {
      await db
        .prepare(
          "INSERT INTO reports (id,author,kind,data,status) VALUES (?,?,?,?,?)",
        )
        .bind(
          crypto.randomUUID(),
          u.userId,
          action,
          JSON.stringify({
            target: typeof b.target === "string" ? b.target : "",
            reason:
              action === "deleteAccount"
                ? "Solicitação de exclusão de conta"
                : txt(b.reason, 10, 2000),
            email: u.email,
          }),
          "aberto",
        )
        .run();
      return json({ ok: true });
    }
    if (
      action === "commission" ||
      action === "moderate" ||
      action === "resolve"
    ) {
      if (!admin(u.userId)) return json({ error: "Acesso restrito." }, 403);
      if (action === "commission") {
        const value = Number(b.bps);
        if (!Number.isInteger(value) || value < 0 || value > 3000)
          fail("A comissão deve estar entre 0% e 30%.");
        await db
          .prepare(
            "INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
          )
          .bind("commission", String(value))
          .run();
      }
      if (action === "moderate")
        await db
          .prepare("UPDATE profiles SET active=? WHERE id=?")
          .bind(b.active === true ? 1 : 0, txt(b.id))
          .run();
      if (action === "resolve")
        await db
          .prepare("UPDATE reports SET status='em análise' WHERE id=?")
          .bind(txt(b.id))
          .run();
      return json({ ok: true });
    }
    if (action === "request") {
      const provider = txt(b.provider);
      if (provider === u.userId)
        fail("Você não pode contratar seu próprio perfil.");
      if (
        !(await db
          .prepare("SELECT id FROM profiles WHERE id=? AND active=1")
          .bind(provider)
          .first())
      )
        fail("Profissional indisponível.");
      const date = txt(b.date, 10, 10);
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        date < new Date().toISOString().slice(0, 10)
      )
        fail("Escolha uma data futura.");
      const id = crypto.randomUUID();
      await db
        .prepare(
          "INSERT INTO orders (id,customer,provider,status,data,version,created) VALUES (?,?,?,?,?,0,?)",
        )
        .bind(
          id,
          u.userId,
          provider,
          "solicitado",
          JSON.stringify({
            description: txt(b.description, 20, 2000),
            neighborhood: txt(b.neighborhood, 2, 100),
            date,
            customerName: u.displayName,
            source: typeof b.source === "string" ? b.source.slice(0, 200) : "",
            simulation: true,
          }),
          new Date().toISOString(),
        )
        .run();
      return json({ ok: true, id });
    }
    const order: any = await db
      .prepare("SELECT * FROM orders WHERE id=? AND (customer=? OR provider=?)")
      .bind(txt(b.id), u.userId, u.userId)
      .first();
    if (!order) return json({ error: "Pedido não encontrado." }, 404);
    const role = order.customer === u.userId ? "customer" : "provider",
      data = JSON.parse(order.data);
    if (action === "message") {
      await db
        .prepare(
          "INSERT INTO messages (id,order_id,author,body,created) VALUES (?,?,?,?,?)",
        )
        .bind(
          crypto.randomUUID(),
          order.id,
          u.userId,
          txt(b.body, 1, 2000),
          new Date().toISOString(),
        )
        .run();
      return json({ ok: true });
    }
    if (action === "review") {
      if (role !== "customer" || order.status !== "concluído")
        fail("Avaliações exigem um serviço concluído.");
      const rating = Number(b.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5)
        fail("Avaliação inválida.");
      const existing = await db
        .prepare("SELECT order_id FROM reviews WHERE order_id=?")
        .bind(order.id)
        .first();
      if (existing) fail("Este serviço já foi avaliado.");
      await db
        .prepare(
          "INSERT INTO reviews (order_id,provider,author,rating,body) VALUES (?,?,?,?,?)",
        )
        .bind(order.id, order.provider, u.userId, rating, txt(b.body, 3, 1000))
        .run();
      return json({ ok: true });
    }
    const status = transition(order.status, action, role);
    if (action === "propose") {
      data.proposal = {
        scope: txt(b.scope, 10, 2000),
        deadline: txt(b.deadline, 2, 300),
        terms: txt(b.terms, 5, 1000),
        fees: calculateFees(Math.round(Number(b.amount) * 100), await rate()),
        revision: (data.proposal?.revision || 0) + 1,
      };
    }
    if (action === "accept") {
      if (!data.proposal) fail("Não há proposta para aceitar.");
      if (b.revision !== data.proposal.revision)
        fail("O orçamento mudou. Atualize antes de aceitar.");
      data.accepted = data.proposal.revision;
    }
    if (action === "pay") {
      if (data.accepted !== data.proposal?.revision)
        fail("É necessário aceitar a proposta atual.");
      data.payment = {
        mode: "simulation",
        method: b.method === "Pix" ? "Pix" : "Cartão",
        paidAt: new Date().toISOString(),
        ref: crypto.randomUUID(),
      };
    }
    if (action === "finish") data.finished = true;
    if (action === "complete" && !data.finished)
      fail("Aguarde o profissional informar a conclusão.");
    if (action === "cancel" && data.payment) data.payment.refunded = true;
    if (action === "dispute") data.dispute = txt(b.reason, 10, 2000);
    const result = await db
      .prepare(
        "UPDATE orders SET status=?,data=?,version=version+1 WHERE id=? AND version=?",
      )
      .bind(status, JSON.stringify(data), order.id, order.version)
      .run();
    if (!result.meta.changes)
      return json(
        { error: "O pedido foi atualizado. Recarregue e tente novamente." },
        409,
      );
    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json(
      { error: e instanceof Error ? e.message : "Não foi possível salvar." },
      400,
    );
  }
}
