import React, { useState } from 'react';

const C = {
  bg: '#f6f8fa',
  surface: '#ffffff',
  border: '#d8dee4',
  text: '#1f2328',
  muted: '#656d76',
  accent: '#0969da',
  accentSoft: '#ddf4ff',
  green: '#1a7f37',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const S = {
  page: { fontFamily: C.font, background: C.bg, minHeight: '100vh', color: C.text, margin: 0 },
  nav: { display: 'flex', gap: 4, padding: '12px 24px', background: C.surface, borderBottom: `1px solid ${C.border}`, alignItems: 'center' },
  logo: { fontWeight: 700, fontSize: 17, marginRight: 20, letterSpacing: -0.3 },
  tab: (active) => ({ padding: '7px 13px', fontSize: 13, borderRadius: 6, border: 'none', cursor: 'pointer', background: active ? C.accentSoft : 'transparent', color: active ? C.accent : C.muted, fontWeight: active ? 600 : 500 }),
  body: { maxWidth: 1080, margin: '0 auto', padding: 24 },
  card: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18 },
  h1: { fontSize: 22, fontWeight: 700, margin: '0 0 4px' },
  sub: { fontSize: 13.5, color: C.muted, margin: '0 0 18px' },
  label: { fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6, display: 'block' },
  input: { width: '100%', boxSizing: 'border-box', padding: 11, fontSize: 14, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: C.font, resize: 'vertical', color: C.text },
  btn: { padding: '9px 16px', fontSize: 13.5, fontWeight: 600, borderRadius: 8, border: 'none', cursor: 'pointer', background: C.accent, color: '#fff' },
  btnGhost: { padding: '9px 16px', fontSize: 13.5, fontWeight: 600, borderRadius: 8, border: `1px solid ${C.border}`, cursor: 'pointer', background: C.surface, color: C.text },
  row: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  pill: (on) => ({ padding: '6px 12px', fontSize: 13, borderRadius: 20, border: `1px solid ${on ? C.accent : C.border}`, background: on ? C.accentSoft : C.surface, color: on ? C.accent : C.muted, cursor: 'pointer', fontWeight: 500 }),
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 },
  colHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  colTitle: { fontSize: 13, fontWeight: 700, color: C.text },
  badge: (color) => ({ fontSize: 11, fontWeight: 600, color, border: `1px solid ${color}`, borderRadius: 5, padding: '2px 7px' }),
  output: { fontSize: 13.5, lineHeight: 1.55, whiteSpace: 'pre-wrap', color: C.text, padding: 12, border: `1px solid ${C.border}`, borderRadius: 8, background: '#fbfcfd', minHeight: 180, width: '100%', boxSizing: 'border-box', fontFamily: C.font, resize: 'vertical' },
  tool: { display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  small: { fontSize: 12.5, color: C.muted },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.surface, marginBottom: 8 },
};

const EXEC = `Status — Atlas Migration (Week 6)

• On track: 78% of services migrated; zero P1 incidents this sprint.
• Blocker: legacy billing API deprecation moved to Jun 14 — needs owner.
• Ask: 2 backend engineers for the final cutover window (Jun 17–21).`;
const TEAM = `Team update — Atlas Migration

What shipped: identity service + 12 internal APIs cut over; 78% complete.
What's next: billing API workaround, load test at 3x peak on Jun 12.
Risks: vendor deprecation Jun 14 (T. Nguyen to confirm fallback).
Owners: Priya — cutover runbook; Marcus — rollback drill.
Decisions needed: approve 4h maintenance window Jun 17, 02:00 UTC.`;

const HISTORY = [
  { t: 'Atlas Migration — Week 6', d: 'Jun 5, 2025 · 2 versions' },
  { t: 'Q2 Billing Redesign — Week 3', d: 'May 29, 2025 · Exec + team' },
  { t: 'Mobile 4.2 Release — Week 1', d: 'May 22, 2025 · 2 versions' },
  { t: 'Data Platform Refresh — Week 9', d: 'May 15, 2025 · Exec only' },
];

export default function App() {
  const [screen, setScreen] = useState('input');
  const [raw, setRaw] = useState('on track 78% migrated\nblocker: billing api deprecation jun 14\nneed 2 eng for cutover jun 17-21');
  const [project, setProject] = useState('Atlas Migration');
  const [audience, setAudience] = useState('Leadership');
  const [urgency, setUrgency] = useState('Normal');
  const [exec, setExec] = useState(EXEC);
  const [team, setTeam] = useState(TEAM);
  const [copied, setCopied] = useState('');

  const tabs = [['input', 'Input'], ['output', 'Versions'], ['refine', 'Refine'], ['export', 'Export'], ['history', 'History']];

  const copy = (which) => {
    setCopied(which);
    setTimeout(() => setCopied(''), 1200);
  };

  return (
    <div style={S.page}>
      <div style={S.nav}>
        <span style={S.logo}>Brieflio</span>
        {tabs.map(([k, label]) => (
          <button key={k} style={S.tab(screen === k)} onClick={() => setScreen(k)}>{label}</button>
        ))}
      </div>

      <div style={S.body}>
        {screen === 'input' && (
          <>
            <h1 style={S.h1}>New status update</h1>
            <p style={S.sub}>Paste rough bullets — Brieflio shapes them into an exec summary and a team update.</p>
            <div style={S.card}>
              <label style={S.label}>Raw bullets</label>
              <textarea style={{ ...S.input, minHeight: 120 }} value={raw} onChange={(e) => setRaw(e.target.value)} />
              <div style={{ ...S.row, marginTop: 16 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={S.label}>Project</label>
                  <input style={S.input} value={project} onChange={(e) => setProject(e.target.value)} />
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={S.label}>Audience emphasis</label>
                  <div style={S.row}>
                    {['Leadership', 'Cross-team', 'Exec briefing'].map((a) => (
                      <span key={a} style={S.pill(audience === a)} onClick={() => setAudience(a)}>{a}</span>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={S.label}>Urgency</label>
                  <div style={S.row}>
                    {['Normal', 'Watch', 'Urgent'].map((u) => (
                      <span key={u} style={S.pill(urgency === u)} onClick={() => setUrgency(u)}>{u}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ ...S.row, marginTop: 18 }}>
                <button style={S.btn} onClick={() => setScreen('output')}>Generate two versions</button>
                <span style={{ ...S.small, alignSelf: 'center' }}>Context: {project} · {audience} · {urgency}</span>
              </div>
            </div>
          </>
        )}

        {screen === 'output' && (
          <>
            <h1 style={S.h1}>Two versions ready</h1>
            <p style={S.sub}>{project} · {audience} emphasis · {urgency} urgency</p>
            <div style={S.twoCol}>
              <div style={S.card}>
                <div style={S.colHead}><span style={S.colTitle}>Exec summary</span><span style={S.badge(C.accent)}>Concise</span></div>
                <div style={S.output}>{exec}</div>
              </div>
              <div style={S.card}>
                <div style={S.colHead}><span style={S.colTitle}>Team update</span><span style={S.badge(C.green)}>Detailed</span></div>
                <div style={S.output}>{team}</div>
              </div>
            </div>
            <div style={{ ...S.row, marginTop: 16 }}>
              <button style={S.btn} onClick={() => setScreen('refine')}>Review &amp; refine</button>
              <button style={S.btnGhost} onClick={() => setScreen('export')}>Jump to export</button>
            </div>
          </>
        )}

        {screen === 'refine' && (
          <>
            <h1 style={S.h1}>Refine in place</h1>
            <p style={S.sub}>Edit either version, or regenerate one without touching the other.</p>
            <div style={S.twoCol}>
              <div style={S.card}>
                <div style={S.colHead}><span style={S.colTitle}>Exec summary</span><span style={S.badge(C.accent)}>Concise</span></div>
                <textarea style={{ ...S.output, minHeight: 200 }} value={exec} onChange={(e) => setExec(e.target.value)} />
                <div style={S.tool}>
                  <button style={S.btnGhost} onClick={() => setExec(EXEC)}>Regenerate</button>
                  <button style={S.btnGhost} onClick={() => setExec(exec.split('\n').slice(0, 3).join('\n'))}>Tighten tone</button>
                </div>
              </div>
              <div style={S.card}>
                <div style={S.colHead}><span style={S.colTitle}>Team update</span><span style={S.badge(C.green)}>Detailed</span></div>
                <textarea style={{ ...S.output, minHeight: 200 }} value={team} onChange={(e) => setTeam(e.target.value)} />
                <div style={S.tool}>
                  <button style={S.btnGhost} onClick={() => setTeam(TEAM)}>Regenerate</button>
                  <button style={S.btnGhost} onClick={() => setTeam(team + '\nNext sync: Fri 10:00 UTC.')}>Add sync note</button>
                </div>
              </div>
            </div>
          </>
        )}

        {screen === 'export' && (
          <>
            <h1 style={S.h1}>Export &amp; share</h1>
            <p style={S.sub}>Send both versions or just one, formatted for the destination.</p>
            <div style={S.card}>
              <div style={S.row}>
                <button style={S.btn} onClick={() => copy('both')}>{copied === 'both' ? 'Copied ✓' : 'Copy both to clipboard'}</button>
                <button style={S.btnGhost} onClick={() => copy('slack')}>{copied === 'slack' ? 'Copied ✓' : 'Copy for Slack'}</button>
                <button style={S.btnGhost} onClick={() => copy('email')}>{copied === 'email' ? 'Copied ✓' : 'Copy for email'}</button>
                <button style={S.btnGhost}>Download .md</button>
              </div>
              <div style={{ ...S.row, marginTop: 16 }}>
                {['Send via Gmail', 'Post to #atlas-migration', 'Save to Notion doc'].map((i) => (
                  <span key={i} style={S.pill(false)}>{i}</span>
                ))}
              </div>
              <p style={{ ...S.small, marginTop: 16, marginBottom: 0 }}>Longest version: 96 words · fits Slack and email previews.</p>
            </div>
          </>
        )}

        {screen === 'history' && (
          <>
            <h1 style={S.h1}>History</h1>
            <p style={S.sub}>Reuse a past update as the starting point for this week's.</p>
            {HISTORY.map((h) => (
              <div key={h.t} style={S.item}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{h.t}</div>
                  <div style={S.small}>{h.d}</div>
                </div>
                <button style={S.btnGhost} onClick={() => { setProject(h.t); setScreen('input'); }}>Reuse</button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
