import { lazy, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

const HeroParticles = lazy(() => import('./HeroParticles'));

interface HeroCanvasProps {
  visible: boolean;
}

/**
 * 整个 Three.js 依赖链（three + @react-three/fiber）集中在这里，
 * 由 HeroSection 通过 React.lazy 延迟加载，不阻塞首屏文字渲染。
 * visible=false 时停止 R3F 渲染循环以省电。
 */
const HeroCanvas = ({ visible }: HeroCanvasProps) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 30], fov: 75 }}
      frameloop={visible ? 'always' : 'never'}
    >
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 10, 50]} />
      <Suspense fallback={null}>
        <HeroParticles />
      </Suspense>
    </Canvas>
  );
};

export default HeroCanvas;
