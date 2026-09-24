import React, { useState } from "react";

const colors = {
  bg: "#F5F7FA",
  card: "#FFFFFF",
  navy: "#1F2A44",
  accent: "#2D6CDF",
  muted: "#6B7280",
  border: "#E2E8F0",
  green: "#1B8A5A",
};
const font = "'Segoe UI', system-ui, -apple-system, sans-serif";

export default function App() {
  const [screen, setScreen] = useState("input");
  const [bullets, setBullets] = useState(
    "- Migrated billing DB to new cluster, 0 downtime\n- Checkout latency down 18% after caching fix\n- Vendor contract for SSO delayed to next sprint\n- Hired 1 backend engineer, starts Nov 3\n- Q3 budget tracking 4% under forecast"
  );
  const [project, setProject] = useState("Atlas Platform Migration");
  const [audience, setAudience] = useState("Leadership");
  const [urgency, setUrgency] = useState("Normal");
  const [exec, setExec] = useState("");
  const [team, setTeam] = useState("");
  const [history, setHistory] = useState([
    { id: 1, project: "Atlas Platform Migration", date: "Oct 21", exec: "Migration on track; checkout latency improved 18%; SSO vendor slip noted." },
    { id: 2, project: "Q3 Growth Sprint", date: "Oct 14", exec: "Signups up 12% WoW; onboarding email A/B test launched Friday." },
  ]);

  const generate = () => {
    const lines = bullets.split("\n").filter((l) => l.trim());
    const execText = `${project} — ${urgency} update for ${audience}.\n\n` +
      lines.slice(0, 3).map((l) => l.replace(/^-\s*/, "")).join("; ") + ".";
    const teamText = `${project} — Detailed Team Update\n\n` +
      lines.map((l) => "• " + l.replace(/^-\s*/, "")).join("\n") +
      "\n\nNext steps: follow up on open items and confirm owners by Friday.";
    setExec(execText);
    setTeam(teamText);
    setHistory([{ id: Date.now(), project, date: "Just now", exec: execText.slice(0, 80) + "…" }, ...history]);
    setScreen("output");
  };

  const tabs = ["input", "output", "edit", "export", "history"];
  const labels = { input: "1. Input", output: "2. Dual Output", edit: "3. Edit & Refine", export: "4. Export", history: "History" };

  const s = {
    page: { fontFamily: font, background: colors.bg, minHeight: "100vh", color: colors.navy },
    nav: { display: "flex", gap: 8, padding: "16px 24px", background: colors.navy, alignItems: "center" },
    navBtn: (active) => ({
      padding: "8px 14px", borderRadius: 6, cursor: "pointer", border: "none",
      background: active ? colors.accent : "transparent", color: active ? "#fff" : "#CBD5E1",
      fontWeight: 600, fontSize: 13,
    }),
    body: { padding: 28, maxWidth: 1100, margin: "0 auto" },
    card: { background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 10, padding: 20, marginBottom: 16 },
    label: { fontSize: 12, fontWeight: 700, color: colors.muted, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 0.5 },
    input: { width: "100%", padding: "9px 10px", borderRadius: 6, border: `1px solid ${colors.border}`, fontSize: 14, marginBottom: 14, boxSizing: "border-box", fontFamily: font },
    textarea: { width: "100%", minHeight: 160, padding: 10, borderRadius: 6, border: `1px solid ${colors.border}`, fontSize: 14, fontFamily: font, boxSizing: "border-box" },
    h1: { fontSize: 22, fontWeight: 700, marginBottom: 4 },
    sub: { fontSize: 13, color: colors.muted, marginBottom: 18 },
    btn: { background: colors.accent, color: "#fff", border: "none", padding: "10px 18px", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 14 },
    btnGhost: { background: "#fff", color: colors.navy, border: `1px solid ${colors.border}`, padding: "9px 16px", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 13, marginRight: 8 },
    col: { flex: 1, minWidth: 320 },
  };

  return (
    <div style={s.page}>
      <div style={s.nav}>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 18, marginRight: 20 }}>Brieflio</div>
        {tabs.map((t) => (
          <button key={t} style={s.navBtn(screen === t)} onClick={() => setScreen(t)}>{labels[t]}</button>
        ))}
      </div>
      <div style={s.body}>
        {screen === "input" && (
          <div style={s.card}>
            <div style={s.h1}>New Status Update</div>
            <div style={s.sub}>Paste rough bullets and set context. Brieflio will draft exec + team versions.</div>
            <label style={s.label}>Raw Bullets</label>
            <textarea style={s.textarea} value={bullets} onChange={(e) => setBullets(e.target.value)} />
            <div style={{ display: "flex", gap: 14, marginTop: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Project</label>
                <input style={s.input} value={project} onChange={(e) => setProject(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Audience</label>
                <select style={s.input} value={audience} onChange={(e) => setAudience(e.target.value)}>
                  <option>Leadership</option><option>Engineering Team</option><option>Cross-functional Stakeholders</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Urgency</label>
                <select style={s.input} value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                  <option>Normal</option><option>Time-sensitive</option><option>FYI Only</option>
                </select>
              </div>
            </div>
            <button style={s.btn} onClick={generate}>Generate Updates →</button>
          </div>
        )}

        {(screen === "output" || screen === "edit") && (
          <div>
            <div style={s.h1}>{project}</div>
            <div style={s.sub}>{screen === "edit" ? "Edit & Refine — tweak wording or regenerate a single version." : "Compare exec summary and team detail side by side."}</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={s.col}>
                <div style={s.card}>
                  <div style={{ fontWeight: 700, color: colors.accent, marginBottom: 8 }}>Exec Summary</div>
                  <textarea style={{ ...s.textarea, minHeight: 200 }} value={exec} onChange={(e) => setExec(e.target.value)} />
                  {screen === "edit" && (
                    <div style={{ marginTop: 10 }}>
                      <button style={s.btnGhost} onClick={() => setExec(exec + "\n(Regenerated tone: more concise.)")}>Regenerate</button>
                      <button style={s.btnGhost} onClick={() => setExec(exec.toUpperCase())}>Punch up tone</button>
                    </div>
                  )}
                </div>
              </div>
              <div style={s.col}>
                <div style={s.card}>
                  <div style={{ fontWeight: 700, color: colors.green, marginBottom: 8 }}>Team Update</div>
                  <textarea style={{ ...s.textarea, minHeight: 200 }} value={team} onChange={(e) => setTeam(e.target.value)} />
                  {screen === "edit" && (
                    <div style={{ marginTop: 10 }}>
                      <button style={s.btnGhost} onClick={() => setTeam(team + "\n• Added detail on blockers.")}>Regenerate</button>
                      <button style={s.btnGhost} onClick={() => setTeam(team + "\n• Softer tone applied.")}>Soften tone</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button style={s.btn} onClick={() => setScreen(screen === "output" ? "edit" : "export")}>
              {screen === "output" ? "Edit & Refine →" : "Continue to Export →"}
            </button>
          </div>
        )}

        {screen === "export" && (
          <div style={s.card}>
            <div style={s.h1}>Export "{project}"</div>
            <div style={s.sub}>Copy, download, or send the final versions.</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
              <button style={s.btn}>Copy Exec Summary</button>
              <button style={s.btn}>Copy Team Update</button>
              <button style={s.btnGhost}>Download .docx</button>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={s.btnGhost}>Send to Slack #status-updates</button>
              <button style={s.btnGhost}>Email to leadership@company.com</button>
            </div>
          </div>
        )}

        {screen === "history" && (
          <div>
            <div style={s.h1}>Past Updates</div>
            <div style={s.sub}>Reuse a previous report as a starting point.</div>
            {history.map((h) => (
              <div key={h.id} style={s.card}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 700 }}>{h.project}</div>
                  <div style={{ color: colors.muted, fontSize: 12 }}>{h.date}</div>
                </div>
                <div style={{ color: colors.muted, fontSize: 13, marginTop: 6 }}>{h.exec}</div>
                <button style={{ ...s.btnGhost, marginTop: 10 }} onClick={() => setScreen("output")}>Reuse</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
