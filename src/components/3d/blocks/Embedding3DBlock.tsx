import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export const Embedding3DBlock: React.FC = () => {
  const galaxyRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y += delta * 0.15;
    }
  });

  const wordNodes = [
    { word: 'King', pos: [-3, 2, 0] as [number, number, number], color: '#F59E0B' },
    { word: 'Man', pos: [-3, -2, 0] as [number, number, number], color: '#06B6D4' },
    { word: 'Woman', pos: [3, -2, 0] as [number, number, number], color: '#8B5CF6' },
    { word: 'Queen', pos: [3, 2, 0] as [number, number, number], color: '#10B981' },
    { word: 'Apple', pos: [-5, -1, -4] as [number, number, number], color: '#F43F5E' },
    { word: 'Banana', pos: [-4, -2, -5] as [number, number, number], color: '#F43F5E' },
  ];

  return (
    <group ref={galaxyRef} position={[0, 0, 0]}>
      {/* Word Vector Spheres */}
      {wordNodes.map((node, idx) => (
        <group key={idx} position={node.pos}>
          <mesh>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={0.5} />
          </mesh>
          <Html distanceFactor={15} center>
            <div
              className="px-2 py-1 rounded bg-stone-900/90 text-white font-mono font-bold text-xs border border-stone-700 shadow-md whitespace-nowrap"
              style={{ color: node.color }}
            >
              "{node.word}"
            </div>
          </Html>
        </group>
      ))}

      {/* Vector Arithmetic Arrows (King -> Man -> Woman -> Queen) */}
      <line>
        <bufferGeometry
          attach="geometry"
          onUpdate={(geo) => {
            geo.setFromPoints([new THREE.Vector3(-3, 2, 0), new THREE.Vector3(-3, -2, 0)]);
          }}
        />
        <lineBasicMaterial attach="material" color="#F59E0B" linewidth={2} />
      </line>

      <line>
        <bufferGeometry
          attach="geometry"
          onUpdate={(geo) => {
            geo.setFromPoints([new THREE.Vector3(-3, -2, 0), new THREE.Vector3(3, -2, 0)]);
          }}
        />
        <lineBasicMaterial attach="material" color="#8B5CF6" linewidth={2} />
      </line>

      <line>
        <bufferGeometry
          attach="geometry"
          onUpdate={(geo) => {
            geo.setFromPoints([new THREE.Vector3(3, -2, 0), new THREE.Vector3(3, 2, 0)]);
          }}
        />
        <lineBasicMaterial attach="material" color="#10B981" linewidth={2} />
      </line>

      {/* Base Grid */}
      <gridHelper args={[20, 20, '#D6CEBE', '#E5DFD3']} position={[0, -4, 0]} />
    </group>
  );
};
