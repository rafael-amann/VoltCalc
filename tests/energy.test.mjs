import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateEnergy } from '../dist/energy.js';
const example = { power: 1000, quantity: 1, hours: 2, days: 30, tariff: 0.95 };
test('requested example: 60 kWh and R$57 monthly', () => {
  assert.deepEqual(calculateEnergy(example), {
    dailyConsumption: 2, monthlyConsumption: 60, dailyCost: 1.9, monthlyCost: 57,
  });
});
test('quantity and fractional hours', () => {
  const result = calculateEnergy({ ...example, power: 100, quantity: 4, hours: 2.5 });
  assert.equal(result.dailyConsumption, 1);
  assert.equal(result.monthlyConsumption, 30);
});
test('zero hours, days and tariff are supported', () => {
  assert.equal(calculateEnergy({ ...example, hours: 0 }).monthlyConsumption, 0);
  assert.equal(calculateEnergy({ ...example, days: 0 }).monthlyConsumption, 0);
  assert.equal(calculateEnergy({ ...example, tariff: 0 }).monthlyCost, 0);
});
test('maximum calendar and daily limits', () => {
  assert.equal(calculateEnergy({ ...example, hours: 24, days: 31 }).monthlyConsumption, 744);
});
test('reject invalid values', () => {
  for (const key of Object.keys(example)) {
    for (const value of [NaN, Infinity, -1]) {
      assert.throws(() => calculateEnergy({ ...example, [key]: value }));
    }
  }
  for (const invalid of [{ power: 0 }, { quantity: 0 }, { quantity: 1.5 }, { hours: 25 }, { days: 32 }, { days: 1.5 }]) {
    assert.throws(() => calculateEnergy({ ...example, ...invalid }));
  }
  assert.throws(() => calculateEnergy({ ...example, power: 1e308, tariff: 1e308 }));
});
