// =============================================
// pest-diagnosis：病蟲害照片上傳 + Gemini AI 辨識 + Google 雲端備份
//
// 由 APP 以登入者身分呼叫（supabase.functions.invoke），actions：
//   diagnose：上傳照片至 Storage + 備份至 Google Drive + Gemini 辨識
//   upload：  僅上傳與備份（使用者不需要 AI 辨識時）
//   log：     記錄儲存後，寫一列到試算表「作物觀察與病蟲害紀錄」
//
// Gemini 金鑰存於 farm_automation.gemini_api_key（負責人在設定頁填入），
// 僅在伺服器端使用，成員與前端皆接觸不到金鑰。
// =============================================
import { createClient } from "jsr:@supabase/supabase-js@2";

const GEMINI_MODEL = "gemini-2.5-flash";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const svc = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 驗證登入者並確認為該農場成員
  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return json({ error: "未登入" }, 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }

  const farmId = String(body.farm_id ?? "");
  const action = String(body.action ?? "");
  if (!farmId) return json({ error: "farm_id is required" }, 400);

  const { data: membership } = await svc
    .from("farm_members")
    .select("id")
    .eq("farm_id", farmId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership) return json({ error: "您不是此農場成員" }, 403);

  const { data: auto } = await svc
    .from("farm_automation")
    .select("sheet_webhook_url, gemini_api_key")
    .eq("farm_id", farmId)
    .maybeSingle();

  // ---- action: log（記錄儲存後補寫試算表）----
  if (action === "log") {
    if (!auto?.sheet_webhook_url) return json({ ok: true, sheet: "not configured" });
    const row = [
      String(body.record_date ?? ""),
      String(body.batch_id ?? ""),
      "病蟲害",
      String(body.description ?? ""),
      String(body.drive_link ?? ""),
      "已記錄",
      "",
    ];
    const sheet = await postToScript(auto.sheet_webhook_url, {
      sheet: "作物觀察與病蟲害紀錄",
      row,
    });
    return json({ ok: true, sheet });
  }

  if (action !== "diagnose" && action !== "upload") {
    return json({ error: "action must be one of: diagnose, upload, log" }, 400);
  }

  // ---- 照片上傳至 Supabase Storage ----
  const b64 = String(body.image_base64 ?? "");
  if (!b64) return json({ error: "image_base64 is required" }, 400);
  let bytes: Uint8Array;
  try {
    bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  } catch {
    return json({ error: "invalid base64 image" }, 400);
  }
  if (bytes.length > 5 * 1024 * 1024) return json({ error: "照片超過 5MB，請壓縮後再上傳" }, 400);

  const path = `${farmId}/${crypto.randomUUID()}.jpg`;
  const { error: upErr } = await svc.storage
    .from("record-photos")
    .upload(path, bytes, { contentType: "image/jpeg" });
  if (upErr) return json({ error: `照片上傳失敗: ${upErr.message}` }, 500);
  const { data: { publicUrl } } = svc.storage.from("record-photos").getPublicUrl(path);

  // ---- 備份至 Google 雲端硬碟（失敗不中斷流程）----
  let driveLink: string | null = null;
  let driveStatus = "not configured";
  if (auto?.sheet_webhook_url) {
    const res = await postToScript(auto.sheet_webhook_url, {
      action: "saveImage",
      base64: b64,
      mimeType: "image/jpeg",
      filename: `病蟲害_${new Date().toISOString().slice(0, 10)}_${crypto.randomUUID().slice(0, 8)}.jpg`,
    });
    if (typeof res === "object" && res !== null && "link" in res) {
      driveLink = String((res as Record<string, unknown>).link);
      driveStatus = "ok";
    } else {
      driveStatus = typeof res === "string" ? res : JSON.stringify(res);
    }
  }

  // ---- Gemini AI 辨識 ----
  let diagnosis: string | null = null;
  if (action === "diagnose") {
    if (!auto?.gemini_api_key) {
      return json({ error: "尚未設定 Gemini API 金鑰，請農場負責人於「設定 → 自動化系統對接」填入" }, 400);
    }
    const cropName = String(body.crop_name ?? "");
    const prompt =
      `你是台灣的植物病蟲害診斷專家。請分析這張作物照片${cropName ? `（作物：${cropName}）` : ""}，以繁體中文回覆，格式如下：\n` +
      "【觀察症狀】簡述照片中可見的異狀\n" +
      "【可能病蟲害】列出 1~3 個可能性，並標註高/中/低信心程度\n" +
      "【防治建議】具體可行的防治措施\n" +
      "【用藥提醒】如需用藥，提醒選用合法登記藥劑並遵守安全採收期\n" +
      "若照片不清楚或無法判斷，請直接說明原因。請保持簡潔，總長度 300 字以內。";

    const gRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${auto.gemini_api_key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: "image/jpeg", data: b64 } },
            ],
          }],
        }),
      },
    );
    if (!gRes.ok) {
      const errText = await gRes.text();
      return json({ error: `Gemini 辨識失敗 (HTTP ${gRes.status})：${errText.slice(0, 300)}` }, 502);
    }
    const gData = await gRes.json();
    diagnosis = gData?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? "")
      .join("") ?? null;
    if (!diagnosis) return json({ error: "Gemini 未回傳辨識結果" }, 502);
  }

  return json({
    ok: true,
    photo_url: publicUrl,
    drive_link: driveLink,
    drive_status: driveStatus,
    diagnosis,
  });
});

async function postToScript(url: string, payload: unknown): Promise<unknown> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return `error: HTTP ${res.status}`;
    return await res.json();
  } catch (e) {
    return `error: ${e instanceof Error ? e.message : String(e)}`;
  }
}
