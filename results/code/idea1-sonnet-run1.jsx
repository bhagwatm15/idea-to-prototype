export default function App() {
  const colors = {
    bg: '#f6f7f9', card: '#ffffff', border: '#e3e6eb', text: '#232733',
    sub: '#6b7280', accent: '#4a5eea', green: '#3f9d6f', yellow: '#c99a2e',
    red: '#c8555f', chip: '#eef0f6'
  };
  const page = { minHeight: '100vh', background: colors.bg, fontFamily: 'Georgia, "Segoe UI", sans-serif', color: colors.text };
  const card = { background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 10, padding: 18, marginBottom: 14 };
  const btn = (bg, fg = '#fff') => ({ background: bg, color: fg, border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 13, cursor: 'pointer', marginRight: 8 });
  const tab = (active) => ({ padding: '10px 16px', cursor: 'pointer', fontSize: 14, borderBottom: active ? `2px solid ${colors.accent}` : '2px solid transparent', color: active ? colors.accent : colors.sub, fontWeight: active ? 600 : 400 });
  const dot = (c) => ({ display: 'inline-block', width: 9, height: 9, borderRadius: 5, background: c, marginRight: 6 });
  const statusColor = { green: colors.green, yellow: colors.yellow, red: colors.red };

  const [screen, setScreen] = useState('switcher');
  const [projectId, setProjectId] = useState(null);
  const [blockerId, setBlockerId] = useState(null);
  const [caughtUp, setCaughtUp] = useState({});

  const projects = [
    { id: 1, name: 'Northwind Checkout Redesign', status: 'yellow',
      lastDecision: 'Switched to single-page checkout flow (Mar 12)',
      blockers: [
        { id: 'b1', title: 'Payments API contract unsigned', since: '4 days', who: 'Priya Nair (Eng)', why: 'Legal review pending on vendor terms', next: 'Ping Legal for ETA, offer to walk them through redlines' },
        { id: 'b2', title: 'Design QA blocked on new icons', since: '1 day', who: 'Sam Ortiz (Design)', why: 'Icon set not yet exported from Figma', next: 'Ask Sam to export placeholder set to unblock QA' }
      ],
      waitingOn: [ { person: 'Priya Nair', ask: 'Approve fallback plan if vendor slips', since: '2 days' }, { person: 'Dana Lee', ask: 'Confirm launch date with marketing', since: '1 day' } ] },
    { id: 2, name: 'Atlas Onboarding Revamp', status: 'green',
      lastDecision: 'Kept email verification as first step (Mar 14)',
      blockers: [ { id: 'b3', title: 'Copy review overdue', since: '2 days', who: 'Marcus Webb (Content)', why: 'Waiting on brand voice sign-off', next: 'Escalate to brand lead directly' } ],
      waitingOn: [ { person: 'Marcus Webb', ask: 'Finalize onboarding copy', since: '2 days' } ] },
    { id: 3, name: 'Helios Data Migration', status: 'red',
      lastDecision: 'Delayed cutover to April 2nd (Mar 10)',
      blockers: [
        { id: 'b4', title: 'Schema mismatch on legacy accounts', since: '6 days', who: 'Tariq Malik (Eng)', why: 'Legacy table missing normalized IDs', next: 'Schedule sync with data team to patch schema' },
        { id: 'b5', title: 'Rollback plan unapproved', since: '3 days', who: 'Elena Cruz (Eng Lead)', why: 'Needs sign-off from infra on cost impact', next: 'Send cost summary directly to Elena' } ],
      waitingOn: [ { person: 'Elena Cruz', ask: 'Approve rollback plan', since: '3 days' }, { person: 'Tariq Malik', ask: 'Confirm schema fix timeline', since: '1 day' } ] },
    { id: 4, name: 'Fern Mobile App v2', status: 'green',
      lastDecision: 'Adopted dark mode as default (Mar 9)',
      blockers: [], waitingOn: [ { person: 'Nina Osei', ask: 'Share App Store screenshots', since: '5 days' } ] }
  ];

  const project = projects.find(p => p.id === projectId);
  const decisionsLog = project ? [
    project.lastDecision,
    'Deferred internationalization to phase 2',
    'Agreed to reuse existing auth service instead of rebuilding'
  ] : [];
  const blocker = project && project.blockers.find(b => b.id === blockerId);
  const allWaiting = projects.flatMap(p => p.waitingOn.map(w => ({ ...w, project: p.name, pid: p.id })));

  const Nav = () => (
    <div style={{ display: 'flex', borderBottom: `1px solid ${colors.border}`, padding: '0 24px', background: colors.card }}>
      {['switcher', 'summary', 'decisions', 'blocker', 'waiting'].map(s => (
        <div key={s} style={tab(screen === s)} onClick={() => setScreen(s)}>
          {{ switcher: 'Projects', summary: 'Re-entry Summary', decisions: 'Decision Log', blocker: 'Blocker Detail', waiting: 'Waiting-On Queue' }[s]}
        </div>
      ))}
    </div>
  );

  let content;
  if (screen === 'switcher') {
    content = (<div>
      <h2>Your Projects</h2>
      {projects.map(p => (
        <div key={p.id} style={{ ...card, cursor: 'pointer' }} onClick={() => { setProjectId(p.id); setScreen('summary'); }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><span style={dot(statusColor[p.status])}></span><strong>{p.name}</strong></div>
            <span style={{ fontSize: 12, color: colors.sub }}>{caughtUp[p.id] ? 'Caught up' : `${p.blockers.length} blocker(s)`}</span>
          </div>
          <div style={{ fontSize: 13, color: colors.sub, marginTop: 6 }}>{p.lastDecision}</div>
        </div>
      ))}
    </div>);
  } else if (!project) {
    content = <div style={card}>Select a project from the switcher first.</div>;
  } else if (screen === 'summary') {
    content = (<div>
      <h2>{project.name}</h2>
      <div style={card}><strong>Last Decision</strong><p style={{ color: colors.sub }}>{project.lastDecision}</p></div>
      <div style={card}><strong>Active Blockers</strong>
        {project.blockers.length === 0 && <p style={{ color: colors.sub }}>None — clear to move fast.</p>}
        {project.blockers.map(b => (
          <div key={b.id} style={{ padding: '8px 0', borderTop: `1px solid ${colors.border}` }}>
            <div>{b.title} <span style={{ fontSize: 12, color: colors.sub }}>· open {b.since}</span></div>
            <button style={btn(colors.accent)} onClick={() => { setBlockerId(b.id); setScreen('blocker'); }}>View</button>
          </div>
        ))}
      </div>
      <div style={card}><strong>Waiting On You</strong>
        {project.waitingOn.map((w, i) => (
          <div key={i} style={{ padding: '8px 0', borderTop: `1px solid ${colors.border}` }}>
            {w.person} needs: {w.ask} <span style={{ fontSize: 12, color: colors.sub }}>({w.since})</span>
            <div><button style={btn(colors.green)}>Reply</button></div>
          </div>
        ))}
      </div>
      <button style={btn(colors.text)} onClick={() => setCaughtUp({ ...caughtUp, [project.id]: true })}>Mark Caught Up</button>
    </div>);
  } else if (screen === 'decisions') {
    content = (<div><h2>Decision Log — {project.name}</h2>
      {decisionsLog.map((d, i) => (<div key={i} style={card}>{d}</div>))}
    </div>);
  } else if (screen === 'blocker') {
    content = !blocker ? <div style={card}>Pick a blocker from the summary view.</div> : (
      <div><h2>{blocker.title}</h2>
        <div style={card}>
          <p><strong>Affected:</strong> {blocker.who}</p>
          <p><strong>Open for:</strong> {blocker.since}</p>
          <p><strong>Why it's stuck:</strong> {blocker.why}</p>
          <p><strong>Suggested next action:</strong> {blocker.next}</p>
          <button style={btn(colors.accent)}>Unblock Now</button>
        </div>
      </div>);
  } else if (screen === 'waiting') {
    content = (<div><h2>Waiting-On Queue</h2>
      {allWaiting.map((w, i) => (
        <div key={i} style={card}>
          <div style={{ fontSize: 12, color: colors.sub }}>{w.project}</div>
          <div>{w.person}: {w.ask} <span style={{ fontSize: 12, color: colors.sub }}>({w.since})</span></div>
          <button style={btn(colors.green)}>Reply</button>
        </div>
      ))}
    </div>);
  }

  return (<div style={page}>
    <div style={{ padding: '18px 24px', fontSize: 20, fontWeight: 700 }}>Resume</div>
    <Nav />
    <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>{content}</div>
  </div>);
}
