import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NodeComponent } from '../../types/architecture';

interface SignalPulseStreamProps {
  components: NodeComponent[];
  activeStepNodeId?: string;
  isPlaying: boolean;
  trainingPhase?: 'before' | 'while' | 'after';
}

export const SignalPulseStream: React.FC<SignalPulseStreamProps> = ({
  components,
  activeStepNodeId,
  isPlaying,
  trainingPhase = 'after',
}) => {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 150;

  // Pre-calculate connection pathways between sequential nodes
  const paths = React.useMemo(() => {
    const p: { start: THREE.Vector3; end: THREE.Vector3; color: THREE.Color }[] = [];
    for (let i = 0; i < components.length - 1; i++) {
      const startNode = components[i];
      const endNode = components[i + 1];

      // If trainingPhase is 'while' (Backprop), reverse start and end points!
      const isBackprop = trainingPhase === 'while';
      const startPos = isBackprop ? new THREE.Vector3(...endNode.position) : new THREE.Vector3(...startNode.position);
      const endPos = isBackprop ? new THREE.Vector3(...startNode.position) : new THREE.Vector3(...endNode.position);
      const colorHex = isBackprop ? '#F43F5E' : trainingPhase === 'before' ? '#64748B' : startNode.glowColor || startNode.color;

      p.push({
        start: startPos,
        end: endPos,
        color: new THREE.Color(colorHex),
      });
    }
    return p;
  }, [components, trainingPhase]);

  // Create geometry positions & colors
  const [positions, colors, progressArray] = React.useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const prog = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      prog[i] = Math.random();
      const pathIndex = i % (paths.length || 1);
      if (paths[pathIndex]) {
        const { start, end, color } = paths[pathIndex];
        const currentPos = new THREE.Vector3().lerpVectors(start, end, prog[i]);
        pos[i * 3] = currentPos.x + (Math.random() - 0.5) * 0.4;
        pos[i * 3 + 1] = currentPos.y;
        pos[i * 3 + 2] = currentPos.z + (Math.random() - 0.5) * 0.4;

        col[i * 3] = color.r;
        col[i * 3 + 1] = color.g;
        col[i * 3 + 2] = color.b;
      }
    }
    return [pos, col, prog];
  }, [paths, particleCount]);

  useFrame((_, delta) => {
    if (!particlesRef.current || !isPlaying || paths.length === 0) return;

    const posAttr = particlesRef.current.geometry.attributes.position;
    const speed = trainingPhase === 'before' ? 0.3 : trainingPhase === 'while' ? 1.2 : 0.8;

    for (let i = 0; i < particleCount; i++) {
      const pathIndex = i % paths.length;
      const { start, end } = paths[pathIndex];

      progressArray[i] += delta * speed;
      if (progressArray[i] > 1) progressArray[i] = 0;

      const currentPos = new THREE.Vector3().lerpVectors(start, end, progressArray[i]);
      posAttr.setXYZ(i, currentPos.x, currentPos.y, currentPos.z);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={trainingPhase === 'while' ? 0.35 : 0.25}
        vertexColors
        transparent
        opacity={isPlaying ? (trainingPhase === 'before' ? 0.4 : 0.95) : 0.2}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
