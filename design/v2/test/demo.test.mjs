import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, demoReducer, dailyDoses, doseKey, vitamin } from '../src/demo.ts';
const toggle = (state, day = 0) => demoReducer(state, { type: 'toggle', medicineId: 'morning', day, time: '08:00' });
const morning = state => state.medicines.find(m => m.id === 'morning');

test('recording deducts stock and cancellation restores the amount actually charged', () => {
  let state = initialState();
  state = demoReducer(state, { type: 'update', medicine: { ...morning(state), stock: 0.5 } });
  state = toggle(state);
  assert.equal(morning(state).stock, 0);
  assert.equal(state.records[doseKey('morning', 0, '08:00')].deducted, 0.5);
  state = demoReducer(state, { type: 'update', medicine: { ...morning(state), dosage: 2, stock: 10 } });
  state = toggle(state);
  assert.equal(morning(state).stock, 10.5);
  assert.equal(state.records[doseKey('morning', 0, '08:00')], undefined);
});
test('zero stock still permits a record and cancellation does not create stock', () => {
  let state = initialState();
  state = demoReducer(state, { type: 'update', medicine: { ...morning(state), stock: 0 } });
  state = toggle(state);
  assert.equal(state.records[doseKey('morning', 0, '08:00')].deducted, 0);
  assert.equal(morning(toggle(state)).stock, 0);
});
test('records for different dates are independent', () => {
  let state = toggle(toggle(initialState()), -1);
  assert.equal(morning(state).stock, 12);
  state = toggle(state);
  assert.equal(morning(state).stock, 13);
  assert.ok(state.records[doseKey('morning', -1, '08:00')]);
  assert.equal(state.records[doseKey('morning', 0, '08:00')], undefined);
});
test('shared group schedules deduplicate equal times, and archived medicines leave the daily plan', () => {
  let state = initialState();
  state = demoReducer(state, { type: 'group', group: { id: 'one', name: '아침', medicineIds: ['morning', 'evening'], time: '08:00' } });
  state = demoReducer(state, { type: 'group', group: { id: 'two', name: '공통', medicineIds: ['morning'], time: '08:00' } });
  assert.equal(dailyDoses(state).filter(d => d.medicine.id === 'morning').length, 1);
  assert.equal(dailyDoses(state).filter(d => d.medicine.id === 'evening').length, 2);
  state = demoReducer(state, { type: 'update', medicine: { ...morning(state), archived: true } });
  assert.equal(dailyDoses(state).filter(d => d.medicine.id === 'morning').length, 0);
  assert.equal(toggle(state), state);
});
test('revisiting the guided registration does not duplicate medicine and reset restores defaults', () => {
  let state = demoReducer(initialState(), { type: 'add', medicine: vitamin });
  state = demoReducer(state, { type: 'add', medicine: vitamin });
  assert.equal(state.medicines.length, 3);
  state = demoReducer(state, { type: 'guardian', email: 'family@example.com', status: 'connected' });
  state = demoReducer(state, { type: 'reminders', enabled: false });
  assert.deepEqual(demoReducer(state, { type: 'reset' }), initialState());
});

test('fractional quantities remain readable after recording and cancellation', () => {
  let state = initialState();
  state = demoReducer(state, { type: 'update', medicine: { ...morning(state), stock: 0.3, dosage: 0.1 } });
  state = toggle(state);
  assert.equal(morning(state).stock, 0.2);
  assert.equal(morning(toggle(state)).stock, 0.3);
});
