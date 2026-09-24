import React, { useState } from 'react';

const App = () => {
  const [screen, setScreen] = useState('input');
  const [rawBullets, setRawBullets] = useState('');
  const [projectName, setProjectName] = useState('');
  const [audience, setAudience] = useState('team');
  const [urgency, setUrgency] = useState('normal');
  const [execSummary, setExecSummary] = useState('');
  const [teamUpdate, setTeamUpdate] = useState('');
  const [history, setHistory] = useState([
    { id: 1, project: 'Q4 Marketing', date: '2025-01-15', preview: 'Campaign launch delayed by 2 weeks...' },
    { id: 2, project: 'API Redesign', date: '2025-01-12', preview: 'V2 endpoints 85% complete, testing phase...' },
    { id: 3, project: 'Mobile App', date: '2025-01-10', preview: 'iOS build approved, Android review pending...' },
  ]);

  const colors = {
    primary: '#0066cc',
    text: '#1a1a1a',
    lightText: '#666',
    border: '#ddd',
    bg: '#f9f9f9',
    white: '#fff',
  };

  const spacing = { xs: 8, sm: 12, md: 16, lg: 24, xl: 32 };

  const headerStyle = { fontSize: 28, fontWeight: 600, color: colors.text, marginBottom: spacing.lg };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: colors.lightText, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: '0.5px' };
  const inputStyle = { width: '100%', padding: spacing.sm, border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, fontFamily: 'system-ui', boxSizing: 'border-box' };
  const buttonStyle = { padding: `${spacing.sm}px ${spacing.md}px`, backgroundColor: colors.primary, color: colors.white, border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer' };
  const secondaryButtonStyle = { ...buttonStyle, backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` };

  const handleGenerate = () => {
    if (!rawBullets.trim()) return;
    const exec = `Executive Summary\n${projectName || 'Project'}\n\nKey Updates:\n• 85% progress on primary deliverable\n• Timeline on track for February release\n• Risk: Dependency on external vendor resolved`;
    const team = `Team Update – ${projectName || 'Project'}\n\nCompleted:\n• Backend API endpoints finalized\n• Database optimization completed\n\nIn Progress:\n• Frontend integration (ETA: 2 weeks)\n• Performance testing suite\n\nBlocked/At Risk:\n• Third-party vendor delay (now resolved)\n\nNext Steps:\n• Stakeholder review scheduled for next Tuesday`;
    setExecSummary(exec);
    setTeamUpdate(team);
    setScreen('output');
  };

  const handleExport = (version) => {
    const text = version === 'exec' ? execSummary : teamUpdate;
    navigator.clipboard.writeText(text);
    alert(`${version === 'exec' ? 'Executive Summary' : 'Team Update'} copied to clipboard!`);
  };

  const handleSaveHistory = () => {
    const newEntry = {
      id: Math.max(...history.map(h => h.id), 0) + 1,
      project: projectName || 'Untitled',
      date: new Date().toISOString().split('T')[0],
      preview: rawBullets.split('\n')[0].slice(0, 50) + '...',
      execSummary,
      teamUpdate,
    };
    setHistory([newEntry, ...history]);
    alert('Status update saved to history!');
  };

  const navTabs = ['input', 'output', 'history'];
  const navLabels = { input: 'Compose', output: 'Review', history: 'History' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.white, fontFamily: 'system-ui, -apple-system, sans-serif', color: colors.text }}>
      {/* Navigation */}
      <div style={{ borderBottom: `1px solid ${colors.border}`, display: 'flex', gap: spacing.lg, padding: `${spacing.md}px ${spacing.xl}px` }}>
        {navTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setScreen(tab)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 14,
              fontWeight: screen === tab ? 600 : 400,
              color: screen === tab ? colors.primary : colors.lightText,
              cursor: 'pointer',
              paddingBottom: spacing.xs,
              borderBottom: screen === tab ? `2px solid ${colors.primary}` : 'none',
            }}
          >
            {navLabels[tab]}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: spacing.xl }}>
        {/* Input Screen */}
        {screen === 'input' && (
          <div>
            <h1 style={headerStyle}>Compose Status Update</h1>
            <div style={{ marginBottom: spacing.lg }}>
              <label style={labelStyle}>Project Name</label>
              <input
                type="text"
                placeholder="e.g., Q1 Product Launch"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: spacing.lg }}>
              <label style={labelStyle}>Raw Status Bullets</label>
              <textarea
                placeholder="Paste or type your raw status updates here..."
                value={rawBullets}
                onChange={(e) => setRawBullets(e.target.value)}
                style={{ ...inputStyle, minHeight: 200, fontFamily: 'monospace', fontSize: 13, resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md, marginBottom: spacing.lg }}>
              <div>
                <label style={labelStyle}>Audience</label>
                <select value={audience} onChange={(e) => setAudience(e.target.value)} style={inputStyle}>
                  <option value="exec">Executive Leadership</option>
                  <option value="team">Team/Department</option>
                  <option value="stakeholder">Stakeholder</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Urgency</label>
                <select value={urgency} onChange={(e) => setUrgency(e.target.value)} style={inputStyle}>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <button onClick={handleGenerate} style={{ ...buttonStyle, width: '100%' }}>
              Generate Versions
            </button>
          </div>
        )}

        {/* Output Screen */}
        {screen === 'output' && (
          <div>
            <h1 style={headerStyle}>Review & Refine</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.lg, marginBottom: spacing.lg }}>
              <div style={{ padding: spacing.md, backgroundColor: colors.bg, borderRadius: 8, border: `1px solid ${colors.border}` }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: spacing.md }}>Executive Summary</h2>
                <textarea
                  value={execSummary}
                  onChange={(e) => setExecSummary(e.target.value)}
                  style={{ ...inputStyle, minHeight: 200, fontFamily: 'monospace', fontSize: 13, marginBottom: spacing.md }}
                />
                <button onClick={() => handleExport('exec')} style={{ ...secondaryButtonStyle, width: '100%' }}>
                  Copy to Clipboard
                </button>
              </div>
              <div style={{ padding: spacing.md, backgroundColor: colors.bg, borderRadius: 8, border: `1px solid ${colors.border}` }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: spacing.md }}>Team Update</h2>
                <textarea
                  value={teamUpdate}
                  onChange={(e) => setTeamUpdate(e.target.value)}
                  style={{ ...inputStyle, minHeight: 200, fontFamily: 'monospace', fontSize: 13, marginBottom: spacing.md }}
                />
                <button onClick={() => handleExport('team')} style={{ ...secondaryButtonStyle, width: '100%' }}>
                  Copy to Clipboard
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: spacing.md }}>
              <button onClick={handleSaveHistory} style={{ ...buttonStyle, flex: 1 }}>
                Save to History
              </button>
              <button onClick={() => setScreen('input')} style={{ ...secondaryButtonStyle, flex: 1 }}>
                Back to Compose
              </button>
            </div>
          </div>
        )}

        {/* History Screen */}
        {screen === 'history' && (
          <div>
            <h1 style={headerStyle}>Status Update History</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setProjectName(item.project);
                    setRawBullets(item.preview);
                    if (item.execSummary) {
                      setExecSummary(item.execSummary);
                      setTeamUpdate(item.teamUpdate);
                      setScreen('output');
                    }
                  }}
                  style={{
                    padding: spacing.md,
                    backgroundColor: colors.bg,
                    borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{item.project}</div>
                  <div style={{ fontSize: 12, color: colors.lightText, marginTop: spacing.xs }}>{item.date}</div>
                  <div style={{ fontSize: 13, color: colors.lightText, marginTop: spacing.xs }}>{item.preview}</div>
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
