import { Curve, Vector3 } from 'three';
export type CameraMode = 'overview' | 'detail' | 'follow';
export type Status = 'พร้อม' | 'กำลังเคลื่อนที่' | 'พัก' | 'จอดที่สถานี A' | 'จอดที่สถานี B';
export const STATIONS = [{ name: 'A', position: [-2.6, 0.02, 0] }, { name: 'B', position: [2.6, 0.02, 0] }] as const;
class Route extends Curve<Vector3> {
  constructor() { super(); }
  getPoint(t: number, target = new Vector3()) {
    const a = t * Math.PI * 2;
    return target.set(-2.6 * Math.cos(a), 0.024, 1.25 * Math.sin(a));
  }
}
export const route = new Route();
route.arcLengthDivisions = 600;
export const ROUTE_LENGTH = route.getLength();
export interface Motion { distance: number; dwell: number; nextStop: number; started: boolean; status: Status; }
export const initialMotion = (): Motion => ({ distance: 0, dwell: 0, nextStop: ROUTE_LENGTH / 2, started: false, status: 'พร้อม' });
export function advance(m: Motion, dt: number, playing: boolean, speed: number, visible = true): number {
  if (!visible) return 0;
  if (!playing) { m.status = m.started ? 'พัก' : 'พร้อม'; return 0; }
  m.started = true;
  if (m.dwell > 0) {
    m.dwell = Math.max(0, m.dwell - dt);
    m.status = Math.round(m.distance / (ROUTE_LENGTH / 2)) % 2 ? 'จอดที่สถานี B' : 'จอดที่สถานี A';
    return 0;
  }
  const step = Math.min(0.35 * speed * dt, m.nextStop - m.distance);
  m.distance += step;
  m.status = 'กำลังเคลื่อนที่';
  if (m.distance >= m.nextStop - 1e-8) {
    m.dwell = 2; m.nextStop += ROUTE_LENGTH / 2;
    m.status = Math.round(m.distance / (ROUTE_LENGTH / 2)) % 2 ? 'จอดที่สถานี B' : 'จอดที่สถานี A';
  }
  return step;
}
