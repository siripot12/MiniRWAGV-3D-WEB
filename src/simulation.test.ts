import { describe, it, expect } from 'vitest';
import { advance, initialMotion, ROUTE_LENGTH, route, STATIONS } from './simulation';
describe('AGV demonstration route', () => {
  it('uses the station coordinates for both exact stops', () => {
    expect(route.getPointAt(0).x).toBeCloseTo(STATIONS[0].position[0]);
    expect(route.getPointAt(.5).x).toBeCloseTo(STATIONS[1].position[0]);
  });
  it('starts parked and applies the requested speed', () => {
    const m = initialMotion(); advance(m,1,false,1); expect(m.distance).toBe(0); expect(m.status).toBe('พร้อม');
    advance(m,1,true,1.5); expect(m.distance).toBeCloseTo(.525);
  });
  it('parks exactly at B, dwells two seconds, then reaches A', () => {
    const m = initialMotion();
    while(m.distance < ROUTE_LENGTH / 2) advance(m,.01,true,1.5);
    expect(m.distance).toBeCloseTo(ROUTE_LENGTH / 2); expect(m.status).toBe('จอดที่สถานี B');
    const parked=m.distance;advance(m,1,true,1);advance(m,1,true,1);expect(m.distance).toBe(parked);
    advance(m,.1,true,1);expect(m.distance).toBeGreaterThan(parked);
    while(m.distance < ROUTE_LENGTH) advance(m,.01,true,1.5);
    expect(m.status).toBe('จอดที่สถานี A');expect(m.distance).toBeCloseTo(ROUTE_LENGTH);
  });
  it('pauses and resumes without losing position', () => {
    const m=initialMotion();advance(m,1,true,1);advance(m,20,false,1);expect(m.distance).toBeCloseTo(.35);expect(m.status).toBe('พัก');advance(m,1,true,1);expect(m.distance).toBeCloseTo(.7);
  });
  it('does not move or consume a dwell while hidden', () => {
    const m=initialMotion();advance(m,100,true,1,false);expect(m.distance).toBe(0);m.dwell=2;advance(m,100,true,1,false);expect(m.dwell).toBe(2);
  });
  it('has continuous heading around the loop and leaves room for the vehicle', () => {
    const a=route.getTangentAt(.99999),b=route.getTangentAt(.00001);expect(a.dot(b)).toBeGreaterThan(.999);
    for(const p of route.getSpacedPoints(100)){expect(Math.abs(p.x)).toBeLessThanOrEqual(2.601);expect(Math.abs(p.z)).toBeLessThanOrEqual(1.251);}
  });
});
