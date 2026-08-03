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

export const Mamba3D: React.FC<Model3DProps> = ({
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
  const memoryHelixRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (memoryHelixRef.current) {
      memoryHelixRef.current.rotation.y += delta * 0.9;
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
      {/* 1. Input Linear Expansion & 1D Conv (y: -6) */}
      {isVisible('mb-input-proj') && (
        <group position={[0, -6, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('mb-input-proj')!); }}>
          <mesh position={[-1.2, 0, 0]}>
            <cylinderGeometry args={[0.9, 0.9, 1.6, 16]} />
            <meshStandardMaterial {...getMeshStyle('mb-input-proj', '#06B6D4')} />
          </mesh>
          <mesh position={[1.2, 0, 0]}>
            <cylinderGeometry args={[0.9, 0.9, 1.6, 16]} />
            <meshStandardMaterial {...getMeshStyle('mb-input-proj', '#06B6D4')} />
          </mesh>
        </group>
      )}

      {/* 2. Selective Parameter Generator B(x), C(x), Δ(x) (y: -3.5) */}
      {isVisible('mb-selective-params') && (
        <group position={[0, -3.5, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('mb-selective-params')!); }}>
          <mesh position={[-1.8, 0, 0]}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial {...getMeshStyle('mb-selective-params', '#F59E0B')} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial {...getMeshStyle('mb-selective-params', '#FBBF24')} />
          </mesh>
          <mesh position={[1.8, 0, 0]}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial {...getMeshStyle('mb-selective-params', '#F59E0B')} />
          </mesh>
        </group>
      )}

      {/* 3. ZOH Discretization Matrix (y: -1) */}
      {isVisible('mb-ssm-discretize') && (
        <group position={[0, -1, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('mb-ssm-discretize')!); }}>
          <mesh>
            <boxGeometry args={[3.8, 1.8, 1.8]} />
            <meshStandardMaterial {...getMeshStyle('mb-ssm-discretize', '#8B5CF6')} />
          </mesh>
        </group>
      )}

      {/* 4. Parallel Scan Recurrent Memory Double-Helix Cylinder (y: 1.5) */}
      {isVisible('mb-parallel-scan') && (
        <group position={[0, 1.5, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('mb-parallel-scan')!); }}>
          {/* Main Glass Memory Cylinder */}
          <mesh>
            <cylinderGeometry args={[1.8, 1.8, 2.8, 32]} />
            <meshStandardMaterial {...getMeshStyle('mb-parallel-scan', '#10B981')} opacity={0.5} />
          </mesh>

          {/* ROTATING 3D DOUBLE-HELIX MEMORY TRAJECTORY (h_t = A_bar * h_t-1 + B_bar * x_t) */}
          <group ref={memoryHelixRef}>
            {Array.from({ length: 16 }).map((_, i) => {
              const angle1 = (i / 16) * Math.PI * 4;
              const angle2 = angle1 + Math.PI;
              const y = (i / 16 - 0.5) * 2.5;

              return (
                <group key={i}>
                  <mesh position={[Math.cos(angle1) * 1.4, y, Math.sin(angle1) * 1.4]}>
                    <sphereGeometry args={[0.18, 12, 12]} />
                    <meshBasicMaterial color="#34D399" />
                  </mesh>
                  <mesh position={[Math.cos(angle2) * 1.4, y, Math.sin(angle2) * 1.4]}>
                    <sphereGeometry args={[0.18, 12, 12]} />
                    <meshBasicMaterial color="#67E8F9" />
                  </mesh>
                </group>
              );
            })}
          </group>
        </group>
      )}

      {/* 5. SiLU Gated Output Projection (y: 4.5) */}
      {isVisible('mb-gated-out') && (
        <group position={[0, 4.5, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('mb-gated-out')!); }}>
          <mesh>
            <coneGeometry args={[2.2, 2.0, 32]} />
            <meshStandardMaterial {...getMeshStyle('mb-gated-out', '#F43F5E')} />
          </mesh>
        </group>
      )}
    </group>
  );
};
