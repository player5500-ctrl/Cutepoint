# GA 數據頁設定教學（萌點 / Cutepoint）

讓 `https://cutepoint.vercel.app/admin/analytics` 顯示真實 GA4 數據，共 5 個步驟，約 15 分鐘。

---

## 步驟 1：建立 Google Cloud 服務帳戶（Service Account）

後台是用「服務帳戶」的身分去讀 GA4 數據，所以要先建立一個。

1. 開啟 [Google Cloud Console](https://console.cloud.google.com/)，用**管理 GA 的同一個 Google 帳號**登入。
2. 頂部專案選單 → 「新增專案」，名稱例如 `cutepoint-analytics` → 建立 → 建立完成後切換到該專案。
3. 左上選單 ☰ → 「API 和服務」→「程式庫」。
4. 搜尋 **Google Analytics Data API** → 點進去 → 按「啟用」。
   - 注意是 **Data API**，不是 Admin API 也不是舊的 Reporting API。
5. 左上選單 ☰ → 「IAM 與管理」→「服務帳戶」→「建立服務帳戶」。
   - 名稱：`cutepoint-ga-reader`（可自訂）
   - 「授予這個服務帳戶專案存取權」：**直接略過**，不用給任何角色（權限是在 GA4 那邊給的）
   - 按「完成」。
6. 回到服務帳戶列表，點剛建立的帳戶 → 「金鑰」分頁 → 「新增金鑰」→「建立新的金鑰」→ 選 **JSON** → 建立。
   - 瀏覽器會下載一個 `.json` 檔，**妥善保存，不要放進專案資料夾、不要 commit 到 git**。

JSON 檔內容長這樣，等一下會用到兩個欄位：

```json
{
  "client_email": "cutepoint-ga-reader@xxxx.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADAN...\n-----END PRIVATE KEY-----\n"
}
```

---

## 步驟 2：取得萌點的 GA4 Property ID

1. 開啟 [Google Analytics](https://analytics.google.com/)，切換到萌點網站的資源（Property）。
2. 左下角「管理」（齒輪）→ 資源欄位 →「資源詳細資料」。
3. 右上角會顯示「資源 ID」，是一串**純數字**，例如 `987654321`。記下來。
   - 注意：不是 `G-XXXXXXX`（那是 Measurement ID，前台埋碼用的），API 要的是純數字資源 ID。

---

## 步驟 3：把服務帳戶加進 GA4（給讀取權限）

1. 一樣在 GA 「管理」→ 資源欄位 →「資源存取管理」。
2. 右上角「＋」→「新增使用者」。
3. 電子郵件貼上步驟 1 JSON 檔裡的 `client_email`（`...@....iam.gserviceaccount.com`）。
4. 角色選 **檢視者（Viewer）** 即可，取消勾選「通知新使用者」→ 新增。

> 沒做這步的話，API 會回 403 PERMISSION_DENIED，後台會顯示「暫時無法取得 GA 數據」。

---

## 步驟 4：在 Vercel 設定環境變數

1. 開啟 [Vercel Dashboard](https://vercel.com/) → 進入 **cutepoint** 專案 → 「Settings」→「Environment Variables」。
2. 依序新增以下 3 個變數（Environment 至少勾 **Production**，建議 Preview 也勾）：

| 變數名稱 | 值 | 來源 |
|---|---|---|
| `GA4_PROPERTY_ID_CUTEPOINT` | 純數字，例如 `987654321` | 步驟 2 |
| `GOOGLE_ANALYTICS_CLIENT_EMAIL` | `cutepoint-ga-reader@xxxx.iam.gserviceaccount.com` | JSON 的 `client_email` |
| `GOOGLE_ANALYTICS_PRIVATE_KEY` | 整段 private key（見下方說明） | JSON 的 `private_key` |

**private key 貼法（最容易出錯的一步）：**

- 複製 JSON 檔中 `private_key` 的**整個值**（雙引號內的全部內容），包含開頭 `-----BEGIN PRIVATE KEY-----` 和結尾 `-----END PRIVATE KEY-----\n`。
- 直接原樣貼上即可——中間的 `\n` 不用自己改，程式已經會自動把 `\n` 還原成換行。
- 若是從別處複製到「已經是多行」的 key，直接多行貼上也可以，兩種格式都支援。

**三個都不可以加 `NEXT_PUBLIC_` 前綴**，加了 key 就會被打包進前端、任何人都看得到。

3. 存檔後 → 「Deployments」分頁 → 最新一筆右側「⋯」→ **Redeploy**。
   - 環境變數改完**一定要重新部署**才會生效。

---

## 步驟 5：驗證

1. 開 `https://cutepoint.vercel.app/admin` → 輸入後台密碼登入。
2. 右上按「📊 GA 數據」→ 進入 `/admin/analytics`。
3. 正常會看到：今日使用者、近 7 天使用者/瀏覽量、詢價/試算/LINE/FB 事件數、熱門頁面、事件排行、流量來源、7 天趨勢圖。
4. 上方可切換「今天 / 近 7 天 / 近 30 天」，切換後所有卡片、排行與趨勢圖都會一起更新。

---

## 步驟 6：讓 Facebook 導流可以被分析（UTM 標記）

後台的「📣 Facebook 導流分析」區塊會自動辨識 `facebook`、`m.facebook.com`、`l.facebook.com`、
`lm.facebook.com`、Meta 廣告、Messenger 等來源。但要看到「哪一篇貼文、哪一個活動」帶來詢價，
貼文網址必須自己加上 UTM 參數。

貼文網址範例（後台也有「複製範例網址」按鈕）：

```
https://cutepoint.vercel.app/?utm_source=facebook&utm_medium=organic_social&utm_campaign=pet_figure&utm_content=calico_cat_post
```

| 參數 | 意義 | 建議值 |
|---|---|---|
| `utm_source` | 流量平台 | `facebook` |
| `utm_medium` | 自然貼文或付費廣告 | 自然貼文 `organic_social`／付費廣告 `paid_social` |
| `utm_campaign` | 行銷活動名稱 | 例：`pet_figure`、`year_end_gift` |
| `utm_content` | 個別貼文名稱 | 例：`calico_cat_post` |

注意事項：

- 沒帶 UTM 的 Facebook 流量仍會計入「FB 導入工作階段」，並歸類為自然流量，
  但不會出現在「熱門活動 / 熱門貼文」排行（後台會顯示提示文字）。
- 建議只用英文小寫與底線，避免中文與空白，報表比較好讀。
- 同一個活動的不同貼文，`utm_campaign` 相同、`utm_content` 各自不同。
- 轉換率＝該來源的 `submit_inquiry` ÷ 工作階段數；工作階段為 0 時顯示 `0%`。

---

## 常見問題排除

| 畫面 / 錯誤 | 原因 | 解法 |
|---|---|---|
| 顯示「GA 數據尚未設定」 | 3 個環境變數缺一或打錯名稱、或改完沒 Redeploy | 檢查變數名稱拼字 → Redeploy |
| 顯示「暫時無法取得 GA 數據」 | ① 服務帳戶沒加進 GA4（403）② Data API 沒啟用 ③ Property ID 錯 | 重做步驟 3 / 步驟 1-4 / 確認是純數字資源 ID |
| Vercel Function 日誌出現 `invalid_grant` | private key 貼壞（少了頭尾、被截斷） | 重新完整複製 JSON 的 `private_key` 值再貼一次 |
| 數字全是 0 | GA4 資源是新的、還沒累積數據；或事件名稱未在前台觸發過 | 等數據進來；到 GA「即時報表」確認事件有進 |
| 剛改完 GA 設定但後台數字沒變 | 後台有 1 小時快取 | 屬正常，最多 1 小時後更新 |
| 出現「⚠️ 快取數據」黃色提示 | 當下連不上 GA4，顯示上次成功的快取 | 通常暫時性，稍後自動恢復 |
| Facebook 區塊顯示「尚無可辨識的 Facebook UTM 流量」 | 貼文網址沒帶 UTM 參數 | 依步驟 6 在貼文網址加上 UTM |
| FB 導入工作階段有數字，但熱門貼文空白 | 有 FB 流量但沒有 `utm_content` | 之後的貼文都補上 `utm_content` |

## 安全備忘

- service account 的 JSON 金鑰檔**永遠不要**放進專案、不要 commit、不要傳給別人。
- key 只存在 Vercel 環境變數（server 端），前端 bundle 已驗證不含任何 key 內容。
- 若懷疑 key 外洩：GCP 服務帳戶 →「金鑰」→ 刪除舊金鑰 → 建新的 → 更新 Vercel 變數 → Redeploy。
