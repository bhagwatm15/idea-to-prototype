import React, { useState } from "react";

const C = {
  bg: "#f6f7f9",
  panel: "#ffffff",
  ink: "#1f2933",
  sub: "#5c6b7a",
  line: "#e3e7ec",
  accent: "#3a6ea5",
  soft: "#eef3f8",
  warn: "#b4690e",
  warnSoft: "#fdf3e4",
  ok: "#3f7d55",
  okSoft: "#eaf4ee",
};
const S = {
  app: { minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", fontSize: 14, padding: "20px 24px 60px" },
  shell: { maxWidth: 880, margin: "0 auto" },
  header: { marginBottom: 16 },
  h1: { fontSize: 20, fontWeight: 600, margin: 0 },
  sub: { color: C.sub, marginTop: 4, fontSize: 13 },
  nav: { display: "flex", gap: 8, margin: "14px 0 22px", flexWrap: "wrap" },
  tab: { padding: "7px 14px", borderRadius: 999, border: `1px solid ${C.line}`, background: C.panel, color: C.sub, cursor: "pointer", fontSize: 13 },
  tabOn: { background: C.accent, color: "#fff", borderColor: C.accent },
  card: { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: 16, marginBottom: 12 },
  cardBtn: { textAlign: "left", width: "100%", cursor: "pointer", font: "inherit", color: "inherit" },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 },
  pill: { fontSize: 12, padding: "3px 9px", borderRadius: 999, background: C.soft, color: C.accent, whiteSpace: "nowrap" },
  pillWarn: { background: C.warnSoft, color: C.warn },
  pillOk: { background: C.okSoft, color: C.ok },
  h2: { fontSize: 15, fontWeight: 600, margin: "0 0 8px" },
  meta: { color: C.sub, fontSize: 12.5, lineHeight: 1.5 },
  body: { lineHeight: 1.55, marginTop: 6 },
  btn: { padding: "7px 13px", borderRadius: 8, border: `1px solid ${C.accent}`, background: C.accent, color: "#fff", cursor: "pointer", fontSize: 13, font: "inherit" },
  btnGhost: { padding: "7px 13px", borderRadius: 8, border: `1px solid ${C.line}`, background: C.panel, color: C.sub, cursor: "pointer", fontSize: 13, font: "inherit" },
  label: { fontSize: 11, textTransform: "uppercase", letterSpacing: .6, color: C.sub, fontWeight: 600, marginBottom: 6 },
  stack: { display: "flex", flexDirection: "column", gap: 10 },
  actions: { display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" },
};

export default function App() {
  const [screen, setScreen] = useState("switcher");
  const [project, setProject] = useState("Atlas");
  const [open, setOpen] = useState(null); // blocker/decision detail ref
  const [toast, setToast] = useState("");

  const projects = [
    { name: "Atlas", desc: "Billing rewrite", flags: ["1 blocker", "2 waiting"], tone: "warn" },
    { name: "Beacon", desc: "Onboarding v2", flags: ["On track"], tone: "ok" },
    { name: "Cobalt", desc: "API rate limits", flags: ["1 decision pending"], tone: "info" },
    { name: "Driftwood", desc: "Partner portal", flags: ["2 blockers"], tone: "warn" },
  ];
  const tone = (t) => (t === "warn" ? S.pillWarn : t === "ok" ? S.pillOk : {});
  const act = (msg) => setToast(msg);

  const nav = (
    <div style={S.nav}>
      {[["Project Switcher", "switcher"], ["Re-entry Summary", "summary"], ["Decision Log", "decisions"], ["Blocker Detail", "blocker"], ["Waiting-On Queue", "waiting"]].map(([label, id]) => (
        <button key={id} style={{ ...S.tab, ...(screen === id ? S.tabOn : {}) }} onClick={() => setScreen(id)}>{label}</button>
      ))}
    </div>
  );

  let body = null;

  if (screen === "switcher") {
    body = (
      <>
        <div style={S.sub}>4 active projects · sorted by re-entry cost</div>
        <div style={{ height: 14 }} />
        <div style={S.stack}>
          {projects.map((p) => (
            <button key={p.name} style={{ ...S.card, ...S.cardBtn }} onClick={() => { setProject(p.name); setScreen("summary"); }}>
              <div style={S.row}>
                <div>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div style={S.meta}>{p.desc} · last touched 2 days ago</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {p.flags.map((f) => <span key={f} style={{ ...S.pill, ...tone(p.tone) }}>{f}</span>)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </>
    );
  } else if (screen === "summary") {
    body = (
      <>
        <div style={S.row}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600 }}>{project} — re-entry summary</div>
            <div style={S.meta}>Away 3 days · 4 events since you left</div>
          </div>
          <span style={{ ...S.pill, ...S.pillWarn }}>Not caught up</span>
        </div>
        <div style={{ height: 14 }} />
        <div style={S.card}>
          <div style={S.label}>Last decision</div>
          <div style={S.body}><strong>Cut over to Stripe Invoicing on July 12</strong> — approved by Dana Whitfield after the reconciliation check passed.</div>
          <div style={S.actions}>
            <button style={S.btnGhost} onClick={() => setScreen("decisions")}>View decision log</button>
          </div>
        </div>
        <div style={S.card}>
          <div style={S.label}>Active blockers</div>
          <div style={{ ...S.row, cursor: "pointer" }} onClick={() => { setOpen("pr-482"); setScreen("blocker"); }}>
            <div>
              <div style={{ fontWeight: 600 }}>PR #482 — tax ID validation failing in EU sandbox</div>
              <div style={S.meta}>Open 4 days · Priya Raman blocked</div>
            </div>
            <span style={S.pill}>Details →</span>
          </div>
        </div>
        <div style={S.card}>
          <div style={S.label}>Waiting on you</div>
          <div style={S.stack}>
            <div style={S.row}><div><strong>Marcus Lee</strong><div style={S.meta}>Needs sign-off on invoice email copy</div></div><button style={S.btn} onClick={() => act("Replied to Marcus Lee")}>Reply</button></div>
            <div style={S.row}><div><strong>Ana Torres</strong><div style={S.meta}>Waiting on Q3 pricing decision</div></div><button style={S.btn} onClick={() => act("Logged decision for Ana Torres")}>Decide</button></div>
          </div>
        </div>
        {toast && <div style={{ ...S.pill, ...S.pillOk, display: "inline-block", marginBottom: 10 }}>{toast}</div>}
        <div style={S.actions}>
          <button style={S.btn} onClick={() => { setToast(""); setScreen("switcher"); }}>Mark caught up & switch project</button>
          <button style={S.btnGhost} onClick={() => setScreen("waiting")}>Open waiting queue</button>
        </div>
      </>
    );
  } else if (screen === "decisions") {
    body = (
      <>
        <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>{project} — decision log</div>
        <div style={{ ...S.meta, marginBottom: 14 }}>Chronological, newest first</div>
        <div style={S.stack}>
          {[
            ["Jul 8", "Cut over to Stripe Invoicing on July 12", "Dana Whitfield"],
            ["Jul 2", "Keep legacy PDF renderer until Q4", "You + Marcus Lee"],
            ["Jun 24", "Defer multi-currency to Atlas phase 2", "Ana Torres"],
            ["Jun 15", "Adopt usage-based metering for API tiers", "Dana Whitfield"],
          ].map(([d, t, who]) => (
            <div key={t} style={S.card}>
              <div style={{ fontWeight: 600 }}>{t}</div>
              <div style={S.meta}>{d} · decided by {who}</div>
            </div>
          ))}
        </div>
      </>
    );
  } else if (screen === "blocker") {
    body = (
      <>
        <div style={S.row}>
          <div style={{ fontSize: 17, fontWeight: 600 }}>Blocker · PR #482</div>
          <span style={{ ...S.pill, ...S.pillWarn }}>Open 4 days</span>
        </div>
        <div style={{ height: 12 }} />
        <div style={S.card}>
          <div style={S.label}>What's stuck</div>
          <div style={S.body}>Tax ID validation fails for EU businesses in the Stripe sandbox. CI is red on <code>atlas-billing</code>, so the July 12 cutover can't be verified.</div>
        </div>
        <div style={S.card}>
          <div style={S.label}>Who's affected</div>
          <div style={S.body}>Priya Raman (blocked on merge), Marcus Lee (QA plan), Release train July 12.</div>
        </div>
        <div style={S.card}>
          <div style={S.label}>Why it's stuck</div>
          <div style={S.body}>Stripe support ticket #77120 has been open 2 days with no owner assigned on our side.</div>
        </div>
        <div style={S.card}>
          <div style={S.label}>Suggested next action</div>
          <div style={S.body}>Assign an owner to the Stripe ticket and unblock Priya's merge.</div>
          <div style={S.actions}>
            <button style={S.btn} onClick={() => act("Owner assigned to Stripe ticket #77120")}>Assign owner</button>
            <button style={S.btnGhost} onClick={() => act("Notified Priya Raman")}>Notify Priya</button>
            <button style={S.btnGhost} onClick={() => setScreen("summary")}>Back to summary</button>
          </div>
          {toast && <div style={{ ...S.pill, ...S.pillOk, display: "inline-block", marginTop: 10 }}>{toast}</div>}
        </div>
      </>
    );
  } else {
    body = (
      <>
        <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>Waiting on you — all projects</div>
        <div style={{ ...S.meta, marginBottom: 14 }}>5 items · clear before switching context</div>
        <div style={S.stack}>
          {[
            ["Marcus Lee", "Atlas", "Sign-off on invoice email copy"],
            ["Ana Torres", "Atlas", "Q3 pricing decision"],
            ["Sam Okafor", "Beacon", "Approve onboarding experiment v3"],
            ["Renee Park", "Cobalt", "Confirm rate-limit thresholds"],
          ].map(([who, proj, what]) => (
            <div key={who} style={{ ...S.card, ...S.row }}>
              <div>
                <div style={{ fontWeight: 600 }}>{who} · <span style={{ color: C.accent }}>{proj}</span></div>
                <div style={S.meta}>{what}</div>
              </div>
              <button style={S.btn} onClick={() => act("Handled: " + what)}>Handle</button>
            </div>
          ))}
        </div>
        {toast && <div style={{ ...S.pill, ...S.pillOk, display: "inline-block", marginTop: 12 }}>{toast}</div>}
      </>
    );
  }

  return (
    <div style={S.app}>
      <div style={S.shell}>
        <div style={S.header}>
          <div style={S.h1}>Resume</div>
          <div style={S.sub}>Pick up exactly where you left off.</div>
        </div>
        {nav}
        {body}
      </div>
    </div>
  );
}
