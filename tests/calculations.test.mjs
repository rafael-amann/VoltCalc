import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculate, formulas } from '../dist/calculations.js';
const circuit = { voltage: 12, current: 2, resistance: 6, power: 24 };
for (const formula of formulas) {
  test(formula.expression, () => {
    const [first, second] = formula.inputs.map(input => circuit[input]);
    assert.equal(calculate(formula, first, second), circuit[formula.target]);
  });
}
test('5500 W / 220 V = 25 A', () => {
  assert.equal(calculate(formulas[0], 5500, 220), 25);
});
test('rejects invalid inputs in either field', () => {
  for (const formula of formulas) {
    for (const value of [0, -1, NaN, Infinity, -Infinity]) {
      assert.throws(() => calculate(formula, value, 12));
      assert.throws(() => calculate(formula, 12, value));
    }
  }
});
test('rejects numeric overflow', () => {
  assert.throws(() => calculate(formulas[9], 1e308, 1e308));
});
