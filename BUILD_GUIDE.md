# BUILD_GUIDE.md

## 建置、測試與部署指南 (Build & Deployment Guide)

### 1. 開發與建置指令

```bash
# 安裝所有相依套件
npm install

# 啟動即時開發伺服器 (Port 3000)
npm run dev

# 檢查 TypeScript 型別與語法
npm run lint

# 生產環境編譯打包 (Vite Rollup 最佳化)
npm run build

# 本地預覽生產建置產物
npm run preview
```

### 2. 效能最佳化策略

- **軟體 WebGL 防護 (Software-WebGL Guard)**：
  透過 `WEBGL_debug_renderer_info` 檢測 SwiftShader / llvmpipe，自動調降像素比 (PixelRatio = 1.0) 並切換為有界節奏循環 (`fenceSync` + `afterDraw`)，確保低階無 GPU 環境也能流暢運作。
- **無垃圾回收 (Zero GC) 循環**：
  Per-frame 動畫循環中不重複分配 `new THREE.Vector3()`，全面複用模組層級暫存向量 (`_vec3A`, `_vec3B`, `_vec3CamTarget`)。
- **程式化音效零載入延遲**：
  整合 Web Audio API 振盪器與濾波器，無須下載大型音效檔案，隨開即響。

### 3. 一鍵部署至 GitHub Pages / Vercel / Cloud Run

- **GitHub Pages**：將 `vite.config.ts` 中的 `base` 設為 Repository 名稱，將 `dist/` 資料夾輸出至 `gh-pages` 分支。
- **Vercel / Netlify**：直接匯入儲存庫，Build Command 設為 `npm run build`，Output Directory 設為 `dist`。
- **AI Studio / Cloud Run**：已內建自動化 Docker 與 Node.js 支援。
