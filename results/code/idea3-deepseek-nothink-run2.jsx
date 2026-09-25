import { useState } from "react";

const C = {
  bg: "#f6f8fa",
  card: "#ffffff",
  border: "#e3e8ee",
  text: "#1f2d3d",
  muted: "#6b7a8d",
  accent: "#3d6bb3",
  accentSoft: "#eaf0fa",
  success: "#2e7d5b",
  warn: "#a86b1f",
};

const styles = {
  app: { minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", fontSize: 14, lineHeight: 1.5 },
  nav: { display: "flex", alignItems: "center", gap: 4, padding: "12px 24px", background: C.card, borderBottom: `1px solid ${C.border}`, flexWrap: "wrap" },
  brand: { fontWeight: 700, fontSize: 18, color: C.accent, marginRight: 20, letterSpacing: 0.2 },
  tab: (active) => ({ padding: "7px 14px", borderRadius: 8, cursor: "pointer", border: "none", background: active ? C.accentSoft : "transparent", color: active ? C.accent : C.muted, fontWeight: active ? 600 : 500, fontSize: 14 }),
  wrap: { maxWidth: 880, margin: "0 auto", padding: "24px 20px 60px" },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 12 },
  h1: { fontSize: 22, fontWeight: 700, margin: "0 0 4px" },
  h2: { fontSize: 15, fontWeight: 600, margin: "0 0 12px" },
  sub: { color: C.muted, fontSize: 13, margin: "0 0 20px" },
  label: { display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 },
  input: { width: "100%", padding: "9px 11px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit", color: C.text, background: "#fff", outline: "none" },
  btn: { background: C.accent, color: "#fff", border: "none", padding: "9px 18px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnGhost: { background: "transparent", color: C.accent, border: `1px solid ${C.accent}`, padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  chip: (active) => ({ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${active ? C.accent : C.border}`, background: active ? C.accentSoft : "#fff", color: active ? C.accent : C.muted }),
  tag: { display: "inline-block", padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: C.accentSoft, color: C.accent, marginRight: 6 },
  row: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  divider: { height: 1, background: C.border, margin: "16px 0" },
  field: { marginBottom: 14 },
  meta: { fontSize: 12, color: C.muted },
};

const decisions = [
  { id: 1, title: "Migrate payments to Stripe", desc: "Move off legacy processor to reduce failed charges.", owner: "Priya Nair", date: "2024-11-12", tags: ["infra", "billing"], status: "Active", rationale: "Legacy processor had 4.2% failure rate and no webhook reliability. Stripe cut failures to 1.1% in pilot.", alternatives: "Braintree, Adyen, staying with legacy processor", stakeholders: "Priya Nair, Marcus Webb, Finance", updates: [{ who: "Marcus Webb", when: "2024-11-20", text: "Rollout completed for all EU customers." }] },
  { id: 2, title: "Adopt quarterly OKR cadence", desc: "Replace annual goals with quarterly OKRs.", owner: "Devon Ellis", date: "2024-10-28", tags: ["process"], status: "Active", rationale: "Annual goals drifted out of sync with roadmap shifts. Quarterly cadence keeps priorities current.", alternatives: "Keep annual goals, half-yearly review", stakeholders: "Leadership team", updates: [] },
  { id: 3, title: "Sunset the Legacy Reports page", desc: "Deprecate old reporting UI in favor of Insights.", owner: "Sara Kim", date: "2024-09-15", tags: ["product"], status: "Superseded", rationale: "Only 2% of users opened it; maintenance cost high.", alternatives: "Keep with limited support, rebuild entirely", stakeholders: "Sara Kim, Support", updates: [{ who: "Sara Kim", when: "2024-10-02", text: "Superseded by Insights v2 release." }] },
  { id: 4, title: "Standardize on Postgres 16", desc: "Upgrade all database clusters this quarter.", owner: "Marcus Webb", date: "2024-08-30", tags: ["infra"], status: "Active", rationale: "Pinned 5.5 years to v12; missing performance and security patches.", alternatives: "Stay on v12, migrate to MySQL", stakeholders: "Marcus Webb, Priya Nair", updates: [] },
];

const tags = ["infra", "billing", "process", "product"];
const members = [
  { name: "Priya Nair", role: "Admin", email: "priya@acme.io" },
  { name: "Marcus Webb", role: "Editor", email: "marcus@acme.io" },
  { name: "Devon Ellis", role: "Editor", email: "devon@acme.io" },
  { name: "Sara Kim", role: "Viewer", email: "sara@acme.io" },
];

export default function App() {
  const [screen, setScreen] = useState("feed");
  const [selected, setSelected] = useState(null);
  const [tagFilter, setTagFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ title: "", desc: "", rationale: "", alternatives: "", stakeholders: "", tag: "infra", date: "2024-11-15" });

  const nav = (s) => { setScreen(s); if (s !== "detail") setSelected(null); };

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const filtered = decisions.filter((d) => (tagFilter === "all" || d.tags.includes(tagFilter)) && (query === "" || (d.title + d.desc + d.owner).toLowerCase().includes(query.toLowerCase())));

  let body;
  if (screen === "feed") {
    body = (
      <div style={styles.wrap}>
        <h1 style={styles.h1}>Decision Log</h1>
        <p style={styles.sub}>Chronological record of team decisions. Newest first.</p>
        <div style={{ ...styles.row, marginBottom: 16 }}>
          {["all", ...tags].map((t) => (
            <button key={t} style={styles.chip(tagFilter === t)} onClick={() => setTagFilter(t)}>{t === "all" ? "All" : t}</button>
          ))}
        </div>
        {filtered.map((d) => (
          <div key={d.id} style={{ ...styles.card, cursor: "pointer" }} onClick={() => { setSelected(d); setScreen("detail"); }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{d.title}</div>
              <span style={{ ...styles.meta, color: d.status === "Superseded" ? C.warn : C.success, fontWeight: 600 }}>{d.status}</span>
            </div>
            <p style={{ ...styles.meta, margin: "6px 0" }}>{d.desc}</p>
            <div style={styles.row}>
              {d.tags.map((t) => <span key={t} style={styles.tag}>{t}</span>)}
              <span style={styles.meta}>{d.owner} · {d.date}</span>
            </div>
          </div>
        ))}
      </div>
    );
  } else if (screen === "new") {
    body = (
      <div style={styles.wrap}>
        <h1 style={styles.h1}>New Decision</h1>
        <p style={styles.sub}>Capture context so future teammates understand the why.</p>
        <div style={styles.card}>
          <div style={styles.field}><label style={styles.label}>Title</label><input style={styles.input} value={form.title} onChange={(e) => setF("title", e.target.value)} placeholder="e.g. Migrate payments to Stripe" /></div>
          <div style={styles.field}><label style={styles.label}>Short description</label><input style={styles.input} value={form.desc} onChange={(e) => setF("desc", e.target.value)} placeholder="One-line summary" /></div>
          <div style={styles.field}><label style={styles.label}>Rationale</label><textarea style={{ ...styles.input, minHeight: 70 }} value={form.rationale} onChange={(e) => setF("rationale", e.target.value)} placeholder="Why this decision?" /></div>
          <div style={styles.field}><label style={styles.label}>Alternatives considered</label><input style={styles.input} value={form.alternatives} onChange={(e) => setF("alternatives", e.target.value)} placeholder="Comma-separated" /></div>
          <div style={styles.field}><label style={styles.label}>Key stakeholders</label><input style={styles.input} value={form.stakeholders} onChange={(e) => setF("stakeholders", e.target.value)} placeholder="Names involved" /></div>
          <div style={{ display: "flex", gap: 14 }}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Category</label>
              <select style={styles.input} value={form.tag} onChange={(e) => setF("tag", e.target.value)}>{tags.map((t) => <option key={t}>{t}</option>)}</select>
            </div>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Decision date</label>
              <input type="date" style={styles.input} value={form.date} onChange={(e) => setF("date", e.target.value)} />
            </div>
          </div>
          <div style={styles.divider} />
          <div style={styles.row}>
            <button style={styles.btn} onClick={() => nav("feed")}>Save Decision</button>
            <button style={{ ...styles.btnGhost, borderColor: C.border, color: C.muted }} onClick={() => nav("feed")}>Cancel</button>
          </div>
        </div>
      </div>
    );
  } else if (screen === "detail" && selected) {
    body = (
      <div style={styles.wrap}>
        <button style={{ ...styles.btnGhost, border: "none", padding: 0, marginBottom: 14 }} onClick={() => nav("feed")}>← Back to log</button>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <h1 style={styles.h1}>{selected.title}</h1>
          <span style={{ ...styles.meta, color: selected.status === "Superseded" ? C.warn : C.success, fontWeight: 600 }}>{selected.status}</span>
        </div>
        <p style={styles.sub}>{selected.desc}</p>
        <div style={styles.card}>
          <h2 style={styles.h2}>Decision details</h2>
          <p style={{ margin: "0 0 10px" }}><strong>Rationale.</strong> {selected.rationale}</p>
          <p style={{ margin: "0 0 10px" }}><strong>Alternatives considered.</strong> {selected.alternatives}</p>
          <p style={{ margin: "0 0 10px" }}><strong>Stakeholders.</strong> {selected.stakeholders}</p>
          <div style={styles.row}>
            {selected.tags.map((t) => <span key={t} style={styles.tag}>{t}</span>)}
            <span style={styles.meta}>Owner: {selected.owner} · Decided {selected.date}</span>
          </div>
        </div>
        <div style={styles.card}>
          <h2 style={styles.h2}>Updates & comments</h2>
          {selected.updates.length === 0 && <p style={{ ...styles.meta, margin: 0 }}>No updates yet.</p>}
          {selected.updates.map((u, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{u.who} <span style={styles.meta}>· {u.when}</span></div>
              <div style={styles.meta}>{u.text}</div>
            </div>
          ))}
          <div style={styles.divider} />
          <input style={styles.input} placeholder="Add an update or comment…" />
          <div style={{ ...styles.row, marginTop: 12 }}>
            <button style={styles.btn}>Post Update</button>
            <button style={{ ...styles.btnGhost, borderColor: C.border, color: C.muted }}>Mark as Superseded</button>
          </div>
        </div>
      </div>
    );
  } else if (screen === "search") {
    body = (
      <div style={styles.wrap}>
        <h1 style={styles.h1}>Search & Filter</h1>
        <p style={styles.sub}>Find past decisions by keyword, tag, owner, or date range.</p>
        <div style={styles.card}>
          <div style={styles.field}><input style={styles.input} placeholder="Search decisions…" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
          <div style={styles.row}>
            {["all", ...tags].map((t) => <button key={t} style={styles.chip(tagFilter === t)} onClick={() => setTagFilter(t)}>{t === "all" ? "All tags" : t}</button>)}
          </div>
        </div>
        <p style={{ ...styles.meta, marginBottom: 10 }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>
        {filtered.map((d) => (
          <div key={d.id} style={{ ...styles.card, cursor: "pointer" }} onClick={() => { setSelected(d); setScreen("detail"); }}>
            <div style={{ fontWeight: 600 }}>{d.title}</div>
            <div style={styles.meta}>{d.owner} · {d.date} · {d.tags.join(", ")}</div>
          </div>
        ))}
        {filtered.length === 0 && <p style={styles.meta}>No decisions match your filters.</p>}
      </div>
    );
  } else {
    body = (
      <div style={styles.wrap}>
        <h1 style={styles.h1}>Team Settings</h1>
        <p style={styles.sub}>Manage members, tags, and permissions for the decision log.</p>
        <div style={styles.card}>
          <h2 style={styles.h2}>Members</h2>
          {members.map((m) => (
            <div key={m.email} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
              <div><div style={{ fontWeight: 600 }}>{m.name}</div><div style={styles.meta}>{m.email}</div></div>
              <span style={styles.tag}>{m.role}</span>
            </div>
          ))}
        </div>
        <div style={styles.card}>
          <h2 style={styles.h2}>Tags</h2>
          <div style={styles.row}>{tags.map((t) => <span key={t} style={styles.tag}>{t}</span>)}<button style={{ ...styles.btnGhost, padding: "3px 10px" }}>+ Add tag</button></div>
        </div>
        <div style={styles.card}>
          <h2 style={styles.h2}>Permissions</h2>
          <p style={{ ...styles.meta, margin: 0 }}>Admins can manage members and tags. Editors can create and update decisions. Viewers have read-only access.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <div style={styles.nav}>
        <div style={styles.brand}>Decido</div>
        {[["feed", "Feed"], ["new", "New Decision"], ["search", "Search & Filter"], ["settings", "Team Settings"]].map(([k, label]) => (
          <button key={k} style={styles.tab(screen === k)} onClick={() => nav(k)}>{label}</button>
        ))}
      </div>
      {body}
    </div>
  );
}
