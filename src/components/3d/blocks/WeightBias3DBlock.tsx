import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WeightBias3DBlockProps {
  weight: number;
  bias: number;
  inputX: number;
}

export const WeightBias3DBlock: React.FC<WeightBias3DBlockProps> = ({
  weight,
  bias,
  inputX,
}) => {
  const beamRef = useRef<THREE.Mesh>(null);
  const platformRef = useRef<THREE.Group>(null);

  const linearSum = weight * inputX + bias;
  const beamRadius = Math.max(0.1, 0.3 * Math.abs(weight));
  const platformY = bias * 1.2;

  useFrame((_, delta) => {
    if (beamRef.current) {
      beamRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Input Source Sphere (x) */}
      <group position={[-5, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={0.3} />
        </mesh>
        {/* Label */}
        <mesh position={[0, -1.3, 0]}>
          <boxGeometry args={[1.5, 0.4, 0.1]} />
          <meshBasicMaterial color="#334155" />
        </mesh>
      </group>

      {/* 2. Weight Multiplier Laser Beam (W * x) */}
      <mesh ref={beamRef} position={[-2.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[beamRadius, beamRadius, 4.2, 32]} />
        <meshStandardMaterial
          color={weight >= 0 ? '#F59E0B' : '#F43F5E'}
          emissive={weight >= 0 ? '#F59E0B' : '#F43F5E'}
          emissiveIntensity={0.5}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* 3. Bias Elevator Platform (b) */}
      <group ref={platformRef} position={[0, platformY, 0]}>
        {/* Elevator Stage */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[1.8, 1.8, 0.4, 32]} />
          <meshStandardMaterial color="#06B6D4" roughness={0.2} metalness={0.5} />
        </mesh>

        {/* Support Hydraulic Piston Column */}
        <mesh position={[0, -platformY / 2 - 0.2, 0]}>
          <cylinderGeometry args={[0.3, 0.3, Math.max(0.1, Math.abs(platformY)), 16]} />
          <meshStandardMaterial color="#64748B" metalness={0.8} />
        </mesh>
      </group>

      {/* 4. Output Receiver Cylinder (y = W*x + b) */}
      <group position={[4.5, platformY, 0]}>
        <mesh>
          <cylinderGeometry args={[1.2, 1.2, 2.2, 32]} />
          <meshStandardMaterial color="#10B981" roughness={0.3} />
        </mesh>
      </group>

      {/* Connection Beam from Elevator to Receiver */}
      <mesh position={[2.25, platformY, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 3.8, 16]} />
        <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.4} />
      </mesh>

      {/* Base Reference Grid Floor */}
      <gridHelper args={[20, 20, '#D6CEBE', '#E5DFD3']} position={[0, -4, 0]} />
    </group>
  );
};
