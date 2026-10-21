import React from 'react';
import { ExternalLink, Sparkles, Navigation, X, BookOpen, Layers, Award, Terminal } from 'lucide-react';
import { PortalNode } from '../three/worldBuilder';
import { AuthorProfile } from '../types/portfolio';
import { soundEngine } from '../audio/soundEngine';

interface WorldSpaceHUDProps {
  activePortal: PortalNode | null;
  portalScreenPos: { x: number; y: number; inView: boolean } | null;
  nearAuthorMonument: boolean;
  monumentScreenPos: { x: number; y: number; inView: boolean } | null;
  author: AuthorProfile | null;
  onWarpToPortal: (portal: PortalNode) => void;
  onDismissMonument: () => void;
}

export const WorldSpaceHUD: React.FC<WorldSpaceHUDProps> = ({
  activePortal,
  portalScreenPos,
  nearAuthorMonument,
  monumentScreenPos,
  author,
  onWarpToPortal,
  onDismissMonument,
}) => {
  // 1. Render Floating Holographic Portal Card
  const renderPortalCard = () => {
    if (!activePortal || !portalScreenPos || !portalScreenPos.inView) return null;

    const proj = activePortal.project;
    const themeColor = proj.themeColor || '#38bdf8';

    // Clamp coordinates within screen boundaries
    const screenX = Math.max(160, Math.min(window.innerWidth - 160, portalScreenPos.x));
    const screenY = Math.max(120, Math.min(window.innerHeight - 200, portalScreenPos.y));

    return (
      <div
        className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-full transition-all duration-300 ease-out z-20"
        style={{
          left: `${screenX}px`,
          top: `${screenY - 14}px`,
          maxWidth: '380px',
          width: '90vw',
        }}
      >
        <div
          className="relative rounded-2xl p-4 bg-[#0a0f1d] border shadow-2xl transition-all"
          style={{
            borderColor: `${themeColor}88`,
            boxShadow: `0 12px 36px -8px ${themeColor}40, 0 0 20px ${themeColor}20`,
          }}
        >
          {/* Hologram top antenna line */}
          <div
            className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-full"
            style={{ backgroundColor: themeColor }}
          />

          {/* Header Tag / Year / Category */}
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[11px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${themeColor}22`,
                color: themeColor,
                border: `1px solid ${themeColor}55`,
              }}
            >
              {proj.category}
            </span>
            <span className="text-xs font-mono text-slate-400">{proj.year}</span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-4 h-4" style={{ color: themeColor }} />
            {proj.title}
          </h3>

          {/* Role & Metrics */}
          <div className="text-xs font-medium text-slate-300 mb-2">
            {proj.role}
            {proj.metrics && (
              <span className="text-slate-400 ml-1">· {proj.metrics}</span>
            )}
          </div>

          {/* Thumbnail preview if available */}
          {proj.thumbnail && (
            <div className="relative w-full h-28 rounded-lg overflow-hidden mb-3 border border-slate-700/60 bg-slate-900">
              <img
                src={proj.thumbnail}
                alt={proj.title}
                className="w-full h-full object-cover opacity-85 hover:opacity-100 transition-opacity"
                loading="lazy"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(to top, #0a0f1d 0%, transparent 60%)`,
                }}
              />
            </div>
          )}

          {/* Description */}
          <p className="text-xs text-slate-300 leading-relaxed mb-3 line-clamp-3">
            {proj.description}
          </p>

          {/* Tags */}
          {proj.tags && proj.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {proj.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Interactive Warp CTA */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
            <button
              onClick={() => {
                soundEngine.playUiChime(true);
                onWarpToPortal(activePortal);
              }}
              className="flex-1 py-2 px-3 rounded-lg font-medium text-xs tracking-wider uppercase text-white flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              style={{
                backgroundColor: themeColor,
                color: '#050711',
                fontWeight: 700,
              }}
            >
              <Navigation className="w-3.5 h-3.5 fill-current" />
              躍遷前往新世界 (Enter World)
            </button>

            <a
              href={proj.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundEngine.playUiChime()}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="另開新分頁瀏覽"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Keyboard tip */}
          <div className="text-[10px] text-center font-mono text-slate-400 mt-2">
            按 [E] 鍵或點擊上方按鈕立即躍遷傳送
          </div>
        </div>

        {/* Pointer Triangle pointing down to 3D portal */}
        <div
          className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] mx-auto -mt-0.5"
          style={{ borderTopColor: themeColor }}
        />
      </div>
    );
  };

  // 2. Render Author Profile Hologram (Near Central Monument)
  const renderAuthorMonumentHologram = () => {
    if (!nearAuthorMonument || !monumentScreenPos || !monumentScreenPos.inView || !author) {
      return null;
    }

    const screenX = Math.max(200, Math.min(window.innerWidth - 200, monumentScreenPos.x));
    const screenY = Math.max(140, Math.min(window.innerHeight - 240, monumentScreenPos.y));

    return (
      <div
        className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-full transition-all duration-300 ease-out z-20"
        style={{
          left: `${screenX}px`,
          top: `${screenY - 20}px`,
          maxWidth: '460px',
          width: '92vw',
        }}
      >
        <div className="relative rounded-2xl p-5 bg-[#070b16] border border-cyan-500/60 shadow-2xl text-white">
          {/* Hologram top cyan light beacon */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-0.5 rounded-full bg-cyan-950 border border-cyan-400 text-[10px] font-mono text-cyan-300 tracking-widest uppercase flex items-center gap-1">
            <Terminal className="w-3 h-3 text-cyan-400" />
            CENTRAL ARCHIVE · 中心樞紐碑文
          </div>

          {/* Dismiss button */}
          <button
            onClick={onDismissMonument}
            className="absolute top-3.5 right-3.5 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="關閉"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Author Header */}
          <div className="flex items-start gap-3 mt-1 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-lg text-slate-950 shadow-lg">
              KV
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                {author.name}
              </h2>
              <p className="text-xs font-mono text-cyan-400">{author.title}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{author.headline}</p>
            </div>
          </div>

          {/* Philosophy Quote */}
          {author.philosophy && (
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 italic mb-3 flex items-start gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>{author.philosophy}</span>
            </div>
          )}

          {/* Bio Summary */}
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {author.bio}
          </p>

          {/* Stats Grid */}
          {author.stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {author.stats.map((st, i) => (
                <div
                  key={i}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center"
                >
                  <div className="text-[10px] text-slate-400">{st.label}</div>
                  <div className="text-xs font-mono font-bold text-cyan-300 mt-0.5">
                    {st.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skills Breakdown */}
          {author.skills && author.skills.length > 0 && (
            <div className="space-y-2 mb-3">
              {author.skills.map((grp, idx) => (
                <div key={idx}>
                  <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-cyan-400" />
                    {grp.category}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {grp.items.map((sk) => (
                      <span
                        key={sk}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/60 text-cyan-200"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Social Links */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              社群與聯繫
            </span>
            <div className="flex items-center gap-1.5">
              {author.socialLinks?.map((lnk) => (
                <a
                  key={lnk.name}
                  href={lnk.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-900 text-[11px] font-mono text-slate-300 hover:text-cyan-200 transition-colors border border-slate-700 hover:border-cyan-500"
                >
                  {lnk.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Pointer Triangle pointing down to center monument */}
        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-cyan-500 mx-auto -mt-0.5" />
      </div>
    );
  };

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      {renderPortalCard()}
      {renderAuthorMonumentHologram()}
    </div>
  );
};
