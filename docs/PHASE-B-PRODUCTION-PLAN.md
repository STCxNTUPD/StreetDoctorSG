# Street Doctor SG — B 類正式版計畫（Next.js + Supabase 遷移）

**目的**：把目前的純前端原型（localStorage）升級為規劃文件 §6–§13 描述的正式產品：
Next.js App Router + Supabase（PostgreSQL/PostGIS、Auth、Storage、RLS）+ Vercel + OneMap +
Cloudflare Turnstile。本文件是執行藍圖，並把原型 v2 新增的功能（路段連選、運輸站點、地圖內回報、
後台內容編輯、合併轉移支持數）一併納入正式 schema。

> 對照：原始規劃文件第 6（架構）、7（Schema）、8（API/Server Actions）、9（RLS）、
> 10（資料夾結構）、12（隱私安全）、13（開發到移交）節。

---

## 1. 原則

- **簡單、低成本、易移交**（呼應 §6.2）：單一 Supabase 後台、Vercel 部署、無自管伺服器。
- **英文優先**（§11）；多語言列第二階段。
- **不重寫 UI**：原型的畫面與互動（含 v2 新功能）直接移植成 React 元件，主要新增的是「真後端」。

## 2. 目標架構（§6.1）

```
瀏覽器  Next.js(App Router)+React+Tailwind + MapLibre(OneMap 底圖)
   │ HTTPS
Vercel  Server Components / Server Actions / Route Handlers / Edge Middleware(/admin 保護)
   │
   ├─ Supabase PostgreSQL + PostGIS（案件、地理查詢）
   ├─ Supabase Storage（案件照片、hero 圖）
   ├─ Supabase Auth（管理員登入）+ RLS
   └─ OneMap（底圖 tile、地址搜尋、反向地理編碼）
外部防護：Cloudflare Turnstile（回報 + 支持）
```

## 3. 原型 → 正式版對應

| 原型（現況） | 正式版做法 |
| :-- | :-- |
| `DB`（localStorage） | Supabase Postgres + Server Actions（service role 寫入） |
| 假登入旗標 `stc-demo` | Supabase Auth + `admin_users` 角色（`stc_admin` / `super_admin`） |
| OSM 免費 tiles | OneMap 底圖（需 token）；`lib/onemap.ts` 封裝 |
| 自由輸入地址 + 瀏覽器定位 | `/api/onemap/search`、`/api/onemap/reverse` 代理 |
| 打勾模擬 Turnstile | 真 Cloudflare Turnstile，Server Action 端驗證 token |
| 照片存 base64 | Supabase Storage 上傳，`issue_photos.storage_path` |
| 站點 `js/transit.js` 靜態清單 | 先沿用靜態 GeoJSON；LTA DataMall 列後續強化 |
| 路段 `geometry`（MultiLineString 陣列） | PostGIS `geography(MultiLineString,4326)` 欄位 |
| `asset_type` / `transit_ref` | `issues` 新增同名欄位 |
| 後台內容（site settings／categories） | `site_settings`（單列）+ `categories` 表 + super_admin RLS |
| 合併轉移支持數 | Postgres 交易函式，原子更新雙方並寫 `moderation_logs` |
| `fetchRoadSegment`（前端 Overpass） | 維持前端呼叫即可；建議加伺服器端快取/代理避免 429 |

## 4. 階段拆解（每階段都有可驗收產出）

**B0 — 環境（§13.1）**
建立 Supabase 專案、Vercel 專案、Cloudflare Turnstile 金鑰、申請 OneMap API。
產出：`.env.example`（URL/anon/service-role/turnstile/onemap），三個 client（
`lib/supabase/{client,server,admin}.ts`，嚴格區分 anon 與 service role，見 §15.4 風險）。

**B1 — 資料庫（§7、§9 + 本文件 §5）**
在 `supabase/migrations/` 建立 schema、索引、RLS、trigger、seed（七＋一類分類、site_settings 預設）。
產出：可重跑的 migration；用 anon key 實測 RLS（§14 權限項）。

**B2 — 核心讀取**
`/`、`/map`、`/issues/[id]`：Server Component 抓 published 案件，MapLibre+OneMap 渲染，
PostGIS 範圍查詢（`getIssuesForMap(filters)`）。移植 v2 的路段（MultiLineString）與運輸圖層。
產出：地圖/詳細頁以真資料運作；1000+ 筆查詢效能測試（§15.1）。

**B3 — 回報（§4.3）**
移植地圖內回報抽屜（含路段連選、站點預填）→ `submitIssueReport(formData)` Server Action：
zod 驗證 → Turnstile 驗證 → 寫 `issues`(pending) + `reporter_contacts` + Storage 照片。
產出：送出後狀態 `pending_moderation`、不公開；rate limit。

**B4 — 支持（§5.2）**
`voteForIssue(issueId, fingerprint)`：Turnstile/限流 + `votes` 唯一鍵防重複；trigger 維護 `support_count`。

**B5 — 管理後台（§4.5）**
Supabase Auth 登入 + Edge Middleware 保護 `/admin/*`。移植：Dashboard、案件列表（核准/拒絕）、
審核頁（編輯/座標/移除照片/狀態紀錄）、重複建議、**合併轉移支持數**（交易函式）、匯出 CSV/GeoJSON
（Route Handler + Content-Disposition，§8）。內容/分類頁限 `super_admin`。

**B6 — QA（§13.7、§14）**
端對端流程、RLS 權限、行動裝置/瀏覽器相容、邊界（>3 張、超大檔、重複支持、標題/描述 XSS）。

**B7 — 上線與移交（§13.8–13.12）**
Soft launch → 推廣 → 移交文件（架構、環境變數清單、SOP、第二階段清單）+ 至少一名 STC 成員實機演練。

## 5. 資料模型補充（疊加於 §7）

```sql
-- issues 新增（對應 v2 功能）
alter table issues add column asset_type   text not null default 'street'
  check (asset_type in ('street','transit'));
alter table issues add column transit_ref  text;                       -- 站名（asset_type='transit'）
alter table issues add column path         geography(multilinestring,4326);  -- 路段連選幾何（可空）
create index idx_issues_path on issues using gist (path);

-- 後台可編輯的全站內容（單列）
create table site_settings (
  id            int primary key default 1 check (id = 1),
  data          jsonb not null,           -- {site_name, hero_title, hero_subtitle, hero_image, stat_*_label, footer_blurb}
  updated_at    timestamptz not null default now()
);

-- 合併並轉移支持數（原子交易，供 adminMergeIssue 呼叫）
create or replace function fn_merge_issue(dup uuid, target uuid, admin uuid)
returns void language plpgsql as $$
declare moved int;
begin
  select support_count into moved from issues where id = dup;
  update issues set support_count = support_count + moved, updated_at = now() where id = target;
  update issues set support_count = 0, duplicate_of_issue_id = target,
                    status = 'duplicate', updated_at = now() where id = dup;
  insert into status_history(issue_id,new_status,note,is_public,changed_by)
    values (dup,'duplicate', 'Merged; '||moved||' support(s) transferred.', true, admin);
  insert into moderation_logs(issue_id,admin_id,action,detail)
    values (dup, admin, 'merge', jsonb_build_object('target',target,'moved',moved));
end; $$;
```

`categories` 沿用 §7（已有 slug/label/display_order/is_active），前端動態讀取（如原型）。

## 6. Server Actions / API（§8）

公開：`getIssuesForMap`、`getIssueById`、`submitIssueReport`、`uploadIssuePhoto`、`voteForIssue`、
`GET /api/onemap/{search,reverse}`。
管理：`adminListIssues`、`adminModerateIssue`、`adminUpdateIssue`、`adminMergeIssue`（呼叫 `fn_merge_issue`）、
`adminRemovePhoto`、`adminUpdateStatus`、`GET /api/admin/export/{csv,geojson}`。
超管：`superadminManageCategory`、`superadminManageAdminUser`、`superadminSaveSettings`。
路段：`fetchRoadSegment` 維持前端 Overpass（建議加 `/api/segment` 代理 + 短期快取，降低 429/504）。

## 7. RLS（§9）重點

- `issues` 公開只讀 published 系列狀態；寫入一律經 Server Action（service role）。
- `reporter_contacts`、`votes`、`moderation_logs`、`admin_users` 不對 anon 開放讀取。
- `site_settings`：公開只讀、寫入限 `super_admin`；`categories` 同 §9。
- 嚴守 client/admin Supabase client 分離，service role key 絕不進前端 bundle（§15.4）。

## 8. 環境、密鑰、部署

`.env`：`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`、
`TURNSTILE_SECRET`、`NEXT_PUBLIC_TURNSTILE_SITEKEY`、`ONEMAP_TOKEN`。
Vercel 環境變數管理；移交文件列出所有外部相依與到期日（§15.5）。

## 9. 風險（§15）

地理精度/效能、防重複支持脆弱性、照片審核人力、RLS 與 service role 邊界、移交後維運斷層——
緩解同 §15；另加：Overpass 公共端點限流（已用多鏡像 + 180m 範圍查詢，正式版再加伺服器快取）。

## 10. 工作量與建議排序

粗估：B0–B1 約 2–3 天、B2 2–3 天、B3 3–4 天、B4 1 天、B5 4–5 天、B6 2–3 天、B7 視推廣。
建議先 B0→B1→B2（先讓真資料的地圖跑起來），再 B3/B4，最後 B5；B6 貫穿全程。

---

*本計畫為 B 類遷移藍圖；確認後可逐階段開工，第一步從 B0 環境與 B1 migration 著手。*
