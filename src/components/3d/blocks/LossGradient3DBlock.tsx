import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const LossGradient3DBlock: React.FC = () => {
  const ballRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef<number>(0);

  useFrame((_, delta) => {
    if (ballRef.current) {
      progressRef.current += delta * 0.8;
      if (progressRef.current > Math.PI * 2) progressRef.current = 0;

      // Animate ball rolling down 3D parabolic loss bowl: z = x^2 + y^2
      const radius = Math.cos(progressRef.current) * 3;
      const angle = progressRef.current * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (x * x + z * z) * 0.15 - 2;

      ballRef.current.position.set(x, y + 0.4, z);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 3D Parabolic Loss Bowl Surface Mesh */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[5, 0.2, 3, 32, 16, true]} />
        <meshStandardMaterial
          color="#8B5CF6"
          wireframe
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Global Minimum Target Core Ring */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.8, 32]} />
        <meshBasicMaterial color="#10B981" side={THREE.DoubleSide} />
      </mesh>

      {/* Rolling Gradient Sphere (Optimizer Parameter Ball) */}
      <mesh ref={ballRef} position={[3, 1, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.8} />
      </mesh>

      {/* Base Grid */}
      <gridHelper args={[20, 20, '#D6CEBE', '#E5DFD3']} position={[0, -4, 0]} />
    </group>
  );
};
