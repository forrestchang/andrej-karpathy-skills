// =============================================
// automation-ingest：自動化溫室控制系統對接 API
//
// POST /functions/v1/automation-ingest
// Header:  x-api-key: <農場自動化 API 金鑰>（在 APP 設定頁產生）
// Body（JSON）：
// {
//   "event_type": "irrigation" | "fertilization" | "ventilation" | "other",
//   "field_name": "A區",            // 或改用 "field_id"（APP 內的田區 UUID）
//   "batch_id":   "B2026-001",      // 產銷履歷試算表的批次ID（選填，未填以田區名代替）
//   "timestamp":  "2026-06-10T08:00:00+08:00",  // 選填，預設為現在
//   "description": "滴灌 30 分鐘",   // 選填
//   "notes": "",                     // 選填
//   "materials": [                   // 施肥時填寫
//     { "name": "台肥43號", "quantity": 20, "unit": "公斤",
//       "brand": "台肥", "license_no": "肥製(質)字第0000000號", "method": "撒施" }
//   ]
// }
//
// 寫入順序：1. APP 資料庫（activity_records，作業人=自動化）
//           2. Google Sheet（透過農場設定的 Apps Script 網址，失敗不影響第 1 步）
// =============================================
import { createClient } from "jsr:@supabase/supabase-js@2";

const EVENT_TO_ACTIVITY: Record<string, string> = {
  irrigation: "灌溉",
  fertilization: "施肥",
  ventilation: "其他",
  other: "其他",
};

// 試算表「一般作業記錄」的作業種類用詞
const EVENT_LABEL: Record<string, string> = {
  irrigation: "澆灌",
  fertilization: "施肥",
  ventilation: "抽風",
  other: "其他",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// 以台灣時區計算記錄日期，避免 UTC 換算造成跨日
function taiwanDate(ts: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei" }).format(ts);
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) return json({ error: "missing x-api-key header" }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: auto } = await supabase
    .from("farm_automation")
    .select("farm_id, sheet_webhook_url")
    .eq("api_key", apiKey)
    .maybeSingle();
  if (!auto) return json({ error: "invalid api key" }, 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }

  const eventType = String(body.event_type ?? "");
  if (!EVENT_TO_ACTIVITY[eventType]) {
    return json({ error: "event_type must be one of: irrigation, fertilization, ventilation, other" }, 400);
  }

  // 田區比對：field_id 或 field_name 擇一
  let fieldQuery = supabase.from("fields").select("id, name").eq("farm_id", auto.farm_id);
  if (body.field_id) fieldQuery = fieldQuery.eq("id", String(body.field_id));
  else if (body.field_name) fieldQuery = fieldQuery.eq("name", String(body.field_name));
  else return json({ error: "field_id or field_name is required" }, 400);

  const { data: field } = await fieldQuery.maybeSingle();
  if (!field) return json({ error: "field not found in this farm" }, 404);

  const ts = body.timestamp ? new Date(String(body.timestamp)) : new Date();
  if (isNaN(ts.getTime())) return json({ error: "invalid timestamp" }, 400);
  const recordDate = taiwanDate(ts);

  const materials = Array.isArray(body.materials) ? body.materials : [];
  const description = String(body.description ?? "") || `自動化${EVENT_LABEL[eventType]}`;
  const notes = String(body.notes ?? "");

  const { data: record, error: insertErr } = await supabase
    .from("activity_records")
    .insert({
      farm_id: auto.farm_id,
      field_id: field.id,
      activity_type: EVENT_TO_ACTIVITY[eventType],
      record_date: recordDate,
      weather: "不記錄",
      materials,
      description,
      notes,
      source: "automation",
      recorded_by: null,
    })
    .select("id")
    .single();
  if (insertErr) return json({ error: insertErr.message }, 500);

  await supabase
    .from("farm_automation")
    .update({ last_used_at: new Date().toISOString() })
    .eq("farm_id", auto.farm_id);

  // 寫入 Google Sheet（產銷履歷試算表）
  let sheet = "not configured";
  if (auto.sheet_webhook_url) {
    const batchId = String(body.batch_id ?? "") || field.name;
    let payload;
    if (eventType === "fertilization") {
      // 施肥紀錄：施肥日期,批次ID,肥料名稱,廠牌製造商,肥料登記證字號,施用方法,使用量,作業人員
      const m = (materials[0] ?? {}) as Record<string, unknown>;
      payload = {
        sheet: "施肥紀錄",
        row: [
          recordDate, batchId,
          String(m.name ?? ""), String(m.brand ?? ""), String(m.license_no ?? ""),
          String(m.method ?? ""),
          m.quantity != null ? `${m.quantity}${m.unit ?? ""}` : "",
          "自動化",
        ],
      };
    } else {
      // 一般作業記錄：紀錄日期,批次ID,作業種類,作業內容,作業人員,備註
      payload = {
        sheet: "一般作業記錄",
        row: [recordDate, batchId, EVENT_LABEL[eventType], description, "自動化", notes],
      };
    }
    try {
      const res = await fetch(auto.sheet_webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      sheet = res.ok ? "ok" : `error: HTTP ${res.status}`;
    } catch (e) {
      sheet = `error: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  return json({ ok: true, record_id: record.id, record_date: recordDate, sheet });
});
