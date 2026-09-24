import React, { useState } from 'react';

const App = () => {
  // Shared styles
  const colors = {
    primary: '#0066cc',
    secondary: '#f5f5f5',
    text: '#1a1a1a',
    border: '#e0e0e0',
    success: '#28a745',
  };

  const spacing = {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  };

  const baseButtonStyle = {
    padding: `${spacing.sm} ${spacing.md}`,
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  };

  // State management
  const [screen, setScreen] = useState('input');
  const [rawBullets, setRawBullets] = useState('');
  const [projectName, setProjectName] = useState('Q4 Platform Roadmap');
  const [audience, setAudience] = useState('executive');
  const [urgency, setUrgency] = useState('normal');

  const [execSummary, setExecSummary] = useState(
    'Successfully launched analytics dashboard v2.1 with improved query performance (40% faster). Completed API documentation overhaul and onboarded 3 new enterprise clients. Q4 roadmap on track; security audit scheduled for Dec 15.'
  );

  const [teamUpdate, setTeamUpdate] = useState(
    '• Analytics Dashboard: Shipped v2.1 with PostgreSQL query optimization, reducing avg load time from 2.3s to 1.4s. Testing complete across staging.\n• Documentation: API docs fully rewritten using OpenAPI 3.1; 12 missing endpoints documented.\n• Client Onboarding: Acme Corp, TechStart Inc, and Global Logistics signed contracts. Implementation kickoffs scheduled.\n• Q4 Milestones: On schedule. Security audit with external firm booked for Dec 15-17. Mobile app beta expected Dec 8.\n• Blockers: Awaiting approval on data retention policy from legal (needed by Dec 1).'
  );

  const [history] = useState([
    { date: 'Dec 1', project: 'Backend Refactor', summary: 'Database migration 85% complete...' },
    { date: 'Nov 28', project: 'Mobile v1.2', summary: 'iOS build passed App Store review...' },
    { date: 'Nov 25', project: 'Q4 Platform Roadmap', summary: 'Successfully launched analytics dashboard...' },
  ]);

  // Helper to generate placeholder output
  const generateOutput = () => {
    if (!rawBullets.trim()) {
      setExecSummary('Please enter bullet points to generate output.');
      setTeamUpdate('Please enter bullet points to generate output.');
      return;
    }
    const lines = rawBullets.split('\n').filter(l => l.trim()).slice(0, 3);
    const bulletList = lines.map(l => `• ${l.replace(/^[-•]\s*/, '')}`).join('\n');
    setExecSummary(`${projectName} update: ${lines[0]?.replace(/^[-•]\s*/, '') || 'Progress update'}. Milestones tracking on schedule.`);
    setTeamUpdate(bulletList + '\n\n• Next steps: Continue development and monitor for blockers.');
    setScreen('output');
  };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: colors.text }}>
      {/* Header */}
      <div style={{ backgroundColor: '#fff', borderBottom: `1px solid ${colors.border}`, padding: spacing.md }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Brieflio</h1>
          <div style={{ display: 'flex', gap: spacing.md, fontSize: '13px' }}>
            {['input', 'output', 'edit', 'export', 'history'].map(s => (
              <button
                key={s}
                onClick={() => setScreen(s)}
                style={{
                  background: screen === s ? colors.primary : 'transparent',
                  color: screen === s ? '#fff' : colors.text,
                  padding: `${spacing.xs} ${spacing.sm}`,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: screen === s ? '600' : '400',
                }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: spacing.lg }}>
        {screen === 'input' && (
          <div>
            <h2 style={{ marginTop: 0 }}>New Status Update</h2>
            <div style={{ marginBottom: spacing.lg }}>
              <label style={{ display: 'block', marginBottom: spacing.sm, fontWeight: '500', fontSize: '14px' }}>
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                style={{
                  width: '100%',
                  padding: spacing.sm,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: spacing.lg }}>
              <label style={{ display: 'block', marginBottom: spacing.sm, fontWeight: '500', fontSize: '14px' }}>
                Paste or type your status bullets
              </label>
              <textarea
                value={rawBullets}
                onChange={e => setRawBullets(e.target.value)}
                placeholder="- Completed Q4 analytics dashboard launch&#10;- Security audit approved&#10;- 3 new enterprise clients onboarded"
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: spacing.md,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: spacing.md, marginBottom: spacing.lg }}>
              <div>
                <label style={{ display: 'block', marginBottom: spacing.sm, fontWeight: '500', fontSize: '14px' }}>
                  Audience
                </label>
                <select
                  value={audience}
                  onChange={e => setAudience(e.target.value)}
                  style={{
                    width: '100%',
                    padding: spacing.sm,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                >
                  <option>executive</option>
                  <option>team</option>
                  <option>stakeholder</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: spacing.sm, fontWeight: '500', fontSize: '14px' }}>
                  Urgency
                </label>
                <select
                  value={urgency}
                  onChange={e => setUrgency(e.target.value)}
                  style={{
                    width: '100%',
                    padding: spacing.sm,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                >
                  <option>normal</option>
                  <option>high</option>
                  <option>critical</option>
                </select>
              </div>
            </div>

            <button
              onClick={generateOutput}
              style={{
                ...baseButtonStyle,
                backgroundColor: colors.primary,
                color: '#fff',
                width: '100%',
                padding: spacing.md,
              }}
            >
              Generate Versions
            </button>
          </div>
        )}

        {screen === 'output' && (
          <div>
            <h2 style={{ marginTop: 0 }}>Dual Output</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.lg }}>
              <div style={{ border: `1px solid ${colors.border}`, borderRadius: '8px', padding: spacing.md, backgroundColor: colors.secondary }}>
                <h3 style={{ marginTop: 0, fontSize: '16px', fontWeight: '600' }}>Executive Summary</h3>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6' }}>{execSummary}</p>
                <button
                  onClick={() => setScreen('edit')}
                  style={{
                    ...baseButtonStyle,
                    backgroundColor: colors.primary,
                    color: '#fff',
                    marginTop: spacing.md,
                    width: '100%',
                  }}
                >
                  Edit
                </button>
              </div>
              <div style={{ border: `1px solid ${colors.border}`, borderRadius: '8px', padding: spacing.md, backgroundColor: colors.secondary }}>
                <h3 style={{ marginTop: 0, fontSize: '16px', fontWeight: '600' }}>Team Update</h3>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{teamUpdate}</p>
                <button
                  onClick={() => setScreen('edit')}
                  style={{
                    ...baseButtonStyle,
                    backgroundColor: colors.primary,
                    color: '#fff',
                    marginTop: spacing.md,
                    width: '100%',
                  }}
                >
                  Edit
                </button>
              </div>
            </div>
            <button
              onClick={() => setScreen('export')}
              style={{
                ...baseButtonStyle,
                backgroundColor: colors.success,
                color: '#fff',
                width: '100%',
                marginTop: spacing.lg,
                padding: spacing.md,
              }}
            >
              Continue to Export
            </button>
          </div>
        )}

        {screen === 'edit' && (
          <div>
            <h2 style={{ marginTop: 0 }}>Edit & Refine</h2>
            <div style={{ marginBottom: spacing.lg }}>
              <label style={{ display: 'block', marginBottom: spacing.sm, fontWeight: '500', fontSize: '14px' }}>
                Executive Summary
              </label>
              <textarea
                value={execSummary}
                onChange={e => setExecSummary(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: spacing.md,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: spacing.lg }}>
              <label style={{ display: 'block', marginBottom: spacing.sm, fontWeight: '500', fontSize: '14px' }}>
                Team Update
              </label>
              <textarea
                value={teamUpdate}
                onChange={e => setTeamUpdate(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '180px',
                  padding: spacing.md,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              onClick={() => setScreen('export')}
              style={{
                ...baseButtonStyle,
                backgroundColor: colors.success,
                color: '#fff',
                width: '100%',
                padding: spacing.md,
              }}
            >
              Ready to Export
            </button>
          </div>
        )}

        {screen === 'export' && (
          <div>
            <h2 style={{ marginTop: 0 }}>Export & Share</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: spacing.md, marginBottom: spacing.lg }}>
              {[
                { label: 'Copy to Clipboard', action: () => navigator.clipboard.writeText(execSummary + '\n\n' + teamUpdate) },
                { label: 'Download as Text', action: () => {} },
                { label: 'Email', action: () => {} },
                { label: 'Slack', action: () => {} },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={item.action}
                  style={{
                    ...baseButtonStyle,
                    backgroundColor: colors.primary,
                    color: '#fff',
                    padding: spacing.md,
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div style={{ backgroundColor: colors.secondary, padding: spacing.md, borderRadius: '6px', marginBottom: spacing.lg }}>
              <h3 style={{ marginTop: 0, fontSize: '14px', fontWeight: '600' }}>Preview</h3>
              <p style={{ fontSize: '13px', margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                <strong>Executive Summary:</strong> {execSummary}
                {'\n\n'}
                <strong>Team Update:</strong> {teamUpdate}
              </p>
            </div>

            <button
              onClick={() => setScreen('input')}
              style={{
                ...baseButtonStyle,
                backgroundColor: '#666',
                color: '#fff',
                width: '100%',
                padding: spacing.md,
              }}
            >
              Create New Update
            </button>
          </div>
        )}

        {screen === 'history' && (
          <div>
            <h2 style={{ marginTop: 0 }}>History</h2>
            <div style={{ backgroundColor: colors.secondary, borderRadius: '8px', overflow: 'hidden' }}>
              {history.map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: spacing.md,
                    borderBottom: i < history.length - 1 ? `1px solid ${colors.border}` : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{item.project}</div>
                    <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{item.summary}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>{item.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
