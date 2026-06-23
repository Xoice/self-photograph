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

  const { positions, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
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

      sizes[i] = Math.random() * 2;
    }
    return { positions, sizes };
  }, [count]);

  useFrame((state) => {
    const { pointer } = state;

    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001;
      pointsRef.current.rotation.x += 0.0005;
    }

    if (groupRef.current) {
      const targetRotationX = pointer.y * 0.2;
      const targetRotationY = pointer.x * 0.2;

      groupRef.current.rotation.x += 0.05 * (targetRotationX - groupRef.current.rotation.x);
      groupRef.current.rotation.y += 0.05 * (targetRotationY - groupRef.current.rotation.y);
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
          size={0.2}
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
