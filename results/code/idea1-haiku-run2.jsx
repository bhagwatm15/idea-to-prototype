import React, { useState } from 'react';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('switcher');
  const [selectedProject, setSelectedProject] = useState(null);

  // Shared style constants
  const colors = {
    bg: '#f8f7f5',
    surface: '#ffffff',
    text: '#2c2c2c',
    textLight: '#6b6b6b',
    accent: '#4a7c7e',
    accentLight: '#e8f1f1',
    warning: '#d97757',
    success: '#5a8f6a',
    border: '#e0ddd8',
  };

  const spacing = {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  };

  const baseText = {
    fontFamily: "'system-ui', sans-serif",
    color: colors.text,
  };

  const projects = [
    { id: 1, name: 'Mobile App Redesign', status: 'on-track', lastUpdate: '2h ago', blockers: 1, waiting: 0 },
    { id: 2, name: 'API Migration', status: 'at-risk', lastUpdate: '8h ago', blockers: 2, waiting: 1 },
    { id: 3, name: 'Dashboard Analytics', status: 'on-track', lastUpdate: '1d ago', blockers: 0, waiting: 2 },
    { id: 4, name: 'Auth System Upgrade', status: 'blocked', lastUpdate: '3d ago', blockers: 3, waiting: 0 },
  ];

  const projectDetails = {
    1: {
      lastDecision: 'Approved iOS-first component library approach (Jan 15)',
      blockers: [{ id: 'b1', title: 'Design review pending on nav patterns', owner: 'Sarah Chen', since: '2d' }],
      waiting: [],
    },
    2: {
      lastDecision: 'Database migration scheduled for Feb 2 (Jan 10)',
      blockers: [
        { id: 'b2', title: 'Legacy endpoint compatibility tests failing', owner: 'Marcus Lee', since: '1d' },
        { id: 'b3', title: 'Customer data export tool not ready', owner: 'Priya Patel', since: '3d' },
      ],
      waiting: [{ id: 'w1', message: 'Alex waiting on migration timeline confirmation', since: '5h' }],
    },
    3: {
      lastDecision: 'Decided on Postgres for analytics backend (Jan 8)',
      blockers: [],
      waiting: [
        { id: 'w2', message: 'Design team waiting on chart spec approval', since: '1d' },
        { id: 'w3', message: 'QA waiting on staging data', since: '2d' },
      ],
    },
    4: {
      lastDecision: 'Postponed due to resource constraints (Jan 5)',
      blockers: [
        { id: 'b4', title: 'OAuth provider integration stuck on credentials', owner: 'Jamie Wong', since: '5d' },
        { id: 'b5', title: 'Security audit blocker', owner: 'InfoSec team', since: '4d' },
        { id: 'b6', title: 'Documentation gaps for legacy system', owner: 'Docs team', since: '6d' },
      ],
      waiting: [],
    },
  };

  const getStatusColor = (status) => {
    if (status === 'on-track') return colors.success;
    if (status === 'at-risk') return colors.warning;
    return colors.warning;
  };

  const getStatusLabel = (status) => {
    if (status === 'on-track') return 'On Track';
    if (status === 'at-risk') return 'At Risk';
    return 'Blocked';
  };

  // Project Switcher Screen
  const renderSwitcher = () => (
    <div style={{ padding: spacing.lg }}>
      <h1 style={{ ...baseText, fontSize: 28, fontWeight: 600, marginBottom: spacing.lg }}>Active Projects</h1>
      <div style={{ display: 'grid', gap: spacing.md }}>
        {projects.map((p) => (
          <div
            key={p.id}
            onClick={() => {
              setSelectedProject(p.id);
              setCurrentScreen('reentry');
            }}
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              padding: spacing.md,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ ...baseText, fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{p.name}</h3>
                <p style={{ ...baseText, color: colors.textLight, fontSize: 13 }}>Updated {p.lastUpdate}</p>
              </div>
              <div
                style={{
                  backgroundColor: getStatusColor(p.status),
                  color: '#fff',
                  padding: `${spacing.xs}px ${spacing.sm}px`,
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                {getStatusLabel(p.status)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: spacing.lg, marginTop: spacing.md, fontSize: 13, color: colors.textLight }}>
              <span>{p.blockers} blocker{p.blockers !== 1 ? 's' : ''}</span>
              <span>{p.waiting} waiting on you</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Re-entry Summary Screen
  const renderReentry = () => {
    const details = projectDetails[selectedProject];
    const project = projects.find((p) => p.id === selectedProject);
    return (
      <div style={{ padding: spacing.lg }}>
        <h1 style={{ ...baseText, fontSize: 28, fontWeight: 600, marginBottom: spacing.lg }}>{project.name}</h1>

        {/* Last Decision */}
        <div
          style={{
            backgroundColor: colors.accentLight,
            border: `1px solid ${colors.accent}`,
            borderRadius: 8,
            padding: spacing.md,
            marginBottom: spacing.lg,
          }}
        >
          <h3 style={{ ...baseText, fontSize: 13, fontWeight: 600, color: colors.accent, marginBottom: spacing.sm }}>
            LAST DECISION
          </h3>
          <p style={{ ...baseText, fontSize: 14, lineHeight: '1.5' }}>{details.lastDecision}</p>
          <button
            onClick={() => setCurrentScreen('decisions')}
            style={{
              marginTop: spacing.sm,
              backgroundColor: 'transparent',
              border: `1px solid ${colors.accent}`,
              color: colors.accent,
              padding: `${spacing.xs}px ${spacing.sm}px`,
              borderRadius: 4,
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            View Decision Log
          </button>
        </div>

        {/* Blockers */}
        {details.blockers.length > 0 && (
          <div style={{ marginBottom: spacing.lg }}>
            <h2 style={{ ...baseText, fontSize: 16, fontWeight: 600, marginBottom: spacing.md }}>Blockers ({details.blockers.length})</h2>
            {details.blockers.map((b) => (
              <div
                key={b.id}
                onClick={() => {
                  setCurrentScreen('blocker');
                }}
                style={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.warning}`,
                  borderLeft: `3px solid ${colors.warning}`,
                  borderRadius: 6,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                  cursor: 'pointer',
                }}
              >
                <p style={{ ...baseText, fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{b.title}</p>
                <p style={{ ...baseText, fontSize: 12, color: colors.textLight }}>
                  {b.owner} • Stuck for {b.since}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Waiting On */}
        {details.waiting.length > 0 && (
          <div style={{ marginBottom: spacing.lg }}>
            <h2 style={{ ...baseText, fontSize: 16, fontWeight: 600, marginBottom: spacing.md }}>Waiting on You ({details.waiting.length})</h2>
            {details.waiting.map((w) => (
              <div
                key={w.id}
                onClick={() => setCurrentScreen('waiting')}
                style={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 6,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                  cursor: 'pointer',
                }}
              >
                <p style={{ ...baseText, fontSize: 14, marginBottom: 4 }}>{w.message}</p>
                <p style={{ ...baseText, fontSize: 12, color: colors.textLight }}>Since {w.since}</p>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setCurrentScreen('switcher')}
          style={{
            backgroundColor: colors.accent,
            color: '#fff',
            border: 'none',
            padding: `${spacing.sm}px ${spacing.md}px`,
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Mark Caught Up & Back to Projects
        </button>
      </div>
    );
  };

  // Decision Log Screen
  const renderDecisions = () => (
    <div style={{ padding: spacing.lg }}>
      <h1 style={{ ...baseText, fontSize: 28, fontWeight: 600, marginBottom: spacing.lg }}>Decision Log</h1>
      {[
        { date: 'Jan 15', decision: 'Approved iOS-first component library approach', owner: 'You' },
        { date: 'Jan 10', decision: 'Database migration scheduled for Feb 2', owner: 'Marcus Lee' },
        { date: 'Jan 8', decision: 'Decided on Postgres for analytics backend', owner: 'You' },
        { date: 'Jan 5', decision: 'Postponed auth upgrade due to resource constraints', owner: 'You' },
      ].map((item, idx) => (
        <div key={idx} style={{ borderLeft: `2px solid ${colors.accent}`, paddingLeft: spacing.md, marginBottom: spacing.lg }}>
          <p style={{ ...baseText, fontSize: 13, fontWeight: 600, color: colors.textLight, marginBottom: 4 }}>{item.date}</p>
          <p style={{ ...baseText, fontSize: 14 }}>{item.decision}</p>
          <p style={{ ...baseText, fontSize: 12, color: colors.textLight, marginTop: 4 }}>by {item.owner}</p>
        </div>
      ))}
      <button
        onClick={() => setCurrentScreen('reentry')}
        style={{
          backgroundColor: 'transparent',
          color: colors.accent,
          border: `1px solid ${colors.accent}`,
          padding: `${spacing.sm}px ${spacing.md}px`,
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Back
      </button>
    </div>
  );

  // Blocker Detail Screen
  const renderBlocker = () => (
    <div style={{ padding: spacing.lg }}>
      <h1 style={{ ...baseText, fontSize: 28, fontWeight: 600, marginBottom: spacing.lg }}>Blocker Details</h1>
      <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 8, padding: spacing.md, marginBottom: spacing.lg }}>
        <p style={{ ...baseText, fontSize: 13, fontWeight: 600, color: colors.textLight, marginBottom: 8 }}>BLOCKER</p>
        <h2 style={{ ...baseText, fontSize: 18, fontWeight: 600, marginBottom: spacing.md }}>Design review pending on nav patterns</h2>
        <div style={{ display: 'grid', gap: spacing.md }}>
          <div>
            <p style={{ ...baseText, fontSize: 12, fontWeight: 600, color: colors.textLight, marginBottom: 4 }}>OWNER</p>
            <p style={{ ...baseText, fontSize: 14 }}>Sarah Chen</p>
          </div>
          <div>
            <p style={{ ...baseText, fontSize: 12, fontWeight: 600, color: colors.textLight, marginBottom: 4 }}>STUCK SINCE</p>
            <p style={{ ...baseText, fontSize: 14 }}>2 days</p>
          </div>
          <div>
            <p style={{ ...baseText, fontSize: 12, fontWeight: 600, color: colors.textLight, marginBottom: 4 }}>IMPACT</p>
            <p style={{ ...baseText, fontSize: 14 }}>Mobile App Redesign timeline at risk if not resolved by Jan 22</p>
          </div>
        </div>
      </div>
      <button
        style={{
          backgroundColor: colors.accent,
          color: '#fff',
          border: 'none',
          padding: `${spacing.sm}px ${spacing.md}px`,
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 500,
          cursor: 'pointer',
          marginRight: spacing.md,
        }}
      >
        Unblock This
      </button>
      <button
        onClick={() => setCurrentScreen('reentry')}
        style={{
          backgroundColor: 'transparent',
          color: colors.accent,
          border: `1px solid ${colors.accent}`,
          padding: `${spacing.sm}px ${spacing.md}px`,
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Back
      </button>
    </div>
  );

  // Waiting-On Queue Screen
  const renderWaiting = () => (
    <div style={{ padding: spacing.lg }}>
      <h1 style={{ ...baseText, fontSize: 28, fontWeight: 600, marginBottom: spacing.lg }}>All Waiting on You</h1>
      {[
        { project: 'API Migration', message: 'Alex waiting on migration timeline confirmation', since: '5h' },
        { project: 'Dashboard Analytics', message: 'Design team waiting on chart spec approval', since: '1d' },
        { project: 'Dashboard Analytics', message: 'QA waiting on staging data', since: '2d' },
      ].map((item, idx) => (
        <div key={idx} style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 8, padding: spacing.md, marginBottom: spacing.md }}>
          <p style={{ ...baseText, fontSize: 12, fontWeight: 600, color: colors.textLight, marginBottom: 4 }}>{item.project}</p>
          <p style={{ ...baseText, fontSize: 14, marginBottom: 8 }}>{item.message}</p>
          <p style={{ ...baseText, fontSize: 12, color: colors.textLight, marginBottom: spacing.sm }}>Waiting since {item.since}</p>
          <button style={{ backgroundColor: colors.accent, color: '#fff', border: 'none', padding: `4px 12px`, borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>Reply</button>
        </div>
      ))}
      <button
        onClick={() => setCurrentScreen('reentry')}
        style={{
          backgroundColor: 'transparent',
          color: colors.accent,
          border: `1px solid ${colors.accent}`,
          padding: `${spacing.sm}px ${spacing.md}px`,
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Back
      </button>
    </div>
  );

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: '100vh', fontFamily: "'system-ui', sans-serif" }}>
      {currentScreen === 'switcher' && renderSwitcher()}
      {currentScreen === 'reentry' && renderReentry()}
      {currentScreen === 'decisions' && renderDecisions()}
      {currentScreen === 'blocker' && renderBlocker()}
      {currentScreen === 'waiting' && renderWaiting()}
    </div>
  );
};

export default App;
