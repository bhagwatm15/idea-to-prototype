import React, { useState } from "react";

const colors = {
  bg: "#f7f9fa",
  card: "#ffffff",
  border: "#e0e6e9",
  text: "#1f2d33",
  subtext: "#5c6b70",
  accent: "#2f6f5e",
  accentLight: "#e6f0ec",
  tag: "#eef2f5",
  danger: "#b5533c",
};

const font = { fontFamily: "Georgia, 'Times New Roman', serif" };
const label = { fontSize: 12, color: colors.subtext, fontWeight: "bold", letterSpacing: 0.5, textTransform: "uppercase" };
const input = { width: "100%", padding: "8px 10px", border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, marginTop: 4, marginBottom: 14, boxSizing: "border-box", ...font };
const card = { background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 10, padding: 16, marginBottom: 14 };
const btn = { background: colors.accent, color: "#fff", border: "none", borderRadius: 6, padding: "9px 16px", fontSize: 14, cursor: "pointer", ...font };
const tabBtn = (active) => ({
  padding: "10px 14px", cursor: "pointer", border: "none", background: "none",
  borderBottom: active ? `3px solid ${colors.accent}` : "3px solid transparent",
  color: active ? colors.accent : colors.subtext, fontWeight: active ? "bold" : "normal", fontSize: 14, ...font,
});

const decisions = [
  { id: 1, title: "Adopt PostgreSQL over MongoDB for core data store", desc: "Switching primary database to support relational integrity as billing features grow.", rationale: "Billing and subscription data is highly relational; need strong consistency and JOIN support.", alternatives: "Stayed on MongoDB with schema validation; evaluated CockroachDB.", stakeholders: "Priya Nair (Eng Lead), Marcus Webb (CTO)", tags: ["Engineering", "Infrastructure"], date: "2024-03-12", owner: "Priya Nair", status: "Active",
    updates: [{ date: "2024-05-02", text: "Migration completed for billing service; other services scheduled Q3." }] },
  { id: 2, title: "Move to quarterly OKRs instead of annual goals", desc: "Shorten planning cycles to react faster to market feedback.", rationale: "Annual goals were consistently outdated by Q2; teams need tighter feedback loops.", alternatives: "Bi-annual planning; rolling monthly goals.", stakeholders: "Elena Ruiz (COO), all team leads", tags: ["Operations", "Strategy"], date: "2024-01-22", owner: "Elena Ruiz", status: "Active", updates: [] },
  { id: 3, title: "Sunset legacy mobile app (v1)", desc: "Deprecate the original iOS/Android app in favor of the web app.", rationale: "Maintenance cost outweighs the shrinking user base (< 4% of MAU).", alternatives: "Keep app in maintenance-only mode; rebuild natively.", stakeholders: "Dan Okoro (Product), Priya Nair (Eng Lead)", tags: ["Product"], date: "2023-11-08", owner: "Dan Okoro", status: "Superseded", updates: [{ date: "2024-02-14", text: "Superseded by decision to build a lightweight PWA instead." }] },
  { id: 4, title: "Hire through agencies for Q2 contractor needs", desc: "Use staffing agencies rather than in-house recruiting for short-term roles.", rationale: "Faster ramp-up during crunch period; recruiting team is at capacity.", alternatives: "Delay hiring; expand recruiting team temporarily.", stakeholders: "Elena Ruiz (COO), Sam Whitfield (HR)", tags: ["Operations", "People"], date: "2024-04-30", owner: "Sam Whitfield", status: "Active", updates: [] },
];

const allTags = ["Engineering", "Infrastructure", "Operations", "Strategy", "Product", "People"];
const members = [
  { name: "Priya Nair", role: "Eng Lead", access: "Admin" },
  { name: "Elena Ruiz", role: "COO", access: "Admin" },
  { name: "Dan Okoro", role: "Product Manager", access: "Editor" },
  { name: "Sam Whitfield", role: "HR Lead", access: "Editor" },
  { name: "Marcus Webb", role: "CTO", access: "Viewer" },
];

export default function App() {
  const [screen, setScreen] = useState("feed");
  const [selected, setSelected] = useState(decisions[0]);
  const [query, setQuery] = useState("");

  const filtered = decisions.filter((d) =>
    d.title.toLowerCase().includes(query.toLowerCase()) || d.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
  );

  const renderTag = (t) => (
    <span key={t} style={{ background: colors.tag, color: colors.accent, borderRadius: 20, padding: "3px 10px", fontSize: 12, marginRight: 6 }}>{t}</span>
  );

  return (
    <div style={{ ...font, background: colors.bg, minHeight: "100vh", color: colors.text }}>
      <div style={{ padding: "18px 24px", borderBottom: `1px solid ${colors.border}`, background: colors.card }}>
        <h1 style={{ margin: 0, fontSize: 22, color: colors.accent }}>Decido</h1>
        <div style={{ fontSize: 13, color: colors.subtext }}>A calm, searchable record of why decisions were made.</div>
      </div>
      <div style={{ display: "flex", borderBottom: `1px solid ${colors.border}`, background: colors.card, paddingLeft: 16 }}>
        {["feed", "new", "detail", "search", "settings"].map((s) => (
          <button key={s} style={tabBtn(screen === s)} onClick={() => setScreen(s)}>
            {{ feed: "Decision Feed", new: "New Decision", detail: "Decision Detail", search: "Search & Filter", settings: "Team Settings" }[s]}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
        {screen === "feed" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {allTags.slice(0, 4).map((t) => <span key={t} style={{ ...card, padding: "6px 12px", margin: 0, fontSize: 12, color: colors.subtext }}>{t}</span>)}
            </div>
            {decisions.map((d) => (
              <div key={d.id} style={{ ...card, cursor: "pointer" }} onClick={() => { setSelected(d); setScreen("detail"); }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{d.title}</strong>
                  <span style={{ fontSize: 12, color: d.status === "Active" ? colors.accent : colors.danger }}>{d.status}</span>
                </div>
                <div style={{ fontSize: 13, color: colors.subtext, margin: "6px 0" }}>{d.desc}</div>
                <div style={{ fontSize: 12, color: colors.subtext }}>{d.date} · {d.owner}</div>
                <div style={{ marginTop: 8 }}>{d.tags.map(renderTag)}</div>
              </div>
            ))}
          </div>
        )}

        {screen === "new" && (
          <div style={card}>
            <label style={label}>Title</label>
            <input style={input} placeholder="e.g. Consolidate support tools into Zendesk" />
            <label style={label}>Short description</label>
            <textarea style={{ ...input, height: 50 }} placeholder="One or two sentences summarizing the decision" />
            <label style={label}>Rationale</label>
            <textarea style={{ ...input, height: 60 }} placeholder="Why this decision was made" />
            <label style={label}>Alternatives considered</label>
            <textarea style={{ ...input, height: 50 }} placeholder="Options that were weighed and rejected" />
            <label style={label}>Key stakeholders</label>
            <input style={input} placeholder="e.g. Priya Nair, Marcus Webb" />
            <label style={label}>Tags / Category</label>
            <input style={input} placeholder="e.g. Engineering, Infrastructure" />
            <label style={label}>Decision date</label>
            <input style={input} type="date" defaultValue="2024-06-01" />
            <button style={btn} onClick={() => setScreen("feed")}>Save Decision</button>
          </div>
        )}

        {screen === "detail" && (
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h2 style={{ margin: 0, fontSize: 19 }}>{selected.title}</h2>
              <span style={{ fontSize: 12, color: selected.status === "Active" ? colors.accent : colors.danger }}>{selected.status}</span>
            </div>
            <div style={{ fontSize: 12, color: colors.subtext, margin: "6px 0 14px" }}>{selected.date} · Owner: {selected.owner}</div>
            <div style={{ marginBottom: 10 }}>{selected.tags.map(renderTag)}</div>
            <p><b>Description:</b> {selected.desc}</p>
            <p><b>Rationale:</b> {selected.rationale}</p>
            <p><b>Alternatives considered:</b> {selected.alternatives}</p>
            <p><b>Stakeholders:</b> {selected.stakeholders}</p>
            <div style={{ borderTop: `1px solid ${colors.border}`, marginTop: 14, paddingTop: 14 }}>
              <label style={label}>Updates</label>
              {selected.updates.length === 0 && <div style={{ fontSize: 13, color: colors.subtext }}>No updates yet.</div>}
              {selected.updates.map((u, i) => (
                <div key={i} style={{ fontSize: 13, marginTop: 6 }}>{u.date}: {u.text}</div>
              ))}
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button style={btn}>Add Update</button>
                <button style={{ ...btn, background: colors.danger }}>Mark Superseded</button>
              </div>
            </div>
          </div>
        )}

        {screen === "search" && (
          <div>
            <input style={input} placeholder="Search by keyword, tag, or owner..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <select style={{ ...input, marginBottom: 0 }}><option>All Tags</option>{allTags.map((t) => <option key={t}>{t}</option>)}</select>
              <select style={{ ...input, marginBottom: 0 }}><option>All Owners</option>{members.map((m) => <option key={m.name}>{m.name}</option>)}</select>
              <input style={{ ...input, marginBottom: 0 }} type="date" />
            </div>
            {filtered.map((d) => (
              <div key={d.id} style={{ ...card, cursor: "pointer" }} onClick={() => { setSelected(d); setScreen("detail"); }}>
                <strong>{d.title}</strong>
                <div style={{ fontSize: 12, color: colors.subtext, marginTop: 4 }}>{d.date} · {d.owner}</div>
              </div>
            ))}
            {filtered.length === 0 && <div style={{ color: colors.subtext }}>No decisions match your search.</div>}
          </div>
        )}

        {screen === "settings" && (
          <div>
            <div style={card}>
              <label style={label}>Team Members</label>
              {members.map((m) => (
                <div key={m.name} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${colors.border}` }}>
                  <span>{m.name} <span style={{ color: colors.subtext, fontSize: 12 }}>({m.role})</span></span>
                  <span style={{ fontSize: 12, color: colors.accent }}>{m.access}</span>
                </div>
              ))}
              <button style={{ ...btn, marginTop: 12 }}>Invite Member</button>
            </div>
            <div style={card}>
              <label style={label}>Tags</label>
              <div style={{ marginTop: 8 }}>{allTags.map(renderTag)}</div>
              <button style={{ ...btn, marginTop: 12 }}>Add Tag</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
