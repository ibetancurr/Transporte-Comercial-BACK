import { RouteEntity } from '../routes/entities/route.entity';
import { IncidentEntity } from '../road-incidents/incident.entity';
import { IDelayEvaluationResult } from '../shared/types';

export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const radians = Math.PI / 180;
  const a = Math.sin((lat2 - lat1) * radians / 2) ** 2 + Math.cos(lat1 * radians) * Math.cos(lat2 * radians) * Math.sin((lon2 - lon1) * radians / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(Math.min(1, a)), Math.sqrt(Math.max(0, 1 - a)));
}

// Match the mobile offline engine: compare incident radii with route waypoints.
export function calculateDelay(route: RouteEntity, incidents: IncidentEntity[]): IDelayEvaluationResult {
  const points = [[route.origenLat, route.origenLon], [route.destinoLat, route.destinoLon], ...route.tramos.flatMap((s) => [[s.origenLat, s.origenLon], [s.destinoLat, s.destinoLon]])];
  const affecting = incidents.filter((incident) => incident.estado === 'activo' && points.some(([lat, lon]) => distanceKm(lat, lon, incident.latitud, incident.longitud) <= incident.radioAfectacionKm));
  const deltaMinutes = affecting.reduce((total, incident) => total + incident.retrasoEstimadoMin, 0);
  return {
    routeId: route.id,
    recalculatedEta: new Date(new Date(route.etaPactado).getTime() + deltaMinutes * 60000).toISOString(),
    deltaMinutes,
    isDelayed: deltaMinutes > 0,
    affectingIncidentsCount: affecting.length,
  };
}
