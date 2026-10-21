import React from 'react';
import { PortalNode } from '../three/worldBuilder';

interface WarpOverlayProps {
  isWarping: boolean;
  warpProgress: number; // 0 to 1
  portal: PortalNode | null;
}

export const WarpOverlay: React.FC<WarpOverlayProps> = ({
  isWarping,
  warpProgress,
  portal,
}) => {
  if (!isWarping || !portal) return null;

  const themeColor = portal.project.themeColor || '#38bdf8';
  // Flash white/color opacity increases as warpProgress reaches 1
  const flashOpacity = Math.max(0, (warpProgress - 0.7) / 0.3);

  return (
    <div className="fixed inset-0 z-40 pointer-events-none flex flex-col items-center justify-center select-none overflow-hidden">
      {/* Radial Warp Speed Tunnel Lines */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at center, transparent 0%, rgba(4, 6, 13, 0.8) 70%, #04060d 100%)`,
          opacity: 0.85 + warpProgress * 0.15,
        }}
      />

      {/* Chromatic Portal Energy Flash */}
      <div
        className="absolute inset-0 transition-opacity duration-150"
        style={{
          backgroundColor: flashOpacity > 0.8 ? '#ffffff' : themeColor,
          opacity: flashOpacity * 0.95,
        }}
      />

      {/* Warp HUD Status Panel */}
      <div className="relative z-10 flex flex-col items-center text-center p-6 max-w-md">
        <div
          className="text-xs font-mono font-bold tracking-widest uppercase mb-2 px-3 py-1 rounded-full border"
          style={{
            backgroundColor: `${themeColor}20`,
            borderColor: themeColor,
            color: themeColor,
          }}
        >
          HYPERSPACE TRANSIT · 時空躍遷中
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide mb-1 drop-shadow-lg">
          {portal.project.title}
        </h1>

        <p className="text-xs font-mono text-slate-300 mb-5">
          正在錨定目標坐標與開啟傳送網絡...
        </p>

        {/* Progress bar */}
        <div className="w-64 h-1.5 rounded-full bg-slate-800 border border-slate-700 overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all duration-75"
            style={{
              width: `${warpProgress * 100}%`,
              backgroundColor: themeColor,
              boxShadow: `0 0 12px ${themeColor}`,
            }}
          />
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          WARP SYNCHRONIZING: {Math.round(warpProgress * 100)}%
        </span>
      </div>
    </div>
  );
};
