import React, { useState } from "react";

export default function App() {
  const colors = {
    bg: "#f4f6f8",
    card: "#ffffff",
    primary: "#2c5f7c",
    primaryDark: "#1e4459",
    text: "#1f2937",
    subtext: "#6b7280",
    border: "#e2e5e9",
    tag: "#eaf1f4",
  };
  const font = "'Segoe UI', Helvetica, Arial, sans-serif";
  const page = { padding: 24, fontFamily: font, color: colors.text, maxWidth: 780, margin: "0 auto" };
  const card = { background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 10, padding: 18, marginBottom: 14 };
  const label = { display: "block", fontSize: 13, color: colors.subtext, marginBottom: 4, marginTop: 12 };
  const input = { width: "100%", padding: "8px 10px", border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, fontFamily: font, boxSizing: "border-box" };
  const button = { background: colors.primary, color: "#fff", border: "none", padding: "9px 16px", borderRadius: 6, cursor: "pointer", fontSize: 14 };
  const pill = { display: "inline-block", background: colors.tag, color: colors.primaryDark, padding: "3px 10px", borderRadius: 12, fontSize: 12, marginRight: 6 };

  const [screen, setScreen] = useState("feed");
  const [decisions, setDecisions] = useState([
    { id: 1, title: "Adopt Postgres over MongoDB for core data store", desc: "Migrate primary datastore to Postgres for relational integrity.", rationale: "Need strong transactional guarantees for billing data.", alternatives: "MongoDB, DynamoDB", stakeholders: "Priya Anand, Tom Reyes", tags: ["Engineering", "Infra"], date: "2024-02-14", owner: "Priya Anand", status: "Active", updates: ["2024-03-01: Migration 60% complete."] },
    { id: 2, title: "Move to quarterly OKRs instead of annual goals", desc: "Switch planning cadence to quarterly for faster iteration.", rationale: "Annual goals became stale after Q2 market shifts.", alternatives: "Keep annual, monthly sprints", stakeholders: "Dana Wu, Leadership Team", tags: ["Strategy"], date: "2024-01-08", owner: "Dana Wu", status: "Active", updates: [] },
    { id: 3, title: "Sunset legacy mobile app v1", desc: "Deprecate v1 app in favor of unified web app.", rationale: "Maintenance cost too high, low active usage (4%).", alternatives: "Keep supporting, partial rewrite", stakeholders: "Marcus Lee, Support Team", tags: ["Product"], date: "2023-11-20", owner: "Marcus Lee", status: "Superseded", updates: ["2024-01-15: Superseded by 'Unified App Rollout' decision."] },
  ]);
  const [selectedId, setSelectedId] = useState(1);
  const [form, setForm] = useState({ title: "", desc: "", rationale: "", alternatives: "", stakeholders: "", tags: "", date: "" });
  const [search, setSearch] = useState({ keyword: "", tag: "All", owner: "All", from: "", to: "" });

  const tabs = ["feed", "new", "detail", "search", "settings"];
  const tabLabels = { feed: "Decision Feed", new: "New Decision", detail: "Decision Detail", search: "Search & Filter", settings: "Team Settings" };
  const selected = decisions.find((d) => d.id === selectedId);
  const allTags = ["All", ...Array.from(new Set(decisions.flatMap((d) => d.tags)))];
  const allOwners = ["All", ...Array.from(new Set(decisions.map((d) => d.owner)))];

  const openDetail = (id) => { setSelectedId(id); setScreen("detail"); };
  const saveDecision = () => {
    if (!form.title) return;
    const nd = { id: Date.now(), title: form.title, desc: form.desc, rationale: form.rationale, alternatives: form.alternatives, stakeholders: form.stakeholders, tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : ["General"], date: form.date || new Date().toISOString().slice(0, 10), owner: "You", status: "Active", updates: [] };
    setDecisions([nd, ...decisions]);
    setForm({ title: "", desc: "", rationale: "", alternatives: "", stakeholders: "", tags: "", date: "" });
    setScreen("feed");
  };
  const markSuperseded = () => setDecisions(decisions.map((d) => (d.id === selectedId ? { ...d, status: "Superseded" } : d)));
  const addUpdate = () => setDecisions(decisions.map((d) => (d.id === selectedId ? { ...d, updates: [...d.updates, new Date().toISOString().slice(0, 10) + ": Reviewed, still on track." ] } : d)));

  const filtered = decisions.filter((d) => {
    const kw = search.keyword.toLowerCase();
    const matchKw = !kw || d.title.toLowerCase().includes(kw) || d.desc.toLowerCase().includes(kw);
    const matchTag = search.tag === "All" || d.tags.includes(search.tag);
    const matchOwner = search.owner === "All" || d.owner === search.owner;
    const matchFrom = !search.from || d.date >= search.from;
    const matchTo = !search.to || d.date <= search.to;
    return matchKw && matchTag && matchOwner && matchFrom && matchTo;
  });

  return (
    <div style={{ background: colors.bg, minHeight: "100vh" }}>
      <div style={{ background: colors.primaryDark, color: "#fff", padding: "16px 24px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 600 }}>Decido</div>
          <div style={{ display: "flex", gap: 6 }}>
            {tabs.map((t) => (
              <div key={t} onClick={() => setScreen(t)} style={{ padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13, background: screen === t ? "#fff" : "transparent", color: screen === t ? colors.primaryDark : "#dbe6ec" }}>
                {tabLabels[t]}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={page}>
        {screen === "feed" && (
          <div>
            <h2 style={{ marginBottom: 4 }}>Decision Log</h2>
            <p style={{ color: colors.subtext, marginTop: 0 }}>{decisions.length} decisions recorded</p>
            <div style={{ marginBottom: 14 }}>
              {allTags.map((t) => (
                <span key={t} style={{ ...pill, cursor: "pointer" }} onClick={() => { setSearch({ ...search, tag: t }); setScreen("search"); }}>{t}</span>
              ))}
            </div>
            {decisions.map((d) => (
              <div key={d.id} style={{ ...card, cursor: "pointer" }} onClick={() => openDetail(d.id)}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{d.title}</strong>
                  <span style={{ fontSize: 12, color: d.status === "Active" ? colors.primary : "#a15c00" }}>{d.status}</span>
                </div>
                <p style={{ color: colors.subtext, fontSize: 14 }}>{d.desc}</p>
                <div>{d.tags.map((t) => <span key={t} style={pill}>{t}</span>)}</div>
                <div style={{ fontSize: 12, color: colors.subtext, marginTop: 6 }}>{d.date} · {d.owner}</div>
              </div>
            ))}
          </div>
        )}

        {screen === "new" && (
          <div style={card}>
            <h2 style={{ marginTop: 0 }}>Log a New Decision</h2>
            <label style={label}>Title</label>
            <input style={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Switch billing provider to Stripe" />
            <label style={label}>Short description</label>
            <input style={input} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="One or two sentences of context" />
            <label style={label}>Rationale</label>
            <input style={input} value={form.rationale} onChange={(e) => setForm({ ...form, rationale: e.target.value })} placeholder="Why this decision was made" />
            <label style={label}>Alternatives considered</label>
            <input style={input} value={form.alternatives} onChange={(e) => setForm({ ...form, alternatives: e.target.value })} placeholder="e.g. Braintree, Adyen" />
            <label style={label}>Key stakeholders</label>
            <input style={input} value={form.stakeholders} onChange={(e) => setForm({ ...form, stakeholders: e.target.value })} placeholder="Names, comma separated" />
            <label style={label}>Tags (comma separated)</label>
            <input style={input} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Finance, Infra" />
            <label style={label}>Decision date</label>
            <input style={input} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <button style={{ ...button, marginTop: 18 }} onClick={saveDecision}>Save Decision</button>
          </div>
        )}

        {screen === "detail" && selected && (
          <div>
            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h2 style={{ marginTop: 0 }}>{selected.title}</h2>
                <span style={{ fontSize: 12, color: selected.status === "Active" ? colors.primary : "#a15c00" }}>{selected.status}</span>
              </div>
              <p style={{ color: colors.subtext }}>{selected.desc}</p>
              <div style={{ marginBottom: 8 }}>{selected.tags.map((t) => <span key={t} style={pill}>{t}</span>)}</div>
              <p><strong>Rationale:</strong> {selected.rationale}</p>
              <p><strong>Alternatives considered:</strong> {selected.alternatives}</p>
              <p><strong>Stakeholders:</strong> {selected.stakeholders}</p>
              <p style={{ fontSize: 12, color: colors.subtext }}>Decided {selected.date} by {selected.owner}</p>
              <div style={{ marginTop: 10 }}>
                <button style={button} onClick={addUpdate}>Add Update</button>
                <button style={{ ...button, background: "#a15c00", marginLeft: 8 }} onClick={markSuperseded}>Mark Superseded</button>
              </div>
            </div>
            <h3>Updates</h3>
            {selected.updates.length === 0 && <p style={{ color: colors.subtext }}>No updates yet.</p>}
            {selected.updates.map((u, i) => <div key={i} style={card}>{u}</div>)}
          </div>
        )}

        {screen === "search" && (
          <div>
            <h2>Search & Filter</h2>
            <div style={card}>
              <label style={label}>Keyword</label>
              <input style={input} value={search.keyword} onChange={(e) => setSearch({ ...search, keyword: e.target.value })} placeholder="Search titles and descriptions" />
              <label style={label}>Tag</label>
              <select style={input} value={search.tag} onChange={(e) => setSearch({ ...search, tag: e.target.value })}>
                {allTags.map((t) => <option key={t}>{t}</option>)}
              </select>
              <label style={label}>Owner</label>
              <select style={input} value={search.owner} onChange={(e) => setSearch({ ...search, owner: e.target.value })}>
                {allOwners.map((o) => <option key={o}>{o}</option>)}
              </select>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={label}>From</label>
                  <input style={input} type="date" value={search.from} onChange={(e) => setSearch({ ...search, from: e.target.value })} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={label}>To</label>
                  <input style={input} type="date" value={search.to} onChange={(e) => setSearch({ ...search, to: e.target.value })} />
                </div>
              </div>
            </div>
            <p style={{ color: colors.subtext }}>{filtered.length} result(s)</p>
            {filtered.map((d) => (
              <div key={d.id} style={{ ...card, cursor: "pointer" }} onClick={() => openDetail(d.id)}>
                <strong>{d.title}</strong>
                <div style={{ fontSize: 12, color: colors.subtext }}>{d.date} · {d.owner}</div>
              </div>
            ))}
          </div>
        )}

        {screen === "settings" && (
          <div>
            <h2>Team Settings</h2>
            <div style={card}>
              <h3 style={{ marginTop: 0 }}>Members</h3>
              {[["Priya Anand", "Admin"], ["Tom Reyes", "Editor"], ["Dana Wu", "Admin"], ["Marcus Lee", "Viewer"]].map(([n, r]) => (
                <div key={n} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${colors.border}` }}>
                  <span>{n}</span>
                  <span style={{ color: colors.subtext, fontSize: 13 }}>{r}</span>
                </div>
              ))}
              <button style={{ ...button, marginTop: 14 }}>Invite Member</button>
            </div>
            <div style={card}>
              <h3 style={{ marginTop: 0 }}>Tags</h3>
              <div>{allTags.filter((t) => t !== "All").map((t) => <span key={t} style={pill}>{t}</span>)}</div>
              <button style={{ ...button, marginTop: 14 }}>Add Tag</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
