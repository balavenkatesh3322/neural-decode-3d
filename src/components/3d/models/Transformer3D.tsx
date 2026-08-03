import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { NodeComponent } from '../../../types/architecture';

interface Transformer3DProps {
  components: NodeComponent[];
  selectedNodeId?: string;
  hoveredNodeId?: string;
  isIsolated?: boolean;
  isWireframe?: boolean;
  isCrossSection?: boolean;
  isModalOpen?: boolean;
  onSelectNode: (component: NodeComponent) => void;
}

export const Transformer3D: React.FC<Transformer3DProps> = ({
  components,
  selectedNodeId,
  hoveredNodeId,
  isIsolated = false,
  isWireframe = false,
  isCrossSection = false,
  isModalOpen = false,
  onSelectNode,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const qkvLatticeRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current && !selectedNodeId) {
      groupRef.current.rotation.y += delta * 0.05;
    }
    if (qkvLatticeRef.current) {
      qkvLatticeRef.current.rotation.z += delta * 0.2;
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

  const tokens = ['The', 'cat', 'sat', 'on', 'the', 'mat', '.', '<eos>'];

  return (
    <group ref={groupRef}>
      {/* 0. Real-World 3D Input Text Prompt Billboard (y: -7.8) */}
      {!isModalOpen && (
        <group position={[0, -7.8, 0]}>
          <Html position={[0, 0, 0]} center distanceFactor={15}>
            <div className="px-3 py-1.5 rounded-xl bg-stone-900/95 text-amber-400 font-mono text-xs border border-amber-500/50 shadow-2xl flex items-center gap-2 whitespace-nowrap">
              <span className="text-[9px] font-bold text-amber-300 uppercase px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800">INPUT PROMPT</span>
              <span className="font-serif italic text-white font-bold">"The cat sat on the mat"</span>
            </div>
          </Html>
        </group>
      )}

      {/* 1. Token Embeddings & RoPE Vector Columns (y: -6) */}
      {isVisible('tf-token-embed') && (
        <group position={[0, -6, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('tf-token-embed')!); }}>
          {tokens.map((token, i) => {
            const x = (i - 3.5) * 0.8;
            return (
              <group key={i} position={[x, 0, 0]}>
                {/* 3D Stacked Vector Dimension Column */}
                <mesh position={[0, 0.4, 0]}>
                  <cylinderGeometry args={[0.2, 0.2, 1.2, 16]} />
                  <meshStandardMaterial {...getMeshStyle('tf-token-embed', '#F59E0B')} />
                </mesh>
                {/* Floating Token Text Tag */}
                {!isModalOpen && (
                  <Html position={[0, -0.6, 0]} center distanceFactor={15}>
                    <span className="px-1.5 py-0.5 rounded bg-stone-900/90 text-amber-300 font-mono text-[10px] border border-amber-500/40 whitespace-nowrap">
                      "{token}"
                    </span>
                  </Html>
                )}
              </group>
            );
          })}
          {/* Base Vector Platform */}
          <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[7.0, 1.2]} />
            <meshBasicMaterial color="#F59E0B" transparent opacity={0.2} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* 2. Q, K, V Projection Lattice Plates (y: -3.5) */}
      {isVisible('tf-qkv-proj') && (
        <group position={[0, -3.5, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('tf-qkv-proj')!); }}>
          <group ref={qkvLatticeRef}>
            {/* Query Subspace Plate (Cyan) */}
            <mesh position={[-2.4, 0, 0]}>
              <boxGeometry args={[1.6, 2.0, 0.3]} />
              <meshStandardMaterial {...getMeshStyle('tf-qkv-proj', '#06B6D4')} />
            </mesh>
            {/* Key Subspace Plate (Purple) */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.6, 2.0, 0.3]} />
              <meshStandardMaterial {...getMeshStyle('tf-qkv-proj', '#8B5CF6')} />
            </mesh>
            {/* Value Subspace Plate (Emerald) */}
            <mesh position={[2.4, 0, 0]}>
              <boxGeometry args={[1.6, 2.0, 0.3]} />
              <meshStandardMaterial {...getMeshStyle('tf-qkv-proj', '#10B981')} />
            </mesh>
          </group>

          {/* Subspace Projection Rays */}
          <line>
            <bufferGeometry
              attach="geometry"
              onUpdate={(geo) => {
                geo.setFromPoints([new THREE.Vector3(0, -2.5, 0), new THREE.Vector3(-2.4, 0, 0)]);
              }}
            />
            <lineBasicMaterial attach="material" color="#06B6D4" linewidth={2} />
          </line>
          <line>
            <bufferGeometry
              attach="geometry"
              onUpdate={(geo) => {
                geo.setFromPoints([new THREE.Vector3(0, -2.5, 0), new THREE.Vector3(2.4, 0, 0)]);
              }}
            />
            <lineBasicMaterial attach="material" color="#10B981" linewidth={2} />
          </line>
        </group>
      )}

      {/* 3. Scaled Dot-Product Attention 3D Heightmap Grid & Causal Mask (y: -1) */}
      {isVisible('tf-attn-matrix') && (
        <group position={[0, -1, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('tf-attn-matrix')!); }}>
          {/* 8x8 Extruded Attention Heatmap Columns */}
          {Array.from({ length: 6 }).map((_, r) =>
            Array.from({ length: 6 }).map((_, c) => {
              const isCausalMasked = c > r; // Upper triangular mask
              const score = isCausalMasked ? 0.05 : 0.2 + (Math.sin(r * 2 + c * 3) + 1) * 0.45;
              const posX = (c - 2.5) * 0.65;
              const posZ = (r - 2.5) * 0.65;

              return (
                <mesh key={`${r}-${c}`} position={[posX, score / 2, posZ]}>
                  <boxGeometry args={[0.55, score, 0.55]} />
                  <meshStandardMaterial
                    {...getMeshStyle('tf-attn-matrix', isCausalMasked ? '#1E293B' : '#8B5CF6')}
                    color={isCausalMasked ? '#334155' : score > 0.6 ? '#F59E0B' : '#8B5CF6'}
                    opacity={isCausalMasked ? 0.15 : 0.85}
                  />
                </mesh>
              );
            })
          )}

          {/* Causal Mask Triangular Wall */}
          <mesh position={[1.2, 0.6, -1.2]} rotation={[0, -Math.PI / 4, 0]}>
            <planeGeometry args={[3.8, 1.8]} />
            <meshBasicMaterial color="#F43F5E" transparent opacity={0.25} side={THREE.DoubleSide} />
          </mesh>

          {/* Grid Base Plane */}
          <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4.5, 4.5]} />
            <meshBasicMaterial color="#8B5CF6" transparent opacity={0.15} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* 4. RMSNorm Torus Ring & Residual Shortcut Arc (y: 1.5) */}
      {isVisible('tf-norm-1') && (
        <group position={[0, 1.5, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('tf-norm-1')!); }}>
          {/* RMSNorm Torus Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.2, 0.25, 16, 48]} />
            <meshStandardMaterial {...getMeshStyle('tf-norm-1', '#10B981')} />
          </mesh>
          {/* Internal Normalization Field */}
          <mesh>
            <cylinderGeometry args={[1.8, 1.8, 0.3, 32]} />
            <meshStandardMaterial {...getMeshStyle('tf-norm-1', '#34D399')} opacity={0.35} />
          </mesh>
        </group>
      )}

      {/* 5. SwiGLU Expansion-Contraction FFN Tunnel (y: 4) */}
      {isVisible('tf-ffn-swiglu') && (
        <group position={[0, 4, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('tf-ffn-swiglu')!); }}>
          {/* Input Dimension Chamber (4096) */}
          <mesh position={[0, -0.8, 0]}>
            <boxGeometry args={[2.8, 0.4, 1.8]} />
            <meshStandardMaterial {...getMeshStyle('tf-ffn-swiglu', '#F43F5E')} />
          </mesh>
          {/* Expanded Intermediate Chamber (14,336) */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[5.5, 0.8, 2.8]} />
            <meshStandardMaterial {...getMeshStyle('tf-ffn-swiglu', '#FB7185')} />
          </mesh>
          {/* Central Swish Gating Aperture Core */}
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.6, 0.12, 16, 32]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          {/* Down-Projected Output Chamber (4096) */}
          <mesh position={[0, 0.8, 0]}>
            <boxGeometry args={[2.8, 0.4, 1.8]} />
            <meshStandardMaterial {...getMeshStyle('tf-ffn-swiglu', '#F43F5E')} />
          </mesh>
        </group>
      )}

      {/* 6. Next Token Logits Bar Chart Output (y: 6.5) */}
      {isVisible('tf-head-logits') && (
        <group position={[0, 6.5, 0]} onClick={(e) => { e.stopPropagation(); onSelectNode(getComponent('tf-head-logits')!); }}>
          {Array.from({ length: 7 }).map((_, i) => {
            const height = 0.4 + Math.abs(Math.sin(i * 1.8 + 1)) * 1.9;
            const x = (i - 3) * 0.7;
            const isTop1 = i === 4; // Winning sampled token
            return (
              <group key={i} position={[x, height / 2, 0]}>
                <mesh>
                  <cylinderGeometry args={[0.22, 0.22, height, 16]} />
                  <meshStandardMaterial
                    {...getMeshStyle('tf-head-logits', isTop1 ? '#3B82F6' : '#64748B')}
                    color={isTop1 ? '#3B82F6' : '#64748B'}
                    emissive={isTop1 ? '#3B82F6' : '#000000'}
                    emissiveIntensity={isTop1 ? 0.5 : 0}
                  />
                </mesh>
                {isTop1 && (
                  <Html position={[0, height / 2 + 0.4, 0]} center distanceFactor={15}>
                    <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono font-bold text-[10px] shadow-md whitespace-nowrap">
                      P("on") = 94.2%
                    </span>
                  </Html>
                )}
              </group>
            );
          })}
        </group>
      )}

      {/* Backbone Signal Conduit Pipe */}
      {!isIsolated && (
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 13.5, 16]} />
          <meshBasicMaterial color="#CBD5E1" transparent opacity={0.35} />
        </mesh>
      )}
    </group>
  );
};
