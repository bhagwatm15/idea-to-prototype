import React, { useState } from "react";

const C = {
  bg: "#f4f6f8",
  card: "#ffffff",
  text: "#1f2937",
  sub: "#6b7280",
  border: "#e2e6ea",
  accent: "#3b6e8f",
  accentSoft: "#e8f0f4",
  good: "#3f8f6b",
  warn: "#c98a2b",
  bad: "#c0524a",
};

const S = {
  page: { background: C.bg, minHeight: "100vh", fontFamily: "Georgia, 'Segoe UI', serif", color: C.text },
  wrap: { maxWidth: 860, margin: "0 auto", padding: "24px 20px 60px" },
  nav: { display: "flex", gap: 6, borderBottom: `1px solid ${C.border}`, padding: "0 20px", background: C.card },
  navBtn: { padding: "14px 12px", border: "none", background: "none", cursor: "pointer", fontSize: 14, color: C.sub, borderBottom: "2px solid transparent", fontFamily: "inherit" },
  navBtnActive: { color: C.accent, borderBottom: `2px solid ${C.accent}`, fontWeight: 600 },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18, marginBottom: 14 },
  h1: { fontSize: 22, margin: "0 0 4px", fontWeight: 600 },
  h2: { fontSize: 16, margin: "0 0 10px", fontWeight: 600, color: C.accent },
  sub: { color: C.sub, fontSize: 13 },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` },
  pill: (bg, fg) => ({ background: bg, color: fg, fontSize: 12, padding: "3px 9px", borderRadius: 12, fontWeight: 600 }),
  btn: { background: C.accent, color: "#fff", border: "none", borderRadius: 6, padding: "7px 13px", fontSize: 13, cursor: "pointer", marginRight: 8 },
  btnGhost: { background: "none", color: C.accent, border: `1px solid ${C.accent}`, borderRadius: 6, padding: "7px 13px", fontSize: 13, cursor: "pointer", marginRight: 8 },
};

const statusColor = { "On track": [C.accentSoft, C.good], "At risk": ["#fbf1e0", C.warn], Blocked: ["#f8e6e4", C.bad] };

const projects = [
  { id: 1, name: "Atlas Migration", last: "2 hours ago", status: "On track" },
  { id: 2, name: "Checkout Redesign", last: "1 day ago", status: "At risk" },
  { id: 3, name: "Mobile Push Notifications", last: "3 days ago", status: "Blocked" },
  { id: 4, name: "Vendor Billing Sync", last: "5 hours ago", status: "On track" },
  { id: 5, name: "Q3 Roadmap Planning", last: "2 days ago", status: "At risk" },
];

const summaries = {
  1: { decision: "Ship migration in two phases instead of one big-bang cutover", rationale: "Reduces downtime risk for EU customers; lets us validate data integrity mid-flight.", date: "Jun 3", blockers: ["Waiting on DB snapshot from infra team", "Schema review overdue by 2 days"] },
  2: { decision: "Delay guest checkout launch to July", rationale: "Payment SDK has an unresolved bug with saved cards on iOS.", date: "May 29", blockers: ["Vendor SDK patch not yet released", "QA sign-off pending"] },
  3: { decision: "Use Firebase instead of building in-house push infra", rationale: "Faster to ship, team lacks bandwidth to maintain custom infra this quarter.", date: "May 24", blockers: ["Legal review of data processing terms", "iOS cert renewal blocked on Apple support"] },
  4: { decision: "Reconcile billing nightly instead of real-time", rationale: "Real-time sync overloaded the vendor API rate limit.", date: "Jun 5", blockers: ["Awaiting confirmation from finance on rounding rule"] },
  5: { decision: "Cut mobile offline-mode from Q3 scope", rationale: "Dependency on new sync engine won't be ready in time.", date: "May 30", blockers: ["Leadership sign-off on revised roadmap"] },
};

const waitingOnYou = [
  { name: "Priya Nair", item: "Approve schema change", age: "2d", priority: "High" },
  { name: "Sam Okafor", item: "Reply on vendor contract terms", age: "4d", priority: "High" },
  { name: "Elena Duarte", item: "Confirm rounding rule for billing", age: "1d", priority: "Medium" },
];
const youWaitingOn = [
  { name: "Infra Team", item: "DB snapshot for migration", age: "3d", priority: "High" },
  { name: "Apple Support", item: "Cert renewal", age: "6d", priority: "Medium" },
  { name: "Legal", item: "Data processing review", age: "5d", priority: "Low" },
];

const decisionLog = {
  1: [
    { date: "Jun 3", text: "Ship migration in two phases instead of one big-bang cutover" },
    { date: "May 20", text: "Chose blue/green rollout strategy" },
    { date: "May 10", text: "Selected Postgres over DynamoDB for new store" },
  ],
  2: [
    { date: "May 29", text: "Delay guest checkout launch to July" },
    { date: "May 15", text: "Approved new PCI-compliant payment vendor" },
  ],
  3: [
    { date: "May 24", text: "Use Firebase instead of building in-house push infra" },
    { date: "May 12", text: "Deprioritized Android rich notifications" },
  ],
  4: [{ date: "Jun 5", text: "Reconcile billing nightly instead of real-time" }],
  5: [{ date: "May 30", text: "Cut mobile offline-mode from Q3 scope" }],
};

export default function App() {
  const [screen, setScreen] = useState("switcher");
  const [activeId, setActiveId] = useState(1);
  const active = projects.find((p) => p.id === activeId);
  const tabs = [
    ["switcher", "Projects"],
    ["summary", "Re-entry Summary"],
    ["waiting", "Waiting-On Board"],
    ["log", "Decision Log"],
    ["integrations", "Integrations"],
  ];

  let content;
  if (screen === "switcher") {
    content = (
      <div style={S.wrap}>
        <h1 style={S.h1}>Your Projects</h1>
        <p style={S.sub}>Pick up where you left off.</p>
        {projects.map((p) => {
          const [bg, fg] = statusColor[p.status];
          return (
            <div key={p.id} style={{ ...S.card, cursor: "pointer" }} onClick={() => { setActiveId(p.id); setScreen("summary"); }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</div>
                  <div style={S.sub}>Last touched {p.last}</div>
                </div>
                <span style={S.pill(bg, fg)}>{p.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  } else if (screen === "summary") {
    const s = summaries[activeId];
    return renderShell();
  } else if (screen === "waiting") {
    content = (
      <div style={S.wrap}>
        <h1 style={S.h1}>Waiting-On Board</h1>
        <div style={S.card}>
          <h2 style={S.h2}>Waiting on you</h2>
          {waitingOnYou.map((w, i) => (
            <div key={i} style={S.row}>
              <div><b>{w.name}</b> — {w.item}<div style={S.sub}>Waiting {w.age}</div></div>
              <span style={S.pill(w.priority === "High" ? "#f8e6e4" : "#eef1f3", w.priority === "High" ? C.bad : C.sub)}>{w.priority}</span>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <h2 style={S.h2}>You're waiting on</h2>
          {youWaitingOn.map((w, i) => (
            <div key={i} style={S.row}>
              <div><b>{w.name}</b> — {w.item}<div style={S.sub}>Waiting {w.age}</div></div>
              <span style={S.pill(w.priority === "High" ? "#f8e6e4" : "#eef1f3", w.priority === "High" ? C.bad : C.sub)}>{w.priority}</span>
            </div>
          ))}
        </div>
      </div>
    );
  } else if (screen === "log") {
    content = (
      <div style={S.wrap}>
        <h1 style={S.h1}>Decision Log — {active.name}</h1>
        <div style={S.card}>
          {decisionLog[activeId].map((d, i) => (
            <div key={i} style={S.row}>
              <span>{d.text}</span>
              <span style={S.sub}>{d.date}</span>
            </div>
          ))}
        </div>
      </div>
    );
  } else if (screen === "integrations") {
    content = (
      <div style={S.wrap}>
        <h1 style={S.h1}>Integrations</h1>
        <p style={S.sub}>Connect tools so Regroup can log decisions and blockers automatically.</p>
        {[["Slack", "Connected", C.good], ["Jira", "Connected", C.good], ["Email", "Not connected", C.sub]].map(([n, s, c], i) => (
          <div key={i} style={S.card}>
            <div style={S.row}>
              <b>{n}</b>
              <span style={{ color: c, fontSize: 13 }}>{s}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderShell() {
    const s = summaries[activeId];
    return (
      <div style={S.page}>
        {nav()}
        <div style={S.wrap}>
          <h1 style={S.h1}>{active.name}</h1>
          <p style={S.sub}>Picking back up — here's where things stand.</p>
          <div style={S.card}>
            <h2 style={S.h2}>Last decision · {s.date}</h2>
            <div style={{ fontSize: 15, marginBottom: 6 }}>{s.decision}</div>
            <div style={S.sub}>Why: {s.rationale}</div>
          </div>
          <div style={S.card}>
            <h2 style={S.h2}>Current blockers</h2>
            {s.blockers.map((b, i) => (
              <div key={i} style={S.row}><span>{b}</span></div>
            ))}
            <div style={{ marginTop: 12 }}>
              <button style={S.btn}>Reply</button>
              <button style={S.btnGhost}>Reassign</button>
              <button style={S.btnGhost}>Snooze</button>
              <button style={S.btnGhost}>Mark resolved</button>
            </div>
          </div>
          <div style={S.card}>
            <h2 style={S.h2}>Waiting on you</h2>
            {waitingOnYou.slice(0, 2).map((w, i) => (
              <div key={i} style={S.row}>
                <span><b>{w.name}</b> — {w.item}</span>
                <span style={S.sub}>{w.age}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function nav() {
    return (
      <div style={S.nav}>
        {tabs.map(([key, label]) => (
          <button key={key} style={{ ...S.navBtn, ...(screen === key ? S.navBtnActive : {}) }} onClick={() => setScreen(key)}>
            {label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={S.page}>
      {nav()}
      {content}
    </div>
  );
}
