import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import type CameraControlsImpl from 'camera-controls';
import { isMobileNow } from '../../hooks/useIsMobile';
import { useAppStore } from '../../store/useAppStore';

const DEFAULT_AZIMUTH = -0.38;
const DEFAULT_POLAR = 1.32;

/**
 * Smooth camera framing built on camera-controls:
 * - re-frames the whole model when `frameNonce` changes (arch switch, reset, collapse)
 * - flies to `focusBox` when the selection / tour step changes
 */
export const CameraRig: React.FC<{
  modelBox: THREE.Box3 | null;
  focusBox: THREE.Box3 | null;
  frameNonce: string;
  autoRotate: boolean;
}> = ({ modelBox, focusBox, frameNonce, autoRotate }) => {
  const ref = useRef<CameraControlsImpl>(null);
  const userActive = useRef(false);
  const lastFrame = useRef<string>('');
  /** After a re-frame request, also re-frame when the (async) new layout lands. */
  const refitUntil = useRef(0);

  const frame = (animate: boolean) => {
    const c = ref.current;
    if (!c || !modelBox) return;
    c.rotateTo(DEFAULT_AZIMUTH, DEFAULT_POLAR, animate);
    // bottom padding leaves room for the tour bar overlay; top for the what-if header
    c.fitToBox(modelBox, animate, isMobileNow() ? { paddingTop: 2.4, paddingBottom: 2.4, paddingLeft: 0.4, paddingRight: 0.4 } : { paddingTop: 1.4, paddingBottom: 3.2, paddingLeft: 1, paddingRight: 1 });
  };

  useEffect(() => {
    if (frameNonce === lastFrame.current) return;
    const firstTime = lastFrame.current === '';
    lastFrame.current = frameNonce;
    refitUntil.current = performance.now() + 2500;
    frame(!firstTime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameNonce]);

  useEffect(() => {
    if (performance.now() < refitUntil.current) frame(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelBox]);

  useEffect(() => {
    const c = ref.current;
    if (!c || !focusBox) return;
    // keep the subject clear of the inspector: it sits on the left on desktop, at the bottom on phones
    const pad = isMobileNow()
      ? { paddingTop: 2.2, paddingBottom: 9, paddingLeft: 0.6, paddingRight: 0.6 }
      : { paddingTop: 0.8, paddingBottom: 1.4, paddingLeft: 5, paddingRight: 0.8 };
    c.fitToBox(focusBox, true, pad);
  }, [focusBox]);

  // zoom buttons / keys: move 30% closer or farther, smoothly
  const cmd = useAppStore((s) => s.cameraCmd);
  useEffect(() => {
    const c = ref.current;
    if (!c || !cmd) return;
    c.dolly(c.distance * (cmd.kind === 'in' ? 0.3 : -0.45), true);
  }, [cmd]);

  useFrame((_, dt) => {
    const c = ref.current;
    if (c && autoRotate && !userActive.current) c.azimuthAngle += dt * 0.12;
  });

  return (
    <CameraControls
      ref={ref}
      makeDefault
      smoothTime={0.45}
      minDistance={3}
      maxDistance={80}
      dollyToCursor
      onStart={() => (userActive.current = true)}
      onEnd={() => (userActive.current = false)}
    />
  );
};
