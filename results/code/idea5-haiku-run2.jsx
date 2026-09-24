import { useState } from 'react';

export default function App() {
  const [screen, setScreen] = useState('dashboard');
  const [trips, setTrips] = useState([
    { id: 1, name: 'Vegas Weekend', participants: ['Alex', 'Jordan', 'Sam'], expenses: [
      { id: 1, description: 'Hotel', amount: 300, paidBy: 'Alex', splitBetween: ['Alex', 'Jordan', 'Sam'] },
      { id: 2, description: 'Dinner', amount: 120, paidBy: 'Jordan', splitBetween: ['Alex', 'Jordan', 'Sam'] }
    ], settled: {} },
    { id: 2, name: 'Beach Trip', participants: ['Casey', 'Morgan'], expenses: [
      { id: 1, description: 'Gas', amount: 50, paidBy: 'Casey', splitBetween: ['Casey', 'Morgan'] }
    ], settled: {} }
  ]);
  const [currentTripId, setCurrentTripId] = useState(1);
  const [newTripName, setNewTripName] = useState('');
  const [newParticipant, setNewParticipant] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expensePaidBy, setExpensePaidBy] = useState('');
  const [expenseSplitBetween, setExpenseSplitBetween] = useState([]);

  const colors = { primary: '#0066cc', success: '#28a745', danger: '#dc3545', light: '#f8f9fa', border: '#e0e0e0', text: '#333' };
  const spacing = { xs: 8, sm: 12, md: 16, lg: 24, xl: 32 };

  const baseButton = {
    padding: `${spacing.sm}px ${spacing.md}px`,
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  };

  const getCurrentTrip = () => trips.find(t => t.id === currentTripId);
  
  const calculateBalances = (trip) => {
    const balances = {};
    trip.participants.forEach(p => balances[p] = 0);
    trip.expenses.forEach(exp => {
      const amountPerPerson = exp.amount / exp.splitBetween.length;
      balances[exp.paidBy] += exp.amount;
      exp.splitBetween.forEach(person => {
        balances[person] -= amountPerPerson;
      });
    });
    return balances;
  };

  const handleAddExpense = () => {
    if (!expenseDesc || !expenseAmount || !expensePaidBy || expenseSplitBetween.length === 0) return;
    const trip = getCurrentTrip();
    const newExpense = {
      id: Math.max(...trip.expenses.map(e => e.id), 0) + 1,
      description: expenseDesc,
      amount: parseFloat(expenseAmount),
      paidBy: expensePaidBy,
      splitBetween: expenseSplitBetween
    };
    setTrips(trips.map(t => t.id === currentTripId ? { ...t, expenses: [...t.expenses, newExpense] } : t));
    setExpenseDesc('');
    setExpenseAmount('');
    setExpensePaidBy('');
    setExpenseSplitBetween([]);
  };

  const handleAddTrip = () => {
    if (!newTripName) return;
    const newTrip = { id: Math.max(...trips.map(t => t.id), 0) + 1, name: newTripName, participants: [], expenses: [], settled: {} };
    setTrips([...trips, newTrip]);
    setCurrentTripId(newTrip.id);
    setNewTripName('');
    setScreen('trip-detail');
  };

  const handleAddParticipant = () => {
    if (!newParticipant) return;
    setTrips(trips.map(t => t.id === currentTripId && !t.participants.includes(newParticipant) ? { ...t, participants: [...t.participants, newParticipant] } : t));
    setNewParticipant('');
  };

  const handleSettleDebt = (from, to) => {
    const trip = getCurrentTrip();
    const key = `${from}-${to}`;
    setTrips(trips.map(t => t.id === currentTripId ? { ...t, settled: { ...t.settled, [key]: !t.settled[key] } } : t));
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh', backgroundColor: colors.light }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: `1px solid ${colors.border}`, padding: spacing.md }}>
        <h1 style={{ margin: 0, color: colors.primary, fontSize: 24 }}>TripTally</h1>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: spacing.sm, padding: spacing.md, backgroundColor: 'white', borderBottom: `1px solid ${colors.border}` }}>
        {['dashboard', 'trip-setup'].map(s => (
          <button key={s} onClick={() => setScreen(s)} style={{ ...baseButton, backgroundColor: screen === s ? colors.primary : colors.light, color: screen === s ? 'white' : colors.text }}>
            {s === 'dashboard' ? 'Trips' : 'New Trip'}
          </button>
        ))}
      </div>

      <div style={{ padding: spacing.lg, maxWidth: 1200, margin: '0 auto' }}>
        {/* Dashboard Screen */}
        {screen === 'dashboard' && (
          <div>
            <h2 style={{ color: colors.text, marginBottom: spacing.md }}>Your Trips</h2>
            {trips.map(trip => {
              const balances = calculateBalances(trip);
              return (
                <div key={trip.id} onClick={() => { setCurrentTripId(trip.id); setScreen('trip-detail'); }} style={{ backgroundColor: 'white', padding: spacing.md, marginBottom: spacing.md, borderRadius: 8, border: `1px solid ${colors.border}`, cursor: 'pointer' }}>
                  <h3 style={{ margin: '0 0 8px 0', color: colors.text }}>{trip.name}</h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#666' }}>{trip.participants.length} people • {trip.expenses.length} expenses</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: 12, color: colors.primary }}>Balance: {Object.values(balances).reduce((a, b) => a + b, 0).toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Trip Setup Screen */}
        {screen === 'trip-setup' && (
          <div style={{ maxWidth: 500 }}>
            <h2 style={{ color: colors.text, marginBottom: spacing.md }}>Create a New Trip</h2>
            <input type="text" placeholder="Trip name" value={newTripName} onChange={e => setNewTripName(e.target.value)} style={{ width: '100%', padding: spacing.sm, marginBottom: spacing.md, border: `1px solid ${colors.border}`, borderRadius: 6, boxSizing: 'border-box' }} />
            <button onClick={handleAddTrip} style={{ ...baseButton, backgroundColor: colors.primary, color: 'white', width: '100%' }}>Create Trip</button>
          </div>
        )}

        {/* Trip Detail Screen */}
        {screen === 'trip-detail' && getCurrentTrip() && (
          <div>
            <h2 style={{ color: colors.text, marginBottom: spacing.md }}>{getCurrentTrip().name}</h2>
            
            <div style={{ marginBottom: spacing.lg }}>
              <h3 style={{ color: colors.text, marginBottom: spacing.sm }}>Participants</h3>
              <div style={{ display: 'flex', gap: spacing.sm, marginBottom: spacing.md }}>
                <input type="text" placeholder="Add participant" value={newParticipant} onChange={e => setNewParticipant(e.target.value)} style={{ flex: 1, padding: spacing.sm, border: `1px solid ${colors.border}`, borderRadius: 6 }} />
                <button onClick={handleAddParticipant} style={{ ...baseButton, backgroundColor: colors.primary, color: 'white' }}>Add</button>
              </div>
              {getCurrentTrip().participants.map(p => <span key={p} style={{ display: 'inline-block', backgroundColor: colors.light, padding: `4px ${spacing.sm}px`, marginRight: spacing.sm, borderRadius: 4, fontSize: 12 }}>{p}</span>)}
            </div>

            <div style={{ marginBottom: spacing.lg }}>
              <h3 style={{ color: colors.text, marginBottom: spacing.sm }}>Quick Actions</h3>
              <button onClick={() => setScreen('add-expense')} style={{ ...baseButton, backgroundColor: colors.primary, color: 'white', marginRight: spacing.sm }}>Add Expense</button>
              <button onClick={() => setScreen('settle-up')} style={{ ...baseButton, backgroundColor: colors.success, color: 'white' }}>Settle Up</button>
            </div>

            <div>
              <h3 style={{ color: colors.text, marginBottom: spacing.sm }}>Expenses</h3>
              {getCurrentTrip().expenses.map(exp => (
                <div key={exp.id} style={{ backgroundColor: 'white', padding: spacing.md, marginBottom: spacing.sm, borderRadius: 6, border: `1px solid ${colors.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: 0, color: colors.text, fontWeight: 600 }}>{exp.description}</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#666' }}>{exp.paidBy} paid • Split with {exp.splitBetween.length} people</p>
                    </div>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 'bold', color: colors.primary }}>${exp.amount.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Expense Screen */}
        {screen === 'add-expense' && getCurrentTrip() && (
          <div style={{ maxWidth: 500 }}>
            <h2 style={{ color: colors.text, marginBottom: spacing.md }}>Add Expense</h2>
            <input type="text" placeholder="Description" value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)} style={{ width: '100%', padding: spacing.sm, marginBottom: spacing.sm, border: `1px solid ${colors.border}`, borderRadius: 6, boxSizing: 'border-box' }} />
            <input type="number" placeholder="Amount" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} style={{ width: '100%', padding: spacing.sm, marginBottom: spacing.sm, border: `1px solid ${colors.border}`, borderRadius: 6, boxSizing: 'border-box' }} />
            <select value={expensePaidBy} onChange={e => setExpensePaidBy(e.target.value)} style={{ width: '100%', padding: spacing.sm, marginBottom: spacing.sm, border: `1px solid ${colors.border}`, borderRadius: 6, boxSizing: 'border-box' }}>
              <option value="">Who paid?</option>
              {getCurrentTrip().participants.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <p style={{ color: colors.text, marginBottom: spacing.sm }}>Split between:</p>
            {getCurrentTrip().participants.map(p => (
              <label key={p} style={{ display: 'block', marginBottom: spacing.sm, cursor: 'pointer' }}>
                <input type="checkbox" checked={expenseSplitBetween.includes(p)} onChange={e => {
                  if (e.target.checked) setExpenseSplitBetween([...expenseSplitBetween, p]);
                  else setExpenseSplitBetween(expenseSplitBetween.filter(x => x !== p));
                }} />
                <span style={{ marginLeft: spacing.sm }}>{p}</span>
              </label>
            ))}
            <button onClick={handleAddExpense} style={{ ...baseButton, backgroundColor: colors.primary, color: 'white', width: '100%', marginTop: spacing.md }}>Add Expense</button>
            <button onClick={() => setScreen('trip-detail')} style={{ ...baseButton, backgroundColor: colors.light, color: colors.text, width: '100%', marginTop: spacing.sm }}>Cancel</button>
          </div>
        )}

        {/* Settle Up Screen */}
        {screen === 'settle-up' && getCurrentTrip() && (
          <div>
            <h2 style={{ color: colors.text, marginBottom: spacing.md }}>Settle Up</h2>
            {(() => {
              const balances = calculateBalances(getCurrentTrip());
              const debts = [];
              const people = getCurrentTrip().participants.sort();
              for (let i = 0; i < people.length; i++) {
                for (let j = i + 1; j < people.length; j++) {
                  const diff = balances[people[i]] - balances[people[j]];
                  if (diff > 0.01) debts.push({ from: people[j], to: people[i], amount: diff });
                  else if (diff < -0.01) debts.push({ from: people[i], to: people[j], amount: -diff });
                }
              }
              return debts.map((debt, idx) => {
                const key = `${debt.from}-${debt.to}`;
                const isSettled = getCurrentTrip().settled[key];
                return (
                  <div key={idx} style={{ backgroundColor: 'white', padding: spacing.md, marginBottom: spacing.sm, borderRadius: 6, border: `1px solid ${colors.border}`, opacity: isSettled ? 0.6 : 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ margin: 0, color: colors.text }}><strong>{debt.from}</strong> owes <strong>{debt.to}</strong> <span style={{ color: colors.primary, fontWeight: 'bold' }}>${debt.amount.toFixed(2)}</span></p>
                      <button onClick={() => handleSettleDebt(debt.from, debt.to)} style={{ ...baseButton, backgroundColor: isSettled ? colors.success : colors.light, color: isSettled ? 'white' : colors.text }}>
                        {isSettled ? '✓ Settled' : 'Mark Settled'}
                      </button>
                    </div>
                  </div>
                );
              });
            })()}
            <button onClick={() => setScreen('trip-detail')} style={{ ...baseButton, backgroundColor: colors.light, color: colors.text, width: '100%', marginTop: spacing.md }}>Back</button>
          </div>
        )}
      </div>
    </div>
  );
}
