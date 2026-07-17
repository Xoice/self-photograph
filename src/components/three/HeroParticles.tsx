import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function gaussian(mean = 0, std = 1) {
  const u1 = Math.random() || 0.0001;
  const u2 = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

const STAR_COLORS = [
  new THREE.Color(0xffffff),
  new THREE.Color(0xb0c4ff),
  new THREE.Color(0xffe4a0),
];

interface StarData {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  phases: Float32Array;
  speeds: Float32Array;
}

const HeroParticles = () => {
  const groupRef = useRef<THREE.Group>(null);
  const galaxyRef = useRef<THREE.Points>(null);
  const coreRef = useRef<THREE.Sprite>(null);
  const dustRef = useRef<THREE.Mesh>(null);
  const meteorRef = useRef<THREE.Points>(null);

  const meteorState = useRef({ active: false, x: 0, y: 0, z: 0, vx: 0, vy: 0, life: 0, maxLife: 0 });
  const meteorTimer = useRef(3 + Math.random() * 7);

  const isMobile = useMemo(() => typeof window !== 'undefined' && window.innerWidth < 768, []);
  const galaxyTilt = useMemo(() => THREE.MathUtils.degToRad(25), []);
  const bgCount = useMemo(() => (isMobile ? 1200 : 2500), [isMobile]);
  const galaxyCount = useMemo(() => (isMobile ? 300 : 700), [isMobile]);

  // 背景星场数据
  const bgStars = useMemo<StarData>(() => {
    const positions = new Float32Array(bgCount * 3);
    const colors = new Float32Array(bgCount * 3);
    const sizes = new Float32Array(bgCount);
    const phases = new Float32Array(bgCount);
    const speeds = new Float32Array(bgCount);

    for (let i = 0; i < bgCount; i++) {
      const i3 = i * 3;
      const r = Math.random() * 40 + 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi) - 10;
      const cr = Math.random();
      const c = cr < 0.6 ? STAR_COLORS[0] : cr < 0.85 ? STAR_COLORS[1] : STAR_COLORS[2];
      colors[i3] = c.r; colors[i3 + 1] = c.g; colors[i3 + 2] = c.b;
      sizes[i] = Math.random() < 0.92 ? 0.3 + Math.random() * 0.4 : 0.8 + Math.random() * 0.8;
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.3 + Math.random() * 2;
    }
    return { positions, colors, sizes, phases, speeds };
  }, [bgCount]);

  // 银河带数据
  const galaxyStars = useMemo<StarData>(() => {
    const positions = new Float32Array(galaxyCount * 3);
    const colors = new Float32Array(galaxyCount * 3);
    const sizes = new Float32Array(galaxyCount);
    const phases = new Float32Array(galaxyCount);
    const speeds = new Float32Array(galaxyCount);
    const cosT = Math.cos(galaxyTilt);
    const sinT = Math.sin(galaxyTilt);

    for (let i = 0; i < galaxyCount; i++) {
      const i3 = i * 3;
      const u = gaussian(0, 12);
      const v = gaussian(0, 1.8);
      const x = u * cosT - v * sinT;
      const y = u * sinT + v * cosT;
      const z = -10;
      positions[i3] = x; positions[i3 + 1] = y; positions[i3 + 2] = z;
      const dist = Math.abs(u) / 12;
      const c = dist < 0.3
        ? STAR_COLORS[2].clone().lerp(STAR_COLORS[0], dist / 0.3)
        : STAR_COLORS[0].clone().lerp(STAR_COLORS[1], (dist - 0.3) / 0.7);
      colors[i3] = c.r; colors[i3 + 1] = c.g; colors[i3 + 2] = c.b;
      sizes[i] = 0.4 + Math.random() * 0.6;
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.5 + Math.random() * 1.5;
    }
    return { positions, colors, sizes, phases, speeds };
  }, [galaxyCount, galaxyTilt]);

  // 闪烁着色器
  const starMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector3(999, 999, 0) },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        attribute float size;
        attribute float phase;
        attribute float speed;
        varying float vTwinkle;
        varying vec3 vColor;
        uniform float uTime;
        uniform vec3 uMouse;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          float twinkle = sin(uTime * speed + phase) * 0.5 + 0.5;
          float dist = distance(position.xy, uMouse.xy);
          float boost = 1.0 - smoothstep(0.0, 10.0, dist);
          twinkle = twinkle * (1.0 - boost * 0.2) + boost * 0.4;
          vTwinkle = twinkle;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uPixelRatio * (300.0 / max(-mvPosition.z, 1.0));
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vTwinkle;
        varying vec3 vColor;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float dist = length(uv);
          if (dist > 0.5) discard;
          float alpha = (1.0 - dist * 2.0) * vTwinkle;
          gl_FragColor = vec4(vColor, alpha * 0.9);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
    });
  }, []);

  // 银心亮核纹理
  const coreTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(255, 220, 160, 0.8)');
    grad.addColorStop(0.3, 'rgba(255, 200, 130, 0.3)');
    grad.addColorStop(1, 'rgba(255, 200, 130, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(canvas);
  }, []);

  // 暗带纹理
  const dustTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 64, 0, 0);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.5, 'rgba(5, 5, 5, 0.8)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 128);
    const grad2 = ctx.createLinearGradient(0, 64, 0, 128);
    grad2.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad2.addColorStop(0.5, 'rgba(5, 5, 5, 0.8)');
    grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, 512, 128);
    return new THREE.CanvasTexture(canvas);
  }, []);

  // 流星几何
  const meteorGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(20 * 3), 3));
    return geo;
  }, []);

  const mouseWorld = useRef(new THREE.Vector3(999, 999, 0));

  useFrame((state) => {
    const { pointer } = state;
    const time = state.clock.elapsedTime;
    const dt = state.clock.getDelta();

    // 鼠标 -> 世界坐标
    mouseWorld.current.x += (pointer.x * 25 - mouseWorld.current.x) * 0.06;
    mouseWorld.current.y += (pointer.y * 18 - mouseWorld.current.y) * 0.06;
    starMaterial.uniforms.uTime.value = time;
    starMaterial.uniforms.uMouse.value.copy(mouseWorld.current);

    // 银河极缓慢漂移
    if (galaxyRef.current) {
      galaxyRef.current.rotation.z = Math.sin(time * 0.008) * 0.015;
    }
    if (coreRef.current) {
      coreRef.current.position.x = Math.sin(time * 0.008) * 1.5;
      coreRef.current.position.y = Math.cos(time * 0.008) * 1;
    }
    if (dustRef.current) {
      dustRef.current.rotation.z = galaxyTilt + Math.sin(time * 0.008) * 0.015;
    }

    // 整体微弱视差
    if (groupRef.current) {
      groupRef.current.rotation.y += (pointer.x * 0.02 - groupRef.current.rotation.y) * 0.02;
      groupRef.current.rotation.x += (-pointer.y * 0.015 - groupRef.current.rotation.x) * 0.02;
    }

    // 流星
    meteorTimer.current -= dt;
    if (!meteorState.current.active && meteorTimer.current <= 0) {
      const m = meteorState.current;
      m.active = true;
      m.x = (Math.random() - 0.5) * 25;
      m.y = 8 + Math.random() * 6;
      m.z = -5 - Math.random() * 5;
      const angle = Math.PI * 0.7 + Math.random() * 0.4;
      const speed = 12 + Math.random() * 8;
      m.vx = Math.cos(angle) * speed;
      m.vy = -Math.sin(angle) * speed;
      m.life = 0;
      m.maxLife = 1.2 + Math.random() * 0.8;
      meteorTimer.current = 5 + Math.random() * 10;
    }

    if (meteorState.current.active && meteorRef.current) {
      const m = meteorState.current;
      m.life += dt;
      if (m.life >= m.maxLife) {
        m.active = false;
        meteorRef.current.visible = false;
      } else {
        meteorRef.current.visible = true;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        const arr = meteorRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < 20; i++) {
          const t = i / 20;
          arr[i * 3] = m.x - m.vx * t * 0.08;
          arr[i * 3 + 1] = m.y - m.vy * t * 0.08;
          arr[i * 3 + 2] = m.z;
        }
        meteorRef.current.geometry.attributes.position.needsUpdate = true;
        const mat = meteorRef.current.material as THREE.PointsMaterial;
        mat.opacity = Math.sin((m.life / m.maxLife) * Math.PI);
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* 背景星场 */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[bgStars.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[bgStars.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[bgStars.sizes, 1]} />
          <bufferAttribute attach="attributes-phase" args={[bgStars.phases, 1]} />
          <bufferAttribute attach="attributes-speed" args={[bgStars.speeds, 1]} />
        </bufferGeometry>
        <primitive object={starMaterial} attach="material" />
      </points>

      {/* 银河带 */}
      <points ref={galaxyRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[galaxyStars.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[galaxyStars.colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[galaxyStars.sizes, 1]} />
          <bufferAttribute attach="attributes-phase" args={[galaxyStars.phases, 1]} />
          <bufferAttribute attach="attributes-speed" args={[galaxyStars.speeds, 1]} />
        </bufferGeometry>
        <primitive object={starMaterial} attach="material" />
      </points>

      {/* 银心亮核 */}
      <sprite ref={coreRef} position={[0, 0, -9.5]} scale={[8, 8, 1]}>
        <spriteMaterial map={coreTexture} transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>

      {/* 暗带 */}
      <mesh ref={dustRef} position={[0, -0.8, -9.8]} rotation={[0, 0, galaxyTilt]}>
        <planeGeometry args={[30, 2]} />
        <meshBasicMaterial map={dustTexture} transparent opacity={0.6} depthWrite={false} />
      </mesh>

      {/* 流星 */}
      <points ref={meteorRef} visible={false}>
        <primitive object={meteorGeo} attach="geometry" />
        <pointsMaterial size={0.4} color={0xffffff} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
      </points>
    </group>
  );
};

export default HeroParticles;
