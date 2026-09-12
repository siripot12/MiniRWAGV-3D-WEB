import React, { Component, Suspense, useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { Html, useProgress } from '@react-three/drei';
import { Box, Factory, Play, Pause, RotateCcw, Lightbulb, Sun, Moon, Scan, Orbit, Navigation, ArrowUpRight, MousePointer2, MoveUpRight, Maximize, X } from 'lucide-react';
import { Scene } from './scene';
import type { CameraMode, Status } from './simulation';
import './style.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/noto-sans-thai/400.css';
import '@fontsource/noto-sans-thai/500.css';
import './readability.css';

class Boundary extends Component<{ children: React.ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() { return this.state.error ? <div className="fallback"><Box size={36}/><h2>เปิดฉาก 3 มิติไม่สำเร็จ</h2><p>ตรวจสอบว่าเบราว์เซอร์รองรับ WebGL และโหลดโมเดลได้</p><button onClick={() => location.reload()}>ลองใหม่</button></div> : this.props.children; }
}
function Loading() { const { progress } = useProgress(); return <Html center><div className="loader"><Box size={32}/><b>กำลังเตรียมโชว์รูม</b><span>{Math.round(progress)}%</span></div></Html>; }
function Switch({ label, sub, on, onChange, icon }: { label: string; sub: string; on: boolean; onChange: () => void; icon: React.ReactNode }) {
  return <button className="switch-row" role="switch" aria-checked={on} aria-label={label} onClick={onChange}><span className="control-icon">{icon}</span><span className="switch-copy"><b>{label}</b><small>{sub}</small></span><span className={'toggle ' + (on ? 'on' : '')}><i/></span></button>;
}
function App() {
  const [webgl] = useState(() => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; } });
  const [playing, setPlaying] = useState(false), [agvLight, setAgvLight] = useState(true), [factoryLight, setFactoryLight] = useState(true);
  const [speed, setSpeed] = useState(1), [camera, setCamera] = useState<CameraMode>('overview'), [reset, setReset] = useState(0);
  const [status, setStatus] = useState<Status>('พร้อม'), [ready, setReady] = useState(false), [wide, setWide] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  function resetAll() { setPlaying(false); setAgvLight(true); setFactoryLight(true); setSpeed(1); setCamera('overview'); setReset(v => v + 1); setStatus('พร้อม'); }
  return <div className={'app ' + (wide ? 'wide' : '')}>
    <header><a className="brand" href="/" aria-label="AGV Factory Showroom"><span className="brand-mark"><Box size={23}/></span><b>AGV<span> / </span>STUDIO</b></a><div className="header-center"><Factory size={15}/> FACTORY SHOWROOM <span className="version">01</span></div><span className="local-badge">INTERACTIVE EXPERIENCE</span></header>
    <main>
      <section className="viewport" aria-label="ฉากโรงงาน 3 มิติ">
        {webgl ? <Boundary><Canvas shadows dpr={[1, 1.5]} camera={{ position: [6.8, 5.7, 7.2], fov: 42, near: 0.05, far: 80 }} gl={{ antialias: true, powerPreference: 'high-performance' }} fallback={<div className="fallback">อุปกรณ์นี้ไม่รองรับ WebGL กรุณาใช้เบราว์เซอร์ที่รองรับกราฟิก 3 มิติ</div>}>
          <Suspense fallback={<Loading/>}><Scene {...{ playing, agvLight, factoryLight, speed, cameraMode: camera, reset, onStatus: setStatus, onReady }}/></Suspense>
        </Canvas></Boundary> : <div className="fallback"><Box size={36}/><p>อุปกรณ์นี้ไม่รองรับ WebGL กรุณาใช้เบราว์เซอร์ที่รองรับกราฟิก 3 มิติ</p></div>}
        <div className="scene-title"><span className="eyebrow"><i/> DIGITAL SHOWROOM / 01</span><h1>Factory<br/><em>in motion.</em></h1><p>สำรวจ ทดลอง และควบคุม AGV ของคุณ</p></div>
        <div className="scene-tools"><span className="scene-tag">{factoryLight ? <Sun size={14}/> : <Moon size={14}/>} {factoryLight ? 'DAY SCENE' : 'NIGHT SCENE'}</span><button className="icon-button" aria-label={wide ? 'แสดงแผงควบคุม' : 'ขยายฉาก'} onClick={() => setWide(v => !v)}>{wide ? <X size={18}/> : <Maximize size={18}/>}</button></div>
        <div className="view-bottom"><div className="scene-help"><MousePointer2 size={16}/><span>ลากเพื่อหมุน <i/> เลื่อนเพื่อซูม</span></div><span className="live-status"><i className={playing ? 'moving' : ''}/>{ready ? 'ฉากพร้อมใช้งาน' : 'กำลังโหลดโมเดล'}</span></div>
        <div className="floor-caption">AUTONOMOUS MOBILE ROBOT <span>—</span> VIRTUAL DEMO</div>
      </section>
      <aside className="controls">
        <div className="panel-heading"><span className="eyebrow">CONTROL CENTER</span><span className="unit-number">UNIT 01</span></div>
        <h2>AGV Explorer<span className="orange-dot"/></h2><p className="intro">รถขนส่งอัตโนมัติ · Factory edition</p>
        <div className="status-card"><span className="vehicle-icon"><Box size={26}/></span><div><small>สถานะการทำงาน</small><strong aria-live="polite" data-testid="status">{status}</strong></div><span className={'status-indicator ' + (playing ? 'active' : '')}/></div>
        <section className="control-section"><div className="section-label"><span>01</span><h3>การเคลื่อนที่</h3><Navigation size={16}/></div>
          <div className="route-diagram"><div className={status.includes('A') || status === 'พร้อม' ? 'station active' : 'station'}><b>A</b><span>สถานีต้นทาง</span></div><div className={'route-link ' + (playing ? 'animated' : '')}><span/><MoveUpRight size={16}/><span/></div><div className={status.includes('B') ? 'station active' : 'station'}><b>B</b><span>สถานีปลายทาง</span></div></div>
          <button disabled={!ready} className={'play-button ' + (playing ? 'playing' : '')} onClick={() => setPlaying(v => !v)}>{playing ? <Pause size={18}/> : <Play size={18} fill="currentColor"/>}{playing ? 'พักการสาธิต' : status === 'พัก' ? 'เล่นต่อ' : 'เริ่มวิ่งสาธิต'}<ArrowUpRight size={17}/></button>
          <div className="speed-label"><span>ความเร็วสาธิต</span><b>{(playing && status === 'กำลังเคลื่อนที่' ? .35 * speed : 0).toFixed(2)} <small>m/s</small></b></div><div className="segmented" aria-label="ความเร็ว">{[.5, 1, 1.5].map(v => <button key={v} aria-pressed={speed === v} onClick={() => setSpeed(v)}>{v.toFixed(1)}×</button>)}</div><p className="hint">วิ่งวน A ↔ B · จอดที่แต่ละสถานี 2 วินาที</p>
        </section>
        <section className="control-section"><div className="section-label"><span>02</span><h3>แสงและบรรยากาศ</h3><Lightbulb size={16}/></div>
          <Switch label="ไฟ AGV" sub="แถบไฟแดงและไฟแสดงสถานะ" on={agvLight} onChange={() => setAgvLight(v => !v)} icon={<Lightbulb size={18}/>}/>
          <Switch label="ไฟโรงงาน" sub={factoryLight ? 'โหมดสว่าง' : 'โหมดแสงสลัว'} on={factoryLight} onChange={() => setFactoryLight(v => !v)} icon={factoryLight ? <Sun size={18}/> : <Moon size={18}/>}/>
        </section>
        <section className="control-section"><div className="section-label"><span>03</span><h3>มุมกล้อง</h3><Scan size={16}/></div><div className="camera-options">{([{ id: 'overview', label: 'ภาพรวม', icon: <Factory size={19}/> }, { id: 'detail', label: 'ใกล้ตัวรถ', icon: <Orbit size={19}/> }, { id: 'follow', label: 'ติดตาม', icon: <Navigation size={19}/> }] as const).map(c => <button key={c.id} aria-pressed={camera === c.id} onClick={() => setCamera(c.id)}>{c.icon}<span>{c.label}</span></button>)}</div></section>
        <button className="reset-button" onClick={resetAll}><RotateCcw size={15}/>เริ่มต้นใหม่<span>RESET</span></button>
        <div className="panel-foot"><span className="mini-logo">AGV</span><span>สภาพแวดล้อมจำลอง<br/>ขนาดอ้างอิงโดยประมาณ</span><Box size={19}/></div>
      </aside>
    </main><footer><span>AGV STUDIO <i/> FACTORY SHOWROOM</span><span>โมเดล 3 มิติจาก Blender <span className="footer-dot">·</span> ประสบการณ์แบบเรียลไทม์</span></footer>
  </div>;
}
createRoot(document.getElementById('root')!).render(<App/>);
