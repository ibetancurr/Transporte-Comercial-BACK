import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const base = process.env.API_URL || 'http://localhost:3000';
async function request(path, { method = 'GET', body, token, expected = 200 } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  assert.equal(response.status, expected, `${method} ${path}: ${JSON.stringify(data)}`);
  return data;
}

const suffix = randomUUID();
const correo = `smoke-${suffix}@example.test`;
const password = 'PruebaIntegracion123!';
const registration = { correo, nombre: 'Prueba de integración', contrasena: password, preguntaSeguridad: 'Ciudad de prueba', respuestaSeguridad: 'Bogota' };
const user = await request('/auth/mobile/register', { method: 'POST', body: registration, expected: 201 });
await request('/auth/mobile/register', { method: 'POST', body: registration, expected: 409 });
await request('/auth/mobile/login', { method: 'POST', body: { correo, contrasena: 'incorrecta' }, expected: 401 });
const { token } = await request('/auth/mobile/login', { method: 'POST', body: { correo, contrasena: password } });
assert.equal((await request('/auth/me', { token })).id, user.usuario.id);
await request('/routes', { expected: 401 });
await request('/routes', { method: 'POST', token, body: { origenNombre: 'Inválido' }, expected: 400 });
const routeBody = {
  origenNombre: 'Bogotá (prueba)', origenLat: 4.711, origenLon: -74.0721,
  destinoNombre: 'Medellín (prueba)', destinoLat: 6.2442, destinoLon: -75.5812,
  etaPactado: new Date(Date.now() + 86400000).toISOString(), distanciaTotalKm: 420, tiempoEstimadoBaseMin: 480,
};
const route = await request('/routes', { method: 'POST', token, body: routeBody, expected: 201 });
assert.equal(route.usuarioId, user.usuario.id);
assert.ok((await request('/routes', { token })).some((r) => r.id === route.id));
const other = await request('/auth/mobile/register', { method: 'POST', body: { ...registration, correo: `other-${suffix}@example.test` }, expected: 201 });
await request(`/routes/${route.id}`, { token: other.token, expected: 404 });
await request(`/routes/${route.id}/evaluate-delay`, { method: 'POST', token: other.token, expected: 404 });
await request('/telemetry/batch', { method: 'POST', token: other.token, body: { routeId: route.id, points: [{ latitude: 4.711, longitude: -74.0721, capturedAt: new Date().toISOString() }] }, expected: 404 });

// Legacy operator accounts can report and resolve incidents.
const operator = await request('/auth/register', { method: 'POST', body: { nombre: 'Operador de prueba', documento: `test-${suffix}`, password, rol: 'operador' }, expected: 201 });
const incidentBody = { tipoEvento: 'mantenimiento', gravedad: 'media', descripcion: 'Incidente de prueba de integración', latitud: routeBody.origenLat, longitud: routeBody.origenLon, radioAfectacionKm: 1, retrasoEstimadoMin: 25, fuente: 'prueba' };
await request('/road-incidents', { method: 'POST', token, body: incidentBody, expected: 403 });
const incident = await request('/road-incidents', { method: 'POST', token: operator.token, body: incidentBody, expected: 201 });
try {
  const evaluation = await request(`/routes/${route.id}/evaluate-delay`, { method: 'POST', token, expected: 201 });
  assert.ok(evaluation.deltaMinutes >= 25);
  assert.equal(evaluation.isDelayed, true);
  assert.equal(Date.parse(evaluation.recalculatedEta) - Date.parse(route.etaPactado), evaluation.deltaMinutes * 60000);
  const batch = { routeId: route.id, points: [{ latitude: 4.711, longitude: -74.0721, speedKmh: 40, capturedAt: new Date().toISOString() }] };
  assert.equal((await request('/telemetry/batch', { method: 'POST', token, body: batch, expected: 201 })).savedCount, 1);
  await request('/telemetry/batch', { method: 'POST', token, body: { ...batch, points: [{ ...batch.points[0], latitude: 100 }] }, expected: 400 });
  await request('/auth/mobile/recovery/verify', { method: 'POST', body: { correo, respuesta: 'Incorrecta' }, expected: 401 });
  assert.equal((await request('/auth/mobile/recovery/question', { method: 'POST', body: { correo } })).pregunta, registration.preguntaSeguridad);
  await request('/auth/mobile/recovery/reset', { method: 'POST', body: { correo, respuesta: ' BOGOTA ', nuevaContrasena: `${password}2` } });
  await request('/auth/mobile/login', { method: 'POST', body: { correo, contrasena: password }, expected: 401 });
  await request('/auth/mobile/login', { method: 'POST', body: { correo, contrasena: `${password}2` } });
} finally {
  await request(`/road-incidents/${incident.id}`, { method: 'PATCH', token: operator.token, body: { estado: 'resuelto' } });
}
console.log('OK: registro, login, recuperación, JWT, aislamiento por usuario, rutas, incidentes, retrasos y telemetría.');
console.log('Se crearon cuentas y una ruta identificadas como prueba de integración.');
