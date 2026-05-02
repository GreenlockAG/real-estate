# PE/VC Portfolio Manager — Replit Bootstrap Prompt (Final, Multi-Table Airtable)

Create a full-stack app in Replit that mirrors **one Airtable base** (same base ID, same personal token) but supports **multiple table IDs (≥4)**.  
The app should **not boot until Airtable credentials are provided** (credential-gated Setup screen). After credentials are added in Replit Secrets, allow Deploy → Sync → Explore.

---

## 🔐 Secrets (Replit → Tools → Secrets)
- `AIRTABLE_API_KEY` — Airtable personal access token  
- `AIRTABLE_BASE_ID` — base ID (shared by all mirrored tables)  
- `AIRTABLE_TABLE_IDS` — comma-separated list of table IDs (e.g. `tblCapCalls,tblDists,tblInvestments,tblFundInfo`)  
- `OPENAI_API_KEY` — for ChatGPT Advisor (optional; Advisor tab disabled if missing)  
- `DATABASE_URL` — optional; Postgres URI (defaults to SQLite `data.db`)  

---

## 🧱 Files to create

### `requirements.txt`
```
fastapi==0.115.0
uvicorn[standard]==0.30.6
sqlmodel==0.0.22
SQLAlchemy==2.0.32
pandas==2.2.2
python-dateutil==2.9.0.post0
requests==2.32.3
pydantic==2.8.2
openai==1.43.0
cachetools==5.4.0
```

### `.replit`
```
run = "uvicorn app:app --host 0.0.0.0 --port 8000"
```

### `replit.nix`
```
{ pkgs }: {
  deps = [
    pkgs.python311
    pkgs.python311Packages.pip
  ];
}
```

### `.gitignore`
```
data.db
dev/logs/*
dev/scratch/*
__pycache__/
*.pyc
.env
```

### `README.md`
```
# PE/VC Portfolio Manager

- Mirrors one Airtable base into a local DB (Airtable is master).  
- Supports multiple tables via AIRTABLE_TABLE_IDS.  
- React SPA with modular viz blocks on light rounded cards.  
- Ant Table & ECharts used by default, but swappable via adapters.  
- ChatGPT Advisor is read-only, no arbitrary code execution.  

## Boot sequence
1. SetupGate screen if secrets missing.  
2. After adding secrets → Deploy app.  
3. Run Sync → Airtable → DB mirror.  
4. Explore Tables, Visualizations, and Advisor.  

## Key endpoints
- `/api/sync`, `/api/healthz`, `/api/table`  
- `/api/meta/schema`, `/api/meta/distinct`  
- `/api/metrics/*` (capital calls, distributions, net cashflow, commitment vs paid-in, nav breakdown, TVPI/DPI/RVPI)  
- `/api/ask` (Advisor, rate-limited, read-only)  
```

---

# GUARDRAILS.md

## Project Guardrails & Layout (Swappable UI Vendors)

These guardrails enforce a clean structure, swappability of UI libraries, and security.

### 1. Principles
- **Separation of concerns**: Metrics ↔ API ↔ Viz blocks are isolated.  
- **Vendor containment**: Ant Design Table & ECharts are wrapped in thin adapters (`static/ui/*`) that expose a **stable prop API**. Swapping vendors requires editing only adapter files or config flags.  
- **Airtable is master**: Local DB is read-only.  
- **Clean repo**: Debug/temporary files go only under `dev/`.  

---

### 2. Repository Layout
```
.
├─ app.py
├─ metrics/                     # Python metric functions (pure)
│  ├─ __init__.py
│  ├─ capital_calls.py
│  ├─ distributions.py
│  ├─ net_cashflow.py
│  ├─ commitment_paidin.py
│  ├─ nav_breakdown.py
│  └─ performance_ratios.py
├─ static/
│  ├─ index.html
│  ├─ styles.css
│  ├─ app.js
│  ├─ config/
│  │  └─ vizConfig.js           # vendor flags + shared defaults
│  ├─ ui/                       # vendor adapters
│  │  ├─ table/
│  │  │  ├─ index.js            # re-exports chosen adapter
│  │  │  └─ antdTable.js
│  │  └─ chart/
│  │     ├─ index.js
│  │     └─ echarts.js
│  ├─ components/
│  │  ├─ TabsRoot.js
│  │  ├─ SetupGate.js           # credential-gated boot
│  │  ├─ SyncPanel.js
│  │  ├─ DataTable.js
│  │  └─ AdvisorPanel.js
│  └─ viz/                      # one folder per viz block
│     ├─ CapitalCalls/
│     │  └─ index.js
│     ├─ Distributions/
│     │  └─ index.js
│     ├─ NetCashflow/
│     │  └─ index.js
│     ├─ NavBreakdown/
│     │  └─ index.js
│     └─ RatiosTable/
│        └─ index.js
├─ dev/
│  ├─ scratch/
│  ├─ scripts/
│  └─ logs/
├─ README.md
└─ requirements.txt
```

---

### 3. Adapter Contracts

**Table Adapter API (`static/ui/table/index.js`)**
```js
<TableView
  columns={[{ key, title, dataIndex, width? }]}
  rows={[{ key, ...fields }]}
  pageSize={number}
  onPageChange?(pageNumber)
  loading={boolean}
  emptyText?={string}
/>
```

**Chart Adapter API (`static/ui/chart/index.js`)**
```js
<LineSeries
  series={[{ name, data: [[tsMs, value], ...] }]}
  xType="time" | "category"
  yType="value" | "log"
  options?={{ legend?: {}, tooltip?: {}, yMin?, yMax? }}
  height={number}
/>

<PieSeries
  data={[{ name, value }]}
  options?={{ legend?: {}, tooltip?: {} }}
  height={number}
/>
```

---

### 4. Vendor Flags & Swappability
- `static/config/vizConfig.js` holds:
```js
export const VENDORS = {
  chart: 'echarts', // 'echarts' | 'chartjs' | ...
  table: 'antd',    // 'antd' | 'mantle' | ...
};
```
- `static/ui/*/index.js` reads `VENDORS` and re-exports the correct adapter.  
- Swapping vendors = change one flag or swap re-export only.  

---

### 5. Viz Block Contract
- Each viz block (`static/viz/<BlockName>/index.js`) renders **inside `.viz-block`** (light bg, rounded corners, subtle shadow).  
- Blocks may only import from:
  - `static/ui/table/index.js` or `static/ui/chart/index.js`  
  - `static/config/vizConfig.js` (defaults/vendor flags)  
  - `static/components/*` (shared shells)  
- No cross-block imports.  

---

### 6. Security
- Advisor is **read-only**: no arbitrary Python.  
- Validate table/column params against whitelists.  
- Use parameterized SQL.  
- `/api/ask` is **rate-limited**.  

---

### 7. Dev & Debug
- Temporary files live only in `dev/`.  
- `.gitignore` excludes `data.db`, `dev/*`, `__pycache__`, and secrets.  

---

### 8. Health & Status
- `/api/healthz` reports:  
  - `secrets_ok`  
  - `db_ok`  
  - mirrored table list  
  - last sync timestamp  

This is displayed in the UI header/status bar.  

---

## ✅ Acceptance
- Credential-gated boot (SetupGate → Deploy → Sync).  
- One Airtable base, multiple table IDs mirrored.  
- Viz blocks modular, on `.viz-block` cards.  
- Swappable UI vendors via adapters.  
- Secure read-only Advisor.  
- Guardrails ensure structure and clean dev hygiene.  
