import assert from "node:assert/strict";
const base = "http://127.0.0.1:8787",
  prefix = "integration_" + Date.now(),
  provider = prefix + "_provider",
  customer = prefix + "_customer",
  outsider = prefix + "_outsider";
async function request(user, body, kind = "me", expected = 200) {
  const r = await fetch(base + "/api/platform?kind=" + kind, {
    method: body ? "POST" : "GET",
    headers: {
      ...(user
        ? {
            "oai-authenticated-user-id": user,
            "oai-authenticated-user-email": user + "@example.test",
          }
        : {}),
      Origin: base,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await r.json();
  assert.equal(r.status, expected, JSON.stringify(data));
  return data;
}
await request(
  null,
  { action: "interest", category: "Tecnologia", description: "teste" },
  "me",
  401,
);
await request(outsider, null, "admin", 403);
await request(provider, {
  action: "profile",
  name: "Perfil de teste automatizado",
  category: "Tecnologia",
  description: "Perfil exclusivo de testes locais, não publicar.",
  specialties: "Criação de site",
  neighborhood: "Centro",
  phone: "55999999999",
  price: 100,
  priceType: "A partir de",
  mode: "Remoto",
  availability: "Segunda-feira",
  publicPhone: false,
});
let pub = await request(null, null, "public");
assert.equal(pub.profiles.find((p) => p.id === provider).phone, undefined);
const { id } = await request(customer, {
  action: "request",
  provider,
  description: "Pedido de teste automatizado de criação de site.",
  neighborhood: "Centro",
  date: "2099-01-01",
});
await request(outsider, null, "messages&id=" + id, 404);
await request(outsider, { action: "message", id, body: "invasão" }, "me", 404);
await request(customer, { action: "pay", id }, "me", 400);
await request(
  customer,
  {
    action: "propose",
    id,
    amount: 100,
    scope: "Escopo de teste",
    deadline: "2 dias",
    terms: "Termos de teste",
  },
  "me",
  400,
);
await request(provider, {
  action: "propose",
  id,
  amount: 123.45,
  scope: "Escopo de teste",
  deadline: "2 dias",
  terms: "Termos de teste",
});
let order = (await request(customer, null, "orders")).find((o) => o.id === id);
assert.equal(order.data.proposal.fees.commission, 988);
assert.equal(order.data.proposal.fees.net, 11357);
await request(customer, { action: "accept", id, revision: 0 }, "me", 400);
await request(customer, { action: "accept", id, revision: 1 });
await request(customer, { action: "pay", id, method: "Pix" });
await request(customer, { action: "pay", id, method: "Pix" }, "me", 400);
await request(customer, { action: "message", id, body: "Mensagem de teste" });
assert.equal((await request(provider, null, "messages&id=" + id)).length, 1);
await request(provider, { action: "start", id });
await request(customer, { action: "complete", id }, "me", 400);
await request(provider, { action: "finish", id });
await request(customer, { action: "complete", id });
await request(
  provider,
  { action: "review", id, rating: 5, body: "teste" },
  "me",
  400,
);
await request(customer, {
  action: "review",
  id,
  rating: 5,
  body: "Avaliação de teste local",
});
await request(
  customer,
  { action: "review", id, rating: 5, body: "duplicada" },
  "me",
  400,
);
order = (await request(customer, null, "orders")).find((o) => o.id === id);
assert.equal(order.status, "concluído");
const { id: cancelId } = await request(customer, {
  action: "request",
  provider,
  description: "Segundo pedido de teste para cancelamento.",
  neighborhood: "Centro",
  date: "2099-01-01",
});
await request(provider, {
  action: "propose",
  id: cancelId,
  amount: 100,
  scope: "Escopo de teste",
  deadline: "2 dias",
  terms: "Termos de teste",
});
await request(customer, { action: "accept", id: cancelId, revision: 1 });
await request(customer, { action: "pay", id: cancelId });
await request(customer, { action: "cancel", id: cancelId });
assert.equal(
  (await request(customer, null, "orders")).find((o) => o.id === cancelId).data
    .payment.refunded,
  true,
);
console.log(
  "PASS: autenticação, autorização, telefone privado, orçamento, comissão, revisão, pagamento único, chat, conclusão, avaliação única e reembolso.",
);
console.log("TEST_FIXTURE_PREFIX=" + prefix);
