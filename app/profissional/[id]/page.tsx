import Profile from "./profile";
import { database } from "@/lib/database";
export const dynamic = "force-dynamic";
async function load(id: string) {
  try {
    const p: any = await database()
      .prepare("SELECT * FROM profiles WHERE id=? AND active=1")
      .bind(id)
      .first();
    if (!p) return null;
    const data = JSON.parse(p.data);
    return {
      ...data,
      phone: data.publicPhone ? data.phone : undefined,
      id: p.id,
      name: p.name,
      category: p.category,
    };
  } catch {
    return null;
  }
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await load((await params).id);
  return {
    title: p
      ? `${p.name} · ${p.category} em Santa Maria | Conecta`
      : "Profissional | Conecta Santa Maria",
    description: p
      ? p.description.slice(0, 160)
      : "Encontre profissionais em Santa Maria.",
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Profile id={id} initialProfile={await load(id)} />;
}
