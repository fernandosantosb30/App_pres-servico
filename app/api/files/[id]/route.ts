import { env } from "cloudflare:workers";
import { database } from "@/lib/database";
export async function GET(
  _: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const f: any = await database()
      .prepare("SELECT mime FROM files WHERE id=? AND kind='public'")
      .bind(id)
      .first();
    if (!f || !env.BUCKET)
      return new Response("Não encontrado", { status: 404 });
    const object = await env.BUCKET.get(id);
    if (!object) return new Response("Não encontrado", { status: 404 });
    return new Response(object.body, {
      headers: {
        "Content-Type": f.mime,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new Response("Indisponível", { status: 503 });
  }
}
