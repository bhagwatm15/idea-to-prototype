import React, { useState } from 'react';

const colors = { primary: '#2A9D8F', primaryDark: '#1f7a70', accent: '#E76F51', bg: '#F5F8F7', card: '#FFFFFF', text: '#264653', muted: '#7A8C8A', border: '#E1E8E6' };
const S = {
  page: { fontFamily: 'Segoe UI, Arial, sans-serif', background: colors.bg, minHeight: '100vh', color: colors.text, paddingBottom: 40 },
  header: { padding: '22px 24px', background: colors.primary, color: '#fff' },
  nav: { display: 'flex', background: '#fff', borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0 },
  navBtn: active => ({ flex: 1, padding: '12px 2px', border: 'none', background: active ? colors.primary : 'transparent', color: active ? '#fff' : colors.text, fontSize: 12, fontWeight: 600, cursor: 'pointer' }),
  container: { padding: 20, maxWidth: 480, margin: '0 auto' },
  card: { background: colors.card, borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' },
  btn: { background: colors.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 14, cursor: 'pointer', fontWeight: 600 },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${colors.border}`, marginBottom: 12, fontSize: 14, boxSizing: 'border-box' },
  label: { fontSize: 12, fontWeight: 700, color: colors.muted, marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 },
  chip: active => ({ display: 'inline-block', padding: '6px 12px', borderRadius: 20, marginRight: 8, marginBottom: 8, fontSize: 13, cursor: 'pointer', border: `1px solid ${active ? colors.primary : colors.border}`, background: active ? colors.primary : '#fff', color: active ? '#fff' : colors.text })
};

export default function App() {
  const [trips, setTrips] = useState([
    { id: 1, name: 'Lake Tahoe Weekend', participants: ['Alex', 'Jamie', 'Priya', 'Sam'], expenses: [
      { id: 1, desc: 'Cabin rental', amount: 480, paidBy: 'Alex', splitWith: ['Alex', 'Jamie', 'Priya', 'Sam'] },
      { id: 2, desc: 'Groceries', amount: 96.5, paidBy: 'Jamie', splitWith: ['Alex', 'Jamie', 'Priya', 'Sam'] },
      { id: 3, desc: 'Ski passes', amount: 220, paidBy: 'Priya', splitWith: ['Priya', 'Sam'] }
    ]},
    { id: 2, name: 'NYC Girls Trip', participants: ['Mia', 'Chloe', 'Zoe'], expenses: [
      { id: 1, desc: 'Hotel - 2 nights', amount: 540, paidBy: 'Mia', splitWith: ['Mia', 'Chloe', 'Zoe'] },
      { id: 2, desc: 'Broadway tickets', amount: 315, paidBy: 'Chloe', splitWith: ['Mia', 'Chloe', 'Zoe'] }
    ]}
  ]);
  const [currentTripId, setCurrentTripId] = useState(1);
  const [screen, setScreen] = useState('dashboard');
  const [newTripName, setNewTripName] = useState('');
  const [newParticipants, setNewParticipants] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expPaidBy, setExpPaidBy] = useState('');
  const [expSplit, setExpSplit] = useState([]);

  const trip = trips.find(t => t.id === currentTripId);
  const fmt = n => '$' + n.toFixed(2);

  const getBalances = t => {
    const bal = {}; t.participants.forEach(p => bal[p] = 0);
    t.expenses.forEach(e => { bal[e.paidBy] += e.amount; const share = e.amount / e.splitWith.length; e.splitWith.forEach(p => bal[p] -= share); });
    return bal;
  };
  const getSettlements = bal => {
    const cred = Object.entries(bal).filter(([, v]) => v > 0.01).map(([n, v]) => ({ n, v })).sort((a, b) => b.v - a.v);
    const deb = Object.entries(bal).filter(([, v]) => v < -0.01).map(([n, v]) => ({ n, v: -v })).sort((a, b) => b.v - a.v);
    const res = []; let i = 0, j = 0;
    while (i < deb.length && j < cred.length) {
      const amt = Math.min(deb[i].v, cred[j].v);
      res.push({ from: deb[i].n, to: cred[j].n, amount: amt });
      deb[i].v -= amt; cred[j].v -= amt;
      if (deb[i].v < 0.01) i++; if (cred[j].v < 0.01) j++;
    }
    return res;
  };

  const addExpense = () => {
    if (!expDesc || !expAmount || !expPaidBy || expSplit.length === 0) return;
    const e = { id: Date.now(), desc: expDesc, amount: parseFloat(expAmount), paidBy: expPaidBy, splitWith: expSplit };
    setTrips(trips.map(t => t.id === trip.id ? { ...t, expenses: [...t.expenses, e] } : t));
    setExpDesc(''); setExpAmount(''); setExpPaidBy(''); setExpSplit([]); setScreen('detail');
  };
  const settle = (from, to, amount) => {
    const e = { id: Date.now(), desc: `Settlement: ${from} paid ${to}`, amount, paidBy: from, splitWith: [to] };
    setTrips(trips.map(t => t.id === trip.id ? { ...t, expenses: [...t.expenses, e] } : t));
  };
  const createTrip = () => {
    if (!newTripName || !newParticipants) return;
    const id = Date.now();
    const people = newParticipants.split(',').map(s => s.trim()).filter(Boolean);
    setTrips([...trips, { id, name: newTripName, participants: people, expenses: [] }]);
    setCurrentTripId(id); setNewTripName(''); setNewParticipants(''); setScreen('detail');
  };

  let content;
  if (screen === 'dashboard') {
    content = (
      <div style={S.container}>
        <h2>Your Trips</h2>
        <button style={S.btn} onClick={() => setScreen('setup')}>+ New Trip</button>
        <div style={{ marginTop: 16 }}>
          {trips.map(t => {
            const bal = getBalances(t); const total = t.expenses.reduce((s, e) => s + e.amount, 0);
            return (
              <div key={t.id} style={S.card} onClick={() => { setCurrentTripId(t.id); setScreen('detail'); }}>
                <h3 style={{ margin: '0 0 6px' }}>{t.name}</h3>
                <div style={{ color: colors.muted, fontSize: 13 }}>{t.participants.length} people · {fmt(total)} total spent</div>
                <div style={{ marginTop: 8, fontSize: 13 }}>
                  {Object.entries(bal).map(([n, v]) => <span key={n} style={{ marginRight: 10, color: v >= 0 ? colors.primary : colors.accent }}>{n}: {v >= 0 ? '+' : ''}{fmt(v)}</span>)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  } else if (screen === 'detail' && trip) {
    const bal = getBalances(trip);
    content = (
      <div style={S.container}>
        <h2>{trip.name}</h2>
        <div style={{ marginBottom: 12 }}>{trip.participants.map(p => <span key={p} style={S.chip(false)}>{p}</span>)}</div>
        <h3>Balances</h3>
        <div style={S.card}>
          {Object.entries(bal).map(([n, v]) => <div key={n} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>{n}</span><span style={{ color: v >= 0 ? colors.primary : colors.accent, fontWeight: 600 }}>{v >= 0 ? '+' : ''}{fmt(v)}</span></div>)}
        </div>
        <h3>Expenses</h3>
        {trip.expenses.map(e => (
          <div key={e.id} style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>{e.desc}</b><span>{fmt(e.amount)}</span></div>
            <div style={{ color: colors.muted, fontSize: 13 }}>Paid by {e.paidBy} · split {e.splitWith.length} ways</div>
          </div>
        ))}
      </div>
    );
  } else if (screen === 'add' && trip) {
    content = (
      <div style={S.container}>
        <h2>Add Expense</h2>
        <label style={S.label}>Description</label>
        <input style={S.input} value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="e.g. Dinner at The Grill" />
        <label style={S.label}>Amount</label>
        <input style={S.input} type="number" value={expAmount} onChange={e => setExpAmount(e.target.value)} placeholder="0.00" />
        <label style={S.label}>Paid by</label>
        <div style={{ marginBottom: 12 }}>{trip.participants.map(p => <span key={p} style={S.chip(expPaidBy === p)} onClick={() => setExpPaidBy(p)}>{p}</span>)}</div>
        <label style={S.label}>Split between</label>
        <div style={{ marginBottom: 16 }}>{trip.participants.map(p => <span key={p} style={S.chip(expSplit.includes(p))} onClick={() => setExpSplit(expSplit.includes(p) ? expSplit.filter(x => x !== p) : [...expSplit, p])}>{p}</span>)}</div>
        <button style={S.btn} onClick={addExpense}>Add Expense</button>
      </div>
    );
  } else if (screen === 'settle' && trip) {
    const settlements = getSettlements(getBalances(trip));
    content = (
      <div style={S.container}>
        <h2>Settle Up</h2>
        {settlements.length === 0 && <div style={S.card}>Everyone is all settled up! 🎉</div>}
        {settlements.map((s, i) => (
          <div key={i} style={S.card}>
            <div style={{ marginBottom: 8 }}><b>{s.from}</b> owes <b>{s.to}</b> <span style={{ color: colors.accent, fontWeight: 700 }}>{fmt(s.amount)}</span></div>
            <button style={S.btn} onClick={() => settle(s.from, s.to, s.amount)}>Mark as Settled</button>
          </div>
        ))}
      </div>
    );
  } else {
    content = (
      <div style={S.container}>
        <h2>Create a Trip</h2>
        <label style={S.label}>Trip Name</label>
        <input style={S.input} value={newTripName} onChange={e => setNewTripName(e.target.value)} placeholder="e.g. Yosemite Camping" />
        <label style={S.label}>Participants (comma separated)</label>
        <input style={S.input} value={newParticipants} onChange={e => setNewParticipants(e.target.value)} placeholder="Alex, Jamie, Priya" />
        <button style={S.btn} onClick={createTrip}>Create Trip</button>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.header}><h1 style={{ margin: 0 }}>TripTally</h1><div style={{ opacity: 0.9, fontSize: 13 }}>Split trips. Stay friends.</div></div>
      <div style={S.nav}>
        {[['dashboard', 'Trips'], ['detail', 'Detail'], ['add', 'Add Expense'], ['settle', 'Settle Up'], ['setup', 'New Trip']].map(([k, label]) => (
          <button key={k} style={S.navBtn(screen === k)} onClick={() => setScreen(k)}>{label}</button>
        ))}
      </div>
      {content}
    </div>
  );
}
