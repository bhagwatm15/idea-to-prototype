import React, { useState } from "react";

const primary = "#2C3E50";
const secondary = "#34495E";
const accent = "#1ABC9C";
const bg = "#ECF0F1";
const text = "#2C3E50";
const pad = "12px";
const radius = "4px";

export default function App() {
  const [screen, setScreen] = useState("input");
  const [raw, setRaw] = useState("");
  const [project, setProject] = useState("");
  const [audience, setAudience] = useState("Executive");
  const [urgency, setUrgency] = useState("Normal");
  const [exec, setExec] = useState("");
  const [team, setTeam] = useState("");
  const [history, setHistory] = useState([]);

  const generate = () => {
    const execTxt = `${project || "Project"}: On track, 80% complete. Key risk: resource constraints.`;
    const teamTxt = `${project || "Project"} status update:\n- Completed: UI redesign, API integration.\n- In progress: QA testing, docs.\n- Next: Deployment prep.\n- Risks: Resource constraints may delay timeline.\n- Owner: Jane Doe.`;
    setExec(execTxt);
    setTeam(teamTxt);
    setScreen("output");
  };

  const saveHistory = () => {
    const entry = {
      project: project || "Untitled",
      exec,
      team,
      date: new Date().toLocaleString(),
    };
    setHistory([entry, ...history]);
    alert("Saved to history");
  };

  const copyTo = (txt) => navigator.clipboard.writeText(txt).then(() => alert("Copied"));

  const navStyle = {
    display: "flex",
    background: secondary,
    padding: pad,
    color: "#fff",
    fontFamily: "Arial, sans-serif",
  };
  const btnStyle = (active) => ({
    flex: 1,
    padding: pad,
    cursor: "pointer",
    background: active ? accent : "transparent",
    border: "none",
    color: "#fff",
    fontWeight: active ? "bold" : "normal",
  });
  const container = {
    fontFamily: "Arial, sans-serif",
    color: text,
    background: bg,
    minHeight: "100vh",
    padding: pad,
  };
  const label = { display: "block", marginTop: pad };
  const input = {
    width: "100%",
    padding: pad,
    marginTop: "4px",
    borderRadius: radius,
    border: `1px solid ${secondary}`,
  };
  const textarea = { ...input, height: "120px", resize: "vertical" };
  const section = { marginTop: pad };
  const button = {
    marginTop: pad,
    padding: pad,
    background: accent,
    border: "none",
    borderRadius: radius,
    color: "#fff",
    cursor: "pointer",
  };

  return (
    <div style={container}>
      <div style={navStyle}>
        {["input", "output", "edit", "export", "history"].map((s) => (
          <button
            key={s}
            style={btnStyle(screen === s)}
            onClick={() => setScreen(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {screen === "input" && (
        <div style={section}>
          <label style={label}>Project name</label>
          <input
            style={input}
            value={project}
            onChange={(e) => setProject(e.target.value)}
            placeholder="e.g. Project Alpha"
          />
          <label style={label}>Audience</label>
          <select
            style={input}
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          >
            <option>Executive</option>
            <option>Team</option>
            <option>Stakeholder</option>
          </select>
          <label style={label}>Urgency</label>
          <select
            style={input}
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
          >
            <option>Low</option>
            <option>Normal</option>
            <option>High</option>
          </select>
          <label style={label}>Raw status bullets (one per line)</label>
          <textarea
            style={textarea}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="- UI redesign completed\n- API integration 70% done"
          />
          <button style={button} onClick={generate}>
            Generate Updates
          </button>
        </div>
      )}

      {screen === "output" && (
        <div style={section}>
          <h3>Executive Summary</h3>
          <pre style={{ ...textarea, height: "80px" }}>{exec}</pre>
          <h3>Team Update</h3>
          <pre style={{ ...textarea, height: "140px" }}>{team}</pre>
          <button style={button} onClick={() => setScreen("edit")}>
            Edit Versions
          </button>
        </div>
      )}

      {screen === "edit" && (
        <div style={section}>
          <label style={label}>Executive Summary (editable)</label>
          <textarea
            style={textarea}
            value={exec}
            onChange={(e) => setExec(e.target.value)}
          />
          <label style={label}>Team Update (editable)</label>
          <textarea
            style={textarea}
            value={team}
            onChange={(e) => setTeam(e.target.value)}
          />
          <button style={button} onClick={() => setScreen("export")}>
            Continue to Export
          </button>
          <button style={{ ...button, background: "#e74c3c", marginLeft: pad }} onClick={saveHistory}>
            Save to History
          </button>
        </div>
      )}

      {screen === "export" && (
        <div style={section}>
          <h3>Ready to Share</h3>
          <div style={{ marginBottom: pad }}>
            <strong>Executive:</strong> {exec}
          </div>
          <div style={{ marginBottom: pad }}>
            <strong>Team:</strong> {team}
          </div>
          <button style={button} onClick={() => copyTo(exec)}>
            Copy Exec
          </button>
          <button style={{ ...button, marginLeft: pad }} onClick={() => copyTo(team)}>
            Copy Team
          </button>
          <button style={{ ...button, marginLeft: pad }} onClick={() => alert("Download simulated")}>
            Download .txt
          </button>
        </div>
      )}

      {screen === "history" && (
        <div style={section}>
          <h3>Past Updates</h3>
          {history.length === 0 && <p>No history yet.</p>}
          {history.map((h, i) => (
            <div
              key={i}
              style={{
                border: `1px solid ${secondary}`,
                borderRadius: radius,
                padding: pad,
                marginBottom: pad,
              }}
            >
              <strong>{h.project}</strong> – {h.date}
              <pre style={{ ...textarea, height: "80px", marginTop: pad }}>
{h.exec}
</pre>
              <pre style={{ ...textarea, height: "80px", marginTop: pad }}>
{h.team}
</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
