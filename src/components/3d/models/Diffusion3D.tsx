import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NodeComponent } from '../../../types/architecture';

interface Model3DProps {
  components: NodeComponent[];
  selectedNodeId?: string;
  hoveredNodeId?: string;
  isIsolated: boolean;
  isWireframe: boolean;
  isCrossSection: boolean;
  isExplodedView?: boolean;
  onSelectNode: (component: NodeComponent) => void;
}

export const Diffusion3D: React.FC<Model3DProps> = ({
  components,
  selectedNodeId,
  hoveredNodeId,
  isIsolated = false,
  isWireframe = false,
  isCrossSection = false,
  isExplodedView = false,
  onSelectNode,
}) => {
  const groupRef = useRef<THREE.Group>(null);

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
      {/* 1. Noisy Latent Tensor z_t (y: -6) */}
      {isVisible('diff-latent-noise') && (
        <group position={[0, -6, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('diff-latent-noise')!); }}>
          <mesh>
            <boxGeometry args={[3.2, 0.5, 3.2]} />
            <meshStandardMaterial {...getMeshStyle('diff-latent-noise', '#F43F5E')} />
          </mesh>
          {Array.from({ length: 9 }).map((_, i) => (
            <mesh key={i} position={[(i % 3 - 1) * 0.9, 0.4, (Math.floor(i / 3) - 1) * 0.9]}>
              <boxGeometry args={[0.2, 0.2, 0.2]} />
              <meshBasicMaterial color="#FB7185" />
            </mesh>
          ))}
        </group>
      )}

      {/* 2. CLIP Text Prompt Conditioner & Conditioning Rays (y: -3.5, x: -5) */}
      {isVisible('diff-text-encoder') && (
        <group position={[-5, -3.5, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('diff-text-encoder')!); }}>
          <mesh>
            <cylinderGeometry args={[1.2, 1.2, 2.2, 32]} />
            <meshStandardMaterial {...getMeshStyle('diff-text-encoder', '#06B6D4')} emissive="#06B6D4" emissiveIntensity={0.4} />
          </mesh>

          {/* TEXT CONDITIONING RAYS shooting into U-Net Cross-Attention Nodes */}
          {!isIsolated && (
            <>
              <line>
                <bufferGeometry
                  attach="geometry"
                  onUpdate={(geo) => {
                    geo.setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(2.8, 0, 0)]);
                  }}
                />
                <lineBasicMaterial attach="material" color="#06B6D4" linewidth={3} />
              </line>
              <line>
                <bufferGeometry
                  attach="geometry"
                  onUpdate={(geo) => {
                    geo.setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(5, 3, 0)]);
                  }}
                />
                <lineBasicMaterial attach="material" color="#06B6D4" linewidth={3} />
              </line>
            </>
          )}
        </group>
      )}

      {/* 3. Contracting U-Net Encoder V-Pyramid (y: -3.5) */}
      {isVisible('diff-encoder-down') && (
        <group position={[0, -3.5, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('diff-encoder-down')!); }}>
          {/* Stage 1 (Wide 64x64) */}
          <mesh position={[-2.2, 0, 0]}>
            <boxGeometry args={[1.6, 2.8, 1.6]} />
            <meshStandardMaterial {...getMeshStyle('diff-encoder-down', '#F59E0B')} />
          </mesh>
          {/* Stage 2 (Medium 32x32) */}
          <mesh position={[0, -0.4, 0]}>
            <boxGeometry args={[1.4, 2.0, 1.4]} />
            <meshStandardMaterial {...getMeshStyle('diff-encoder-down', '#FBBF24')} />
          </mesh>
          {/* Stage 3 (Deep 16x16) */}
          <mesh position={[2.2, -0.8, 0]}>
            <boxGeometry args={[1.2, 1.4, 1.2]} />
            <meshStandardMaterial {...getMeshStyle('diff-encoder-down', '#F59E0B')} />
          </mesh>
        </group>
      )}

      {/* 4. U-Net Bottleneck Self & Cross Attention Core (y: -0.5) */}
      {isVisible('diff-bottleneck') && (
        <group position={[0, -0.5, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('diff-bottleneck')!); }}>
          <mesh>
            <octahedronGeometry args={[2.0, 2]} />
            <meshStandardMaterial {...getMeshStyle('diff-bottleneck', '#8B5CF6')} emissive="#8B5CF6" emissiveIntensity={0.4} />
          </mesh>
        </group>
      )}

      {/* 5. Expanding U-Net Decoder & Skip Connection Bridge Tubes (y: 2.5) */}
      {isVisible('diff-decoder-up') && (
        <group position={[0, 2.5, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('diff-decoder-up')!); }}>
          {/* Stage 3 Up (16x16) */}
          <mesh position={[-2.2, -0.8, 0]}>
            <boxGeometry args={[1.2, 1.4, 1.2]} />
            <meshStandardMaterial {...getMeshStyle('diff-decoder-up', '#10B981')} />
          </mesh>
          {/* Stage 2 Up (32x32) */}
          <mesh position={[0, -0.4, 0]}>
            <boxGeometry args={[1.4, 2.0, 1.4]} />
            <meshStandardMaterial {...getMeshStyle('diff-decoder-up', '#34D399')} />
          </mesh>
          {/* Stage 1 Up (64x64) */}
          <mesh position={[2.2, 0, 0]}>
            <boxGeometry args={[1.6, 2.8, 1.6]} />
            <meshStandardMaterial {...getMeshStyle('diff-decoder-up', '#10B981')} />
          </mesh>

          {/* U-NET SKIP CONNECTION TUBULAR BRIDGES */}
          {!isIsolated && (
            <mesh position={[0, -0.5, 0]}>
              <tubeGeometry
                args={[
                  new THREE.CatmullRomCurve3([
                    new THREE.Vector3(-2.2, -3.5, 0),
                    new THREE.Vector3(0, -0.5, 1.2),
                    new THREE.Vector3(2.2, 2.5, 0),
                  ]),
                  32,
                  0.1,
                  8,
                  false,
                ]}
              />
              <meshStandardMaterial color="#10B981" emissive="#34D399" emissiveIntensity={0.5} />
            </mesh>
          )}
        </group>
      )}

      {/* 6. Predicted Noise Vector Head ε_θ (y: 6) */}
      {isVisible('diff-noise-predict') && (
        <group position={[0, 6, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('diff-noise-predict')!); }}>
          <mesh>
            <cylinderGeometry args={[2.0, 2.0, 1.2, 32]} />
            <meshStandardMaterial {...getMeshStyle('diff-noise-predict', '#3B82F6')} />
          </mesh>
        </group>
      )}
    </group>
  );
};
