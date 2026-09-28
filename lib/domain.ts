export const CATEGORIES = [
  "Reformas e construção",
  "Encanamento",
  "Elétrica",
  "Pintura",
  "Tecnologia",
  "Contabilidade",
  "Limpeza",
  "Jardinagem",
];
export function calculateFees(cents: number, bps: number) {
  if (
    !Number.isSafeInteger(cents) ||
    cents < 100 ||
    cents > 100000000 ||
    !Number.isInteger(bps) ||
    bps < 0 ||
    bps > 3000
  )
    throw new Error("Valor ou comissão inválidos.");
  const commission = Math.round((cents * bps) / 10000);
  return {
    gross: cents,
    commission,
    processing: 0,
    net: cents - commission,
    bps,
  };
}
export function transition(status: string, action: string, role: string) {
  const rules: Record<string, [string[], string, string]> = {
    propose: [["solicitado", "em negociação"], "provider", "em negociação"],
    accept: [["em negociação"], "customer", "aguardando pagamento"],
    pay: [["aguardando pagamento"], "customer", "confirmado"],
    start: [["confirmado"], "provider", "em andamento"],
    finish: [["em andamento"], "provider", "em andamento"],
    complete: [["em andamento"], "customer", "concluído"],
    cancel: [
      ["solicitado", "em negociação", "aguardando pagamento", "confirmado"],
      "either",
      "cancelado",
    ],
    dispute: [
      ["confirmado", "em andamento", "concluído"],
      "either",
      "em disputa",
    ],
  };
  const r = rules[action];
  if (!r || !r[0].includes(status) || (r[1] !== "either" && r[1] !== role))
    throw new Error("Esta ação não é permitida nesta etapa.");
  return r[2];
}
export function normalize(v: string) {
  return v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
