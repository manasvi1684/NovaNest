import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random';

function FloatingParticles({ count = 1000 }) {
  const ref = useRef();
  const sphere = useMemo(() => random.inSphere(new Float32Array(count * 3), { radius: 1.5 }), [count]);

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
  });

  return (
    <group ref={ref}>
      <Points
        positions={sphere}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.02}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

function AnimatedSphere() {
  const meshRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(time / 2) * 0.3;
    meshRef.current.rotation.y = Math.sin(time / 3) * 0.3;
    meshRef.current.position.y = Math.sin(time) * 0.1;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial
        color="#6366f1"
        wireframe
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

const ThreeDBackground = () => {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 2] }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <FloatingParticles count={500} />
        <AnimatedSphere />
      </Canvas>
    </div>
  );
};

export default ThreeDBackground; 