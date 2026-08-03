import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { NodeComponent } from '../../../types/architecture';

interface CNN3DProps {
  components: NodeComponent[];
  selectedNodeId?: string;
  hoveredNodeId?: string;
  isIsolated?: boolean;
  isWireframe?: boolean;
  isCrossSection?: boolean;
  isExplodedView?: boolean;
  isModalOpen?: boolean;
  onSelectNode: (component: NodeComponent) => void;
}

export const CNN3D: React.FC<CNN3DProps> = ({
  components,
  selectedNodeId,
  hoveredNodeId,
  isIsolated = false,
  isWireframe = false,
  isCrossSection = false,
  isExplodedView = false,
  isModalOpen = false,
  onSelectNode,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const slidingKernelRef = useRef<THREE.Mesh>(null);

  // Animate the 3D 3x3 Conv Filter sliding across the spatial feature map plane!
  useFrame((state) => {
    if (slidingKernelRef.current) {
      const time = state.clock.getElapsedTime() * 2;
      const posX = Math.sin(time) * 1.2;
      const posZ = Math.cos(time * 0.7) * 1.2;
      slidingKernelRef.current.position.set(posX, -3.5, posZ);
    }
  });

  const getComponent = (id: string) => components.find((c) => c.id === id);

  const isVisible = (id: string) => {
    if (!isIsolated) return true;
    return selectedNodeId === id;
  };

  const getMeshStyle = (id: string, defaultColor: string) => {
    const isSelected = selectedNodeId === id;
    const isHovered = hoveredNodeId === id;

    if (isIsolated) {
      if (isSelected) {
        return {
          color: '#eb7c6b',
          emissive: '#eb7c6b',
          emissiveIntensity: 0.9,
          wireframe: isWireframe,
          transparent: false,
          opacity: 1,
        };
      }
      return {
        color: defaultColor,
        emissive: '#000000',
        emissiveIntensity: 0,
        wireframe: isWireframe,
        transparent: true,
        opacity: 0.05,
      };
    }

    if (isSelected) {
      return {
        color: '#eb7c6b',
        emissive: '#eb7c6b',
        emissiveIntensity: 0.8,
        wireframe: isWireframe,
        transparent: isCrossSection,
        opacity: isCrossSection ? 0.45 : 1,
      };
    }
    if (isHovered) {
      return {
        color: '#06B6D4',
        emissive: '#67E8F9',
        emissiveIntensity: 0.6,
        wireframe: isWireframe,
        transparent: isCrossSection,
        opacity: isCrossSection ? 0.55 : 1,
      };
    }
    return {
      color: defaultColor,
      emissive: '#000000',
      emissiveIntensity: 0,
      wireframe: isWireframe,
      transparent: isCrossSection,
      opacity: isCrossSection ? 0.35 : 1,
    };
  };

  return (
    <group ref={groupRef}>
      {/* 0. Real-World 3D Input RGB Photo Billboard (y: -7.8) */}
      {!isModalOpen && (
        <group position={[0, -7.8, 0]}>
          <Html position={[0, 0, 0]} center distanceFactor={15}>
            <div className="px-3 py-1.5 rounded-xl bg-stone-900/95 text-amber-400 font-mono text-xs border border-amber-500/50 shadow-2xl flex items-center gap-2 whitespace-nowrap">
              <span className="text-[9px] font-bold text-blue-300 uppercase px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800">IMAGE INPUT</span>
              <span className="font-serif italic text-white font-bold">Golden Retriever (224 × 224 RGB)</span>
            </div>
          </Html>
        </group>
      )}

      {/* 1. RGB Pixel Grid Input (y: -6) */}
      {isVisible('cnn-input-image') && (
        <group position={[0, -6, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('cnn-input-image')!); }}>
          <mesh rotation={[-Math.PI / 3, 0, 0]}>
            <planeGeometry args={[4.5, 4.5]} />
            <meshStandardMaterial {...getMeshStyle('cnn-input-image', '#3B82F6')} side={THREE.DoubleSide} />
          </mesh>
          <gridHelper args={[4.5, 12, '#60A5FA', '#93C5FD']} position={[0, -5.99, 0]} rotation={[-Math.PI / 3, 0, 0]} />
        </group>
      )}

      {/* 2. Conv1 7x7 Stem Slices & Sliding 3x3 Filter Cube (y: -3.5) */}
      {isVisible('cnn-conv1-stem') && (
        <group onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('cnn-conv1-stem')!); }}>
          {/* Stacked Spatial Feature Map Slices */}
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh key={i} position={[0, -3.5, (i - 2) * 0.45]} rotation={[-Math.PI / 4, 0, 0]}>
              <boxGeometry args={[3.2, 3.2, 0.08]} />
              <meshStandardMaterial {...getMeshStyle('cnn-conv1-stem', '#F59E0B')} opacity={0.65} />
            </mesh>
          ))}

          {/* SLIDING 3D CONVOLUTION FILTER KERNEL CUBE (Real-time sliding motion!) */}
          {!isIsolated && (
            <mesh ref={slidingKernelRef} position={[0, -3.5, 0]}>
              <boxGeometry args={[0.7, 0.7, 0.7]} />
              <meshStandardMaterial color="#F59E0B" emissive="#FBBF24" emissiveIntensity={0.8} />
            </mesh>
          )}
        </group>
      )}

      {/* 3. Bottleneck Block 1x1 -> 3x3 -> 1x1 (y: -1) */}
      {isVisible('cnn-bottleneck-block') && (
        <group position={[0, -1, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('cnn-bottleneck-block')!); }}>
          {/* 1x1 Compression Slab */}
          <mesh position={[-1.8, 0, 0]}>
            <boxGeometry args={[1.2, 2.2, 2.2]} />
            <meshStandardMaterial {...getMeshStyle('cnn-bottleneck-block', '#8B5CF6')} />
          </mesh>
          {/* 3x3 Texture Conv Slab */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.6, 2.8, 2.8]} />
            <meshStandardMaterial {...getMeshStyle('cnn-bottleneck-block', '#A855F7')} />
          </mesh>
          {/* 1x1 Expansion Slab */}
          <mesh position={[1.8, 0, 0]}>
            <boxGeometry args={[1.2, 3.5, 3.5]} />
            <meshStandardMaterial {...getMeshStyle('cnn-bottleneck-block', '#8B5CF6')} />
          </mesh>
        </group>
      )}

      {/* 4. ResNet Identity Skip Tubular Arc Bridge (y: 1.5) */}
      {isVisible('cnn-residual-skip') && (
        <group position={[0, 1.5, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('cnn-residual-skip')!); }}>
          {/* Addition Torus Ring F(x) + x */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.2, 0.25, 16, 48]} />
            <meshStandardMaterial {...getMeshStyle('cnn-residual-skip', '#10B981')} />
          </mesh>

          {/* GLOWING 3D TUBULAR RESIDUAL SKIP ARC BRIDGE (Jumping over bottleneck layers!) */}
          {!isIsolated && (
            <mesh position={[-3.2, -2.5, 0]}>
              <tubeGeometry
                args={[
                  new THREE.CatmullRomCurve3([
                    new THREE.Vector3(0, -2.5, 0),
                    new THREE.Vector3(-2.8, 0, 0),
                    new THREE.Vector3(0, 2.5, 0),
                  ]),
                  32,
                  0.12,
                  8,
                  false,
                ]}
              />
              <meshStandardMaterial color="#10B981" emissive="#34D399" emissiveIntensity={0.8} />
            </mesh>
          )}
        </group>
      )}

      {/* 5. Global Average Pooling (y: 4) */}
      {isVisible('cnn-global-pool') && (
        <group position={[0, 4, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('cnn-global-pool')!); }}>
          <mesh>
            <cylinderGeometry args={[1.2, 1.2, 1.8, 32]} />
            <meshStandardMaterial {...getMeshStyle('cnn-global-pool', '#F43F5E')} />
          </mesh>
        </group>
      )}

      {/* 6. Softmax FC Classifier (y: 6.5) */}
      {isVisible('cnn-fc-classifier') && (
        <group position={[0, 6.5, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('cnn-fc-classifier')!); }}>
          <mesh>
            <cylinderGeometry args={[2.2, 0.5, 1.5, 32]} />
            <meshStandardMaterial {...getMeshStyle('cnn-fc-classifier', '#06B6D4')} />
          </mesh>
        </group>
      )}
    </group>
  );
};
