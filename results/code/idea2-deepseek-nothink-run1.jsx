import React, { useState } from 'react';

const C = {
  bg: '#F7F8FA', card: '#FFFFFF', border: '#E2E5EA',
  text: '#1A1D23', sub: '#5B6472', accent: '#2D6BF3',
  accentSoft: '#EAF0FE', ok: '#0F9D58', warn: '#D97706'
};
const S = {
  input: { width: '100%', boxSizing: 'border-box', border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', color: C.text, background: C.card, outline: 'none' },
  btn: { border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 },
  label: { fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: C.sub, marginBottom: 6, display: 'block' },
  h2: { fontSize: 17, fontWeight: 700, color: C.text, margin: '0 0 4px' },
  p: { fontSize: 13, color: C.sub, margin: '0 0 14px', lineHeight: 1.5 }
};

export default function App() {
  const [screen, setScreen] = useState('input');
  const [bullets, setBullets] = useState('- Auth service migrated to v2, latency down 340ms\n- 3 of 5 onboarding emails shipped; 2 blocked on copy review\n- Payment provider sandbox keys pending from Finance\n- Next: load test API gateway Thursday, demo Friday 2pm');
  const [project, setProject] = useState('Atlas Platform – Sprint 24');
  const [audience, setAudience] = useState('Executive');
  const [urgency, setUrgency] = useState('Normal');
  const [exec, setExec] = useState('Atlas Platform Sprint 24 is on track: auth migration complete, cutting API latency by 340ms. Onboarding emails are 3/5 live, with 2 awaiting copy review. Payment sandbox keys are pending from Finance — the only blocker. Next: API gateway load test Thursday and a demo Friday at 2pm.');
  const [team, setTeam] = useState('Wins this week:\n• Auth service migrated to v2 in production — latency reduced 340ms (p95 now 210ms).\n• 3 of 5 onboarding emails shipped to staging: welcome, verify, first-project.\n\nIn progress / blocked:\n• Emails 4 & 5 blocked on copy review from Maya — need by Wed EOD.\n• Payment provider sandbox keys still pending from Finance (Sarah).\n\nUp next:\n• Load test API gateway Thursday morning.\n• Sprint demo Friday 2pm, main room.');
  const [tone, setTone] = useState('Professional');
  const [copied, setCopied] = useState('');

  const tabs = [['input','Input'],['output','Output'],['refine','Edit & Refine'],['export','Export & Share'],['history','History']];
  const history = [
    { d: 'Mar 14', t: 'Atlas Platform – Sprint 23', n: '4 bullets · Exec + Team' },
    { d: 'Mar 07', t: 'Atlas Platform – Sprint 22', n: '5 bullets · Exec + Team' },
    { d: 'Feb 28', t: 'Mobile Beta – Week 6', n: '3 bullets · Team only' }
  ];
  const copy = (label) => { setCopied(label); };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: '0 24px', display: 'flex', alignItems: 'center', gap: 24, height: 56 }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: C.text, letterSpacing: -0.3 }}>Brieflio</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {tabs.map(([k, l]) => (
            <button key={k} onClick={() => setScreen(k)} style={{ ...S.btn, padding: '6px 12px', background: screen === k ? C.accentSoft : 'transparent', color: screen === k ? C.accent : C.sub }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: '0 auto', padding: 24 }}>
        {screen === 'input' && (
          <div style={S.card}>
            <h2 style={S.h2}>New status update</h2>
            <p style={S.p}>Paste rough bullets or notes — Brieflio turns them into two clean versions.</p>
            <label style={S.label}>Raw bullets</label>
            <textarea value={bullets} onChange={e => setBullets(e.target.value)} rows={7} style={{ ...S.input, resize: 'vertical', lineHeight: 1.6 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginTop: 16 }}>
              <div><label style={S.label}>Project / context</label><input value={project} onChange={e => setProject(e.target.value)} style={S.input} /></div>
              <div><label style={S.label}>Audience emphasis</label>
                <select value={audience} onChange={e => setAudience(e.target.value)} style={S.input}><option>Executive</option><option>Engineering</option><option>Stakeholders</option></select></div>
              <div><label style={S.label}>Urgency</label>
                <select value={urgency} onChange={e => setUrgency(e.target.value)} style={S.input}><option>Normal</option><option>High</option><option>Critical</option></select></div>
            </div>
            <div style={{ marginTop: 18, display: 'flex', gap: 10, alignItems: 'center' }}>
              <button onClick={() => setScreen('output')} style={{ ...S.btn, background: C.accent, color: '#fff' }}>Generate two versions</button>
              <span style={{ fontSize: 12.5, color: C.sub }}>{bullets.split('\n').filter(Boolean).length} bullets · ~{bullets.split(/\s+/).length} words</span>
            </div>
          </div>
        )}

        {screen === 'output' && (
          <div>
            <h2 style={{ ...S.h2, marginBottom: 2 }}>Generated updates</h2>
            <p style={S.p}>Two tailored versions from the same source. Click either to edit inline.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[['Exec summary', exec, setExec, 'Concise'], ['Team update', team, setTeam, 'Detailed']].map(([title, val, set, tag]) => (
                <div key={title} style={S.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <strong style={{ fontSize: 14, color: C.text }}>{title}</strong>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.accent, background: C.accentSoft, padding: '3px 8px', borderRadius: 99 }}>{tag}</span>
                  </div>
                  <textarea value={val} onChange={e => set(e.target.value)} rows={10} style={{ ...S.input, resize: 'vertical', lineHeight: 1.6, fontSize: 13.5 }} />
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button onClick={() => copy(title)} style={{ ...S.btn, background: C.accentSoft, color: C.accent }}>{copied === title ? 'Copied ✓' : 'Copy'}</button>
                    <button onClick={() => setScreen('refine')} style={{ ...S.btn, background: 'transparent', color: C.sub, border: `1px solid ${C.border}` }}>Refine</button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setScreen('export')} style={{ ...S.btn, background: C.accent, color: '#fff', marginTop: 16 }}>Continue to export →</button>
          </div>
        )}

        {screen === 'refine' && (
          <div style={S.card}>
            <h2 style={S.h2}>Edit & refine</h2>
            <p style={S.p}>Tweak wording, adjust tone, or regenerate a single version.</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
              <label style={{ ...S.label, margin: 0 }}>Tone</label>
              {['Professional', 'Direct', 'Friendly'].map(t => (
                <button key={t} onClick={() => setTone(t)} style={{ ...S.btn, padding: '6px 12px', background: tone === t ? C.accentSoft : 'transparent', color: tone === t ? C.accent : C.sub, border: `1px solid ${tone === t ? C.accent : C.border}` }}>{t}</button>
              ))}
              <span style={{ fontSize: 12.5, color: C.sub, marginLeft: 4 }}>Applied to: {tone}</span>
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={S.label}>Exec summary</label>
                <textarea value={exec} onChange={e => setExec(e.target.value)} rows={5} style={{ ...S.input, resize: 'vertical', lineHeight: 1.6 }} />
                <button onClick={() => setExec(exec + ' (refined)')} style={{ ...S.btn, marginTop: 8, background: C.accentSoft, color: C.accent }}>↻ Regenerate this version</button>
              </div>
              <div>
                <label style={S.label}>Team update</label>
                <textarea value={team} onChange={e => setTeam(e.target.value)} rows={7} style={{ ...S.input, resize: 'vertical', lineHeight: 1.6 }} />
                <button onClick={() => setTeam(team + '\n\n(revised)')} style={{ ...S.btn, marginTop: 8, background: C.accentSoft, color: C.accent }}>↻ Regenerate this version</button>
              </div>
            </div>
            <button onClick={() => setScreen('export')} style={{ ...S.btn, background: C.accent, color: '#fff', marginTop: 16 }}>Save & continue →</button>
          </div>
        )}

        {screen === 'export' && (
          <div>
            <h2 style={{ ...S.h2, marginBottom: 2 }}>Export & share</h2>
            <p style={S.p}>Send both versions anywhere your team works.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={S.card}>
                <strong style={{ fontSize: 14 }}>Copy</strong>
                <p style={{ ...S.p, marginTop: 6 }}>Clipboard-ready, formatted for each channel.</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => copy('Email')} style={{ ...S.btn, background: C.accentSoft, color: C.accent }}>{copied === 'Email' ? 'Copied ✓' : 'Copy for Email'}</button>
                  <button onClick={() => copy('Slack')} style={{ ...S.btn, background: C.accentSoft, color: C.accent }}>{copied === 'Slack' ? 'Copied ✓' : 'Copy for Slack'}</button>
                  <button onClick={() => copy('Docs')} style={{ ...S.btn, background: C.accentSoft, color: C.accent }}>{copied === 'Docs' ? 'Copied ✓' : 'Copy for Docs'}</button>
                </div>
              </div>
              <div style={S.card}>
                <strong style={{ fontSize: 14 }}>Send / download</strong>
                <p style={{ ...S.p, marginTop: 6 }}>Direct integrations and file exports.</p>
                <div style={{ display: 'grid', gap: 8 }}>
                  <button onClick={() => copy('Slack sent')} style={{ ...S.btn, background: C.accent, color: '#fff', textAlign: 'left' }}>{copied === 'Slack sent' ? 'Sent to #atlas-eng ✓' : 'Send to Slack — #atlas-eng'}</button>
                  <button onClick={() => copy('Email sent')} style={{ ...S.btn, border: `1px solid ${C.border}`, background: 'transparent', color: C.text, textAlign: 'left' }}>{copied === 'Email sent' ? 'Drafted to leads ✓' : 'Email to sprint-leads@company.com'}</button>
                  <button onClick={() => copy('Doc')} style={{ ...S.btn, border: `1px solid ${C.border}`, background: 'transparent', color: C.text, textAlign: 'left' }}>{copied === 'Doc' ? 'Downloaded ✓' : 'Download .docx / .md'}</button>
                </div>
              </div>
            </div>
            <div style={{ ...S.card, marginTop: 16 }}>
              <label style={S.label}>Preview — Team update</label>
              <div style={{ fontSize: 13, color: C.text, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{team}</div>
            </div>
          </div>
        )}

        {screen === 'history' && (
          <div style={S.card}>
            <h2 style={S.h2}>History</h2>
            <p style={S.p}>Reuse a past update as a starting point.</p>
            {history.map(h => (
              <div key={h.t} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{h.t}</div>
                  <div style={{ fontSize: 12.5, color: C.sub }}>{h.d} · {h.n}</div>
                </div>
                <button onClick={() => { setScreen('output'); }} style={{ ...S.btn, background: C.accentSoft, color: C.accent }}>Reuse</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
