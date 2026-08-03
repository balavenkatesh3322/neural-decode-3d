import React, { useState, useMemo, useEffect } from 'react';
import { SystemCategory, Architecture, NodeComponent } from './types/architecture';
import { ALL_ARCHITECTURES, ARCHITECTURES_BY_ID } from './data/architectures';
import { Navbar } from './components/layout/Navbar';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { RightSidebar } from './components/layout/RightSidebar';
import { ToolRibbon } from './components/layout/ToolRibbon';
import { AnimationPlayerBar } from './components/layout/AnimationPlayerBar';
import { CanvasContainer } from './components/3d/CanvasContainer';
import { LessonModal } from './components/modals/LessonModal';
import { QuizModal } from './components/modals/QuizModal';
import { CompareModal } from './components/modals/CompareModal';
import { PlaygroundModal } from './components/modals/PlaygroundModal';
import { BuildingBlocksModal } from './components/modals/BuildingBlocksModal';
import { ComponentDetailModal } from './components/modals/ComponentDetailModal';
import { EndToEndPipelineModal } from './components/modals/EndToEndPipelineModal';
import { ShareModal } from './components/modals/ShareModal';
import { TrainingProgressWidget } from './components/layout/TrainingProgressWidget';
import { HelpCircle, Sparkles } from 'lucide-react';

export function App() {
  // Navigation & View Mode State
  const [viewMode, setViewMode] = useState<'blocks' | 'architectures'>('architectures');
  const [activeBlockId, setActiveBlockId] = useState<string>('weight-bias');
  const [weightVal, setWeightVal] = useState<number>(1.5);
  const [biasVal, setBiasVal] = useState<number>(0.5);
  const [inputXVal, setInputXVal] = useState<number>(2.0);
  const [activationFunc, setActivationFunc] = useState<'relu' | 'sigmoid' | 'gelu' | 'silu'>('relu');
  const [trainingPhase, setTrainingPhase] = useState<'before' | 'while' | 'after'>('after');

  const [activeCategory, setActiveCategory] = useState<SystemCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArchId, setSelectedArchId] = useState<string>('transformer');
  const [selectedNode, setSelectedNode] = useState<NodeComponent | null>(null);

  // 3D Canvas View Options
  const [isIsolated, setIsIsolated] = useState(false);
  const [isWireframe, setIsWireframe] = useState(false);
  const [isCrossSection, setIsCrossSection] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const [isExplodedView, setIsExplodedView] = useState(false);

  // Animation Mode State
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(1);

  // Sidebar Collapse Minimize States & Transition Load State
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [isLoadingArchitecture, setIsLoadingArchitecture] = useState(false);

  // Modal Open States
  const [isLessonOpen, setIsLessonOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);
  const [isBuildingBlocksOpen, setIsBuildingBlocksOpen] = useState(false);
  const [isComponentDetailOpen, setIsComponentDetailOpen] = useState(false);
  const [isEndToEndPipelineOpen, setIsEndToEndPipelineOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const isModalOpen = isLessonOpen || isQuizOpen || isCompareOpen || isPlaygroundOpen || isBuildingBlocksOpen || isComponentDetailOpen || isEndToEndPipelineOpen || isShareOpen;

  const activeArchitecture = useMemo(
    () => ARCHITECTURES_BY_ID[selectedArchId] || ALL_ARCHITECTURES[0],
    [selectedArchId]
  );

  // Automated Step Progression Timer during animation playback
  useEffect(() => {
    let interval: any = null;
    if (isPlayingAnimation) {
      interval = setInterval(() => {
        setCurrentStepIndex((prevStep) => {
          const totalSteps = activeArchitecture.dataFlowSteps.length;
          const nextStep = prevStep >= totalSteps ? 1 : prevStep + 1;
          const stepObj = activeArchitecture.dataFlowSteps.find((s) => s.stepIndex === nextStep);
          if (stepObj) {
            const node = activeArchitecture.components.find((c) => c.id === stepObj.activeNodeId);
            if (node) setSelectedNode(node);
          }
          return nextStep;
        });
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isPlayingAnimation, activeArchitecture]);

  // Filter architectures based on category and search query
  const filteredArchitectures = useMemo(() => {
    return ALL_ARCHITECTURES.filter((arch) => {
      const categoryMatch = activeCategory === 'all' || arch.category === activeCategory;
      const searchMatch =
        searchQuery.trim() === '' ||
        arch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        arch.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        arch.components.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return categoryMatch && searchMatch;
    });
  }, [activeCategory, searchQuery]);

  // Component Selection Handler
  const handleSelectNode = (component: NodeComponent | null) => {
    setSelectedNode(component);
    if (component) {
      setIsComponentDetailOpen(true);
    }
  };

  // Switch architecture handler
  const handleSelectArchitecture = (arch: Architecture) => {
    setSelectedArchId(arch.id);
    setSelectedNode(null);
    setCurrentStepIndex(1);
    setIsIsolated(false);
    setIsWireframe(false);
    setIsCrossSection(false);
    setIsLoadingArchitecture(true);
    setTimeout(() => {
      setIsLoadingArchitecture(false);
    }, 450);
  };

  // Animation Step Handlers
  const handleStepNext = () => {
    if (currentStepIndex < activeArchitecture.dataFlowSteps.length) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      const step = activeArchitecture.dataFlowSteps.find((s) => s.stepIndex === nextIdx);
      if (step) {
        const node = activeArchitecture.components.find((c) => c.id === step.activeNodeId);
        if (node) setSelectedNode(node);
      }
    }
  };

  const handleStepPrev = () => {
    if (currentStepIndex > 1) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      const step = activeArchitecture.dataFlowSteps.find((s) => s.stepIndex === prevIdx);
      if (step) {
        const node = activeArchitecture.components.find((c) => c.id === step.activeNodeId);
        if (node) setSelectedNode(node);
      }
    }
  };

  const handleSelectStep = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
    const step = activeArchitecture.dataFlowSteps.find((s) => s.stepIndex === stepIndex);
    if (step) {
      const node = activeArchitecture.components.find((c) => c.id === step.activeNodeId);
      if (node) setSelectedNode(node);
    }
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-[#FBF9F5] text-stone-900 overflow-hidden font-sans">
      {/* Navbar Header Area */}
      <Navbar
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        onSelectCategory={setActiveCategory}
        onSearchChange={setSearchQuery}
        onOpenBuildingBlocks={() => setIsBuildingBlocksOpen(true)}
        onOpenLesson={() => setIsLessonOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenPlayground={() => setIsEndToEndPipelineOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
      />

      {/* Main Workspace Area (Matching Anatomy Atelier .workspace 3-column grid) */}
      <div className="workspace max-w-[1720px] w-full mx-auto flex-1 grid grid-cols-[285px_minmax(620px,1fr)_330px] gap-[18px] my-3 overflow-hidden px-4 md:px-6">
        {/* Left Architecture Library Sidebar */}
        <LeftSidebar
          architectures={filteredArchitectures}
          selectedArchId={selectedArchId}
          onSelectArchitecture={handleSelectArchitecture}
        />

        {/* Center Interactive 3D WebGL Canvas Viewport (.viewer-shell) */}
        <main key={selectedArchId} className="viewer-shell relative h-full rounded-[26px] border border-[rgba(117,91,70,0.18)] bg-[rgba(255,251,244,0.82)] shadow-[0_18px_48px_rgba(87,62,43,0.06)] overflow-hidden animate-page-transition">
          <CanvasContainer
            viewMode={viewMode}
            activeBlockId={activeBlockId}
            weightVal={weightVal}
            biasVal={biasVal}
            inputXVal={inputXVal}
            activationFunc={activationFunc}
            architecture={activeArchitecture}
            selectedNode={selectedNode}
            isIsolated={isIsolated}
            isWireframe={isWireframe}
            isCrossSection={isCrossSection}
            isAutoRotate={isAutoRotate}
            isExplodedView={isExplodedView}
            isPlayingAnimation={isPlayingAnimation}
            trainingPhase={trainingPhase}
            isModalOpen={isModalOpen}
            isLoading={isLoadingArchitecture}
            activeStepNodeId={activeArchitecture.dataFlowSteps.find((s) => s.stepIndex === currentStepIndex)?.activeNodeId}
            onSelectNode={handleSelectNode}
          />

          {/* Vertical Left Tool Ribbon */}
          <ToolRibbon
            isIsolated={isIsolated}
            isWireframe={isWireframe}
            isCrossSection={isCrossSection}
            isAutoRotate={isAutoRotate}
            isExplodedView={isExplodedView}
            onResetView={() => {
              setSelectedNode(null);
              setIsIsolated(false);
              setIsWireframe(false);
              setIsCrossSection(false);
              setIsExplodedView(false);
              setCurrentStepIndex(1);
            }}
            onToggleIsolate={() => setIsIsolated(!isIsolated)}
            onToggleWireframe={() => setIsWireframe(!isWireframe)}
            onToggleCrossSection={() => setIsCrossSection(!isCrossSection)}
            onToggleAutoRotate={() => setIsAutoRotate(!isAutoRotate)}
            onToggleExplodedView={() => setIsExplodedView(!isExplodedView)}
            onOpenCompare={() => setIsCompareOpen(true)}
          />

          {/* Floating Sticky Tip Note (Anatomy Atelier Signature Detail) */}
          <div className="absolute top-5 right-5 p-3 rounded-2xl bg-[#fff2c9] border border-[#f0e2b0] shadow-md text-xs text-[#534a43] max-w-xs z-10 pointer-events-none select-none">
            <div className="flex items-center gap-1.5 font-bold mb-1 text-[#8d6bcc] font-cursive italic">
              <Sparkles className="w-3.5 h-3.5 text-[#eb7c6b]" />
              <span>3D Specimen Interaction Tip</span>
            </div>
            <ul className="space-y-0.5 text-[10px] font-sans opacity-90 text-[#534a43]">
              <li>• Drag canvas to orbit rotate in 3D</li>
              <li>• Scroll to zoom into tensor nodes</li>
              <li>• Click any glowing 3D hotspot pin to inspect math</li>
            </ul>
          </div>
        </main>

        {/* Right Deep Component & Training Inspector Sidebar */}
        <RightSidebar
          architecture={activeArchitecture}
          selectedNode={selectedNode}
          currentStepIndex={currentStepIndex}
          isPlayingAnimation={isPlayingAnimation}
          onTogglePlayAnimation={() => setIsPlayingAnimation(!isPlayingAnimation)}
          onSelectNode={handleSelectNode}
        />
      </div>

      {/* Modals */}
      {isLessonOpen && (
        <LessonModal
          architecture={activeArchitecture}
          onClose={() => setIsLessonOpen(false)}
          onSelectStepNode={(nodeId) => {
            const node = activeArchitecture.components.find((c) => c.id === nodeId);
            if (node) setSelectedNode(node);
          }}
        />
      )}

      {isQuizOpen && (
        <QuizModal
          architecture={activeArchitecture}
          onClose={() => setIsQuizOpen(false)}
        />
      )}

      {isCompareOpen && (
        <CompareModal
          currentArchitecture={activeArchitecture}
          onClose={() => setIsCompareOpen(false)}
        />
      )}

      {isPlaygroundOpen && (
        <PlaygroundModal
          architecture={activeArchitecture}
          onClose={() => setIsPlaygroundOpen(false)}
          onAnimateWithPrompt={() => setIsPlayingAnimation(true)}
        />
      )}

      {isBuildingBlocksOpen && (
        <BuildingBlocksModal
          onClose={() => setIsBuildingBlocksOpen(false)}
        />
      )}

      {isComponentDetailOpen && selectedNode && (
        <ComponentDetailModal
          component={selectedNode}
          architecture={activeArchitecture}
          onClose={() => setIsComponentDetailOpen(false)}
        />
      )}

      {isEndToEndPipelineOpen && (
        <EndToEndPipelineModal
          onClose={() => setIsEndToEndPipelineOpen(false)}
        />
      )}

      {isShareOpen && (
        <ShareModal
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </div>
  );
}
