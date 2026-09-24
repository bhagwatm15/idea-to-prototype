import React, { useState } from 'react';

const App = () => {
  const [screen, setScreen] = useState('switcher');
  const [selectedProject, setSelectedProject] = useState(null);
  const [caughtUpProjects, setCaughtUpProjects] = useState(new Set());

  // Shared styles
  const colors = {
    primary: '#2C3E50',
    secondary: '#34495E',
    accent: '#3498DB',
    success: '#27AE60',
    warning: '#E67E22',
    danger: '#E74C3C',
    background: '#ECF0F1',
    border: '#BDC3C7',
    text: '#2C3E50',
    lightText: '#7F8C8D',
  };

  const spacing = {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  };

  const sharedButtonStyle = {
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  };

  // Sample data
  const projects = [
    {
      id: 1,
      name: 'Mobile App Redesign',
      status: 'at-risk',
      blockers: 2,
      waiting: 1,
      lastActivity: '2 hours ago',
    },
    {
      id: 2,
      name: 'API Migration',
      status: 'on-track',
      blockers: 0,
      waiting: 3,
      lastActivity: '30 min ago',
    },
    {
      id: 3,
      name: 'Analytics Dashboard',
      status: 'at-risk',
      blockers: 1,
      waiting: 0,
      lastActivity: '4 hours ago',
    },
    {
      id: 4,
      name: 'Payment Integration',
      status: 'on-track',
      blockers: 0,
      waiting: 0,
      lastActivity: '1 day ago',
    },
  ];

  const decisions = [
    {
      id: 1,
      date: '2024-01-15 2:30 PM',
      title: 'Approved new color palette for redesign',
      maker: 'You',
      impact: 'Unblocked design handoff',
    },
    {
      id: 2,
      date: '2024-01-14 10:15 AM',
      title: 'Postponed backend optimization to Phase 2',
      maker: 'You',
      impact: 'Adjusted timeline',
    },
    {
      id: 3,
      date: '2024-01-13 4:45 PM',
      title: 'Selected Postgres for primary database',
      maker: 'Tech Lead Sarah',
      impact: 'Unblocked infrastructure setup',
    },
  ];

  const blockers = [
    {
      id: 1,
      title: 'Waiting on design system components from Design',
      owner: 'Marcus (Design Lead)',
      duration: '3 days',
      impact: '4 engineers blocked',
      nextAction: 'Follow up with Marcus on timeline',
    },
    {
      id: 2,
      title: 'API rate limits causing test failures',
      owner: 'Platform Team',
      duration: '1 day',
      impact: 'Testing pipeline unstable',
      nextAction: 'Request sandbox environment',
    },
  ];

  const waitingOn = [
    {
      id: 1,
      project: 'Mobile App Redesign',
      request: 'Review design mockups - 5 screens',
      from: 'Design Lead Marcus',
      date: '2 hours ago',
    },
    {
      id: 2,
      project: 'API Migration',
      request: 'Approve database schema changes',
      from: 'Tech Lead Sarah',
      date: '1 hour ago',
    },
    {
      id: 3,
      project: 'API Migration',
      request: 'Sign off on deployment plan',
      from: 'DevOps Alex',
      date: '30 min ago',
    },
  ];

  const getStatusColor = (status) => {
    return status === 'on-track' ? colors.success : colors.warning;
  };

  const getStatusLabel = (status) => {
    return status === 'on-track' ? '●' : '⚠';
  };

  // Screen: Project Switcher
  if (screen === 'switcher') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: colors.background, fontFamily: 'system-ui' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: spacing.xl }}>
          <h1 style={{ color: colors.primary, fontSize: '28px', marginBottom: spacing.lg, fontWeight: '600' }}>
            Resume
          </h1>
          <p style={{ color: colors.lightText, fontSize: '14px', marginBottom: spacing.xl }}>
            Your active projects at a glance. Select one to catch up.
          </p>

          {projects.map((project) => (
            <div
              key={project.id}
              style={{
                backgroundColor: '#FFFFFF',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                padding: spacing.md,
                marginBottom: spacing.md,
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
              }}
              onClick={() => {
                setSelectedProject(project);
                setScreen('summary');
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
                    <span style={{ fontSize: '16px', color: getStatusColor(project.status) }}>
                      {getStatusLabel(project.status)}
                    </span>
                    <h3 style={{ color: colors.primary, fontSize: '16px', margin: 0, fontWeight: '500' }}>
                      {project.name}
                    </h3>
                  </div>
                  <p style={{ color: colors.lightText, fontSize: '13px', margin: `${spacing.xs} 0`, marginLeft: '20px' }}>
                    {project.blockers > 0 && `${project.blockers} blocker${project.blockers > 1 ? 's' : ''} • `}
                    {project.waiting} waiting on you • Last activity {project.lastActivity}
                  </p>
                </div>
                <button
                  style={{
                    ...sharedButtonStyle,
                    backgroundColor: colors.accent,
                    color: '#FFFFFF',
                  }}
                >
                  Open
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Screen: Re-entry Summary
  if (screen === 'summary') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: colors.background, fontFamily: 'system-ui' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: spacing.xl }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
            <h1 style={{ color: colors.primary, fontSize: '24px', margin: 0, fontWeight: '600' }}>
              {selectedProject?.name}
            </h1>
            <button
              onClick={() => setScreen('switcher')}
              style={{
                ...sharedButtonStyle,
                backgroundColor: colors.background,
                color: colors.primary,
                border: `1px solid ${colors.border}`,
              }}
            >
              ← Back
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: spacing.md, marginBottom: spacing.lg, borderBottom: `2px solid ${colors.border}` }}>
            {['summary', 'decisions', 'blockers', 'waiting'].map((tab) => (
              <button
                key={tab}
                onClick={() => setScreen(tab === 'summary' ? 'summary' : tab)}
                style={{
                  ...sharedButtonStyle,
                  backgroundColor: 'transparent',
                  color: screen === (tab === 'summary' ? 'summary' : tab) ? colors.primary : colors.lightText,
                  borderBottom: screen === (tab === 'summary' ? 'summary' : tab) ? `2px solid ${colors.accent}` : 'none',
                  paddingBottom: spacing.sm,
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Last Decision */}
          <div style={{ backgroundColor: '#FFFFFF', border: `1px solid ${colors.border}`, borderRadius: '6px', padding: spacing.md, marginBottom: spacing.lg }}>
            <h3 style={{ color: colors.primary, fontSize: '14px', margin: `0 0 ${spacing.sm} 0`, fontWeight: '600', textTransform: 'uppercase' }}>
              Last Decision
            </h3>
            <p style={{ color: colors.primary, fontSize: '15px', margin: `0 0 ${spacing.xs} 0`, fontWeight: '500' }}>
              {decisions[0].title}
            </p>
            <p style={{ color: colors.lightText, fontSize: '13px', margin: 0 }}>
              {decisions[0].date} • {decisions[0].maker} • {decisions[0].impact}
            </p>
          </div>

          {/* Active Blockers */}
          <div style={{ backgroundColor: '#FFFFFF', border: `1px solid ${colors.border}`, borderRadius: '6px', padding: spacing.md, marginBottom: spacing.lg }}>
            <h3 style={{ color: colors.primary, fontSize: '14px', margin: `0 0 ${spacing.md} 0`, fontWeight: '600', textTransform: 'uppercase' }}>
              Active Blockers ({blockers.length})
            </h3>
            {blockers.map((blocker) => (
              <div
                key={blocker.id}
                style={{ paddingBottom: spacing.md, marginBottom: spacing.md, borderBottom: `1px solid ${colors.border}`, cursor: 'pointer' }}
                onClick={() => setScreen('blocker')}
              >
                <p style={{ color: colors.primary, fontSize: '14px', margin: `0 0 ${spacing.xs} 0`, fontWeight: '500' }}>
                  {blocker.title}
                </p>
                <p style={{ color: colors.lightText, fontSize: '13px', margin: `0 0 ${spacing.xs} 0` }}>
                  {blocker.owner} • Open {blocker.duration} • {blocker.impact}
                </p>
              </div>
            ))}
          </div>

          {/* Who's Waiting */}
          <div style={{ backgroundColor: '#FFFFFF', border: `1px solid ${colors.border}`, borderRadius: '6px', padding: spacing.md }}>
            <h3 style={{ color: colors.primary, fontSize: '14px', margin: `0 0 ${spacing.md} 0`, fontWeight: '600', textTransform: 'uppercase' }}>
              Waiting on You ({selectedProject?.waiting})
            </h3>
            {waitingOn
              .filter((item) => item.project === selectedProject?.name)
              .map((item) => (
                <div key={item.id} style={{ paddingBottom: spacing.md, marginBottom: spacing.md, borderBottom: `1px solid ${colors.border}`, cursor: 'pointer' }} onClick={() => setScreen('waiting')}>
                  <p style={{ color: colors.primary, fontSize: '14px', margin: `0 0 ${spacing.xs} 0`, fontWeight: '500' }}>
                    {item.request}
                  </p>
                  <p style={{ color: colors.lightText, fontSize: '13px', margin: 0 }}>
                    {item.from} • {item.date}
                  </p>
                </div>
              ))}
          </div>

          <button
            onClick={() => {
              setCaughtUpProjects((prev) => new Set(prev).add(selectedProject.id));
              setScreen('switcher');
            }}
            style={{
              ...sharedButtonStyle,
              backgroundColor: colors.success,
              color: '#FFFFFF',
              marginTop: spacing.lg,
              width: '100%',
            }}
          >
            Mark as Caught Up
          </button>
        </div>
      </div>
    );
  }

  // Screen: Decision Log
  if (screen === 'decisions') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: colors.background, fontFamily: 'system-ui' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: spacing.xl }}>
          <button
            onClick={() => setScreen('summary')}
            style={{
              ...sharedButtonStyle,
              backgroundColor: colors.background,
              color: colors.primary,
              border: `1px solid ${colors.border}`,
              marginBottom: spacing.lg,
            }}
          >
            ← Back to Summary
          </button>
          <h2 style={{ color: colors.primary, fontSize: '24px', marginBottom: spacing.lg, fontWeight: '600' }}>
            Decision Log
          </h2>
          {decisions.map((decision) => (
            <div
              key={decision.id}
              style={{ backgroundColor: '#FFFFFF', border: `1px solid ${colors.border}`, borderRadius: '6px', padding: spacing.md, marginBottom: spacing.md }}
            >
              <p style={{ color: colors.lightText, fontSize: '12px', margin: `0 0 ${spacing.xs} 0` }}>
                {decision.date}
              </p>
              <h4 style={{ color: colors.primary, fontSize: '15px', margin: `0 0 ${spacing.xs} 0`, fontWeight: '600' }}>
                {decision.title}
              </h4>
              <p style={{ color: colors.lightText, fontSize: '13px', margin: 0 }}>
                {decision.maker} • {decision.impact}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Screen: Blocker Detail
  if (screen === 'blocker') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: colors.background, fontFamily: 'system-ui' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: spacing.xl }}>
          <button
            onClick={() => setScreen('summary')}
            style={{
              ...sharedButtonStyle,
              backgroundColor: colors.background,
              color: colors.primary,
              border: `1px solid ${colors.border}`,
              marginBottom: spacing.lg,
            }}
          >
            ← Back to Summary
          </button>
          <h2 style={{ color: colors.primary, fontSize: '24px', marginBottom: spacing.lg, fontWeight: '600' }}>
            Blocker Details
          </h2>
          {blockers.map((blocker) => (
            <div key={blocker.id} style={{ backgroundColor: '#FFFFFF', border: `2px solid ${colors.warning}`, borderRadius: '6px', padding: spacing.lg }}>
              <h3 style={{ color: colors.primary, fontSize: '16px', margin: `0 0 ${spacing.md} 0`, fontWeight: '600' }}>
                {blocker.title}
              </h3>
              <div style={{ marginBottom: spacing.md }}>
                <p style={{ color: colors.lightText, fontSize: '12px', margin: `0 0 ${spacing.xs} 0`, textTransform: 'uppercase', fontWeight: '600' }}>
                  Owner
                </p>
                <p style={{ color: colors.primary, fontSize: '14px', margin: 0 }}>{blocker.owner}</p>
              </div>
              <div style={{ marginBottom: spacing.md }}>
                <p style={{ color: colors.lightText, fontSize: '12px', margin: `0 0 ${spacing.xs} 0`, textTransform: 'uppercase', fontWeight: '600' }}>
                  Duration
                </p>
                <p style={{ color: colors.primary, fontSize: '14px', margin: 0 }}>{blocker.duration}</p>
              </div>
              <div style={{ marginBottom: spacing.md }}>
                <p style={{ color: colors.lightText, fontSize: '12px', margin: `0 0 ${spacing.xs} 0`, textTransform: 'uppercase', fontWeight: '600' }}>
                  Impact
                </p>
                <p style={{ color: colors.primary, fontSize: '14px', margin: 0 }}>{blocker.impact}</p>
              </div>
              <div style={{ marginBottom: spacing.lg }}>
                <p style={{ color: colors.lightText, fontSize: '12px', margin: `0 0 ${spacing.xs} 0`, textTransform: 'uppercase', fontWeight: '600' }}>
                  Next Action
                </p>
                <p style={{ color: colors.primary, fontSize: '14px', margin: 0 }}>{blocker.nextAction}</p>
              </div>
              <button
                style={{
                  ...sharedButtonStyle,
                  backgroundColor: colors.accent,
                  color: '#FFFFFF',
                }}
              >
                Take Action
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Screen: Waiting-On Queue
  if (screen === 'waiting') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: colors.background, fontFamily: 'system-ui' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: spacing.xl }}>
          <button
            onClick={() => setScreen('summary')}
            style={{
              ...sharedButtonStyle,
              backgroundColor: colors.background,
              color: colors.primary,
              border: `1px solid ${colors.border}`,
              marginBottom: spacing.lg,
            }}
          >
            ← Back to Summary
          </button>
          <h2 style={{ color: colors.primary, fontSize: '24px', marginBottom: spacing.lg, fontWeight: '600' }}>
            Waiting on You ({waitingOn.length})
          </h2>
          {waitingOn.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: '#FFFFFF',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                padding: spacing.md,
                marginBottom: spacing.md,
              }}
            >
              <p style={{ color: colors.accent, fontSize: '12px', margin: `0 0 ${spacing.xs} 0`, fontWeight: '600' }}>
                {item.project}
              </p>
              <h4 style={{ color: colors.primary, fontSize: '15px', margin: `0 0 ${spacing.xs} 0`, fontWeight: '600' }}>
                {item.request}
              </h4>
              <p style={{ color: colors.lightText, fontSize: '13px', margin: 0 }}>
                {item.from} • {item.date}
              </p>
              <button
                style={{
                  ...sharedButtonStyle,
                  backgroundColor: colors.accent,
                  color: '#FFFFFF',
                  marginTop: spacing.md,
                }}
              >
                Reply
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
};

export default App;
