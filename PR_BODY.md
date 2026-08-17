# feat(analytics): 後台新增 Facebook 導流分析與日期範圍

分支：`feature/facebook-ga-analytics`（從 `main` 建立，3 個 commit，未動到正式站）

---

## 修改內容

### 1. GA4 現況檢查（第一部分）— 原本已正確，未重做

| 檢查項目 | 結果 |
|---|---|
| 所有公開頁面載入 GA4 | ✅ `layout.tsx` 掛 `<GoogleAnalytics />`，全站生效 |
| App Router 換頁送 `page_view` | ✅ `PageViewTracker` 監聽 `usePathname` / `useSearchParams` |
| 不重複送 page view | ✅ `gtag('config', { send_page_view: false })`，只由 tracker 送 |
| localhost 不污染正式數據 | ✅ init script 與 `gaEnabled()` 雙重擋 localhost / 127.0.0.1 / .local |
| 後台 API 需管理員驗證 | ✅ `isAuthed()` 檢查 `x-admin-key`（實測錯誤密碼回 401） |
| GA4 失敗不整頁崩潰 | ✅ API 回 `data: null`，前端顯示空狀態 + 重新載入 |
| 每小時快取 + 顯示舊資料 | ✅ 保留，並改為「每個日期範圍各自快取」 |
| 不送個資進 GA4 | ✅ `analytics.ts` 的 `sanitize()` 過濾姓名/電話/Email/地址/留言/金額等鍵 |

### 2. 新增的 GA4 查詢（`src/lib/ga4.ts`）

新增 4 個 Facebook 導流查詢，維度全部使用官方 GA4 Data API 名稱：

| 查詢 | 維度 | 指標 |
|---|---|---|
| FB 流量結構 | `sessionSource`, `sessionMedium`, `sessionCampaignName`, `sessionManualAdContent` | `sessions` |
| FB 導入後事件 | `sessionSource`, `sessionCampaignName`, `sessionManualAdContent`, `eventName` | `eventCount` |
| FB 每日工作階段 | `date`, `sessionSource`, `sessionMedium` | `sessions` |
| FB 每日事件 | `date`, `sessionSource`, `eventName` | `eventCount` |

- `sessionManualAdContent` 即 GA4 對應 `utm_content` 的官方維度（不是自創名稱）。
- 事件查詢用 `dimensionFilter.inListFilter` 只取 `submit_inquiry` / `click_line` / `calculate_price`，降低回傳量。
- Facebook 來源辨識：`facebook`、`m.facebook.com`、`l.facebook.com`、`lm.facebook.com`、
  `web.facebook.com`、`fb`、`fb.me`、`meta`、`meta_ads`、`messenger`、Audience Network（`an`）。
- UTM 分類：`utm_medium` 含 `organic` → 自然貼文；含 `paid` / `cpc` / `ads` → 付費廣告；
  沒帶 UTM 的 Facebook referral 歸為自然流量（使用者點貼文連結進站）。
- 日期範圍：`today` / `7d` / `30d`，`parseRange()` 對亂填參數一律 fallback 為 `7d`。

### 3. 新增的後台指標（`/admin/analytics`）

卡片：FB 導入工作階段、FB 自然流量、FB 付費流量、FB 導入後詢價數、FB 詢價轉換率、
FB 導入後 LINE 點擊數、FB 導入後價格試算次數。

排行與圖表：
- Facebook 熱門活動 Top 5（活動名稱 / 工作階段 / 詢價 / 轉換率）
- Facebook 熱門貼文 Top 5（貼文名稱 / 工作階段 / 詢價 / LINE 點擊）
- Facebook 每日趨勢（工作階段 / 詢價 / LINE 點擊，三色長條，缺少的日期補 0）
- Facebook 來源明細 Top 5

其他：
- 日期範圍切換（今天 / 近 7 天 / 近 30 天），切換後所有卡片、排行、趨勢同步更新。
- 轉換率＝`submit_inquiry ÷ sessions × 100%`，分母 0 一律顯示 `0%`（無 NaN / Infinity）。
- 沒有 UTM 時顯示提示：請在貼文網址加入 utm_source / utm_medium / utm_campaign / utm_content。
- UTM 說明區塊 + 「複製範例網址」按鈕。
- GA4 未設定時明確列出缺少哪些環境變數。
- 保留重新載入按鈕、loading 動畫、快取（stale）黃色提示。
- 手機版：卡片 `min-w-0` + 表格與圖表 `overflow-x-auto`，長活動／貼文名稱 `truncate` 並帶 `title` 可看全名。

### 4. 事件追蹤修正

| 事件 | 原本 | 現在 |
|---|---|---|
| `calculate_price` | 只有按 LINE / 詢價 CTA 才送，且與 `click_line` 同時送造成重複 | 規格變動後 0.8 秒防抖送出（＝試算完成），同一組規格不重送；按 CTA 時若尚未送過才補送 |
| `submit_inquiry` | API 成功後才送（正確） | 保留，並加上連點保護與只送一次的保險 |
| `click_line` | 只有 /contact 與試算頁有 | 補上 Footer（全站） |
| `click_facebook` | 全站沒有任何 FB 連結，事件永遠不會觸發 | Footer 與 /contact 新增粉絲頁連結並追蹤 |

送出的參數只有 `product_type`、`size`、`quantity`、`complexity`、`own_file`、`urgent`、
`source`、`page_path`；沒有姓名、電話、Email、留言、金額。

### 5. 附帶整理

- `src/lib/site.ts`：LINE / Facebook 網址集中管理，可用 `NEXT_PUBLIC_LINE_URL`、
  `NEXT_PUBLIC_FACEBOOK_URL` 覆寫，不寫死也不需要改程式。
- `src/components/TrackedLink.tsx`：外部連結 + 事件追蹤的小元件（讓 Footer 維持 server component）。
- `chore(lint)` commit：把專案原本就存在的 19 個 ESLint 錯誤修掉（`any` 換成
  `CaseRecord` / `InquiryRecord` 型別、react-hooks 誤判加註解），純型別與註解，無行為變更。
- `docs/GA數據設定教學.md`：補上日期範圍與 Facebook UTM 標記章節。

---

## 測試結果

| 指令 | 結果 |
|---|---|
| `npm install` | ✅ 375 packages |
| `npm run lint` | ✅ 0 errors 0 warnings（修改前為 19 errors） |
| `npx tsc --noEmit` | ✅ 無錯誤 |
| `npm run build` | ✅ Compiled successfully，20 頁全部產出成功 |
| 邏輯單元測試（自撰） | ✅ 24 項全通過：FB 來源辨識、UTM medium 分類、除以零保護（`rate(3,0)=0`）、Top5 聚合、缺日補 0、全空資料不炸 |
| API 實測（本機 production server） | ✅ 無密碼 401／錯密碼 401／正確密碼 200；GA env 未設定時回 `configured:false` 並列出缺少變數；`?range=hack` 安全 fallback 為 `7d` |

---

## 需要我（Jazz）操作的項目

1. **Vercel 環境變數**（Settings → Environment Variables，Production + Preview 都勾）：
   `NEXT_PUBLIC_GA_ID_CUTEPOINT`、`GA4_PROPERTY_ID_CUTEPOINT`、
   `GOOGLE_ANALYTICS_CLIENT_EMAIL`、`GOOGLE_ANALYTICS_PRIVATE_KEY`、`ADMIN_PASSWORD`。
   設定完要 Redeploy 才生效。
2. **GA4**：確認 service account email 已加入 GA4 資源的「檢視者」權限，且 Google Analytics Data API 已啟用。
3. **Facebook 貼文網址**：日後貼文請加上 UTM（後台有複製按鈕）。

## 已知限制

- `sessionManualAdContent` 只會有值在有帶 `utm_content` 的流量；歷史貼文無法回溯補 UTM。
- GA4 對 `eventCount` 搭配 session 維度可能出現少量 `(not set)` 歸因，屬 GA4 行為。
- 後台為 1 小時記憶體快取（每個日期範圍各一份），Vercel 冷啟動後首次查詢會重新抓。
- 「近 30 天」趨勢圖在手機上需橫向滑動（已加捲動容器，不會破版）。
