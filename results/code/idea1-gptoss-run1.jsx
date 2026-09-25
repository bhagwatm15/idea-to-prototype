import React, { useState } from 'react';

const App = () => {
  const colors = {
    bg: '#F5F7FA',
    primary: '#2C3E50',
    accent: '#3498DB',
    success: '#27AE60',
    warning: '#F1C40F',
    danger: '#E74C3C',
    text: '#333'
  };
  const spacing = { p: 8, m: 8 };
  const container = {
    backgroundColor: colors.bg,
    fontFamily: 'Helvetica, Arial, sans-serif',
    color: colors.text,
    minHeight: '100vh',
    padding: spacing.p
  };
  const tabBar = { display: 'flex', backgroundColor: colors.primary, color: '#fff', padding: spacing.p };
  const tab = isActive => ({
    flex: 1,
    textAlign: 'center',
    cursor: 'pointer',
    padding: spacing.p,
    backgroundColor: isActive ? colors.accent : 'transparent'
  });
  const card = {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: spacing.p,
    marginBottom: spacing.m,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };

  const projects = [
    { id: 1, name: 'Apollo Website Redesign', status: 'green', health: 'On Track' },
    { id: 2, name: 'Beacon Mobile Launch', status: 'yellow', health: 'Risk' },
    { id: 3, name: 'Cobalt API Migration', status: 'red', health: 'Stalled' }
  ];
  const decisions = [
    { id: 1, title: 'Choose primary colour palette', date: '2024-09-12', by: 'Lena' },
    { id: 2, title: 'Set sprint length to 2 weeks', date: '2024-09-08', by: 'Mike' },
    { id: 3, title: 'Defer analytics integration', date: '2024-09-05', by: 'Sara' }
  ];
  const blocker = {
    title: 'Design assets missing',
    opened: '2024-09-10',
    owner: 'Lena',
    description: 'UI kit not uploaded to shared drive, causing dev stalls.',
    suggested: 'Ask design lead for assets or approve temporary placeholders.'
  };
  const waiting = [
    { id: 1, from: 'Dev Team', item: 'Approve UI mockups', due: '2024-09-14' },
    { id: 2, from: 'QA', item: 'Clarify acceptance criteria', due: '2024-09-13' },
    { id: 3, from: 'Stakeholder', item: 'Sign‑off on budget', due: '2024-09-15' }
  ];

  const [screen, setScreen] = useState('switcher');
  const [selectedProject, setSelectedProject] = useState(null);
  const openProject = proj => {
    setSelectedProject(proj);
    setScreen('summary');
  };

  const renderTabs = () => (
    <div style={tabBar}>
      {['switcher', 'summary', 'decisions', 'blocker', 'waiting'].map(s => (
        <div key={s} style={tab(screen === s)} onClick={() => setScreen(s)}>
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </div>
      ))}
    </div>
  );

  let content = null;
  if (screen === 'switcher') {
    content = (
      <div>
        {projects.map(p => (
          <div key={p.id} style={card} onClick={() => openProject(p)}>
            <div style={{ fontWeight: 'bold' }}>{p.name}</div>
            <div>
              Status:{' '}
              <span
                style={{
                  color:
                    p.status === 'green'
                      ? colors.success
                      : p.status === 'yellow'
                      ? colors.warning
                      : colors.danger
                }}
              >
                {p.health}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  } else if (screen === 'summary') {
    const proj = selectedProject;
    content = (
      <div>
        <div style={card}>
          <div style={{ fontWeight: 'bold', fontSize: 16 }}>
            {proj ? proj.name : '[No project selected]'}
          </div>
          <div>
            Last decision:{' '}
            <strong>{decisions[0].title}</strong> ({decisions[0].date})
          </div>
          <div>Current blocker: <em>{blocker.title}</em></div>
          <div>
            Waiting on: {waiting[0].from} – {waiting[0].item}
          </div>
        </div>
        <button
          style={{
            padding: spacing.p,
            backgroundColor: colors.accent,
            color: '#fff',
            border: 'none',
            borderRadius: 4
          }}
          onClick={() => alert('Marked as caught up')}
        >
          Mark as caught up
        </button>
      </div>
    );
  } else if (screen === 'decisions') {
    content = (
      <div>
        {decisions.map(d => (
          <div key={d.id} style={card}>
            <div style={{ fontWeight: 'bold' }}>{d.title}</div>
            <div>
              {d.date} – by {d.by}
            </div>
          </div>
        ))}
      </div>
    );
  } else if (screen === 'blocker') {
    content = (
      <div style={card}>
        <div style={{ fontWeight: 'bold', marginBottom: spacing.p }}>{blocker.title}</div>
        <div>
          <strong>Opened:</strong> {blocker.opened}
        </div>
        <div>
          <strong>Owner:</strong> {blocker.owner}
        </div>
        <div style={{ marginTop: spacing.p }}>{blocker.description}</div>
        <div style={{ marginTop: spacing.p }}>
          <strong>Suggested action:</strong> {blocker.suggested}
        </div>
      </div>
    );
  } else if (screen === 'waiting') {
    content = (
      <div>
        {waiting.map(w => (
          <div key={w.id} style={card}>
            <div>
              <strong>{w.from}</strong> – {w.item}
            </div>
            <div>Due: {w.due}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={container}>
      {renderTabs()}
      <div style={{ padding: spacing.p }}>{content}</div>
    </div>
  );
};

export default App;
