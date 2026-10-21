import React, { useState } from 'react';
import {
  Compass,
  Volume2,
  VolumeX,
  Eye,
  Sliders,
  ChevronDown,
  ChevronUp,
  MapPin,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { ProjectPortal } from '../types/portfolio';
import { soundEngine } from '../audio/soundEngine';

interface BottomDockProps {
  projects: ProjectPortal[];
  cameraMode: 'TPV' | 'FPV';
  playerCoords: { x: number; z: number };
  onToggleCameraMode: () => void;
  onTeleportToCenter: () => void;
  onTeleportToPortal: (index: number) => void;
  onOpenDataEditor: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  projects,
  cameraMode,
  playerCoords,
  onToggleCameraMode,
  onTeleportToCenter,
  onTeleportToPortal,
  onOpenDataEditor,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());
  const [showQuickJump, setShowQuickJump] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);

  const toggleSound = () => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
  };

  return (
    <div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 select-none transition-all duration-300"
      style={{
        maxWidth: 'min(960px, 94vw)',
        width: 'max-content',
        transform: isCollapsed
          ? 'translateX(-50%) translateY(calc(100% - 32px))'
          : 'translateX(-50%) translateY(0)',
      }}
    >
      {/* Quick Jump Dropdown Menu */}
      {showQuickJump && !isCollapsed && (
        <div className="mb-2 p-3 rounded-2xl bg-[#090d18] border border-slate-700 shadow-2xl text-white animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="text-xs font-mono text-cyan-400 font-semibold flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              快速躍遷航點 (Teleport Waypoints)
            </span>
            <button
              onClick={() => setShowQuickJump(false)}
              className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
            >
              關閉 ✕
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-52 overflow-y-auto pr-1">
            <button
              onClick={() => {
                onTeleportToCenter();
                setShowQuickJump(false);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950 text-left border border-slate-700 hover:border-cyan-500 text-xs transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="font-medium text-slate-200 truncate">中心碑文 (Hub)</span>
            </button>

            {projects.map((proj, idx) => (
              <button
                key={proj.id}
                onClick={() => {
                  onTeleportToPortal(idx);
                  setShowQuickJump(false);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-750 text-left border border-slate-700 hover:border-slate-500 text-xs transition-colors flex items-center gap-1.5"
                style={{
                  borderLeftColor: proj.themeColor,
                  borderLeftWidth: '3px',
                }}
              >
                <div className="truncate">
                  <div className="font-medium text-slate-200 truncate">{proj.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{proj.category}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Control Help Guide Popover */}
      {showHelpGuide && !isCollapsed && (
        <div className="mb-2 p-3.5 rounded-2xl bg-[#090d18] border border-slate-700 shadow-2xl text-white text-xs max-w-sm">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="font-mono text-cyan-400 font-semibold flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              探索操作指南 (Controls)
            </span>
            <button
              onClick={() => setShowHelpGuide(false)}
              className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5 text-slate-300 text-[11px] font-mono leading-relaxed">
            <div className="flex justify-between">
              <span className="text-slate-400">移動漫遊</span>
              <span className="text-cyan-300">W / A / S / D 或 方向鍵</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">衝刺加速</span>
              <span className="text-cyan-300">Shift + 移動</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">環視視角</span>
              <span className="text-cyan-300">滑鼠按住拖曳 / 手機單指滑動</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">鏡頭縮放</span>
              <span className="text-cyan-300">滑鼠滾輪 (TPV 模式)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">視角切換</span>
              <span className="text-cyan-300">V 鍵 (第三人稱 / 第一人稱)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">躍遷互動</span>
              <span className="text-cyan-300">靠近傳送門按 E 或 點擊按鈕</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">開關音效</span>
              <span className="text-cyan-300">M 鍵 或 底欄按鈕</span>
            </div>
          </div>
        </div>
      )}

      {/* Unified Dock Container */}
      <div className="rounded-2xl bg-[#090e1a] border border-slate-700/80 shadow-2xl p-1.5 flex flex-col items-center">
        {/* Collapse / Expand Tab Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-[10px] font-mono text-slate-400 hover:text-cyan-300 px-3 py-0.5 rounded-full hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer mb-1"
          title={isCollapsed ? '展開控制列' : '收合控制列 (進入純粹漫遊模式)'}
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3 h-3 text-cyan-400" />
              <span>展開控制列 (Show HUD)</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3 text-slate-400" />
              <span>收合控制列 (Zen Mode)</span>
            </>
          )}
        </button>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-white">
          {/* Coordinates indicator (Static, no pulse) */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
            <MapPin className="w-3 h-3 text-cyan-400" />
            <span>X: {playerCoords.x}</span>
            <span className="text-slate-600">|</span>
            <span>Z: {playerCoords.z}</span>
          </div>

          {/* Camera Mode Toggle */}
          <button
            onClick={() => {
              soundEngine.playUiChime();
              onToggleCameraMode();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-colors font-medium text-slate-200 cursor-pointer"
            title="切換視角 (第三人稱 / 第一人稱，快捷鍵 V)"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>{cameraMode === 'TPV' ? '第三人稱 (TPV)' : '第一人稱 (FPV)'}</span>
          </button>

          {/* Audio Synthesizer Toggle */}
          <button
            onClick={() => {
              soundEngine.playUiChime();
              toggleSound();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-colors font-medium text-slate-200 cursor-pointer"
            title="開啟/關閉森林鳥鳴微風與星門動態混音 (快捷鍵 M)"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">環境音已靜音</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">森林動態混音</span>
              </>
            )}
          </button>

          {/* Teleport / Waypoints Drawer Toggle */}
          <button
            onClick={() => {
              soundEngine.playUiChime();
              setShowQuickJump(!showQuickJump);
              setShowHelpGuide(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors font-medium cursor-pointer ${
              showQuickJump
                ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                : 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 hover:border-slate-600 text-slate-200'
            }`}
            title="快速跳轉至各個世界入口"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>世界航點 ({projects.length})</span>
          </button>

          {/* Reset to Center Hub */}
          <button
            onClick={() => {
              soundEngine.playUiChime();
              onTeleportToCenter();
            }}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-colors font-medium text-slate-200 cursor-pointer"
            title="回到中心出發地"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>回中心碑文</span>
          </button>

          {/* Multiverse Data Editor / JSON Configurator */}
          <button
            onClick={() => {
              soundEngine.playUiChime();
              onOpenDataEditor();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-600/80 transition-colors font-medium text-cyan-200 cursor-pointer"
            title="編輯 projects.json，動態增減道路與網址"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>自訂宇宙資料 (JSON)</span>
          </button>

          {/* Help Guide Toggle */}
          <button
            onClick={() => {
              soundEngine.playUiChime();
              setShowHelpGuide(!showHelpGuide);
              setShowQuickJump(false);
            }}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              showHelpGuide
                ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                : 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="操作指南"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
