import test from "node:test";
import assert from "node:assert/strict";
// @ts-ignore Node executes this test directly with type stripping.
import { calculateFees, transition } from "../lib/domain.ts";
test("commission is rounded in cents and net reconciles", () => {
  for (const amount of [100, 101, 999, 10000, 999999]) {
    const f = calculateFees(amount, 800);
    assert.equal(f.gross, f.net + f.commission + f.processing);
    assert.equal(f.commission, Math.round(amount * 0.08));
  }
  assert.equal(calculateFees(10000, 800).net, 9200);
});
test("invalid and extreme amounts and commission rejected", () => {
  for (const amount of [NaN, Infinity, -1, 0, 1.5, 100000001])
    assert.throws(() => calculateFees(amount, 800));
  assert.throws(() => calculateFees(100, 3001));
});
test("full order lifecycle enforces participants", () => {
  let s = "solicitado";
  s = transition(s, "propose", "provider");
  s = transition(s, "accept", "customer");
  s = transition(s, "pay", "customer");
  s = transition(s, "start", "provider");
  s = transition(s, "finish", "provider");
  s = transition(s, "complete", "customer");
  assert.equal(s, "concluído");
});
test("payment cannot replay or happen before acceptance", () => {
  assert.throws(() => transition("solicitado", "pay", "customer"));
  assert.throws(() => transition("confirmado", "pay", "customer"));
  assert.throws(() => transition("em negociação", "accept", "provider"));
  assert.throws(() => transition("em andamento", "complete", "provider"));
  assert.throws(() => transition("confirmado", "start", "customer"));
});
test("cancelled orders cannot progress and started work requires dispute", () => {
  assert.equal(transition("confirmado", "cancel", "customer"), "cancelado");
  assert.throws(() => transition("cancelado", "start", "provider"));
  assert.throws(() => transition("em andamento", "cancel", "customer"));
  assert.equal(transition("em andamento", "dispute", "provider"), "em disputa");
});
