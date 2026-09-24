import React, { useState } from 'react';

export default function App() {
  const colors = {
    bg: '#f6f7f9', card: '#ffffff', border: '#e2e5e9', text: '#20242b',
    sub: '#6b7280', accent: '#3b6e8f', accentSoft: '#eaf1f5',
    green: '#3f9c6d', yellow: '#c9962e', red: '#c05a4a'
  };
  const font = { fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif', color: colors.text };
  const page = { minHeight: '100vh', background: colors.bg, ...font };
  const nav = { display: 'flex', gap: 8, padding: '14px 24px', borderBottom: `1px solid ${colors.border}`, background: colors.card };
  const navBtn = (on) => ({ padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, background: on ? colors.accent : 'transparent', color: on ? '#fff' : colors.sub });
  const wrap = { padding: '28px 32px', maxWidth: 760, margin: '0 auto' };
  const card = { background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 18, marginBottom: 14 };
  const h1 = { fontSize: 22, fontWeight: 700, margin: '0 0 18px' };
  const h2 = { fontSize: 15, fontWeight: 700, margin: '0 0 8px' };
  const sub = { color: colors.sub, fontSize: 13 };
  const btn = { background: colors.accent, color: '#fff', border: 'none', borderRadius: 7, padding: '7px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginRight: 8 };
  const dot = (s) => ({ display: 'inline-block', width: 9, height: 9, borderRadius: 9, marginRight: 8, background: s === 'green' ? colors.green : s === 'yellow' ? colors.yellow : colors.red });

  const projects = [
    { id: 1, name: 'Atlas Migration', status: 'green',
      lastDecision: { text: 'Adopt Postgres over DynamoDB for cost predictability', by: 'You', date: 'Oct 2' },
      blockers: [{ id: 1, title: 'Infra budget sign-off pending', who: 'Dana Kim (Infra)', age: '3 days', reason: 'Awaiting finance approval on Q4 spend', next: 'Ping Dana directly, escalate to Priya if no reply by Fri' }],
      waiting: [{ who: 'Dana Kim', what: 'Infra budget approval', since: '3 days' }],
      decisions: [
        { date: 'Oct 2', text: 'Adopt Postgres over DynamoDB for cost predictability', by: 'You' },
        { date: 'Sep 27', text: 'Delay cutover to avoid holiday freeze', by: 'You' },
        { date: 'Sep 20', text: 'Use blue/green deploy strategy', by: 'Marcus Lee' }
      ] },
    { id: 2, name: 'Checkout Redesign', status: 'yellow',
      lastDecision: { text: 'Move to single-page checkout flow', by: 'You', date: 'Oct 4' },
      blockers: [{ id: 2, title: 'Design review stalled', who: 'Sofia Renz (Design)', age: '6 days', reason: 'Two competing layouts, no tiebreaker yet', next: 'Pick a variant this week, or delegate the call to Sofia' }],
      waiting: [{ who: 'Sofia Renz', what: 'Final layout decision', since: '6 days' }, { who: 'Growth team', what: 'Confirmation on A/B split', since: '2 days' }],
      decisions: [
        { date: 'Oct 4', text: 'Move to single-page checkout flow', by: 'You' },
        { date: 'Sep 30', text: 'Drop guest-checkout upsell modal', by: 'You' }
      ] },
    { id: 3, name: 'Onboarding V2', status: 'red',
      lastDecision: { text: 'Pause email drip until copy is rewritten', by: 'You', date: 'Sep 29' },
      blockers: [{ id: 3, title: 'Legal review overdue', who: 'Tom Alvarez (Legal)', age: '9 days', reason: 'Consent language flagged, no revision sent back', next: 'Escalate to Legal lead, request interim approval' }],
      waiting: [{ who: 'Tom Alvarez', what: 'Consent copy sign-off', since: '9 days' }],
      decisions: [{ date: 'Sep 29', text: 'Pause email drip until copy is rewritten', by: 'You' }] }
  ];

  const [screen, setScreen] = useState('switcher');
  const [projectId, setProjectId] = useState(null);
  const [blockerId, setBlockerId] = useState(null);
  const [caughtUp, setCaughtUp] = useState({});
  const project = projects.find(p => p.id === projectId);
  const blocker = project && project.blockers.find(b => b.id === blockerId);
  const goProject = (id) => { setProjectId(id); setScreen('summary'); };
  const tabs = ['switcher', 'summary', 'decisions', 'blocker', 'queue'];
  const label = { switcher: 'Switcher', summary: 'Re-entry Summary', decisions: 'Decision Log', blocker: 'Blocker Detail', queue: 'Waiting-On Queue' };

  let body;
  if (screen === 'switcher') {
    body = (<div style={wrap}><h1 style={h1}>Your Projects</h1>
      {projects.map(p => (
        <div key={p.id} style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><span style={dot(p.status)} />{p.name} {caughtUp[p.id] && <span style={{ ...sub, marginLeft: 8 }}>✓ caught up</span>}</div>
            <button style={btn} onClick={() => goProject(p.id)}>Resume</button>
          </div>
          <div style={{ ...sub, marginTop: 6 }}>Last decision: {p.lastDecision.text}</div>
        </div>))}
    </div>);
  } else if (screen === 'summary' && project) {
    body = (<div style={wrap}><h1 style={h1}>{project.name}</h1>
      <div style={card}><h2 style={h2}>Last decision</h2><div>{project.lastDecision.text}</div><div style={sub}>{project.lastDecision.by} · {project.lastDecision.date}</div></div>
      <div style={card}><h2 style={h2}>Blockers</h2>
        {project.blockers.map(b => (<div key={b.id} style={{ marginBottom: 8 }}>
          <div>{b.title} <span style={sub}>({b.age} open)</span></div>
          <button style={btn} onClick={() => { setBlockerId(b.id); setScreen('blocker'); }}>View & act</button>
        </div>))}
      </div>
      <div style={card}><h2 style={h2}>Who's waiting</h2>
        {project.waiting.map((w, i) => (<div key={i} style={{ marginBottom: 6 }}>{w.who} — {w.what} <span style={sub}>({w.since})</span> <button style={{ ...btn, background: colors.accentSoft, color: colors.accent }} onClick={() => alert('Reply sent to ' + w.who)}>Reply</button></div>))}
      </div>
      <button style={btn} onClick={() => setCaughtUp({ ...caughtUp, [project.id]: true })}>Mark caught up</button>
      <button style={{ ...btn, background: 'transparent', color: colors.sub, border: `1px solid ${colors.border}` }} onClick={() => setScreen('switcher')}>Back to Switcher</button>
    </div>);
  } else if (screen === 'decisions' && project) {
    body = (<div style={wrap}><h1 style={h1}>Decision Log — {project.name}</h1>
      {project.decisions.map((d, i) => (<div key={i} style={card}><div>{d.text}</div><div style={sub}>{d.by} · {d.date}</div></div>))}
    </div>);
  } else if (screen === 'blocker' && blocker) {
    body = (<div style={wrap}><h1 style={h1}>Blocker Detail</h1>
      <div style={card}>
        <h2 style={h2}>{blocker.title}</h2>
        <div style={sub}>Affects: {blocker.who}</div>
        <div style={sub}>Open for: {blocker.age}</div>
        <div style={{ margin: '10px 0' }}>Why it's stuck: {blocker.reason}</div>
        <div style={{ marginBottom: 12 }}>Suggested next step: {blocker.next}</div>
        <button style={btn} onClick={() => alert('Unblock message sent to ' + blocker.who)}>Unblock now</button>
        <button style={{ ...btn, background: colors.accentSoft, color: colors.accent }} onClick={() => setScreen('summary')}>Back to Summary</button>
      </div>
    </div>);
  } else if (screen === 'queue') {
    const all = projects.flatMap(p => p.waiting.map(w => ({ ...w, project: p.name })));
    body = (<div style={wrap}><h1 style={h1}>Waiting on You</h1>
      {all.map((w, i) => (<div key={i} style={card}>
        <div>{w.who} — {w.what}</div>
        <div style={sub}>{w.project} · waiting {w.since}</div>
        <button style={btn} onClick={() => alert('Replied to ' + w.who)}>Reply</button>
      </div>))}
    </div>);
  } else {
    body = (<div style={wrap}><p style={sub}>Select a project from the Switcher first.</p></div>);
  }

  return (<div style={page}>
    <div style={nav}>{tabs.map(t => (<button key={t} style={navBtn(screen === t)} onClick={() => setScreen(t)}>{label[t]}</button>))}</div>
    {body}
  </div>);
}
