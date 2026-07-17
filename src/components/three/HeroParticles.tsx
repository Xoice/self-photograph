import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const HeroParticles = () => {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);

  const count = useMemo(() => {
    if (typeof window === 'undefined') return 1500;
    const w = window.innerWidth;
    if (w < 768) return 800;
    if (w < 1200) return 1200;
    return 1500;
  }, []);

  // 原始位置 + 位移缓冲，用于鼠标推开粒子
  const { positions, basePositions, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const basePositions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 60;
      positions[i3 + 1] = (Math.random() - 0.5) * 60;
      positions[i3 + 2] = (Math.random() - 0.5) * 60;

      if (i > count / 2) {
        const radius = 10 + Math.random() * 15;
        const theta = Math.random() * Math.PI * 2;
        const phi = (Math.random() - 0.5) * Math.PI * 0.5;

        positions[i3] = radius * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi);
        positions[i3 + 2] = radius * Math.sin(theta);
      }

      basePositions.set([positions[i3], positions[i3 + 1], positions[i3 + 2]], i3);
      sizes[i] = Math.random() * 2;
    }
    return { positions, basePositions, sizes };
  }, [count]);

  // 鼠标在 R3F 坐标系(-1..1)里展开到世界空间的推力原点
  const mouseWorld = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state) => {
    const { pointer } = state;

    // pointer 归一化 -> 世界坐标，z 固定在镜头前方
    const targetMouseX = pointer.x * 30;
    const targetMouseY = pointer.y * 20;
    mouseWorld.current.x += (targetMouseX - mouseWorld.current.x) * 0.08;
    mouseWorld.current.y += (targetMouseY - mouseWorld.current.y) * 0.08;

    if (pointsRef.current) {
      const geom = pointsRef.current.geometry;
      const posAttr = geom.attributes.position;
      const arr = posAttr.array as Float32Array;

      const mx = mouseWorld.current.x;
      const my = mouseWorld.current.y;
      // 推力半径，越大影响范围越广
      const radius = 8;
      const radius2 = radius * radius;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const bx = basePositions[i3];
        const by = basePositions[i3 + 1];
        const bz = basePositions[i3 + 2];

        const dx = bx - mx;
        const dy = by - my;
        const dist2 = dx * dx + dy * dy;

        let ox = bx;
        let oy = by;

        if (dist2 < radius2) {
          const dist = Math.sqrt(dist2) || 0.0001;
          const force = (1 - dist / radius);
          const push = force * force * radius * 0.6;
          ox = bx + (dx / dist) * push;
          oy = by + (dy / dist) * push;
        }

        // 缓动回归，让粒子被推开后有回弹
        arr[i3] += (ox - arr[i3]) * 0.15;
        arr[i3 + 1] += (oy - arr[i3 + 1]) * 0.15;
        // z 轻微呼吸，避免完全死板
        arr[i3 + 2] = bz + Math.sin(state.clock.elapsedTime * 0.5 + i * 0.1) * 0.5;
      }
      posAttr.needsUpdate = true;

      pointsRef.current.rotation.y += 0.0005;
      pointsRef.current.rotation.x += 0.0003;
    }

    if (groupRef.current) {
      const targetRotationX = pointer.y * 0.15;
      const targetRotationY = pointer.x * 0.15;
      groupRef.current.rotation.x += 0.04 * (targetRotationX - groupRef.current.rotation.x);
      groupRef.current.rotation.y += 0.04 * (targetRotationY - groupRef.current.rotation.y);
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            args={[sizes, 1]}
            count={sizes.length}
            array={sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.25}
          color="#CCFF00"
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

export default HeroParticles;
