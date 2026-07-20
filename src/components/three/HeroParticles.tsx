import { useRef, useMemo, useEffect } from 'react';
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
  new THREE.Color(0xff66aa), // 氢α发射线（M8/M16 星云，长曝光呈粉红色）
];

/**
 * 拱桥银河参数。
 * 银河层位于 z=-10，相机 z=30 / fov=75 → 可视半高 ≈ 30.7。
 * 圆心沉在画面下方，星点沿圆弧分布：左下端 → 拱顶 → 右下端。
 */
const ARCH_CENTER_Y = -22; // 弧圆心（画面下方）
const ARCH_RADIUS = 48; // 拱顶 y ≈ 26，距画面顶部约 15%
const ARCH_START = THREE.MathUtils.degToRad(-20); // 右端沉入地平线以下
const ARCH_END = THREE.MathUtils.degToRad(200); // 左端沉入地平线以下
const ARCH_SPAN = ARCH_END - ARCH_START;
const CORE_ANGLE = THREE.MathUtils.degToRad(160); // 银心位于弧的左下段
const CORE_U = (CORE_ANGLE - ARCH_START) / ARCH_SPAN; // 银心在暗带纹理上的 u 坐标
const ARCH_MID = (ARCH_START + ARCH_END) / 2; // 拱顶角度

interface StarData {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  phases: Float32Array;
  speeds: Float32Array;
}

const HeroParticles = () => {
  const groupRef = useRef<THREE.Group>(null);
  const archRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Sprite>(null);
  const meteorRef = useRef<THREE.Points>(null);

  const meteorState = useRef({ active: false, x: 0, y: 0, z: 0, vx: 0, vy: 0, life: 0, maxLife: 0 });
  // eslint-disable-next-line react-hooks/purity -- 首次流星延迟随机一次
  const meteorTimer = useRef(3 + Math.random() * 7);

  const isMobile = useMemo(() => typeof window !== 'undefined' && window.innerWidth < 768, []);
  const bgCount = useMemo(() => (isMobile ? 1200 : 2500), [isMobile]);
  const galaxyCount = useMemo(() => (isMobile ? 650 : 1600), [isMobile]);

  // 背景星场数据
  /* eslint-disable react-hooks/purity -- 星点位置/颜色/大小用 Math.random 一次性生成，仅在挂载或粒度变化时计算 */
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
      const c = cr < 0.55 ? STAR_COLORS[0] : cr < 0.9 ? STAR_COLORS[1] : STAR_COLORS[2];
      colors[i3] = c.r; colors[i3 + 1] = c.g; colors[i3 + 2] = c.b;
      sizes[i] = Math.random() < 0.92 ? 0.3 + Math.random() * 0.4 : 0.8 + Math.random() * 0.8;
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.3 + Math.random() * 2;
    }
    return { positions, colors, sizes, phases, speeds };
  }, [bgCount]);
  /* eslint-enable react-hooks/purity */

  // 银河拱桥数据（局部坐标：圆心在原点，由 archRef 平移到 ARCH_CENTER_Y）
  /* eslint-disable react-hooks/purity -- 银河拱桥星点分布同样一次性随机生成 */
  const galaxyStars = useMemo<StarData>(() => {
    const positions = new Float32Array(galaxyCount * 3);
    const colors = new Float32Array(galaxyCount * 3);
    const sizes = new Float32Array(galaxyCount);
    const phases = new Float32Array(galaxyCount);
    const speeds = new Float32Array(galaxyCount);

    for (let i = 0; i < galaxyCount; i++) {
      const i3 = i * 3;
      // 25% 星点聚集在银心附近（降低左偏置），其余沿弧均匀采样 + 切向微扰
      const theta = THREE.MathUtils.clamp(
        (Math.random() < 0.25
          ? gaussian(CORE_ANGLE, 0.24)
          : ARCH_START + Math.random() * ARCH_SPAN) + gaussian(0, 1.2 / ARCH_RADIUS),
        ARCH_START,
        ARCH_END,
      );
      const dCore = Math.abs(theta - CORE_ANGLE);
      const coreBoost = Math.exp(-(dCore * dCore) / (2 * 0.25 * 0.25));
      // 拱顶亮度加成：让弧线最高点更醒目，增强"拱桥"辨识度
      const dMid = Math.abs(theta - ARCH_MID);
      const peakBoost = Math.exp(-(dMid * dMid) / (2 * 0.4 * 0.4));
      // 沿弧线归一化进度：0=右端, 1=左端
      const archProgress = (theta - ARCH_START) / ARCH_SPAN;
      // 沿法线方向高斯偏移形成带厚，银心 + 暖金区更厚
      const goldWidthBoost = (archProgress > 0.20 && archProgress <= 0.36)
        ? 1.8 * Math.max(0, 1.0 - Math.abs(archProgress - 0.25) / 0.10)
        : 0;
      const r = ARCH_RADIUS + gaussian(0, 2.2 + 1.6 * coreBoost + goldWidthBoost);
      positions[i3] = r * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(theta);
      positions[i3 + 2] = -10 + gaussian(0, 1.2);

      // 颜色分区（基于真实银河拱桥特征）：
      // 粉红区 (0.52-1.0, theta 95°-200°)：拱顶偏左到左端，Hα 发射主导
      // 过渡区 (0.36-0.52, theta 60°-95°)：拱顶附近，蓝白 + 粉红残留
      // 暖金区 (0.20-0.36, theta 25°-60°)：暖金集中，M6/M7 星团处峰值
      // 银尾区 (0-0.20, theta -20°-25°)：暗金渐消
      let c: THREE.Color;
      if (archProgress > 0.52) {
        // 粉红区：银心附近（archProgress ~0.82）最浓
        const pinkDist = Math.abs(archProgress - 0.82);
        const pinkIntensity = Math.exp(-(pinkDist * pinkDist) / (2 * 0.18 * 0.18));
        const haChance = 0.25 + 0.35 * pinkIntensity;
        if (Math.random() < haChance) {
          c = STAR_COLORS[3].clone().lerp(STAR_COLORS[0], Math.random() * 0.3);
        } else {
          c = STAR_COLORS[0].clone().lerp(STAR_COLORS[3], 0.15 * pinkIntensity);
        }
      } else if (archProgress > 0.36) {
        // 过渡区：蓝白为主 + 15% 粉红残留
        c = STAR_COLORS[1].clone().lerp(STAR_COLORS[0], (archProgress - 0.36) / 0.16);
        if (Math.random() < 0.15) {
          c.lerp(STAR_COLORS[3], 0.2);
        }
      } else if (archProgress > 0.20) {
        // 暖金集中区：M6/M7 星团（archProgress ~0.25）处最亮
        const goldT = Math.max(0, 1.0 - Math.abs(archProgress - 0.25) / 0.10);
        c = STAR_COLORS[0].clone().lerp(STAR_COLORS[2], goldT);
      } else {
        // 银尾消散：暗金渐消
        const fadeT = archProgress / 0.20;
        c = STAR_COLORS[1].clone().lerp(STAR_COLORS[2], fadeT * 0.4);
      }
      colors[i3] = c.r; colors[i3 + 1] = c.g; colors[i3 + 2] = c.b;
      // 银心 + 拱顶 + M6/M7 星团 size 加成
      const m6m7Boost = Math.exp(-Math.pow((archProgress - 0.25) / 0.05, 2)) * 1.0;
      sizes[i] = (0.4 + Math.random() * 0.6) * (1 + 0.8 * coreBoost + 0.6 * peakBoost + m6m7Boost);
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.5 + Math.random() * 1.5;
    }
    return { positions, colors, sizes, phases, speeds };
  }, [galaxyCount]);
  /* eslint-enable react-hooks/purity */

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
          float boost = 1.0 - smoothstep(0.0, 15.0, dist);
          twinkle = twinkle * (1.0 - boost * 0.4) + boost * 0.8;
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

  // 银河层独立材质实例：uMouse 需换算到拱桥局部坐标，与背景星场分开
  const galaxyMaterial = useMemo(() => starMaterial.clone(), [starMaterial]);

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

  // 暗带纹理：带脊最暗、两侧渐隐，且沿弧长方向银心处最浓、两端淡出
  const dustTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.5, 'rgba(5, 5, 5, 0.92)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 128);
    // 沿弧长（u 方向）调制不透明度
    ctx.globalCompositeOperation = 'destination-in';
    const mask = ctx.createLinearGradient(0, 0, 512, 0);
    mask.addColorStop(0, 'rgba(0, 0, 0, 0.15)');
    mask.addColorStop(Math.max(CORE_U - 0.3, 0.01), 'rgba(0, 0, 0, 0.55)');
    mask.addColorStop(CORE_U, 'rgba(0, 0, 0, 1)');
    mask.addColorStop(Math.min(CORE_U + 0.3, 0.99), 'rgba(0, 0, 0, 0.55)');
    mask.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
    ctx.fillStyle = mask;
    ctx.fillRect(0, 0, 512, 128);
    return new THREE.CanvasTexture(canvas);
  }, []);

  // 暗带几何：沿弧线弯曲的扁平 ribbon，贴在亮带内侧（拱桥局部坐标）
  const dustGeo = useMemo(() => {
    const SEGS = 72;
    const R_DUST = ARCH_RADIUS - 1.5;
    const HALF_W = 2.0;
    const positions = new Float32Array((SEGS + 1) * 2 * 3);
    const uvs = new Float32Array((SEGS + 1) * 2 * 2);
    const indices: number[] = [];

    for (let i = 0; i <= SEGS; i++) {
      const theta = ARCH_START + (i / SEGS) * ARCH_SPAN;
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);
      positions.set([(R_DUST + HALF_W) * cos, (R_DUST + HALF_W) * sin, -9.8], i * 6);
      positions.set([(R_DUST - HALF_W) * cos, (R_DUST - HALF_W) * sin, -9.8], i * 6 + 3);
      uvs.set([i / SEGS, 1], i * 4);
      uvs.set([i / SEGS, 0], i * 4 + 2);
      if (i < SEGS) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    return geo;
  }, []);

  // 流星几何
  const meteorGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(30 * 3), 3));
    return geo;
  }, []);

  // 组件卸载时释放 GPU 资源，避免页面切换导致显存泄漏
  useEffect(() => {
    return () => {
      starMaterial.dispose();
      galaxyMaterial.dispose();
      coreTexture.dispose();
      dustTexture.dispose();
      dustGeo.dispose();
      meteorGeo.dispose();
    };
  }, [starMaterial, galaxyMaterial, coreTexture, dustTexture, dustGeo, meteorGeo]);

  const mouseWorld = useRef(new THREE.Vector3(999, 999, 0));

  useFrame((state) => {
    const { pointer } = state;
    const time = state.clock.elapsedTime;
    const dt = state.clock.getDelta();

    // 鼠标 -> 世界坐标
    mouseWorld.current.x += (pointer.x * 25 - mouseWorld.current.x) * 0.06;
    mouseWorld.current.y += (pointer.y * 18 - mouseWorld.current.y) * 0.06;
    // eslint-disable-next-line react-hooks/immutability -- R3F 每帧更新 ShaderMaterial uniform，属标准做法
    starMaterial.uniforms.uTime.value = time;
    starMaterial.uniforms.uMouse.value.copy(mouseWorld.current);
    // eslint-disable-next-line react-hooks/immutability -- 同上，银河层 uniform 同步
    galaxyMaterial.uniforms.uTime.value = time;

    // 拱桥绕自身圆心极缓慢摇摆（延时摄影感）
    let archRot = 0;
    if (archRef.current) {
      archRot = Math.sin(time * 0.03) * 0.05;
      archRef.current.rotation.z = archRot;
    }
    // 鼠标换算到拱桥局部坐标，保持星点靠近鼠标时的增亮效果
    const mx = mouseWorld.current.x;
    const my = mouseWorld.current.y - ARCH_CENTER_Y;
    const cosR = Math.cos(-archRot);
    const sinR = Math.sin(-archRot);
    galaxyMaterial.uniforms.uMouse.value.set(mx * cosR - my * sinR, mx * sinR + my * cosR, 0);

    // 银心呼吸
    if (coreRef.current) {
      (coreRef.current.material as THREE.SpriteMaterial).opacity = 0.62 + Math.sin(time * 0.6) * 0.08;
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
      meteorTimer.current = 3 + Math.random() * 5;
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
        for (let i = 0; i < 30; i++) {
          const t = i / 30;
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

      {/* 银河拱桥：星带 + 银心 + 暗带，整体绕圆心摇摆 */}
      <group ref={archRef} position={[0, ARCH_CENTER_Y, 0]}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[galaxyStars.positions, 3]} />
            <bufferAttribute attach="attributes-color" args={[galaxyStars.colors, 3]} />
            <bufferAttribute attach="attributes-size" args={[galaxyStars.sizes, 1]} />
            <bufferAttribute attach="attributes-phase" args={[galaxyStars.phases, 1]} />
            <bufferAttribute attach="attributes-speed" args={[galaxyStars.speeds, 1]} />
          </bufferGeometry>
          <primitive object={galaxyMaterial} attach="material" />
        </points>

        {/* 银心亮核（弧左下段） */}
        <sprite
          ref={coreRef}
          position={[ARCH_RADIUS * Math.cos(CORE_ANGLE), ARCH_RADIUS * Math.sin(CORE_ANGLE), -9.5]}
          scale={[13, 13, 1]}
        >
          <spriteMaterial map={coreTexture} transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>

        {/* 暗带（沿弧弯曲） */}
        <mesh geometry={dustGeo}>
          <meshBasicMaterial map={dustTexture} transparent opacity={0.9} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 流星 */}
      <points ref={meteorRef} visible={false}>
        <primitive object={meteorGeo} attach="geometry" />
        <pointsMaterial size={0.8} color={0xffffff} transparent opacity={1.0} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
      </points>
    </group>
  );
};

export default HeroParticles;
