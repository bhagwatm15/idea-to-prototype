import React, { useState } from "react";

const C = {
  bg: "#f7f8fa",
  card: "#ffffff",
  ink: "#1f2933",
  sub: "#62707c",
  line: "#e4e8ec",
  accent: "#3b6ea5",
  warn: "#c47f2a",
  danger: "#b5473c",
  good: "#3f8f6b"
};
const S = {
  page: { minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: "system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif", fontSize: 14 },
  wrap: { maxWidth: 860, margin: "0 auto", padding: "20px 18px 48px" },
  nav: { display: "flex", gap: 6, flexWrap: "wrap", borderBottom: `1px solid ${C.line}`, paddingBottom: 10, marginBottom: 18 },
  tab: { padding: "7px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13, color: C.sub, background: "transparent", border: "none" },
  tabOn: { padding: "7px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13, color: "#fff", background: C.accent, border: "none" },
  card: { background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: 14, marginBottom: 12 },
  h: { fontSize: 19, margin: "0 0 4px", fontWeight: 600 },
  sub: { color: C.sub, margin: "0 0 16px", fontSize: 13 },
  label: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6, color: C.sub, margin: "0 0 6px", fontWeight: 600 },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
  btn: { padding: "6px 11px", borderRadius: 6, border: `1px solid ${C.accent}`, background: "#fff", color: C.accent, cursor: "pointer", fontSize: 12.5 },
  btnSolid: { padding: "6px 11px", borderRadius: 6, border: `1px solid ${C.accent}`, background: C.accent, color: "#fff", cursor: "pointer", fontSize: 12.5 },
  pill: { display: "inline-block", fontSize: 11, padding: "2px 7px", borderRadius: 20, fontWeight: 600 },
  click: { cursor: "pointer" }
};
const Dot = ({ color }) => <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 8, background: color, marginRight: 7 }} />;

const projects = [
  { id: 1, name: "Atlas Revamp", status: "On track", color: C.good, wait: 2, blockers: 1, updated: "4h ago" },
  { id: 2, name: "Billing V2", status: "At risk", color: C.warn, wait: 3, blockers: 2, updated: "1d ago" },
  { id: 3, name: "Mobile Onboarding", status: "Stalled", color: C.danger, wait: 1, blockers: 1, updated: "6d ago" },
  { id: 4, name: "Search Relevance", status: "On track", color: C.good, wait: 0, blockers: 0, updated: "2d ago" }
];

export default function App() {
  const [screen, setScreen] = useState("switch");
  const [project, setProject] = useState(projects[0]);
  const [blocker, setBlocker] = useState(null);
  const [caught, setCaught] = useState(false);

  const nav = (
    <div style={S.nav}>
      {[["switch", "Projects"], ["summary", "Re-entry Summary"], ["decisions", "Decision Log"], ["blocker", "Blocker Detail"], ["queue", "Waiting-On Queue"]].map(([k, l]) => (
        <button key={k} style={screen === k ? S.tabOn : S.tab} onClick={() => setScreen(k)}>{l}</button>
      ))}
    </div>
  );

  let body;
  if (screen === "switch") {
    body = (
      <>
        <h1 style={S.h}>Re-entry</h1>
        <p style={S.sub}>Pick a project to catch up on. {projects.reduce((a, p) => a + p.wait, 0)} items are waiting on you across all projects.</p>
        {projects.map(p => (
          <div key={p.id} style={{ ...S.card, ...S.click, ...S.row }} onClick={() => { setProject(p); setCaught(false); setScreen("summary"); }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 12.5 }}>
                <Dot color={p.color} />{p.status} · updated {p.updated}
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: 12.5, color: C.sub }}>
              <div>{p.blockers} blocker{p.blockers === 1 ? "" : "s"}</div>
              <div>{p.wait} waiting on you</div>
            </div>
          </div>
        ))}
      </>
    );
  } else if (screen === "summary") {
    body = (
      <>
        <h1 style={S.h}>{project.name} · Re-entry Summary</h1>
        <p style={S.sub}>Where things stand since you were last here. Updated {project.updated}.</p>
        <div style={S.card}>
          <p style={S.label}>Last decision</p>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Ship phased rollout to 20% on May 8</div>
          <div style={{ fontSize: 12.5, color: C.sub }}>Decided by Priya N. with Engineering · <span style={{ color: C.accent, cursor: "pointer" }} onClick={() => setScreen("decisions")}>View decision log</span></div>
        </div>
        <div style={S.card}>
          <p style={S.label}>Active blockers</p>
          <div style={{ ...S.click, ...S.row }} onClick={() => { setBlocker({ who: "Platform API", why: "Rate limits not lifted for partner keys", age: "5 days" }); setScreen("blocker"); }}>
            <div><Dot color={C.danger} />Partner API keys still rate-limited</div>
            <button style={S.btn}>Open</button>
          </div>
          <div style={{ ...S.row, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.line}` }}>
            <div><Dot color={C.warn} />Copy review not complete for empty states</div>
            <button style={S.btn}>Open</button>
          </div>
        </div>
        <div style={S.card}>
          <p style={S.label}>Who's waiting on what</p>
          <div style={{ ...S.row, marginBottom: 8 }}><div><b>Marcus L.</b> — needs sign-off on migration plan</div><button style={S.btn}>Reply</button></div>
          <div style={{ ...S.row }}><div><b>Dana R.</b> — blocked on your answer re: scope of Q3 goals</div><button style={S.btn}>Reply</button></div>
        </div>
        <div style={{ ...S.row, marginTop: 4 }}>
          <div style={{ fontSize: 12.5, color: caught ? C.good : C.sub }}>{caught ? "Marked caught up ✓" : "Ready to move on?"}</div>
          <button style={S.btnSolid} onClick={() => setCaught(true)}>Mark caught up</button>
        </div>
      </>
    );
  } else if (screen === "decisions") {
    body = (
      <>
        <h1 style={S.h}>{project.name} · Decision Log</h1>
        <p style={S.sub}>Chronological history of key decisions.</p>
        {[
          { d: "May 8", t: "Phased rollout to 20%", who: "Priya N." },
          { d: "Apr 29", t: "Keep billing on legacy gateway for launch", who: "You" },
          { d: "Apr 21", t: "Cut social login from MVP scope", who: "Marcus L." },
          { d: "Apr 12", t: "Adopt design system tokens v2", who: "Dana R." }
        ].map((x, i) => (
          <div key={i} style={{ ...S.card, ...S.row }}>
            <div><div style={{ fontWeight: 600 }}>{x.t}</div><div style={{ fontSize: 12.5, color: C.sub }}>{x.who}</div></div>
            <div style={{ fontSize: 12.5, color: C.sub }}>{x.d}</div>
          </div>
        ))}
      </>
    );
  } else if (screen === "blocker") {
    const b = blocker || { who: "Platform API", why: "Rate limits not lifted for partner keys", age: "5 days" };
    body = (
      <>
        <h1 style={S.h}>Blocker Detail</h1>
        <p style={S.sub}>{project.name}</p>
        <div style={S.card}>
          <p style={S.label}>What's stuck</p>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{b.who}: {b.why}</div>
          <div style={{ fontSize: 12.5, color: C.sub }}>Open for {b.age} · owner: Lena T., Platform team</div>
        </div>
        <div style={S.card}>
          <p style={S.label}>Impact</p>
          <div style={{ fontSize: 13 }}>Blocks partner onboarding for 3 accounts and pushes the May 20 milestone by ~4 days.</div>
        </div>
        <div style={S.card}>
          <p style={S.label}>Suggested next action</p>
          <div style={{ fontSize: 13, marginBottom: 10 }}>Escalate to Platform leads and confirm revised limit by EOD tomorrow.</div>
          <button style={S.btn}>Message Lena T.</button>{" "}
          <button style={S.btn}>Log a decision</button>
        </div>
      </>
    );
  } else {
    body = (
      <>
        <h1 style={S.h}>Waiting-On Queue</h1>
        <p style={S.sub}>Everything waiting on you, across all projects. Clear these before switching context.</p>
        {[
          { p: "Atlas Revamp", who: "Marcus L.", ask: "Sign-off on migration plan" },
          { p: "Billing V2", who: "Dana R.", ask: "Answer on Q3 scope" },
          { p: "Billing V2", who: "Priya N.", ask: "Approve revised rollout dates" },
          { p: "Mobile Onboarding", who: "Sam K.", ask: "Confirm copy review owner" }
        ].map((x, i) => (
          <div key={i} style={{ ...S.card, ...S.row }}>
            <div><div style={{ fontWeight: 600 }}>{x.who} — {x.ask}</div><div style={{ fontSize: 12.5, color: C.sub }}>{x.p}</div></div>
            <button style={S.btn}>Reply</button>
          </div>
        ))}
      </>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        {nav}
        {body}
      </div>
    </div>
  );
}
