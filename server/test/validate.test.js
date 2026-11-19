import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCents, checkDate } from '../validate.js';

test('parseCents handles decimals without floats', () => {
  assert.equal(parseCents('25'), 2500);
  assert.equal(parseCents('25.5'), 2550);
  assert.equal(parseCents('0.07'), 7);
  assert.equal(parseCents('1,200.00'), 120000);
  assert.equal(parseCents('19.99'), 1999);
});

test('parseCents rejects bad input', () => {
  for (const v of ['', '0', '-5', 'abc', '1.234', '0.00']) assert.throws(() => parseCents(v));
});

test('checkDate validates real dates', () => {
  assert.equal(checkDate('2024-02-29'), '2024-02-29');
  assert.throws(() => checkDate('2023-02-29'));
  assert.throws(() => checkDate('nope'));
});
