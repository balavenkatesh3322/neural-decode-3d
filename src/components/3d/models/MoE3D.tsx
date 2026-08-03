import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { NodeComponent } from '../../../types/architecture';

interface Model3DProps {
  components: NodeComponent[];
  selectedNodeId?: string;
  hoveredNodeId?: string;
  isIsolated: boolean;
  isWireframe: boolean;
  isCrossSection: boolean;
  onSelectNode: (component: NodeComponent) => void;
}

export const MoE3D: React.FC<Model3DProps> = ({
  components,
  selectedNodeId,
  hoveredNodeId,
  isIsolated = false,
  isWireframe = false,
  isCrossSection = false,
  onSelectNode,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const routerRingRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (routerRingRef.current) {
      routerRingRef.current.rotation.y += delta * 0.4;
    }
  });

  const getComponent = (id: string) => components.find((c) => c.id === id);

  const isVisible = (id: string) => {
    if (!isIsolated) return true;
    return selectedNodeId === id;
  };

  const getMeshStyle = (id: string, defaultColor: string, isIdle?: boolean) => {
    const isSelected = selectedNodeId === id;
    const isHovered = hoveredNodeId === id;

    if (isIsolated) {
      if (isSelected) {
        return {
          color: '#F59E0B',
          emissive: '#FBBF24',
          emissiveIntensity: 1.0,
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
        color: '#F59E0B',
        emissive: '#FBBF24',
        emissiveIntensity: 0.9,
        wireframe: isWireframe,
        transparent: isCrossSection || isIdle,
        opacity: isIdle ? 0.2 : isCrossSection ? 0.45 : 1,
      };
    }
    if (isHovered) {
      return {
        color: '#06B6D4',
        emissive: '#67E8F9',
        emissiveIntensity: 0.6,
        wireframe: isWireframe,
        transparent: isCrossSection || isIdle,
        opacity: isIdle ? 0.25 : isCrossSection ? 0.55 : 1,
      };
    }
    return {
      color: defaultColor,
      emissive: '#000000',
      emissiveIntensity: 0,
      wireframe: isWireframe,
      transparent: isCrossSection || isIdle,
      opacity: isIdle ? 0.2 : isCrossSection ? 0.35 : 1,
    };
  };

  return (
    <group ref={groupRef}>
      {/* 0. Real-World 3D Input Code Billboard (y: -7.8) */}
      <group position={[0, -7.8, 0]}>
        <Html position={[0, 0, 0]} center distanceFactor={15}>
          <div className="px-3 py-1.5 rounded-xl bg-stone-900/95 text-amber-400 font-mono text-xs border border-amber-500/50 shadow-2xl flex items-center gap-2 whitespace-nowrap">
            <span className="text-[9px] font-bold text-cyan-300 uppercase px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">PYTHON CODE INPUT</span>
            <span className="font-mono text-white font-bold">💻 def fibonacci(n):</span>
          </div>
        </Html>
      </group>

      {/* 1. Input Representation Node (y: -6) */}
      {isVisible('moe-input-repr') && (
        <group position={[0, -6, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('moe-input-repr')!); }}>
          <mesh>
            <cylinderGeometry args={[2.5, 2.5, 0.5, 32]} />
            <meshStandardMaterial {...getMeshStyle('moe-input-repr', '#06B6D4')} />
          </mesh>
        </group>
      )}

      {/* 2. Top-2 Gating Router Nucleus (y: -2.5) */}
      {isVisible('moe-router-gate') && (
        <group position={[0, -2.5, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('moe-router-gate')!); }}>
          <mesh>
            <sphereGeometry args={[1.3, 32, 32]} />
            <meshStandardMaterial {...getMeshStyle('moe-router-gate', '#F59E0B')} emissive="#F59E0B" emissiveIntensity={0.4} />
          </mesh>
          <group ref={routerRingRef}>
            <mesh rotation={[Math.PI / 3, 0, 0]}>
              <torusGeometry args={[2.2, 0.1, 16, 48]} />
              <meshBasicMaterial color="#FBBF24" transparent opacity={0.6} />
            </mesh>
          </group>
        </group>
      )}

      {/* 3. Expert FFN Pods (y: 1.5 ~ 2) */}
      {/* Expert 1 (Active Math & Code) */}
      {isVisible('moe-expert-1') && (
        <group position={[-5, 1.5, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('moe-expert-1')!); }}>
          <mesh>
            <boxGeometry args={[1.8, 2.5, 1.8]} />
            <meshStandardMaterial {...getMeshStyle('moe-expert-1', '#8B5CF6')} emissive="#8B5CF6" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[0, 1.3, 0]}>
            <cylinderGeometry args={[0.9, 0.9, 0.2, 16]} />
            <meshBasicMaterial color="#C084FC" />
          </mesh>
        </group>
      )}

      {/* Expert 2 (Active Language) */}
      {isVisible('moe-expert-2') && (
        <group position={[-1.8, 2, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('moe-expert-2')!); }}>
          <mesh>
            <boxGeometry args={[1.8, 2.5, 1.8]} />
            <meshStandardMaterial {...getMeshStyle('moe-expert-2', '#8B5CF6')} emissive="#8B5CF6" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[0, 1.3, 0]}>
            <cylinderGeometry args={[0.9, 0.9, 0.2, 16]} />
            <meshBasicMaterial color="#C084FC" />
          </mesh>
        </group>
      )}

      {/* Expert 3 (Idle Reasoning) */}
      {isVisible('moe-expert-3') && (
        <group position={[1.8, 2, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('moe-expert-3')!); }}>
          <mesh>
            <boxGeometry args={[1.8, 2.5, 1.8]} />
            <meshStandardMaterial {...getMeshStyle('moe-expert-3', '#64748B', true)} />
          </mesh>
        </group>
      )}

      {/* Expert 4 (Idle Facts) */}
      {isVisible('moe-expert-4') && (
        <group position={[5, 1.5, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('moe-expert-4')!); }}>
          <mesh>
            <boxGeometry args={[1.8, 2.5, 1.8]} />
            <meshStandardMaterial {...getMeshStyle('moe-expert-4', '#64748B', true)} />
          </mesh>
        </group>
      )}

      {/* 4. DeepSeek Always-Active Shared Expert (y: 0.5, z: -2) */}
      {isVisible('moe-shared-expert') && (
        <group position={[0, 0.5, -2]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('moe-shared-expert')!); }}>
          <mesh>
            <cylinderGeometry args={[2.0, 2.0, 1.8, 32]} />
            <meshStandardMaterial {...getMeshStyle('moe-shared-expert', '#10B981')} />
          </mesh>
          <mesh position={[0, 1.0, 0]}>
            <torusGeometry args={[2.2, 0.08, 16, 32]} />
            <meshBasicMaterial color="#34D399" />
          </mesh>
        </group>
      )}

      {/* 5. Expert Aggregator Node (y: 5.5) */}
      {isVisible('moe-aggregator') && (
        <group position={[0, 5.5, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('moe-aggregator')!); }}>
          <mesh>
            <octahedronGeometry args={[1.8, 2]} />
            <meshStandardMaterial {...getMeshStyle('moe-aggregator', '#F43F5E')} />
          </mesh>
        </group>
      )}

      {/* DYNAMIC LASER ROUTING CONDUITS (Router -> Active Expert Pods #1 & #2) */}
      {!isIsolated && (
        <>
          {/* Active Conduit 1 */}
          <line>
            <bufferGeometry
              attach="geometry"
              onUpdate={(geo) => {
                geo.setFromPoints([new THREE.Vector3(0, -2.5, 0), new THREE.Vector3(-5, 1.5, 0)]);
              }}
            />
            <lineBasicMaterial attach="material" color="#F59E0B" linewidth={4} />
          </line>
          {/* Active Conduit 2 */}
          <line>
            <bufferGeometry
              attach="geometry"
              onUpdate={(geo) => {
                geo.setFromPoints([new THREE.Vector3(0, -2.5, 0), new THREE.Vector3(-1.8, 2, 0)]);
              }}
            />
            <lineBasicMaterial attach="material" color="#F59E0B" linewidth={4} />
          </line>
          {/* Shared Expert Conduit */}
          <line>
            <bufferGeometry
              attach="geometry"
              onUpdate={(geo) => {
                geo.setFromPoints([new THREE.Vector3(0, -6, 0), new THREE.Vector3(0, 0.5, -2)]);
              }}
            />
            <lineBasicMaterial attach="material" color="#10B981" linewidth={3} />
          </line>
        </>
      )}
    </group>
  );
};
