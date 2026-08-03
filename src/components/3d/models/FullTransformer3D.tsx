import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { NodeComponent } from '../../../types/architecture';

interface FullTransformer3DProps {
  components: NodeComponent[];
  selectedNodeId?: string;
  hoveredNodeId?: string;
  isIsolated?: boolean;
  isWireframe?: boolean;
  isCrossSection?: boolean;
  isExplodedView?: boolean;
  onSelectNode: (component: NodeComponent) => void;
}

export const FullTransformer3D: React.FC<FullTransformer3DProps> = ({
  components,
  selectedNodeId,
  hoveredNodeId,
  isIsolated = false,
  isWireframe = false,
  isCrossSection = false,
  isExplodedView = false,
  onSelectNode,
}) => {
  const encoderStackRef = useRef<THREE.Group>(null);
  const decoderStackRef = useRef<THREE.Group>(null);
  const crossAttnBridgeRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (crossAttnBridgeRef.current) {
      crossAttnBridgeRef.current.rotation.z += delta * 0.5;
    }
  });

  const explodedOffset = isExplodedView ? 2.4 : 1.0;

  // Encoder Stack Components (Left Column: x = -3.8)
  const encoderNodes = components.filter((c) =>
    ['encoder_input', 'encoder_pos', 'encoder_attn', 'encoder_ffn'].includes(c.id) || c.id.startsWith('enc_')
  );

  // Decoder Stack Components (Right Column: x = 3.8)
  const decoderNodes = components.filter((c) =>
    ['decoder_input', 'decoder_masked_attn', 'cross_attn', 'decoder_ffn', 'lm_head'].includes(c.id) || c.id.startsWith('dec_')
  );

  return (
    <group>
      {/* 1. Left Column: ENCODER STACK (x = -3.8) */}
      <group ref={encoderStackRef} position={[-3.8, 0, 0]}>
        <Html position={[0, 6.5, 0]} center pointerEvents="none">
          <div className="px-3 py-1 rounded-full bg-[#2f2a27] text-white text-[10px] font-mono font-bold border border-amber-500/40 shadow-lg whitespace-nowrap">
            ENCODER STACK (N = 6)
          </div>
        </Html>

        {/* Base Platform for Encoder */}
        <mesh position={[0, -4.5, 0]}>
          <cylinderGeometry args={[2.2, 2.5, 0.4, 32]} />
          <meshStandardMaterial
            color="#2f2a27"
            metalness={0.8}
            roughness={0.2}
            wireframe={isWireframe}
          />
        </mesh>

        {/* Encoder Layers */}
        {components.slice(0, 4).map((comp, idx) => {
          const isSelected = selectedNodeId === comp.id;
          const isHovered = hoveredNodeId === comp.id;
          const yPos = (-3 + idx * 2.2) * explodedOffset;

          return (
            <group
              key={comp.id}
              position={[0, yPos, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onSelectNode(comp);
              }}
            >
              <mesh>
                <boxGeometry args={[3.2, 0.6, 3.2]} />
                <meshPhysicalMaterial
                  color={isSelected ? '#eb7c6b' : isHovered ? '#f4a261' : comp.color}
                  metalness={0.2}
                  roughness={0.1}
                  transmission={0.4}
                  thickness={0.5}
                  wireframe={isWireframe}
                  emissive={isSelected ? '#eb7c6b' : '#000000'}
                  emissiveIntensity={isSelected ? 0.6 : 0}
                />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* 2. Right Column: DECODER STACK (x = 3.8) */}
      <group ref={decoderStackRef} position={[3.8, 0, 0]}>
        <Html position={[0, 6.5, 0]} center pointerEvents="none">
          <div className="px-3 py-1 rounded-full bg-[#eb7c6b] text-white text-[10px] font-mono font-bold border border-white/40 shadow-lg whitespace-nowrap">
            DECODER STACK (N = 6)
          </div>
        </Html>

        {/* Base Platform for Decoder */}
        <mesh position={[0, -4.5, 0]}>
          <cylinderGeometry args={[2.2, 2.5, 0.4, 32]} />
          <meshStandardMaterial
            color="#2f2a27"
            metalness={0.8}
            roughness={0.2}
            wireframe={isWireframe}
          />
        </mesh>

        {/* Decoder Layers */}
        {components.slice(4).map((comp, idx) => {
          const isSelected = selectedNodeId === comp.id;
          const isHovered = hoveredNodeId === comp.id;
          const yPos = (-3 + idx * 2.2) * explodedOffset;

          return (
            <group
              key={comp.id}
              position={[0, yPos, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onSelectNode(comp);
              }}
            >
              <mesh>
                <boxGeometry args={[3.2, 0.6, 3.2]} />
                <meshPhysicalMaterial
                  color={isSelected ? '#eb7c6b' : isHovered ? '#f4a261' : comp.color}
                  metalness={0.2}
                  roughness={0.1}
                  transmission={0.4}
                  thickness={0.5}
                  wireframe={isWireframe}
                  emissive={isSelected ? '#eb7c6b' : '#000000'}
                  emissiveIntensity={isSelected ? 0.6 : 0}
                />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* 3. Cross-Attention Encoder-Decoder Connecting Bridges */}
      <group ref={crossAttnBridgeRef}>
        {[-0.8, 1.4].map((yHeight, i) => (
          <mesh key={i} position={[0, yHeight * explodedOffset, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 7.6, 16]} />
            <meshBasicMaterial color="#eb7c6b" wireframe={isWireframe} />
          </mesh>
        ))}

        <Html position={[0, 0.3 * explodedOffset, 0]} center pointerEvents="none">
          <div className="px-2.5 py-1 rounded-full bg-[#fff2c9] border border-[#f0e2b0] text-[#8d6bcc] text-[9px] font-mono font-bold shadow-md whitespace-nowrap animate-pulse">
            CROSS-ATTENTION BRIDGE (Q_dec · K_encᵀ)
          </div>
        </Html>
      </group>
    </group>
  );
};
