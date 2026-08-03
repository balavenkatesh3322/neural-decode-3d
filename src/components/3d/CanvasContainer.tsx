import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Architecture, NodeComponent } from '../../types/architecture';
import { HotspotPin } from './HotspotPin';
import { SignalPulseStream } from './SignalPulseStream';
import { Transformer3D } from './models/Transformer3D';
import { MoE3D } from './models/MoE3D';
import { CNN3D } from './models/CNN3D';
import { Mamba3D } from './models/Mamba3D';
import { Diffusion3D } from './models/Diffusion3D';
import { WeightBias3DBlock } from './blocks/WeightBias3DBlock';
import { Activation3DBlock } from './blocks/Activation3DBlock';
import { LossGradient3DBlock } from './blocks/LossGradient3DBlock';
import { Embedding3DBlock } from './blocks/Embedding3DBlock';
import { Loader2, Boxes, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CanvasContainerProps {
  viewMode: 'blocks' | 'architectures';
  activeBlockId: string;
  weightVal: number;
  biasVal: number;
  inputXVal: number;
  activationFunc: 'relu' | 'sigmoid' | 'gelu' | 'silu';
  architecture: Architecture;
  selectedNode: NodeComponent | null;
  hoveredNodeId?: string;
  isIsolated: boolean;
  isWireframe: boolean;
  isCrossSection: boolean;
  isAutoRotate: boolean;
  isPlayingAnimation: boolean;
  trainingPhase?: 'before' | 'while' | 'after';
  isModalOpen?: boolean;
  isLoading?: boolean;
  activeStepNodeId?: string;
  onSelectNode: (component: NodeComponent) => void;
}

const CameraController: React.FC<{
  targetLookAt?: [number, number, number];
  defaultPos: [number, number, number];
  defaultLookAt: [number, number, number];
}> = ({ targetLookAt, defaultPos, defaultLookAt }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const endPos = new THREE.Vector3(...defaultPos);
    const endLookAt = targetLookAt ? new THREE.Vector3(...targetLookAt) : new THREE.Vector3(...defaultLookAt);

    let startPos = camera.position.clone();
    let startTime = performance.now();
    const duration = 1000;

    const animateCamera = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2;

      camera.position.lerpVectors(startPos, endPos, easeProgress);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(endLookAt, easeProgress);
        controlsRef.current.update();
      }

      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      }
    };

    requestAnimationFrame(animateCamera);
  }, [targetLookAt, defaultPos, defaultLookAt, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      rotateSpeed={0.8}
      zoomSpeed={0.9}
      minDistance={4}
      maxDistance={40}
    />
  );
};

export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  viewMode,
  activeBlockId,
  weightVal,
  biasVal,
  inputXVal,
  activationFunc,
  architecture,
  selectedNode,
  hoveredNodeId,
  isIsolated,
  isWireframe,
  isCrossSection,
  isAutoRotate,
  isPlayingAnimation,
  trainingPhase,
  isModalOpen = false,
  isLoading = false,
  activeStepNodeId,
  onSelectNode,
}) => {
  const renderArchitectureModel = () => {
    switch (architecture.id) {
      case 'transformer':
        return (
          <Transformer3D
            components={architecture.components}
            selectedNodeId={selectedNode?.id}
            hoveredNodeId={hoveredNodeId}
            isIsolated={isIsolated}
            isWireframe={isWireframe}
            isCrossSection={isCrossSection}
            onSelectNode={onSelectNode}
          />
        );
      case 'cnn':
        return (
          <CNN3D
            components={architecture.components}
            selectedNodeId={selectedNode?.id}
            hoveredNodeId={hoveredNodeId}
            isIsolated={isIsolated}
            isWireframe={isWireframe}
            isCrossSection={isCrossSection}
            onSelectNode={onSelectNode}
          />
        );
      case 'moe':
        return (
          <MoE3D
            components={architecture.components}
            selectedNodeId={selectedNode?.id}
            hoveredNodeId={hoveredNodeId}
            isIsolated={isIsolated}
            isWireframe={isWireframe}
            isCrossSection={isCrossSection}
            onSelectNode={onSelectNode}
          />
        );
      case 'mamba':
        return (
          <Mamba3D
            components={architecture.components}
            selectedNodeId={selectedNode?.id}
            hoveredNodeId={hoveredNodeId}
            isIsolated={isIsolated}
            isWireframe={isWireframe}
            isCrossSection={isCrossSection}
            onSelectNode={onSelectNode}
          />
        );
      case 'diffusion':
        return (
          <Diffusion3D
            components={architecture.components}
            selectedNodeId={selectedNode?.id}
            hoveredNodeId={hoveredNodeId}
            isIsolated={isIsolated}
            isWireframe={isWireframe}
            isCrossSection={isCrossSection}
            onSelectNode={onSelectNode}
          />
        );
      default:
        return (
          <Transformer3D
            components={architecture.components}
            selectedNodeId={selectedNode?.id}
            hoveredNodeId={hoveredNodeId}
            isIsolated={isIsolated}
            isWireframe={isWireframe}
            isCrossSection={isCrossSection}
            onSelectNode={onSelectNode}
          />
        );
    }
  };

  const renderAtomicBlock = () => {
    switch (activeBlockId) {
      case 'weight_bias':
        return <WeightBias3DBlock weight={weightVal} bias={biasVal} inputX={inputXVal} />;
      case 'activation':
        return <Activation3DBlock inputVal={inputXVal} funcType={activationFunc} />;
      case 'loss':
        return <LossGradient3DBlock />;
      case 'embedding':
        return <Embedding3DBlock />;
      default:
        return <WeightBias3DBlock weight={weightVal} bias={biasVal} inputX={inputXVal} />;
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-radial from-white via-[#f7eee5]/60 to-[#e9ddd0]/80">
      {/* 3D WebGL Canvas Component */}
      <Canvas
        camera={{
          position: architecture.defaultCameraPosition,
          fov: 45,
          near: 0.1,
          far: 100,
        }}
        shadows
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />
        <directionalLight position={[-10, -10, -10]} intensity={0.4} />

        <CameraController
          targetLookAt={selectedNode ? selectedNode.position : undefined}
          defaultPos={viewMode === 'blocks' ? [0, 4, 14] : architecture.defaultCameraPosition}
          defaultLookAt={viewMode === 'blocks' ? [0, 0, 0] : architecture.defaultCameraTarget}
        />

        {/* View Mode Routing */}
        {viewMode === 'blocks' ? (
          renderAtomicBlock()
        ) : (
          <>
            {renderArchitectureModel()}
            {!isModalOpen &&
              architecture.components.map((comp, idx) => (
                <HotspotPin
                  key={comp.id}
                  position={comp.position}
                  component={comp}
                  isSelected={selectedNode?.id === comp.id}
                  isHovered={hoveredNodeId === comp.id}
                  stepNumber={idx + 1}
                  onSelect={onSelectNode}
                  onHover={() => {}}
                />
              ))}
            <SignalPulseStream
              components={architecture.components}
              activeStepNodeId={activeStepNodeId}
              isPlaying={isPlayingAnimation}
              trainingPhase={trainingPhase}
            />
          </>
        )}
      </Canvas>

      {/* Interactive 3D Neural Specimen Transition Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[rgba(255,251,244,0.88)] backdrop-blur-md flex flex-col items-center justify-center z-40 select-none"
          >
            <div className="p-6 rounded-[26px] bg-white border border-[rgba(117,91,70,0.18)] shadow-2xl flex flex-col items-center gap-3 max-w-sm text-center">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-[#eb7c6b]/20 border-t-[#eb7c6b] animate-spin" />
                <Boxes className="w-6 h-6 text-[#2f2a27] animate-pulse" />
              </div>

              <div>
                <h3 className="font-serif font-medium text-lg text-[#2f2a27]">
                  Decoding 3D Specimen…
                </h3>
                <p className="text-xs font-sans text-[#8d847c] mt-0.5">
                  Synthesizing tensor nodes & camera matrices
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
