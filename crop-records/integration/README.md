# 自動化溫室控制系統對接規格

供智慧農業自動化控制系統（澆灌、抽風、施肥等）將作業事件自動寫入：

1. **農作物生產履歷 APP**（Supabase 資料庫，記錄人顯示「自動化」）
2. **產銷履歷農事紀錄試算表_TAP_Database**（Google Sheet，作業人員填「自動化」）
   - 澆灌、抽風 → 「一般作業記錄」分頁
   - 施肥 → 「施肥紀錄」分頁

> 目前農業部自動化系統的正式 API 規格尚未取得。本規格為我方的通用接收格式，
> 任何系統照此格式傳送即可；待取得農業部規格後，再加一層轉接程式即可，不需改動本 API。

## 啟用步驟

1. **試算表端**：依照 `apps-script/Code.gs` 檔頭的步驟，將 Apps Script 部署到你的試算表，取得網頁應用程式 URL。
2. **APP 端**：以農場負責人身分登入 → 設定 → 自動化系統對接 → 產生 API 金鑰 → 貼上 Apps Script URL 並儲存。
3. **自動化系統端**：照下方格式呼叫 API。

## API 規格

```
POST https://qvlsfudvhwjwrkgmxxgp.supabase.co/functions/v1/automation-ingest
Content-Type: application/json
x-api-key: <農場自動化 API 金鑰>
```

### 請求欄位

| 欄位 | 必填 | 說明 |
|------|------|------|
| `event_type` | ✅ | `irrigation`（澆灌）、`fertilization`（施肥）、`ventilation`（抽風）、`other` |
| `field_name` 或 `field_id` | ✅ | APP 內的田區名稱（需完全一致）或田區 UUID |
| `batch_id` | — | 試算表的批次ID；未填以田區名稱代替 |
| `timestamp` | — | ISO 8601 時間（建議含 `+08:00` 時區）；未填以現在時間記錄 |
| `description` | — | 作業內容（如「滴灌 30 分鐘」）；未填自動產生 |
| `notes` | — | 備註 |
| `materials` | 施肥時填 | 資材陣列，欄位見下 |

`materials` 每筆欄位：`name`（肥料名稱）、`quantity`（使用量）、`unit`（單位）、
`brand`（廠牌製造商）、`license_no`（肥料登記證字號）、`method`（施用方法）。
施肥寫入試算表時取第一筆資材。

### 範例：澆灌

```bash
curl -X POST https://qvlsfudvhwjwrkgmxxgp.supabase.co/functions/v1/automation-ingest \
  -H "Content-Type: application/json" \
  -H "x-api-key: <API金鑰>" \
  -d '{
    "event_type": "irrigation",
    "field_name": "A區",
    "batch_id": "B2026-001",
    "timestamp": "2026-06-10T08:00:00+08:00",
    "description": "滴灌 30 分鐘"
  }'
```

### 範例：施肥

```bash
curl -X POST https://qvlsfudvhwjwrkgmxxgp.supabase.co/functions/v1/automation-ingest \
  -H "Content-Type: application/json" \
  -H "x-api-key: <API金鑰>" \
  -d '{
    "event_type": "fertilization",
    "field_name": "A區",
    "batch_id": "B2026-001",
    "materials": [{
      "name": "台肥43號",
      "quantity": 20,
      "unit": "公斤",
      "brand": "台肥",
      "license_no": "肥製(質)字第0000000號",
      "method": "撒施"
    }]
  }'
```

### 回應

```json
{ "ok": true, "record_id": "...", "record_date": "2026-06-10", "sheet": "ok" }
```

`sheet` 為 `"ok"`（已寫入試算表）、`"not configured"`（尚未設定 Apps Script 網址）
或 `"error: ..."`（試算表寫入失敗，但 APP 資料庫已寫入成功）。

錯誤時回傳對應 HTTP 狀態碼與 `{ "error": "..." }`：
`401` 金鑰錯誤、`400` 格式錯誤、`404` 找不到田區。

## 病蟲害照片與 AI 辨識（APP 內建功能）

新增農事記錄選「病蟲害」類型時，可拍照或上傳照片：

1. 照片存入 Supabase Storage（APP 內顯示）
2. 自動備份到你的 Google 雲端硬碟「農事照片備份」資料夾（經 Apps Script）
3. 按「AI 病蟲害辨識」由 Gemini（gemini-2.5-flash）分析照片，結果自動填入作業說明
4. 記錄儲存後，自動寫一列到試算表「作物觀察與病蟲害紀錄」（含照片雲端連結）

啟用條件（農場負責人在「設定 → 自動化系統對接」完成）：
- Apps Script 部署網址（照片備份與試算表寫入）。更新 Apps Script 程式後，
  記得「部署 → 管理部署作業 → 編輯 → 新版本」並重新授權（新增了雲端硬碟權限）
- Gemini API 金鑰（至 [aistudio.google.com](https://aistudio.google.com) 免費取得）。
  金鑰只存在伺服器端資料庫，僅負責人可讀寫，農場成員與前端程式皆接觸不到

## 安全性說明

- API 金鑰為 48 字元隨機字串，每農場一組，只有農場負責人可在 APP 內查看與重新產生（刪除後重建即可換新金鑰）。
- Apps Script 部署網址本身含長隨機字串，僅你的農場設定中持有；如外洩，重新部署 Apps Script 並更新設定即可。
- 試算表寫入失敗不會阻擋 APP 資料庫記錄，避免 Google 服務異常時遺失資料。
