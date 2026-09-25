import React, { useState } from "react";

const C = {
  bg: "#f7f8fa",
  card: "#ffffff",
  border: "#e2e6ed",
  text: "#1f2933",
  sub: "#627080",
  accent: "#2f6f5e",
  accentSoft: "#e4efe9",
  warn: "#8a5a1c",
  chip: "#eef1f5",
};

const styles = {
  app: { fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", background: C.bg, color: C.text, minHeight: "100vh", padding: "0 0 40px" },
  header: { background: C.card, borderBottom: `1px solid ${C.border}`, padding: "16px 28px", display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" },
  logo: { fontSize: 20, fontWeight: 700, letterSpacing: -0.4, color: C.accent },
  tabs: { display: "flex", gap: 6, flexWrap: "wrap" },
  tab: (active) => ({ padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600, background: active ? C.accentSoft : "transparent", color: active ? C.accent : C.sub }),
  body: { maxWidth: 900, margin: "0 auto", padding: "26px 28px" },
  h1: { fontSize: 22, fontWeight: 700, margin: "0 0 4px" },
  sub: { fontSize: 13.5, color: C.sub, margin: "0 0 20px" },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 12 },
  row: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" },
  title: { fontSize: 15.5, fontWeight: 650, margin: 0 },
  meta: { fontSize: 12.5, color: C.sub, marginTop: 6 },
  chip: { display: "inline-block", background: C.chip, color: C.sub, fontSize: 11.5, padding: "3px 9px", borderRadius: 20, marginRight: 6, fontWeight: 600 },
  status: (s) => ({ fontSize: 11.5, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: s === "Active" ? C.accentSoft : "#f3ece0", color: s === "Active" ? C.accent : C.warn }),
  input: { width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13.5, fontFamily: "inherit", color: C.text, background: "#fcfdfe", marginBottom: 14 },
  label: { display: "block", fontSize: 12.5, fontWeight: 650, color: C.sub, marginBottom: 5 },
  btn: { background: C.accent, color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontSize: 13.5, fontWeight: 650, cursor: "pointer" },
  btnGhost: { background: "transparent", color: C.accent, border: `1px solid ${C.accent}`, padding: "7px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 650, cursor: "pointer" },
  filterBar: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 },
  filter: (active) => ({ padding: "6px 13px", borderRadius: 20, border: `1px solid ${active ? C.accent : C.border}`, background: active ? C.accentSoft : C.card, color: active ? C.accent : C.sub, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }),
  detail: { fontSize: 13.5, lineHeight: 1.65, color: "#3a4653" },
  field: { marginTop: 14 },
  fieldH: { fontSize: 12, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  comment: { borderTop: `1px solid ${C.border}`, paddingTop: 12, marginTop: 12, fontSize: 13, color: "#3a4653" },
  memberRow: { display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13.5 },
};

const decisions = [
  { id: 1, title: "Standardize on Postgres over MongoDB", owner: "Priya Nair", date: "Mar 4, 2025", tags: ["Data", "Infra"], status: "Active", desc: "Chose Postgres for the core platform to get transactions and mature tooling.", rationale: "Relational integrity for billing and audit logs outweighed schema flexibility. Team already skilled in SQL.", alternatives: "MongoDB, CockroachDB, DynamoDB", stakeholders: "Priya Nair, Tomás Rivera, Dana Okafor" },
  { id: 2, title: "Sunset the legacy mobile v1 client", owner: "Dana Okafor", date: "Feb 18, 2025", tags: ["Product", "Roadmap"], status: "Active", desc: "Drop v1 client support after the Q3 migration window closes.", rationale: "Only 1.8% of DAU remain on v1. Maintenance cost is ~2 engineer-weeks per quarter.", alternatives: "Keep v1 read-only, Full rewrite", stakeholders: "Dana Okafor, Ben Hartley" },
  { id: 3, title: "Switch pricing to per-seat tiers", owner: "Tomás Rivera", date: "Jan 27, 2025", tags: ["Pricing", "GTM"], status: "Superseded", desc: "Moved from usage-based to three per-seat tiers.", rationale: "Sales cycles were stalling on unpredictable invoices. Per-seat matched how buyers budget.", alternatives: "Flat rate, Hybrid usage + seat", stakeholders: "Tomás Rivera, Priya Nair, Lena Fischer" },
  { id: 4, title: "Adopt incident.io for on-call", owner: "Ben Hartley", date: "Dec 9, 2024", tags: ["Infra", "Ops"], status: "Active", desc: "Replaced PagerDuty with incident.io for on-call and postmortems.", rationale: "Better Slack workflow and cheaper at our seat count. Postmortems auto-drafted.", alternatives: "PagerDuty, Opsgenie, Build in-house", stakeholders: "Ben Hartley, Priya Nair" },
];

export default function App() {
  const [screen, setScreen] = useState("feed");
  const [openId, setOpenId] = useState(1);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ title: "", desc: "", rationale: "", alternatives: "", stakeholders: "", tags: "", date: "Mar 12, 2025" });

  const tabs = [["feed", "Decision Feed"], ["new", "New Decision"], ["search", "Search & Filter"], ["settings", "Team Settings"]];
  const open = decisions.find((d) => d.id === openId) || decisions[0];
  const tagFilters = ["All", "Data", "Product", "Pricing", "Infra"];
  const filtered = decisions.filter((d) => filter === "All" || d.tags.includes(filter));
  const searched = decisions.filter((d) => {
    const q = query.toLowerCase();
    return !q || d.title.toLowerCase().includes(q) || d.owner.toLowerCase().includes(q) || d.tags.join(" ").toLowerCase().includes(q);
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <div style={styles.logo}>Decido</div>
        <div style={styles.tabs}>
          {tabs.map(([k, label]) => (
            <button key={k} style={styles.tab(screen === k)} onClick={() => setScreen(k)}>{label}</button>
          ))}
        </div>
      </div>

      <div style={styles.body}>
        {screen === "feed" && (
          <div>
            <h1 style={styles.h1}>Decision Feed</h1>
            <p style={styles.sub}>{decisions.length} logged decisions · most recent first</p>
            <div style={styles.filterBar}>
              {tagFilters.map((t) => (
                <button key={t} style={styles.filter(filter === t)} onClick={() => setFilter(t)}>{t}</button>
              ))}
            </div>
            {filtered.map((d) => (
              <div key={d.id} style={styles.card}>
                <div style={styles.row}>
                  <div>
                    <h3 style={styles.title}>{d.title}</h3>
                    <div style={styles.meta}>{d.owner} · {d.date} · {d.tags.join(", ")}</div>
                  </div>
                  <span style={styles.status(d.status)}>{d.status}</span>
                </div>
                <p style={styles.detail}>{d.desc}</p>
                <button style={styles.btnGhost} onClick={() => { setOpenId(d.id); setScreen("detail"); }}>Open decision →</button>
              </div>
            ))}
          </div>
        )}

        {screen === "detail" && (
          <div>
            <button style={styles.btnGhost} onClick={() => setScreen("feed")}>← Back to feed</button>
            <div style={{ ...styles.card, marginTop: 16 }}>
              <div style={styles.row}>
                <h1 style={{ ...styles.h1, margin: 0 }}>{open.title}</h1>
                <span style={styles.status(open.status)}>{open.status}</span>
              </div>
              <div style={styles.meta}>{open.owner} · {open.date} · {open.tags.join(", ")}</div>
              <div style={styles.field}><div style={styles.fieldH}>Decision</div><div style={styles.detail}>{open.desc}</div></div>
              <div style={styles.field}><div style={styles.fieldH}>Rationale</div><div style={styles.detail}>{open.rationale}</div></div>
              <div style={styles.field}><div style={styles.fieldH}>Alternatives considered</div><div style={styles.detail}>{open.alternatives}</div></div>
              <div style={styles.field}><div style={styles.fieldH}>Stakeholders</div><div style={styles.detail}>{open.stakeholders}</div></div>
              <div style={styles.comment}><b>Priya Nair</b> · Mar 6, 2025<br />Migration script merged. Revisit partitioning in Q3.</div>
              <div style={styles.comment}><b>Ben Hartley</b> · Mar 5, 2025<br />Added read replica for the reporting workload.</div>
              <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                <button style={styles.btn}>Add update</button>
                <button style={styles.btnGhost}>Mark as superseded</button>
              </div>
            </div>
          </div>
        )}

        {screen === "new" && (
          <div>
            <h1 style={styles.h1}>New Decision</h1>
            <p style={styles.sub}>Capture what was decided, why, and who was involved.</p>
            <div style={styles.card}>
              <label style={styles.label}>Title</label>
              <input style={styles.input} value={form.title} onChange={set("title")} placeholder="e.g. Standardize on Postgres" />
              <label style={styles.label}>Short description</label>
              <input style={styles.input} value={form.desc} onChange={set("desc")} placeholder="One or two sentences on the decision" />
              <label style={styles.label}>Rationale</label>
              <input style={styles.input} value={form.rationale} onChange={set("rationale")} placeholder="Why this option won" />
              <label style={styles.label}>Alternatives considered</label>
              <input style={styles.input} value={form.alternatives} onChange={set("alternatives")} placeholder="Comma separated" />
              <label style={styles.label}>Key stakeholders</label>
              <input style={styles.input} value={form.stakeholders} onChange={set("stakeholders")} placeholder="Comma separated names" />
              <label style={styles.label}>Tags / category</label>
              <input style={styles.input} value={form.tags} onChange={set("tags")} placeholder="e.g. Data, Infra" />
              <label style={styles.label}>Decision date</label>
              <input style={styles.input} value={form.date} onChange={set("date")} />
              <button style={styles.btn} onClick={() => setScreen("feed")}>Save decision</button>
            </div>
          </div>
        )}

        {screen === "search" && (
          <div>
            <h1 style={styles.h1}>Search & Filter</h1>
            <p style={styles.sub}>Find past decisions by keyword, tag, owner, or date range.</p>
            <input style={styles.input} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search decisions, owners, tags…" />
            <div style={styles.filterBar}>
              {tagFilters.map((t) => (
                <button key={t} style={styles.filter(filter === t)} onClick={() => setFilter(t)}>{t}</button>
              ))}
            </div>
            <p style={styles.meta}>{searched.length} result{searched.length === 1 ? "" : "s"} · Jan 2025 – Mar 2025</p>
            {searched.map((d) => (
              <div key={d.id} style={styles.card}>
                <div style={styles.row}>
                  <h3 style={styles.title}>{d.title}</h3>
                  <span style={styles.status(d.status)}>{d.status}</span>
                </div>
                <div style={styles.meta}>{d.owner} · {d.date} · {d.tags.map((t) => <span key={t} style={styles.chip}>{t}</span>)}</div>
              </div>
            ))}
          </div>
        )}

        {screen === "settings" && (
          <div>
            <h1 style={styles.h1}>Team Settings</h1>
            <p style={styles.sub}>4 members · 6 tags · admin only for editing</p>
            <div style={styles.card}>
              <div style={styles.fieldH}>Members</div>
              <div style={styles.memberRow}><span>Priya Nair</span><span style={styles.chip}>Admin</span></div>
              <div style={styles.memberRow}><span>Tomás Rivera</span><span style={styles.chip}>Editor</span></div>
              <div style={styles.memberRow}><span>Dana Okafor</span><span style={styles.chip}>Editor</span></div>
              <div style={styles.memberRow}><span>Ben Hartley</span><span style={styles.chip}>Viewer</span></div>
            </div>
            <div style={styles.card}>
              <div style={styles.fieldH}>Tags</div>
              {["Data", "Infra", "Product", "Pricing", "GTM", "Ops"].map((t) => <span key={t} style={styles.chip}>{t}</span>)}
            </div>
            <div style={styles.card}>
              <div style={styles.fieldH}>Permissions</div>
              <div style={styles.detail}>Admins can edit and supersede any decision. Editors can add updates. Viewers can read and comment.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
