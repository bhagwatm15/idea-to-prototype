import React, { useState } from "react";

const colors = {
  bg: "#f7f8fa",
  panel: "#ffffff",
  border: "#e0e3e8",
  primary: "#1f4e79",
  accent: "#2f80ed",
  text: "#2b2f36",
  muted: "#6b7280",
};

const font = "'Segoe UI', Helvetica, Arial, sans-serif";

const styles = {
  app: { fontFamily: font, background: colors.bg, minHeight: "100vh", color: colors.text },
  nav: { display: "flex", gap: 4, background: colors.primary, padding: "0 16px" },
  tab: (active) => ({
    padding: "14px 18px",
    cursor: "pointer",
    color: active ? "#fff" : "#cdd8e6",
    borderBottom: active ? "3px solid #fff" : "3px solid transparent",
    fontSize: 14,
    fontWeight: 600,
  }),
  main: { padding: 28, maxWidth: 1100, margin: "0 auto" },
  h1: { fontSize: 22, fontWeight: 700, marginBottom: 6, color: colors.primary },
  sub: { fontSize: 13, color: colors.muted, marginBottom: 20 },
  panel: { background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 8, padding: 20 },
  label: { fontSize: 12, fontWeight: 600, color: colors.muted, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 0.4 },
  input: { width: "100%", padding: "10px 12px", border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, marginBottom: 16, boxSizing: "border-box", fontFamily: font },
  textarea: { width: "100%", minHeight: 160, padding: 12, border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, marginBottom: 16, boxSizing: "border-box", fontFamily: font, resize: "vertical" },
  btn: { background: colors.accent, color: "#fff", border: "none", padding: "10px 18px", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnGhost: { background: "transparent", color: colors.primary, border: `1px solid ${colors.primary}`, padding: "9px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  row: { display: "flex", gap: 20 },
  col: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: 700, marginBottom: 10, color: colors.primary },
  historyItem: { padding: "12px 14px", border: `1px solid ${colors.border}`, borderRadius: 6, marginBottom: 10, background: colors.panel, display: "flex", justifyContent: "space-between", alignItems: "center" },
};

export default function App() {
  const [screen, setScreen] = useState("Input");
  const [bullets, setBullets] = useState(
    "- Migrated billing service to new infra, cut latency 30%\n- QA found 4 regressions in checkout flow, 2 fixed\n- Vendor contract renewal delayed, blocks Q3 rollout\n- Hired 1 new backend engineer, starts Monday"
  );
  const [project, setProject] = useState("Atlas Billing Migration");
  const [audience, setAudience] = useState("Leadership");
  const [urgency, setUrgency] = useState("Normal");
  const [execText, setExecText] = useState(
    "Atlas Billing Migration is on track: infra move cut latency 30%. Checkout QA found minor issues, half resolved. Vendor delay is the key risk to Q3 timeline."
  );
  const [teamText, setTeamText] = useState(
    "Team update — Atlas Billing:\n1. Infra migration complete, latency down 30%.\n2. QA flagged 4 checkout regressions; 2 fixed, 2 in progress.\n3. Vendor contract renewal delayed — escalating this week.\n4. New backend engineer (Priya) starts Monday, onboarding plan ready."
  );
  const [history, setHistory] = useState([
    { id: 1, name: "Atlas Billing Migration - Week 24", date: "Jun 10" },
    { id: 2, name: "Mobile Redesign Sprint Recap", date: "Jun 3" },
    { id: 3, name: "Vendor Renewal Status", date: "May 27" },
  ]);

  const tabs = ["Input", "Dual Output", "Edit & Refine", "Export/Share", "History"];

  const generate = () => {
    setExecText(
      `${project}: Key progress this period includes infra gains and hiring. Main risk is vendor delay affecting Q3. Audience: ${audience}, Urgency: ${urgency}.`
    );
    setTeamText(
      `Team update — ${project}:\n1. ${bullets.split("\n")[0]?.replace("- ", "") || "Progress item"}\n2. QA and delivery items tracked in board.\n3. Escalation needed on vendor timeline.\n4. Staffing update included.`
    );
    setScreen("Dual Output");
  };

  return (
    <div style={styles.app}>
      <div style={styles.nav}>
        {tabs.map((t) => (
          <div key={t} style={styles.tab(screen === t)} onClick={() => setScreen(t)}>
            {t}
          </div>
        ))}
      </div>
      <div style={styles.main}>
        {screen === "Input" && (
          <div>
            <div style={styles.h1}>New Status Update</div>
            <div style={styles.sub}>Paste rough bullets, add context, then generate exec + team versions.</div>
            <div style={styles.panel}>
              <label style={styles.label}>Raw Bullets</label>
              <textarea style={styles.textarea} value={bullets} onChange={(e) => setBullets(e.target.value)} />
              <div style={styles.row}>
                <div style={styles.col}>
                  <label style={styles.label}>Project Name</label>
                  <input style={styles.input} value={project} onChange={(e) => setProject(e.target.value)} />
                </div>
                <div style={styles.col}>
                  <label style={styles.label}>Audience</label>
                  <select style={styles.input} value={audience} onChange={(e) => setAudience(e.target.value)}>
                    <option>Leadership</option>
                    <option>Peers</option>
                    <option>Client</option>
                  </select>
                </div>
                <div style={styles.col}>
                  <label style={styles.label}>Urgency</label>
                  <select style={styles.input} value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                    <option>Normal</option>
                    <option>High</option>
                    <option>FYI Only</option>
                  </select>
                </div>
              </div>
              <button style={styles.btn} onClick={generate}>Generate Updates</button>
            </div>
          </div>
        )}

        {screen === "Dual Output" && (
          <div>
            <div style={styles.h1}>{project}</div>
            <div style={styles.sub}>Exec summary vs. team update — compare and refine.</div>
            <div style={styles.row}>
              <div style={styles.col}>
                <div style={styles.panel}>
                  <div style={styles.cardTitle}>Exec Summary</div>
                  <div style={{ fontSize: 14, lineHeight: 1.6 }}>{execText}</div>
                </div>
              </div>
              <div style={styles.col}>
                <div style={styles.panel}>
                  <div style={styles.cardTitle}>Team Update</div>
                  <div style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-line" }}>{teamText}</div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <button style={styles.btn} onClick={() => setScreen("Edit & Refine")}>Edit & Refine</button>
              <span style={{ display: "inline-block", width: 10 }} />
              <button style={styles.btnGhost} onClick={() => setScreen("Export/Share")}>Export / Share</button>
            </div>
          </div>
        )}

        {screen === "Edit & Refine" && (
          <div>
            <div style={styles.h1}>Edit & Refine</div>
            <div style={styles.sub}>Tweak either version inline or regenerate just one.</div>
            <div style={styles.row}>
              <div style={styles.col}>
                <div style={styles.panel}>
                  <div style={styles.cardTitle}>Exec Summary</div>
                  <textarea style={styles.textarea} value={execText} onChange={(e) => setExecText(e.target.value)} />
                  <button style={styles.btnGhost} onClick={() => setExecText(execText + " (tightened for brevity)")}>Regenerate Exec</button>
                </div>
              </div>
              <div style={styles.col}>
                <div style={styles.panel}>
                  <div style={styles.cardTitle}>Team Update</div>
                  <textarea style={styles.textarea} value={teamText} onChange={(e) => setTeamText(e.target.value)} />
                  <button style={styles.btnGhost} onClick={() => setTeamText(teamText + "\n5. Added more detail per regeneration.")}>Regenerate Team</button>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <button style={styles.btn} onClick={() => setScreen("Export/Share")}>Continue to Export</button>
            </div>
          </div>
        )}

        {screen === "Export/Share" && (
          <div>
            <div style={styles.h1}>Export / Share</div>
            <div style={styles.sub}>Send the final versions wherever your team needs them.</div>
            <div style={styles.panel}>
              <div style={styles.cardTitle}>Choose Destination</div>
              <button style={styles.btnGhost}>Copy Exec to Clipboard</button>
              <span style={{ display: "inline-block", width: 10 }} />
              <button style={styles.btnGhost}>Copy Team to Clipboard</button>
              <span style={{ display: "inline-block", width: 10 }} />
              <button style={styles.btnGhost}>Download as .txt</button>
              <div style={{ marginTop: 16 }}>
                <button style={styles.btn}>Send to Slack (#atlas-updates)</button>
                <span style={{ display: "inline-block", width: 10 }} />
                <button style={styles.btn}>Send via Email</button>
              </div>
              <div
                style={{
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: `1px solid ${colors.border}`,
                }}
                onClick={() =>
                  setHistory([{ id: Date.now(), name: `${project} - Update`, date: "Just now" }, ...history])
                }
              >
                <button style={styles.btnGhost}>Save to History</button>
              </div>
            </div>
          </div>
        )}

        {screen === "History" && (
          <div>
            <div style={styles.h1}>Past Updates</div>
            <div style={styles.sub}>Reuse a previous report as a starting point.</div>
            {history.map((h) => (
              <div key={h.id} style={styles.historyItem}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{h.name}</div>
                  <div style={{ fontSize: 12, color: colors.muted }}>{h.date}</div>
                </div>
                <button style={styles.btnGhost} onClick={() => setScreen("Dual Output")}>Reuse</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
