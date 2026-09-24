import React, { useState } from 'react';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('projects');
  const [selectedProject, setSelectedProject] = useState(null);

  // Shared color palette & spacing
  const colors = {
    bg: '#f9f8f6',
    surface: '#ffffff',
    text: '#2c2c2c',
    textLight: '#666666',
    accent: '#4a90a4',
    accentLight: '#e8f0f5',
    success: '#5a9b6f',
    warning: '#d4a574',
    border: '#e0dcd7',
  };

  const spacing = {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  };

  // Sample data
  const projects = [
    { id: 1, name: 'Mobile App Redesign', status: 'Active', lastTouched: '2 hours ago', health: 'on-track' },
    { id: 2, name: 'API v2 Migration', status: 'Active', lastTouched: '1 day ago', health: 'at-risk' },
    { id: 3, name: 'Analytics Dashboard', status: 'Planning', lastTouched: '3 days ago', health: 'on-track' },
    { id: 4, name: 'Support Portal', status: 'Blocked', lastTouched: '5 days ago', health: 'blocked' },
  ];

  const projectDetails = {
    1: {
      name: 'Mobile App Redesign',
      lastDecision: 'Approved new onboarding flow with 3-step process',
      rationale: 'User research showed 40% drop-off at registration. Reduced steps to minimum viable.',
      decisionDate: '2024-01-15',
      blockers: ['Design review from brand team (pending)', 'iOS build optimization'],
    },
    2: {
      name: 'API v2 Migration',
      lastDecision: 'Postponed database migration to Q2',
      rationale: 'Performance testing revealed schema changes need 3+ weeks prep.',
      decisionDate: '2024-01-10',
      blockers: ['Waiting on infrastructure team for capacity plan'],
    },
    3: {
      name: 'Analytics Dashboard',
      lastDecision: 'Added real-time metrics module to scope',
      rationale: 'Sales team identified this as critical for enterprise deals.',
      decisionDate: '2024-01-08',
      blockers: [],
    },
    4: {
      name: 'Support Portal',
      lastDecision: 'Blocked pending legal review',
      rationale: 'GDPR compliance check required before launch.',
      decisionDate: '2024-01-05',
      blockers: ['Legal team review in progress (5 days)'],
    },
  };

  const waitingOn = {
    1: {
      waiting: [
        { name: 'Sarah Chen', role: 'Brand Lead', age: '3 days', priority: 'high' },
        { name: 'Mike Rodriguez', role: 'iOS Engineer', age: '1 day', priority: 'medium' },
      ],
      waitingOnYou: [{ name: 'James Park', role: 'Design', age: '2 days', priority: 'high' }],
    },
    2: {
      waiting: [{ name: 'Infrastructure Team', role: 'DevOps', age: '4 days', priority: 'high' }],
      waitingOnYou: [{ name: 'You', role: 'PM', age: '0 days', priority: 'medium' }],
    },
  };

  const decisions = {
    1: [
      { title: 'Approved new onboarding flow with 3-step process', date: '2024-01-15' },
      { title: 'Decided to prioritize iOS over Android for initial launch', date: '2024-01-10' },
      { title: 'Reduced scope to exclude offline mode for v1', date: '2024-01-05' },
    ],
    2: [
      { title: 'Postponed database migration to Q2', date: '2024-01-10' },
      { title: 'Chose PostgreSQL over MongoDB for v2 schema', date: '2024-01-01' },
    ],
  };

  // Base container and text styles
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: colors.bg,
    padding: spacing.lg,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: colors.text,
  };

  const headerStyle = {
    fontSize: '28px',
    fontWeight: '600',
    marginBottom: spacing.md,
    color: colors.text,
  };

  const subheaderStyle = {
    fontSize: '14px',
    color: colors.textLight,
    marginBottom: spacing.lg,
  };

  const navStyle = {
    display: 'flex',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: spacing.sm,
  };

  const navButtonStyle = (isActive) => ({
    padding: `${spacing.sm} ${spacing.md}`,
    border: 'none',
    backgroundColor: 'transparent',
    color: isActive ? colors.accent : colors.textLight,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '400',
    borderBottom: isActive ? `2px solid ${colors.accent}` : 'none',
    marginBottom: '-1px',
  });

  const cardStyle = {
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    padding: spacing.md,
    marginBottom: spacing.md,
    cursor: 'pointer',
  };

  const buttonStyle = (variant = 'primary') => ({
    padding: `${spacing.xs} ${spacing.md}`,
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    backgroundColor: variant === 'primary' ? colors.accent : colors.accentLight,
    color: variant === 'primary' ? '#fff' : colors.accent,
    marginRight: spacing.xs,
  });

  // Render based on current screen
  return (
    <div style={containerStyle}>
      <nav style={navStyle}>
        <button style={navButtonStyle(currentScreen === 'projects')} onClick={() => setCurrentScreen('projects')}>
          Projects
        </button>
        {selectedProject && (
          <>
            <button style={navButtonStyle(currentScreen === 'summary')} onClick={() => setCurrentScreen('summary')}>
              Re-entry
            </button>
            <button style={navButtonStyle(currentScreen === 'waiting')} onClick={() => setCurrentScreen('waiting')}>
              Waiting On
            </button>
            <button style={navButtonStyle(currentScreen === 'decisions')} onClick={() => setCurrentScreen('decisions')}>
              Decisions
            </button>
          </>
        )}
        <button style={navButtonStyle(currentScreen === 'integrations')} onClick={() => setCurrentScreen('integrations')}>
          Settings
        </button>
      </nav>

      {currentScreen === 'projects' && (
        <div>
          <h1 style={headerStyle}>Projects</h1>
          <p style={subheaderStyle}>Active & recent projects</p>
          {projects.map((p) => (
            <div
              key={p.id}
              style={{
                ...cardStyle,
                backgroundColor: colors.surface,
                opacity: p.status === 'Blocked' ? 0.85 : 1,
              }}
              onClick={() => {
                setSelectedProject(p.id);
                setCurrentScreen('summary');
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600' }}>{p.name}</div>
                  <div style={{ fontSize: '13px', color: colors.textLight, marginTop: spacing.xs }}>
                    {p.status} • Last touched {p.lastTouched}
                  </div>
                </div>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor:
                      p.health === 'on-track'
                        ? colors.success
                        : p.health === 'at-risk'
                          ? colors.warning
                          : '#d9534f',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {currentScreen === 'summary' && selectedProject && (
        <div>
          <h1 style={headerStyle}>{projectDetails[selectedProject].name}</h1>
          <p style={subheaderStyle}>Last decision & blockers</p>

          <div style={{ ...cardStyle, backgroundColor: colors.accentLight }}>
            <div style={{ fontSize: '12px', color: colors.textLight, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Last Decision
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', marginTop: spacing.sm }}>
              {projectDetails[selectedProject].lastDecision}
            </div>
            <div style={{ fontSize: '13px', color: colors.textLight, marginTop: spacing.sm }}>
              <strong>Why:</strong> {projectDetails[selectedProject].rationale}
            </div>
            <div style={{ fontSize: '12px', color: colors.textLight, marginTop: spacing.sm }}>
              {projectDetails[selectedProject].decisionDate}
            </div>
          </div>

          {projectDetails[selectedProject].blockers.length > 0 && (
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: spacing.sm }}>Current Blockers</h3>
              {projectDetails[selectedProject].blockers.map((blocker, i) => (
                <div key={i} style={{ ...cardStyle, borderLeft: `3px solid ${colors.warning}` }}>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>{blocker}</div>
                  <div style={{ marginTop: spacing.sm }}>
                    <button style={buttonStyle('primary')}>Reply</button>
                    <button style={buttonStyle('secondary')}>Snooze</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {currentScreen === 'waiting' && selectedProject && waitingOn[selectedProject] && (
        <div>
          <h1 style={headerStyle}>Waiting On</h1>
          <p style={subheaderStyle}>{projectDetails[selectedProject].name}</p>

          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: spacing.sm, marginTop: spacing.lg }}>
            Waiting on You
          </h3>
          {waitingOn[selectedProject].waitingOnYou.map((item, i) => (
            <div key={i} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>{item.name}</div>
                  <div style={{ fontSize: '13px', color: colors.textLight }}>{item.role}</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '13px', color: colors.warning }}>
                  {item.age}
                </div>
              </div>
              <button style={{ ...buttonStyle('primary'), marginTop: spacing.sm }}>Reply</button>
            </div>
          ))}

          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: spacing.sm, marginTop: spacing.lg }}>
            You're Waiting On
          </h3>
          {waitingOn[selectedProject].waiting.map((item, i) => (
            <div key={i} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>{item.name}</div>
                  <div style={{ fontSize: '13px', color: colors.textLight }}>{item.role}</div>
                </div>
                <div
                  style={{
                    textAlign: 'right',
                    fontSize: '13px',
                    color: item.priority === 'high' ? '#d9534f' : colors.warning,
                    fontWeight: '600',
                  }}
                >
                  {item.age}
                </div>
              </div>
              <button style={{ ...buttonStyle('secondary'), marginTop: spacing.sm }}>Nudge</button>
            </div>
          ))}
        </div>
      )}

      {currentScreen === 'decisions' && selectedProject && decisions[selectedProject] && (
        <div>
          <h1 style={headerStyle}>Decision Log</h1>
          <p style={subheaderStyle}>{projectDetails[selectedProject].name}</p>
          {decisions[selectedProject].map((d, i) => (
            <div key={i} style={cardStyle}>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{d.title}</div>
              <div style={{ fontSize: '12px', color: colors.textLight, marginTop: spacing.xs }}>{d.date}</div>
            </div>
          ))}
        </div>
      )}

      {currentScreen === 'integrations' && (
        <div>
          <h1 style={headerStyle}>Integrations & Settings</h1>
          <p style={subheaderStyle}>Connect tools to auto-log decisions and blockers</p>

          {['Slack', 'Jira', 'Email'].map((tool) => (
            <div key={tool} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>{tool}</div>
                  <div style={{ fontSize: '13px', color: colors.textLight }}>
                    {tool === 'Slack' && 'Post decisions to #product'}
                    {tool === 'Jira' && 'Sync blockers with Jira issues'}
                    {tool === 'Email' && 'Auto-digest of waiting-on summaries'}
                  </div>
                </div>
                <button style={buttonStyle('primary')}>Connect</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
