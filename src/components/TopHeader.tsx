import React from 'react';
import { Compass, Sparkles, User, Orbit } from 'lucide-react';
import { AuthorProfile, ProjectPortal } from '../types/portfolio';

interface TopHeaderProps {
  author: AuthorProfile | null;
  projects: ProjectPortal[];
  activePortalTitle: string | null;
  nearAuthorMonument: boolean;
  onOpenMonument: () => void;
  onOpenDataEditor: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  author,
  projects,
  activePortalTitle,
  nearAuthorMonument,
  onOpenMonument,
  onOpenDataEditor,
}) => {
  return (
    <header className="fixed top-3 left-3 right-3 z-30 pointer-events-none flex items-start justify-between select-none">
      {/* Top Left Spec Badge */}
      <div className="pointer-events-auto flex items-center gap-2.5 p-2 pr-3.5 rounded-2xl bg-[#071712]/95 border border-emerald-700/60 shadow-xl">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md">
          <Sparkles className="w-4 h-4 text-slate-950" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-xs font-bold font-mono tracking-wider text-emerald-200">
              MULTIVERSE HUB
            </h1>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60">
              靜謐森林 · 3D
            </span>
          </div>
          <p className="text-[11px] text-emerald-400/80">
            {author?.name || 'Technical Artist'} · {projects.length} 個林間星門入口
          </p>
        </div>
      </div>

      {/* Center Dynamic Proximity Indicator */}
      <div className="hidden sm:flex pointer-events-auto items-center">
        {activePortalTitle ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400 text-xs font-mono text-cyan-200 shadow-lg animate-in fade-in duration-200">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>已接近星門：{activePortalTitle} (按 E 躍遷)</span>
          </div>
        ) : nearAuthorMonument ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-400 text-xs font-mono text-blue-200 shadow-lg animate-in fade-in duration-200">
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span>已抵達中心碑文 · 作者檔案</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>沿著發光路徑前往各個世界入口</span>
          </div>
        )}
      </div>

      {/* Top Right Quick Actions */}
      <div className="pointer-events-auto flex items-center gap-1.5">
        <button
          onClick={onOpenMonument}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors cursor-pointer shadow-md"
          title="查看作者簡歷與哲學"
        >
          <User className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">作者檔案</span>
        </button>

        <button
          onClick={onOpenDataEditor}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-950/90 hover:bg-cyan-900 text-cyan-200 border border-cyan-600/80 text-xs font-mono transition-colors cursor-pointer shadow-md"
          title="編輯 JSON 資料庫"
        >
          <span>JSON 設定</span>
        </button>
      </div>
    </header>
  );
};
