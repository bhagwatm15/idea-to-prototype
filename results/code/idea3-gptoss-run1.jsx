import React, { useState } from "react";

export default function App() {
  const colors = {
    primary: "#2C3E50",
    accent: "#3498DB",
    bg: "#F5F7FA",
    text: "#333",
    light: "#FFF",
  };
  const spacing = { s: 8, m: 16, l: 24 };
  const btn = {
    background: colors.accent,
    color: colors.light,
    border: "none",
    padding: `${spacing.s}px ${spacing.m}px`,
    margin: `${spacing.s}px`,
    cursor: "pointer",
  };
  const input = {
    padding: `${spacing.s}px`,
    margin: `${spacing.s}px 0`,
    width: "100%",
    border: `1px solid ${colors.primary}`,
    borderRadius: 4,
  };
  const container = {
    fontFamily: "Arial, sans-serif",
    color: colors.text,
    background: colors.bg,
    minHeight: "100vh",
    padding: spacing.l,
  };
  const nav = {
    display: "flex",
    marginBottom: spacing.l,
    borderBottom: `2px solid ${colors.primary}`,
  };
  const navBtn = (active) => ({
    ...btn,
    background: active ? colors.primary : colors.accent,
  });

  const [screen, setScreen] = useState("feed");
  const [decisions, setDecisions] = useState([
    {
      id: 1,
      title: "Adopt new UI library",
      desc: "Switch to React Material UI for consistency",
      rationale: "Better theming, community support",
      alternatives: "Bootstrap, Ant Design",
      stakeholders: "Design Lead, Frontend Team",
      tags: ["UI", "Tech Debt"],
      date: "2024-08-12",
      updates: [],
      superseded: false,
    },
    {
      id: 2,
      title: "Cloud provider migration",
      desc: "Move services to AWS",
      rationale: "Scalability and cost predictability",
      alternatives: "Azure, GCP",
      stakeholders: "Ops, Finance",
      tags: ["Infrastructure"],
      date: "2024-07-01",
      updates: [],
      superseded: false,
    },
    {
      id: 3,
      title: "Quarterly OKR process",
      desc: "Implement OKR tracking tool",
      rationale: "Align goals across teams",
      alternatives: "Manual spreadsheets",
      stakeholders: "HR, All Teams",
      tags: ["Process"],
      date: "2024-06-15",
      updates: [],
      superseded: false,
    },
  ]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [newForm, setNewForm] = useState({
    title: "",
    desc: "",
    rationale: "",
    alternatives: "",
    stakeholders: "",
    tags: "",
    date: "",
  });
  const [updateText, setUpdateText] = useState("");

  const currentDecision = decisions.find((d) => d.id === selectedId);

  const renderNav = (
    <div style={nav}>
      {["feed", "new", "search", "team"].map((k) => (
        <button
          key={k}
          style={navBtn(screen === k)}
          onClick={() => setScreen(k)}
        >
          {k === "feed"
            ? "Decision Feed"
            : k === "new"
            ? "New Decision"
            : k === "search"
            ? "Search & Filter"
            : "Team Settings"}
        </button>
      ))}
    </div>
  );

  const renderFeed = (
    <div>
      {decisions.map((d) => (
        <div
          key={d.id}
          style={{
            background: colors.light,
            padding: spacing.m,
            marginBottom: spacing.m,
            borderRadius: 4,
            cursor: "pointer",
          }}
          onClick={() => {
            setSelectedId(d.id);
            setScreen("detail");
          }}
        >
          <strong>{d.title}</strong>
          <div style={{ fontSize: 12, color: colors.primary }}>{d.date}</div>
          <div>{d.tags.map((t) => `#${t}`).join(" ")}</div>
        </div>
      ))}
    </div>
  );

  const renderNew = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const newDec = {
          id: Math.max(...decisions.map((d) => d.id)) + 1,
          title: newForm.title,
          desc: newForm.desc,
          rationale: newForm.rationale,
          alternatives: newForm.alternatives,
          stakeholders: newForm.stakeholders,
          tags: newForm.tags.split(",").map((t) => t.trim()),
          date: newForm.date,
          updates: [],
          superseded: false,
        };
        setDecisions([newDec, ...decisions]);
        setNewForm({
          title: "",
          desc: "",
          rationale: "",
          alternatives: "",
          stakeholders: "",
          tags: "",
          date: "",
        });
        setScreen("feed");
      }}
    >
      {["title", "desc", "rationale", "alternatives", "stakeholders", "tags", "date"].map(
        (field) => (
          <div key={field}>
            <label style={{ fontWeight: "bold" }}>
              {field.charAt(0).toUpperCase() + field.slice(1)}:
            </label>
            <input
              style={input}
              type={field === "date" ? "date" : "text"}
              value={newForm[field]}
              onChange={(e) =>
                setNewForm({ ...newForm, [field]: e.target.value })
              }
              required
            />
          </div>
        )
      )}
      <button style={btn} type="submit">
        Save Decision
      </button>
    </form>
  );

  const renderDetail = currentDecision && (
    <div style={{ background: colors.light, padding: spacing.m, borderRadius: 4 }}>
      <h2>{currentDecision.title}</h2>
      <p>{currentDecision.desc}</p>
      <p><strong>Rationale:</strong> {currentDecision.rationale}</p>
      <p><strong>Alternatives:</strong> {currentDecision.alternatives}</p>
      <p><strong>Stakeholders:</strong> {currentDecision.stakeholders}</p>
      <p><strong>Tags:</strong> {currentDecision.tags.map((t) => `#${t}`).join(" ")}</p>
      <p><strong>Date:</strong> {currentDecision.date}</p>
      <p><strong>Status:</strong> {currentDecision.superseded ? "Superseded" : "Active"}</p>
      <hr />
      <h4>Updates</h4>
      {currentDecision.updates.length === 0 && <p>No updates yet.</p>}
      {currentDecision.updates.map((u, i) => (
        <div key={i} style={{ marginBottom: spacing.s }}>
          <em>{u}</em>
        </div>
      ))}
      <textarea
        style={{ ...input, height: 60 }}
        placeholder="Add an update..."
        value={updateText}
        onChange={(e) => setUpdateText(e.target.value)}
      />
      <button
        style={btn}
        onClick={() => {
          if (!updateText.trim()) return;
          const upd = [...decisions];
          const idx = upd.findIndex((d) => d.id === currentDecision.id);
          upd[idx].updates.push(updateText.trim());
          setDecisions(upd);
          setUpdateText("");
        }}
      >
        Add Update
      </button>
      <button
        style={{ ...btn, background: currentDecision.superseded ? "#95A5A6" : "#E74C3C" }}
        onClick={() => {
          const upd = decisions.map((d) =>
            d.id === currentDecision.id ? { ...d, superseded: !d.superseded } : d
          );
          setDecisions(upd);
        }}
      >
        {currentDecision.superseded ? "Re‑activate" : "Mark Superseded"}
      </button>
      <button style={btn} onClick={() => setScreen("feed")}>
        Back to Feed
      </button>
    </div>
  );

  const filtered = decisions.filter((d) => {
    const matchesSearch = search
      ? d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.desc.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesTag = filterTag ? d.tags.includes(filterTag) : true;
    return matchesSearch && matchesTag;
  });

  const renderSearch = (
    <div>
      <input
        style={input}
        placeholder="Keyword..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <input
        style={input}
        placeholder="Filter by tag (e.g., UI)"
        value={filterTag}
        onChange={(e) => setFilterTag(e.target.value)}
      />
      {filtered.map((d) => (
        <div
          key={d.id}
          style={{
            background: colors.light,
            padding: spacing.m,
            marginBottom: spacing.m,
            borderRadius: 4,
            cursor: "pointer",
          }}
          onClick={() => {
            setSelectedId(d.id);
            setScreen("detail");
          }}
        >
          <strong>{d.title}</strong> – {d.date}
        </div>
      ))}
    </div>
  );

  const renderTeam = (
    <div>
      <h3>Members</h3>
      <ul>
        <li>Alice – Admin</li>
        <li>Bob – Editor</li>
        <li>Carol – Viewer</li>
      </ul>
      <h3>Tags</h3>
      <ul>
        <li>UI</li>
        <li>Infrastructure</li>
        <li>Process</li>
      </ul>
    </div>
  );

  let main;
  if (screen === "feed") main = renderFeed;
  else if (screen === "new") main = renderNew;
  else if (screen === "detail") main = renderDetail;
  else if (screen === "search") main = renderSearch;
  else if (screen === "team") main = renderTeam;

  return (
    <div style={container}>
      <h1 style={{ color: colors.primary }}>Decido</h1>
      {renderNav}
      {main}
    </div>
  );
}
