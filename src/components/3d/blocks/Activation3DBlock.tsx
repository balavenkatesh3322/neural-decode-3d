import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Activation3DBlockProps {
  inputVal: number;
  funcType: 'relu' | 'sigmoid' | 'gelu' | 'silu';
}

export const Activation3DBlock: React.FC<Activation3DBlockProps> = ({
  inputVal,
  funcType,
}) => {
  const gateLeftRef = useRef<THREE.Mesh>(null);
  const gateRightRef = useRef<THREE.Mesh>(null);

  // Calculate output activation
  const getOutput = (x: number) => {
    switch (funcType) {
      case 'relu':
        return Math.max(0, x);
      case 'sigmoid':
        return 1 / (1 + Math.exp(-x));
      case 'silu':
        return x / (1 + Math.exp(-x));
      default:
        return Math.max(0, x);
    }
  };

  const outputVal = getOutput(inputVal);
  // Gate aperture opening (0 = shut, 1 = fully open)
  const aperture = Math.min(1.0, Math.max(0.0, outputVal / 2.0));
  const gateOffset = aperture * 1.5;

  useFrame((_, delta) => {
    if (gateLeftRef.current && gateRightRef.current) {
      gateLeftRef.current.position.x = -0.9 - gateOffset;
      gateRightRef.current.position.x = 0.9 + gateOffset;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Input Laser Beam */}
      <mesh position={[-4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 4, 16]} />
        <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={0.6} />
      </mesh>

      {/* 3D Mechanical Shutter Gate Frame */}
      <group position={[0, 0, 0]}>
        {/* Outer Ring Chassis */}
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[2.5, 0.3, 16, 48]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Left Shutter Blade */}
        <mesh ref={gateLeftRef} position={[-0.9, 0, 0]}>
          <boxGeometry args={[1.5, 3.8, 0.2]} />
          <meshStandardMaterial color="#F43F5E" metalness={0.7} />
        </mesh>

        {/* Right Shutter Blade */}
        <mesh ref={gateRightRef} position={[0.9, 0, 0]}>
          <boxGeometry args={[1.5, 3.8, 0.2]} />
          <meshStandardMaterial color="#F43F5E" metalness={0.7} />
        </mesh>
      </group>

      {/* Output Projected Beam (Visible only when gate opens!) */}
      {outputVal > 0.05 && (
        <mesh position={[4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15 + aperture * 0.25, 0.15 + aperture * 0.25, 4, 16]} />
          <meshStandardMaterial
            color="#10B981"
            emissive="#10B981"
            emissiveIntensity={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>
      )}

      {/* Base Grid */}
      <gridHelper args={[20, 20, '#D6CEBE', '#E5DFD3']} position={[0, -4, 0]} />
    </group>
  );
};
