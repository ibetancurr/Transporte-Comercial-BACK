const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calculateDelay } = require('../dist/delay-engine/calculate-delay');

const route = { id: 'route', origenLat: 4.711, origenLon: -74.0721, destinoLat: 6.2442, destinoLon: -75.5812, etaPactado: new Date('2026-11-11T18:00:00Z'), tramos: [] };
const incident = { estado: 'activo', latitud: 4.711, longitud: -74.0721, radioAfectacionKm: 1, retrasoEstimadoMin: 30 };

test('No incidents preserve the agreed ETA', () => {
  const result = calculateDelay(route, []);
  assert.equal(result.recalculatedEta, route.etaPactado.toISOString());
  assert.equal(result.deltaMinutes, 0);
  assert.equal(result.isDelayed, false);
});
test('An incident near multiple waypoints is counted once', () => {
  const result = calculateDelay({ ...route, tramos: [{ origenLat: route.origenLat, origenLon: route.origenLon, destinoLat: route.origenLat, destinoLon: route.origenLon }] }, [incident]);
  assert.equal(result.deltaMinutes, 30);
  assert.equal(result.affectingIncidentsCount, 1);
  assert.equal(result.recalculatedEta, '2026-11-11T18:30:00.000Z');
});
test('Inactive and distant incidents do not add delay', () => {
  const result = calculateDelay(route, [{ ...incident, estado: 'resuelto' }, { ...incident, latitud: 0, longitud: 0 }]);
  assert.equal(result.deltaMinutes, 0);
});
test('Intermediate waypoints contribute and delays accumulate', () => {
  const result = calculateDelay({ ...route, tramos: [{ origenLat: 5, origenLon: -74, destinoLat: 5.1, destinoLon: -74 }] }, [incident, { ...incident, latitud: 5, longitud: -74, retrasoEstimadoMin: 20 }]);
  assert.equal(result.deltaMinutes, 50);
  assert.equal(result.affectingIncidentsCount, 2);
});
