import React, { useState } from 'react';
import { X, Check, Copy, RefreshCw, Plus, FileText, AlertCircle } from 'lucide-react';
import { ProjectPortal, AuthorProfile } from '../types/portfolio';
import { soundEngine } from '../audio/soundEngine';

interface DataEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProjects: ProjectPortal[];
  currentAuthor: AuthorProfile;
  onApplyChanges: (projects: ProjectPortal[], author: AuthorProfile) => void;
}

export const DataEditorModal: React.FC<DataEditorModalProps> = ({
  isOpen,
  onClose,
  currentProjects,
  currentAuthor,
  onApplyChanges,
}) => {
  const [jsonText, setJsonText] = useState(() =>
    JSON.stringify({ author: currentAuthor, projects: currentProjects }, null, 2)
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'presets'>('editor');

  if (!isOpen) return null;

  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed.projects)) {
        throw new Error('JSON 格式錯誤：根物件中必須包含 "projects" 陣列！');
      }
      if (parsed.projects.length === 0) {
        throw new Error('專案陣列至少需要包含 1 個作品入口！');
      }

      setErrorMessage(null);
      soundEngine.playUiChime(true);
      onApplyChanges(parsed.projects, parsed.author || currentAuthor);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('無效的 JSON 語法');
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddProject = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const newId = `proj-0${(parsed.projects?.length || 0) + 1}`;
      const colors = ['#38bdf8', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f43f5e'];
      const chosenColor = colors[Math.floor(Math.random() * colors.length)];

      const newProj: ProjectPortal = {
        id: newId,
        title: `新探索領域 #${newId}`,
        category: '互動體驗與實驗網頁',
        role: 'Creator & Developer',
        year: '2026',
        description: '透過動態 JSON 新增的世界入口。系統將自動計算輻射角並生成全新的發光石階與主題色星門。',
        url: 'https://threejs.org',
        thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
        themeColor: chosenColor,
        environmentType: 'stellar',
        tags: ['NewWorld', 'DynamicJSON', 'Three.js'],
        metrics: 'Live Generated Node',
      };

      parsed.projects = [...(parsed.projects || []), newProj];
      const updated = JSON.stringify(parsed, null, 2);
      setJsonText(updated);
      setErrorMessage(null);
      soundEngine.playUiChime();
    } catch {
      setErrorMessage('請先修正目前的 JSON 語法錯誤後再新增專案！');
    }
  };

  const loadPreset = (type: 'techart' | 'web3d' | 'tenNodes' | 'minimal') => {
    let presetProjects: ProjectPortal[] = [];
    if (type === 'techart') {
      presetProjects = currentProjects;
    } else if (type === 'web3d') {
      presetProjects = [
        {
          id: 'w3d-1',
          title: 'Spatial Canvas: 3D 空間白板',
          category: 'Web3D 協作工具',
          role: 'Lead Architect',
          year: '2025',
          description: '支援多人在線拖曳 3D 幾何體的無限空間畫布，整合 WebXR 與實時渲染管線。',
          url: 'https://github.com',
          thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
          themeColor: '#06b6d4',
          environmentType: 'minimal',
          tags: ['WebGL', 'WebXR', 'Three.js'],
        },
        {
          id: 'w3d-2',
          title: 'Cyberpunk Data City: 數據拓撲',
          category: '全息儀表板',
          role: 'Creative Tech',
          year: '2025',
          description: '將雲端微服務架構轉化為發光立體摩天大樓，即時監控數據流量。',
          url: 'https://webglsamples.org',
          thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
          themeColor: '#ec4899',
          environmentType: 'cyberpunk',
          tags: ['Shader', 'DataViz', 'GPU Compute'],
        },
        {
          id: 'w3d-3',
          title: 'Ethereal Forest: 生物發光秘境',
          category: '沉浸式聲音景觀',
          role: 'Environment Tech',
          year: '2024',
          description: '空間音訊合成器搭配對應步伐呼吸的植物發光粒子系統。',
          url: 'https://github.com',
          thumbnail: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=600&q=80',
          themeColor: '#10b981',
          environmentType: 'nature',
          tags: ['AudioSynth', 'Particles'],
        },
        {
          id: 'w3d-4',
          title: 'Quantum Orbit: 粒子物理雲',
          category: '科學模擬',
          role: 'Simulation Dev',
          year: '2024',
          description: 'GPU 加速的百萬粒子引力攝動計算與動態星雲渲染。',
          url: 'https://developer.mozilla.org',
          thumbnail: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=600&q=80',
          themeColor: '#a855f7',
          environmentType: 'stellar',
          tags: ['GPGPU', 'Astrophysics'],
        },
      ];
    } else if (type === 'tenNodes') {
      // 10 Radial Paths Multiverse Stress-test
      presetProjects = Array.from({ length: 10 }).map((_, i) => ({
        id: `node-${i + 1}`,
        title: `異次元星門 · 門徑 0${i + 1}`,
        category: `平行象限探索 ${i + 1}`,
        role: 'Dimensional Explorer',
        year: '2026',
        description: `動態輻射生成的第 ${i + 1} 號傳送節點。驗證 360 度圓形等距排布演算法與獨立主題光源動態綁定。`,
        url: 'https://threejs.org',
        thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
        themeColor: [
          '#38bdf8', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6',
          '#06b6d4', '#f43f5e', '#84cc16', '#6366f1', '#eab308'
        ][i % 10],
        environmentType: 'stellar',
        tags: [`Sector-${i + 1}`, 'Procedural'],
        metrics: `36° Radial Separation`,
      }));
    } else if (type === 'minimal') {
      presetProjects = currentProjects.slice(0, 3);
    }

    const updated = JSON.stringify({ author: currentAuthor, projects: presetProjects }, null, 2);
    setJsonText(updated);
    setErrorMessage(null);
    soundEngine.playUiChime();
    setActiveTab('editor');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-[#090d18] border border-cyan-500/40 shadow-2xl text-white overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#070b14]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold tracking-wide font-mono text-cyan-200">
              MULTIVERSE DATA CONFIGURATOR · 資料驅動中心 (projects.json)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-5 py-2 border-b border-slate-800 bg-slate-900/60 text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-600'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              JSON 即時編輯器
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeTab === 'presets'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-600'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              預設宇宙範例 (Presets)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddProject}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="在 JSON 末端快速新增一個入口路徑"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>快速增加入口</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已複製' : '複製 JSON'}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'editor' ? (
            <div className="flex flex-col h-full space-y-3">
              <div className="text-xs text-slate-400 leading-relaxed">
                說明：在此修改專案清單或作者資訊，點擊「套用並重新構建」後，3D 引擎將即時重新計算輻射半徑、道路角度與傳送門光源色彩，完全無須重整頁面。
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-950/80 border border-red-500/80 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <textarea
                value={jsonText}
                onChange={(e) => {
                  setJsonText(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full flex-1 min-h-[360px] p-4 rounded-xl bg-[#05070e] border border-slate-700 text-emerald-300 font-mono text-xs leading-relaxed focus:outline-none focus:border-cyan-500 transition-colors resize-y select-text"
                spellCheck={false}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                點擊下方預設模板即可快速載入不同領域的作品集資料庫或進行多路徑壓力測試：
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => loadPreset('techart')}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 cursor-pointer transition-all hover:bg-slate-850"
                >
                  <h4 className="font-bold text-sm text-cyan-300 mb-1">
                    1. 資深技術美術與圖形管線 (Default)
                  </h4>
                  <p className="text-xs text-slate-400 mb-2">
                    6 條放射道路：包含 Unity 6 WebGL、PBR 鐘樓、螢光神隱秘境與日冕模擬。
                  </p>
                  <span className="text-[10px] font-mono text-slate-500">6 個世界入口 · 多彩主題色</span>
                </div>

                <div
                  onClick={() => loadPreset('web3d')}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 cursor-pointer transition-all hover:bg-slate-850"
                >
                  <h4 className="font-bold text-sm text-emerald-300 mb-1">
                    2. Web3D 與空間創意技術
                  </h4>
                  <p className="text-xs text-slate-400 mb-2">
                    4 條放射道路：聚焦 WebXR、Three.js、空間資料視覺化與音訊合成器。
                  </p>
                  <span className="text-[10px] font-mono text-slate-500">4 個世界入口 · 現代純淨</span>
                </div>

                <div
                  onClick={() => loadPreset('tenNodes')}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-purple-400 cursor-pointer transition-all hover:bg-slate-850"
                >
                  <h4 className="font-bold text-sm text-purple-300 mb-1">
                    3. 10 條放射星軌極限生成測試 (10 Radial Paths)
                  </h4>
                  <p className="text-xs text-slate-400 mb-2">
                    10 條等距放射道路：測試動態角度間距 (36°)、半徑自動擴展與多色傳送門並行。
                  </p>
                  <span className="text-[10px] font-mono text-slate-500">10 個世界入口 · 高密度測試</span>
                </div>

                <div
                  onClick={() => loadPreset('minimal')}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 cursor-pointer transition-all hover:bg-slate-850"
                >
                  <h4 className="font-bold text-sm text-amber-300 mb-1">
                    4. 極簡三方世界 (Minimal 3 Paths)
                  </h4>
                  <p className="text-xs text-slate-400 mb-2">
                    3 條經典道路：空間開闊，適合精選焦點作品展示。
                  </p>
                  <span className="text-[10px] font-mono text-slate-500">3 個世界入口 · 聚焦展示</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-[#070b14]">
          <div className="text-[11px] font-mono text-slate-400">
            支援即時重繪 3D 空間與光照
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>套用並重新構建 3D 宇宙 (Rebuild World)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
