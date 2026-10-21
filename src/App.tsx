/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import initialPortfolioData from './data/projects.json';
import { ProjectPortal, AuthorProfile } from './types/portfolio';
import { MultiverseScene, SceneHUDState } from './three/MultiverseScene';
import { WorldSpaceHUD } from './components/WorldSpaceHUD';
import { BottomDock } from './components/BottomDock';
import { TopHeader } from './components/TopHeader';
import { DataEditorModal } from './components/DataEditorModal';
import { MobileJoystick } from './components/MobileJoystick';
import { WarpOverlay } from './components/WarpOverlay';
import { soundEngine } from './audio/soundEngine';
import { PortalNode } from './three/worldBuilder';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<MultiverseScene | null>(null);

  // Data state
  const [projects, setProjects] = useState<ProjectPortal[]>(() => initialPortfolioData.projects as ProjectPortal[]);
  const [author, setAuthor] = useState<AuthorProfile>(() => initialPortfolioData.author as AuthorProfile);

  // HUD & 3D Scene reactive state
  const [hudState, setHudState] = useState<SceneHUDState>({
    activePortal: null,
    portalScreenPos: null,
    nearAuthorMonument: false,
    monumentScreenPos: null,
    isWarping: false,
    warpProgress: 0,
    cameraMode: 'TPV',
    playerCoords: { x: 0, z: 4 },
  });

  // Modal visibility
  const [isDataEditorOpen, setIsDataEditorOpen] = useState(false);
  const [forceShowMonumentHologram, setForceShowMonumentHologram] = useState(false);

  // Initialize Three.js WebGL scene once
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const scene = new MultiverseScene(
      canvasMountRef.current,
      projects,
      author,
      (state) => {
        setHudState(state);
      }
    );
    sceneRef.current = scene;

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []); // Run once on mount

  // Handle warp sequence
  const handleWarpToPortal = useCallback((portal: PortalNode) => {
    if (!sceneRef.current) return;
    sceneRef.current.triggerWarp(portal, (url) => {
      // Smoothly open in new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }, []);

  // Keyboard shortcut [E] for warping when near a portal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e' && hudState.activePortal && !hudState.isWarping) {
        handleWarpToPortal(hudState.activePortal);
      }
      if (e.key.toLowerCase() === 'h') {
        // Handled in BottomDock or can toggle HUD
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hudState.activePortal, hudState.isWarping, handleWarpToPortal]);

  // Handle data updates from JSON editor
  const handleApplyDataChanges = (newProjects: ProjectPortal[], newAuthor: AuthorProfile) => {
    setProjects(newProjects);
    setAuthor(newAuthor);
    if (sceneRef.current) {
      sceneRef.current.author = newAuthor;
      sceneRef.current.rebuildWorld(newProjects);
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#04060d]">
      {/* Isolated Three.js WebGL Canvas Mount Container */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing outline-none"
        tabIndex={0}
      />

      {/* Top Header Bar & Status */}
      <TopHeader
        author={author}
        projects={projects}
        activePortalTitle={hudState.activePortal?.project.title || null}
        nearAuthorMonument={hudState.nearAuthorMonument}
        onOpenMonument={() => {
          if (sceneRef.current) {
            sceneRef.current.teleportToCenter();
          }
          setForceShowMonumentHologram(true);
        }}
        onOpenDataEditor={() => setIsDataEditorOpen(true)}
      />

      {/* In-World 3D Spatial Holographic Panels */}
      <WorldSpaceHUD
        activePortal={hudState.activePortal}
        portalScreenPos={hudState.portalScreenPos}
        nearAuthorMonument={hudState.nearAuthorMonument || forceShowMonumentHologram}
        monumentScreenPos={
          hudState.monumentScreenPos ||
          (forceShowMonumentHologram
            ? { x: window.innerWidth / 2, y: window.innerHeight / 2 - 40, inView: true }
            : null)
        }
        author={author}
        onWarpToPortal={handleWarpToPortal}
        onDismissMonument={() => setForceShowMonumentHologram(false)}
      />

      {/* Warp Transition Visual FX */}
      <WarpOverlay
        isWarping={hudState.isWarping}
        warpProgress={hudState.warpProgress}
        portal={hudState.activePortal}
      />

      {/* Mobile Virtual Joystick */}
      <MobileJoystick
        onMove={(x, y) => {
          if (sceneRef.current) {
            sceneRef.current.setJoystickVector(x, y);
          }
        }}
      />

      {/* Consolidated Ergonomic Bottom Dock (No Viewport Occlusion) */}
      <BottomDock
        projects={projects}
        cameraMode={hudState.cameraMode}
        playerCoords={hudState.playerCoords}
        onToggleCameraMode={() => sceneRef.current?.toggleCameraMode()}
        onTeleportToCenter={() => sceneRef.current?.teleportToCenter()}
        onTeleportToPortal={(index) => sceneRef.current?.teleportToPortal(index)}
        onOpenDataEditor={() => setIsDataEditorOpen(true)}
      />

      {/* Multiverse Data Configurator & JSON Editor */}
      <DataEditorModal
        isOpen={isDataEditorOpen}
        onClose={() => setIsDataEditorOpen(false)}
        currentProjects={projects}
        currentAuthor={author}
        onApplyChanges={handleApplyDataChanges}
      />
    </main>
  );
}
