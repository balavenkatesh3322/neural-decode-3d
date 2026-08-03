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
  activeStepNodeId?: string;
  onSelectNode: (component: NodeComponent) => void;
}

const CameraController: React.FC<{
  targetPos?: [number, number, number];
  targetLookAt?: [number, number, number];
  defaultPos: [number, number, number];
  defaultLookAt: [number, number, number];
}> = ({ targetPos, targetLookAt, defaultPos, defaultLookAt }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const pos = targetPos || defaultPos;
    const lookAt = targetLookAt || defaultLookAt;

    camera.position.set(...pos);
    if (controlsRef.current) {
      controlsRef.current.target.set(...lookAt);
      controlsRef.current.update();
    }
  }, [targetPos, targetLookAt, defaultPos, defaultLookAt, camera]);

  return <OrbitControls ref={controlsRef} makeDefault enableDamping dampingFactor={0.05} maxDistance={35} minDistance={4} />;
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
  trainingPhase = 'after',
  isModalOpen = false,
  activeStepNodeId,
  onSelectNode,
}) => {
  // Render Atomic 3D Block
  const renderAtomicBlock = () => {
    switch (activeBlockId) {
      case 'weight-bias':
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

  // Render Full Architecture Model
  const renderArchitectureModel = () => {
    const commonProps = {
      components: architecture.components,
      selectedNodeId: selectedNode?.id,
      hoveredNodeId,
      isIsolated,
      isWireframe,
      isCrossSection,
      isModalOpen,
      onSelectNode,
    };

    switch (architecture.id) {
      case 'transformer':
        return <Transformer3D {...commonProps} />;
      case 'moe':
        return <MoE3D {...commonProps} />;
      case 'cnn':
        return <CNN3D {...commonProps} />;
      case 'mamba':
        return <Mamba3D {...commonProps} />;
      case 'diffusion':
        return <Diffusion3D {...commonProps} />;
      default:
        return <Transformer3D {...commonProps} />;
    }
  };

  return (
    <div className="relative w-full h-full bg-[#F3EEE3] overflow-hidden select-none">
      <Canvas
        camera={{
          position: viewMode === 'blocks' ? [0, 4, 14] : architecture.defaultCameraPosition,
          fov: 45,
        }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />
        <directionalLight position={[-10, -10, -10]} intensity={0.5} />
        <pointLight position={[0, 5, 5]} intensity={0.8} color="#F59E0B" />

        <CameraController
          targetPos={
            viewMode === 'blocks'
              ? [0, 2, 14]
              : selectedNode
                ? [selectedNode.position[0], selectedNode.position[1] + 1.5, selectedNode.position[2] + 8]
                : undefined
          }
          targetLookAt={
            viewMode === 'blocks'
              ? [0, 0, 0]
              : selectedNode
                ? selectedNode.position
                : undefined
          }
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
              architecture.components.map((comp) => (
                <HotspotPin
                  key={comp.id}
                  component={comp}
                  isSelected={selectedNode?.id === comp.id}
                  isModalOpen={isModalOpen}
                  onSelect={() => onSelectNode(comp)}
                  onDeselect={() => onSelectNode(null as any)}
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

        <gridHelper args={[40, 40, '#D6CEBE', '#E5DFD3']} position={[0, -8, 0]} />
      </Canvas>
    </div>
  );
};
