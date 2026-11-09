import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { BACKGROUND } from './style';

export interface LensPointer {
  x: number;
  y: number;
  inside: boolean;
}

/** Set by <Effects> so the lens knows whether a composer is already rendering the main frame. */
export const effectsState = { mounted: false };

/**
 * Magnifying lens. Each frame the scene is rendered OFFSCREEN through a camera whose view
 * offset covers exactly the patch of screen under the pointer, `zoom`× smaller — a real
 * high-resolution re-render, not a stretched screenshot. The pixels are copied into the
 * lens' own 2D canvas, which sits above the HTML labels.
 *
 * Rendering offscreen (instead of scissoring into the main framebuffer) keeps the lens
 * independent of whatever state the post-processing composer leaves the renderer in.
 */
export const Lens: React.FC<{ pointer: React.MutableRefObject<LensPointer>; zoom: number; size: number; output: React.RefObject<HTMLCanvasElement> }> = ({ pointer, zoom, size: L, output }) => {
  const { gl, scene, camera, size } = useThree();
  const lensCam = useMemo(() => new THREE.PerspectiveCamera(), []);
  const bg = useMemo(() => new THREE.Color(BACKGROUND), []);
  const target = useMemo(() => {
    const rt = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: true });
    // encode to sRGB while rendering, so the bytes read back look like the main view
    rt.texture.colorSpace = THREE.SRGBColorSpace;
    return rt;
  }, []);
  const scratch = useMemo(() => ({ buf: new Uint8Array(4), img: null as ImageData | null }), []);
  const prevClear = useMemo(() => new THREE.Color(), []);

  useEffect(() => () => target.dispose(), [target]);

  // priority 2: runs after the post-processing composer (priority 1) has drawn the frame
  useFrame(() => {
    // registering a positive-priority frame callback turns off r3f's automatic render,
    // so if no composer is active yet, draw the main frame ourselves
    if (!effectsState.mounted) gl.render(scene, camera);

    const p = pointer.current;
    const out = output.current;
    const ctx2d = out?.getContext('2d');
    if (!p.inside || !out || !ctx2d) return;

    const px = Math.max(64, Math.round(L * Math.min(2, gl.getPixelRatio())));
    if (target.width !== px) {
      target.setSize(px, px);
      scratch.buf = new Uint8Array(px * px * 4);
      scratch.img = new ImageData(px, px);
      out.width = out.height = px;
    }

    const w = L / zoom;
    lensCam.copy(camera as THREE.PerspectiveCamera);
    lensCam.setViewOffset(size.width, size.height, p.x - w / 2, p.y - w / 2, w, w);
    lensCam.updateProjectionMatrix();

    const prevTarget = gl.getRenderTarget();
    const prevAlpha = gl.getClearAlpha();
    gl.getClearColor(prevClear);
    gl.setRenderTarget(target);
    gl.setClearColor(bg, 1);
    gl.clear(true, true, true);
    gl.render(scene, lensCam);
    gl.setRenderTarget(prevTarget);
    gl.setClearColor(prevClear, prevAlpha);

    // read back (WebGL rows are bottom-up) and flip into the 2D canvas
    gl.readRenderTargetPixels(target, 0, 0, px, px, scratch.buf);
    const img = scratch.img!;
    const row = px * 4;
    for (let y = 0; y < px; y++) img.data.set(scratch.buf.subarray((px - 1 - y) * row, (px - y) * row), y * row);
    ctx2d.putImageData(img, 0, 0);
  }, 2);

  return null;
};
