# PORTFOLIO_DATA.md

## 專案資料架構與擴充規範 (Data-Driven Schema)

本作品集入口採用 **100% 資料驅動 (Data-Driven Architecture)**。所有世界入口、傳送門、發光石階與作者資訊皆由 `projects.json` 即時解析並由 Three.js 空間演算引擎動態生成。

### 1. JSON 欄位結構定義

```json
{
  "author": {
    "name": "作者姓名",
    "title": "專業職稱",
    "headline": "一句話定位 / Slogan",
    "bio": "個人簡介與專業背景",
    "philosophy": "設計或工程哲學",
    "stats": [
      { "label": "標籤", "value": "數值" }
    ],
    "skills": [
      { "category": "技能類別", "items": ["技能1", "技能2"] }
    ],
    "socialLinks": [
      { "name": "平台名稱", "url": "外部連結", "icon": "圖標名稱" }
    ]
  },
  "projects": [
    {
      "id": "proj-01",
      "title": "作品名稱",
      "category": "領域分類 (例如：3D 遊戲 / WebGL / 技術美術)",
      "role": "負責角色 (例如：Lead Technical Artist)",
      "year": "完成年份",
      "description": "作品核心亮點與技術敘述",
      "url": "外部展示/Repo 網址 (按下傳送門躍遷的跳轉目的地)",
      "thumbnail": "預覽圖網址",
      "themeColor": "16 進位主題色彩 (例如 #38bdf8)，將同步改變 3D 傳送門、粒子與石階光芒",
      "environmentType": "stellar | cyberpunk | nature | fantasy | minimal",
      "tags": ["技術標籤1", "技術標籤2"],
      "metrics": "效能或成果指標 (例如：60 FPS on Mobile)"
    }
  ]
}
```

### 2. 動態生成演算法運作機制 (Procedural Pathing)

1. **放射狀角度均分**：
   系統計算 `angle = (2 * Math.PI * index) / projects.length`，在 360 度空間中均勻散布。
2. **路徑長度自適應**：
   根據專案數量動態計算擴展半徑 `radius = Math.max(18, 14 + count * 1.4)`，避免多節點時互相遮擋。
3. **主題色動態綁定**：
   每個傳送門之 `PointLight`、星環粒子 (`Points`)、漩渦紋理 (`CanvasTexture`) 與石階地磚符文均依據 `themeColor` 即時繪製並賦予獨立發光氛圍。
4. **即時編輯與測試**：
   在網頁中點擊底欄的「自訂宇宙資料 (JSON)」，可直接編輯或切換預設範本（支援 10 條放射路徑壓力測試），點擊套用後立即無縫重構 3D 空間！
