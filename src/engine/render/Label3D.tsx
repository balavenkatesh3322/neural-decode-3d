import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

const tmp = new THREE.Vector3();

/**
 * A DOM label pinned to a 3D point. Unlike drei's `distanceFactor`, its scale is
 * clamped: it shrinks in overviews but never balloons when the camera is close.
 */
export const Label3D: React.FC<{
  position?: [number, number, number] | THREE.Vector3;
  children: React.ReactNode;
  /** Distance at which the label renders at 1×. */
  k?: number;
  min?: number;
  max?: number;
  origin?: string;
  zIndexRange?: [number, number];
  interactive?: boolean;
}> = ({ position, children, k = 18, min = 0.62, max = 1, origin = 'center center', zIndexRange = [15, 0], interactive = true }) => {
  const anchor = useRef<THREE.Group>(null);
  const inner = useRef<HTMLDivElement>(null);
  const last = useRef(0);

  useFrame(({ camera }) => {
    if (!anchor.current || !inner.current) return;
    anchor.current.getWorldPosition(tmp);
    const s = Math.min(max, Math.max(min, k / camera.position.distanceTo(tmp)));
    if (Math.abs(s - last.current) > 0.004) {
      last.current = s;
      inner.current.style.transform = `scale(${s.toFixed(3)})`;
    }
  });

  return (
    <group ref={anchor} position={position}>
      <Html center zIndexRange={zIndexRange} style={{ pointerEvents: interactive ? 'auto' : 'none' }}>
        <div ref={inner} style={{ transformOrigin: origin }}>
          {children}
        </div>
      </Html>
    </group>
  );
};
