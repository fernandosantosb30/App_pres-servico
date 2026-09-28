import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { database } from "@/lib/database";
export async function POST(req: Request) {
  try {
    if (req.headers.get("origin") !== new URL(req.url).origin)
      return Response.json({ error: "Origem inválida." }, { status: 403 });
    const user = await getChatGPTUser();
    if (!user)
      return Response.json({ error: "Entre na conta." }, { status: 401 });
    const form = await req.formData(),
      file = form.get("file");
    if (
      !(file instanceof File) ||
      file.size > 5 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    )
      return Response.json(
        { error: "Use uma imagem JPG, PNG ou WebP de até 5 MB." },
        { status: 400 },
      );
    if (!env.BUCKET) throw Error("Uploads indisponíveis.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const valid =
      file.type === "image/jpeg"
        ? bytes[0] === 255 && bytes[1] === 216
        : file.type === "image/png"
          ? bytes[0] === 137 &&
            bytes[1] === 80 &&
            bytes[2] === 78 &&
            bytes[3] === 71
          : new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
    if (!valid) throw Error("Formato de imagem inválido.");
    const id = crypto.randomUUID();
    await env.BUCKET.put(id, bytes, {
      httpMetadata: { contentType: file.type },
    });
    try {
      await database()
        .prepare("INSERT INTO files (id,owner,kind,mime) VALUES (?,?,?,?)")
        .bind(id, user.userId, "public", file.type)
        .run();
    } catch (e) {
      await env.BUCKET.delete(id);
      throw e;
    }
    return Response.json({ id });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Falha no envio." },
      { status: 400 },
    );
  }
}
