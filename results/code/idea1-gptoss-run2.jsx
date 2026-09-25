import React, { useState } from "react";

const App = () => {
  const [screen, setScreen] = useState("switcher");
  const [project, setProject] = useState(null);

  const colors = {
    bg: "#f5f8fb",
    primary: "#2b6cb0",
    secondary: "#4a5568",
    success: "#2f855a",
    warning: "#d69e2e",
    danger: "#c53030",
    light: "#edf2f7",
    white: "#fff",
  };

  const spacing = { xs: 4, sm: 8, md: 16, lg: 24 };

  const base = {
    container: {
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      background: colors.bg,
      minHeight: "100vh",
      padding: spacing.lg,
      color: colors.secondary,
    },
    card: {
      background: colors.white,
      borderRadius: 4,
      padding: spacing.md,
      marginBottom: spacing.md,
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    title: { fontSize: 20, fontWeight: 600, marginBottom: spacing.sm, color: colors.primary },
    subtitle: { fontSize: 16, fontWeight: 500, marginBottom: spacing.xs, color: colors.secondary },
    btn: (bg) => ({
      background: bg,
      color: colors.white,
      border: "none",
      borderRadius: 4,
      padding: `${spacing.xs}px ${spacing.sm}px`,
      cursor: "pointer",
      marginRight: spacing.xs,
    }),
    nav: {
      display: "flex",
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    status: (c) => ({
      display: "inline-block",
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: c,
      marginRight: spacing.xs,
    }),
  };

  const sampleProjects = [
    { id: 1, name: "Apollo Launch", health: "green", status: "On Track" },
    { id: 2, name: "Zephyr Migration", health: "orange", status: "At Risk" },
    { id: 3, name: "Orion Beta", health: "red", status: "Delayed" },
  ];

  const decisions = [
    { id: 1, date: "2024-09-10", title: "Choose AWS region for latency" },
    { id: 2, date: "2024-09-08", title: "Approve budget increase $12k" },
    { id: 3, date: "2024-09-05", title: "Select UI framework: Material-UI" },
  ];

  const blockers = [
    {
      id: 1,
      owner: "Lena",
      title: "API auth token refresh failing",
      opened: "3d ago",
      suggested: "Escalate to infra lead",
    },
    {
      id: 2,
      owner: "Raj",
      title: "Data schema mismatch with downstream",
      opened: "1d ago",
      suggested: "Schedule sync with data team",
    },
  ];

  const waiting = [
    { id: 1, from: "Design", item: "Approve final mockups" },
    { id: 2, from: "QA", item: "Review regression test plan" },
    { id: 3, from: "Stakeholder", item: "Confirm launch date" },
  ];

  const renderNav = () => (
    <div style={base.nav}>
      <button style={base.btn(colors.primary)} onClick={() => setScreen("switcher")}>
        Switcher
      </button>
      {project && (
        <>
          <button style={base.btn(colors.primary)} onClick={() => setScreen("summary")}>
            Summary
          </button>
          <button style={base.btn(colors.primary)} onClick={() => setScreen("decision")}>
            Decisions
          </button>
          <button style={base.btn(colors.primary)} onClick={() => setScreen("blocker")}>
            Blocker
          </button>
          <button style={base.btn(colors.primary)} onClick={() => setScreen("waiting")}>
            Waiting
          </button>
        </>
      )}
    </div>
  );

  const renderSwitcher = () => (
    <div>
      <div style={base.title}>Active Projects</div>
      {sampleProjects.map((p) => (
        <div
          key={p.id}
          style={{
            ...base.card,
            cursor: "pointer",
            borderLeft: `4px solid ${
              p.health === "green"
                ? colors.success
                : p.health === "orange"
                ? colors.warning
                : colors.danger
            }`,
          }}
          onClick={() => {
            setProject(p);
            setScreen("summary");
          }}
        >
          <span style={base.status(p.health === "green" ? colors.success : p.health === "orange" ? colors.warning : colors.danger)} />
          <strong>{p.name}</strong> – {p.status}
        </div>
      ))}
    </div>
  );

  const renderSummary = () => (
    <div>
      <div style={base.title}>Re‑entry Summary – {project.name}</div>
      <div style={base.card}>
        <div style={base.subtitle}>Last Decision</div>
        <div>{decisions[0].title} ({decisions[0].date})</div>
      </div>
      <div style={base.card}>
        <div style={base.subtitle}>Active Blockers</div>
        {blockers.map((b) => (
          <div key={b.id}>• {b.title} – {b.owner}</div>
        ))}
      </div>
      <div style={base.card}>
        <div style={base.subtitle}>Waiting On Me</div>
        {waiting.map((w) => (
          <div key={w.id}>• {w.from}: {w.item}</div>
        ))}
      </div>
      <button style={base.btn(colors.success)} onClick={() => alert("Marked as caught up")}>
        Mark as Caught Up
      </button>
    </div>
  );

  const renderDecision = () => (
    <div>
      <div style={base.title}>Decision Log – {project.name}</div>
      {decisions.map((d) => (
        <div key={d.id} style={base.card}>
          <div>{d.date}</div>
          <div>{d.title}</div>
        </div>
      ))}
    </div>
  );

  const renderBlocker = () => (
    <div>
      <div style={base.title}>Blocker Detail – {project.name}</div>
      {blockers.map((b) => (
        <div key={b.id} style={base.card}>
          <div style={base.subtitle}>{b.title}</div>
          <div>Owner: {b.owner}</div>
          <div>Opened: {b.opened}</div>
          <div>Suggested: {b.suggested}</div>
          <button style={base.btn(colors.primary)} onClick={() => alert(`Unblocked ${b.owner}`)}>
            Unblock
          </button>
        </div>
      ))}
    </div>
  );

  const renderWaiting = () => (
    <div>
      <div style={base.title}>Waiting‑On Queue</div>
      {waiting.map((w) => (
        <div key={w.id} style={base.card}>
          <div style={base.subtitle}>{w.from}</div>
          <div>{w.item}</div>
          <button style={base.btn(colors.primary)} onClick={() => alert(`Replied to ${w.from}`)}>
            Reply
          </button>
        </div>
      ))}
    </div>
  );

  let content;
  switch (screen) {
    case "summary":
      content = renderSummary();
      break;
    case "decision":
      content = renderDecision();
      break;
    case "blocker":
      content = renderBlocker();
      break;
    case "waiting":
      content = renderWaiting();
      break;
    default:
      content = renderSwitcher();
  }

  return (
    <div style={base.container}>
      {renderNav()}
      {content}
    </div>
  );
};

export default App;
