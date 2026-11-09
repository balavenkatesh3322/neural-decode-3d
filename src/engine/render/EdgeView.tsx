import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { Label3D } from './Label3D';
import type { EdgeKind } from '../spec/schema';
import { DOWNSTREAM, UPSTREAM } from './style';
import { EDGE_COLORS } from './edges';

export type EdgeEmphasis = 'normal' | 'upstream' | 'downstream' | 'dim' | 'inactive' | 'active';

export const EdgeView: React.FC<{
  curve: THREE.CatmullRomCurve3;
  kind: EdgeKind;
  emphasis: EdgeEmphasis;
  label?: string;
  showLabel: boolean;
}> = ({ curve, kind, emphasis, label, showLabel }) => {
  const points = useMemo(() => curve.getPoints(48), [curve]);
  const { end, quat } = useMemo(() => {
    const end = curve.getPointAt(1);
    const tan = curve.getTangentAt(0.995).normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan);
    return { end, quat };
  }, [curve]);
  const mid = useMemo(() => curve.getPointAt(0.5), [curve]);

  const color =
    emphasis === 'upstream' ? UPSTREAM : emphasis === 'downstream' || emphasis === 'active' ? DOWNSTREAM : emphasis === 'inactive' ? '#c9c2b9' : EDGE_COLORS[kind];
  const width = emphasis === 'upstream' || emphasis === 'downstream' || emphasis === 'active' ? 3.2 : kind === 'data' ? 1.8 : 1.5;
  const opacity = emphasis === 'dim' ? 0.12 : emphasis === 'inactive' ? 0.4 : 0.95;
  const dashed = kind === 'control' || kind === 'condition' || emphasis === 'inactive';

  return (
    <group>
      <Line
        points={points}
        color={color}
        lineWidth={width}
        transparent
        opacity={opacity}
        dashed={dashed}
        dashSize={0.18}
        gapSize={0.12}
        depthWrite={false}
      />
      {/* arrowhead, pulled back so it sits just outside the target */}
      <mesh position={end.clone().sub(curve.getTangentAt(0.995).multiplyScalar(0.12))} quaternion={quat}>
        <coneGeometry args={[0.07, 0.2, 10]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
      </mesh>
      {label && showLabel && emphasis !== 'dim' && (
        <Label3D position={mid} interactive={false}>
          <span
            className="px-1.5 py-[1px] rounded-full text-[9px] font-mono whitespace-nowrap border bg-[rgba(255,252,247,0.92)]"
            style={{ color, borderColor: `${color}55` }}
          >
            {label}
          </span>
        </Label3D>
      )}
    </group>
  );
};
