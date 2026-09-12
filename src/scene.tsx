import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Html, Lightformer, Line, OrbitControls, useGLTF } from '@react-three/drei';
import { Box3, Color, Group, Mesh, MeshStandardMaterial, Object3D, Vector3, MathUtils } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { advance, initialMotion, route, ROUTE_LENGTH, STATIONS } from './simulation';
import type { CameraMode, Status } from './simulation';

const MODEL_ROOT = `${import.meta.env.BASE_URL}models/`;
useGLTF.preload(`${MODEL_ROOT}agv.glb`, false);
useGLTF.preload(`${MODEL_ROOT}factory.glb`, false);

type Vec = [number, number, number];
interface Props { playing: boolean; agvLight: boolean; factoryLight: boolean; speed: number; cameraMode: CameraMode; reset: number; onStatus: (status: Status) => void; onReady: () => void; }
function Block({ p, s, color = '#4c5960', glow = 0 }: { p: Vec; s: Vec; color?: string; glow?: number }) {
  return <mesh position={p} castShadow receiveShadow><boxGeometry args={s}/><meshStandardMaterial color={color} metalness={.22} roughness={.64} emissive={color} emissiveIntensity={glow}/></mesh>;
}
function Rack({ x, z }: { x: number; z: number }) {
  return <group position={[x, 0, z]}>
    {[-.8,.8].flatMap(dx => [-.35,.35].map(dz => <Block key={dx+','+dz} p={[dx,1,dz]} s={[.065,2,.065]} color="#3f5862"/>))}
    {[.18,.85,1.52].map((y,i) => <group key={y}><Block p={[0,y,0]} s={[1.75,.07,.83]} color="#b56636"/>
      {[-.45,.22].map((dx,j) => <group key={dx}><Block p={[dx,y+.23,0]} s={[.48,.39,.54]} color={i===1 ? '#737f85' : '#9f9075'}/><Block p={[dx,y+.24,.276]} s={[.21,.12,.005]} color="#d2d4ca"/><Block p={[dx,y+.24,.28]} s={[.025,.09,.006]} color="#5e6562"/></group>)}
    </group>)}
  </group>;
}
function FactoryScene({ bright }: { bright: boolean }) {
  const source = useGLTF(`${MODEL_ROOT}factory.glb`, false).scene;
  const factory = useMemo(() => {
    const copy = source.clone(true);
    copy.traverse(o => {
      if (!(o instanceof Mesh)) return;
      o.material = new MeshStandardMaterial({color: o.name.startsWith('FLOOR') ? '#687477' : '#34454e', roughness: .85});
      o.receiveShadow = true;
      if (o.name.startsWith('FLOOR')) { o.scale.multiply(new Vector3(.4,.3,.4)); o.position.set(0,-.03,0); }
      if (o.name.includes('BORDER')) { o.scale.multiply(new Vector3(.4,.5,.4)); o.position.set(0,.07,o.name.startsWith('NORTH') ? -4 : 4); }
      if (o.name.startsWith('STATION')) {
        const s = o.name.startsWith('STATION_A') ? STATIONS[0] : STATIONS[1];
        o.scale.multiply(new Vector3(.62,.025,.62));o.position.set(s.position[0],.007,0);
        (o.material as MeshStandardMaterial).color.set('#40565f');
      }
      if (o.name.startsWith('INTERSECTION')) {o.scale.multiply(new Vector3(.42,.03,.42));o.position.set(0,.004,0);(o.material as MeshStandardMaterial).color.set('#596a70');}
    });
    return copy;
  },[source]);
  const routePoints = useMemo(() => route.getSpacedPoints(180).map(p => new Vector3(p.x,.022,p.z)), []);
  return <>
    <primitive object={factory}/>
    <gridHelper args={[12,24, '#788489','#788489']} position={[0,.003,0]} material-transparent material-opacity={.14}/>
    <Line points={routePoints} color="#dbb468" lineWidth={2} dashed dashSize={.13} gapSize={.10}/>
    {STATIONS.map(s => <group key={s.name} position={[s.position[0],0,0]}>
      <Line points={[[-.63,.026,-.63],[.63,.026,-.63],[.63,.026,.63],[-.63,.026,.63],[-.63,.026,-.63]]} color="#e3b96b" lineWidth={2}/>
      <Html position={[0,.08,-.82]} center zIndexRange={[5,0]}><div className="station-label"><b>{s.name}</b> STATION</div></Html>
      {[-.8,.8].map(x => <group key={x}><Block p={[x,.22,-1.9]} s={[.09,.44,.09]} color="#d1a352"/><Block p={[x,.26,-1.9]} s={[.094,.09,.094]} color="#26343a"/></group>)}
    </group>)}
    <Block p={[0,1.25,-4]} s={[12,2.5,.13]} color="#384850"/>
    <Block p={[-6,.68,0]} s={[.12,1.36,8]} color="#43525a"/>
    <Block p={[0,.2,-3.88]} s={[11.9,.05,.03]} color="#e19950"/>
    {[-5.7,-1.9,1.9,5.7].map(x => <group key={x}>
      <Block p={[x,1.8,-3.8]} s={[.13,3.6,.17]} color="#263941"/>
      <Block p={[x,.29,-3.8]} s={[.20,.58,.23]} color="#c59545"/>
      <Block p={[x,3.5,-2.1]} s={[.11,.16,3.6]} color="#34464e"/>
      <Block p={[x,3.39,-1.5]} s={[.23,.05,1.4]} color={bright ? '#ecf0e6' : '#64838d'} glow={bright ? 2 : .25}/>
    </group>)}
    <Block p={[0,3.46,-3.8]} s={[11.8,.18,.16]} color="#273941"/>
    <Block p={[0,3.46,-.37]} s={[11.8,.12,.10]} color="#354952"/>
    {[-4.6,-2.5,2.4,4.5].map(x => <Rack key={x} x={x} z={-3.18}/>)}
    <group position={[0,0,-3.32]}><Block p={[0,.6,0]} s={[1.3,1.2,.60]} color="#78898d"/><Block p={[0,.87,.31]} s={[.75,.3,.02]} color="#182b32"/><Block p={[.43,.87,.33]} s={[.035,.035,.035]} color="#8cd6ac" glow={1}/><Block p={[0,.19,.315]} s={[1,.025,.01]} color="#414e55"/></group>
    <Html position={[0,2.6,-3.88]} center zIndexRange={[4,0]}><div className="station-label">AGV / FACTORY LAB</div></Html>
    {[-4.4,4.5].map(x => <group key={x} position={[x,0,2.6]}><Block p={[0,.06,0]} s={[1,.12,.8]} color="#796b4e"/><Block p={[0,.31,0]} s={[.8,.38,.66]} color="#77878d"/><Block p={[0,.51,0]} s={[.84,.035,.69]} color="#89999e"/></group>)}
    <Block p={[0,-.20,0]} s={[12.3,.28,8.3]} color="#1f3038"/>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.35,0]} receiveShadow><planeGeometry args={[200,200]}/><meshStandardMaterial color="#27343b" roughness={1}/></mesh>
  </>;
}
export function Scene({playing, agvLight, factoryLight, speed, cameraMode, reset, onStatus, onReady}: Props) {
  const gltf = useGLTF(`${MODEL_ROOT}agv.glb`, false);
  const model = useMemo(() => {
    const copy = gltf.scene.clone(true);
    copy.traverse(o => {
      if (o instanceof Mesh) {
        o.castShadow = true; o.receiveShadow = true;
        const material = (o.material as MeshStandardMaterial).clone();
        o.material = material;
        material.envMapIntensity = .6;
      }
    });
    return copy;
  }, [gltf.scene]);
  const wheels = useMemo(() => {const result: Object3D[]=[];model.traverse(o => {if(o.userData.part==='wheelPivot')result.push(o)});return result},[model]);
  const lamps = useMemo(() => {
    const materials: { m: MeshStandardMaterial; intensity: number }[]=[];
    model.traverse(o => {if(o instanceof Mesh){const m=o.material as MeshStandardMaterial;if(/Red LED|Green status LED/.test(m.name))materials.push({m,intensity:m.emissiveIntensity});}});
    return materials;
  },[model]);
  const robot = useRef<Group>(null!);
  const controls = useRef<OrbitControlsImpl>(null!);
  const motion = useRef(initialMotion());
  const lastStatus = useRef<Status>('พร้อม');
  const transition = useRef(true);
  const skipFrame = useRef(false);
  const { camera, size } = useThree();
  const pos = useMemo(() => new Vector3(), []);
  const tangent = useMemo(() => new Vector3(), []);
  const target = useMemo(() => new Vector3(), []);
  const eye = useMemo(() => new Vector3(), []);
  useEffect(() => {onReady();}, [onReady]);
  useEffect(() => { const changed = () => { skipFrame.current = true; }; document.addEventListener('visibilitychange', changed); return () => document.removeEventListener('visibilitychange', changed); }, []);
  useEffect(() => {lamps.forEach(({m,intensity}) => {m.emissiveIntensity=agvLight ? intensity : 0;});},[agvLight,lamps]);
  useEffect(() => {
    motion.current=initialMotion();lastStatus.current='พร้อม';wheels.forEach(w=>w.rotation.x=0);transition.current=true;onStatus('พร้อม');
  },[reset,onStatus,wheels]);
  useEffect(() => {transition.current=true;},[cameraMode,size.width,size.height]);
  useFrame((_,delta) => {
    const dt = skipFrame.current ? 0 : Math.min(delta,.25);
    skipFrame.current = false;
    const m = motion.current;
    const distance = advance(m,dt,playing,speed,!document.hidden);
    const fraction=(m.distance%ROUTE_LENGTH)/ROUTE_LENGTH;
    route.getPointAt(fraction,pos);route.getTangentAt(fraction,tangent);
    robot.current.position.copy(pos);
    // Blender's -Y front becomes glTF +Z. Wheel axles remain local X.
    robot.current.rotation.y=Math.atan2(tangent.x,tangent.z);
    wheels.forEach(w => {w.rotation.x+=distance/.052;});
    if(m.status!==lastStatus.current){lastStatus.current=m.status;onStatus(m.status);}
    if(!controls.current)return;
    if(transition.current||cameraMode==='follow'){
      if(cameraMode==='overview'){target.set(0,.25,0);eye.set(6.8,5.7,7.2);}
      else {
        target.copy(pos).add(new Vector3(0,.25,0));
        eye.copy(pos).add(cameraMode==='detail' ? new Vector3(1.45,1.35,1.75) : new Vector3(-tangent.x*2.8+1,1.9,-tangent.z*2.8+1));
      }
      if(size.width/size.height<.9)eye.sub(target).multiplyScalar(1.55).add(target);
      const alpha=1-Math.exp(-dt*4);
      camera.position.lerp(eye,alpha);controls.current.target.lerp(target,alpha);controls.current.update();
      if(camera.position.distanceTo(eye)<.02)transition.current=false;
    }
    camera.position.y=Math.max(.12,camera.position.y);
  });
  return <>
    <color attach="background" args={[factoryLight ? '#33434b' : '#111c27']}/>
    <fog attach="fog" args={[factoryLight ? '#33434b' : '#111c27',22,55]}/>
    <ambientLight intensity={factoryLight ? .65 : .12}/>
    <hemisphereLight args={['#d4e5f0','#695748',factoryLight ? 1.5 : .35]}/>
    <directionalLight position={[-3,8,4]} intensity={factoryLight ? 3.5 : .35} color="#fff1dc" castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={7} shadow-camera-bottom={-7} shadow-normalBias={.025}/>
    <directionalLight position={[6,4,-4]} intensity={factoryLight ? 1.7 : .35} color="#acdaff"/>
    <Environment resolution={128}><Lightformer position={[0,8,0]} rotation={[Math.PI/2,0,0]} scale={[10,10,1]} intensity={1.5}/><Lightformer position={[3,3,5]} scale={[5,5,1]} intensity={1}/></Environment>
    <FactoryScene bright={factoryLight}/>
    <group ref={robot}>
      <primitive object={model}/>
      <pointLight position={[.37,.28,0]} color="#ff1b23" intensity={agvLight ? .10 : 0} distance={.6} decay={2}/>
      <pointLight position={[-.37,.28,0]} color="#ff1b23" intensity={agvLight ? .10 : 0} distance={.6} decay={2}/>
      <pointLight position={[0,.19,.56]} color="#36ff86" intensity={agvLight ? .015 : 0} distance={.22}/>
    </group>
    <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={.09} minDistance={1} maxDistance={19} minPolarAngle={.12} maxPolarAngle={Math.PI/2-.045} enablePan={cameraMode!=='follow'} enableRotate={cameraMode!=='follow'} enableZoom={cameraMode!=='follow'} onStart={()=>{transition.current=false;}}/>
  </>;
}
