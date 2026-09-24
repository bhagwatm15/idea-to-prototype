import React, { useState } from 'react';

export default function App() {
  const colors = {
    primary: '#4A90E2',
    success: '#7ED321',
    text: '#333',
    textLight: '#999',
    bg: '#F8F9FA',
    border: '#E8EAED',
    white: '#FFFFFF',
  };

  const spacing = {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  };

  const [screen, setScreen] = useState('dashboard');
  const [trips, setTrips] = useState([
    { id: 1, name: 'Vegas Weekend', participants: ['Alice', 'Bob', 'Charlie'], expenses: 3, balances: { Alice: 45.50, Bob: -22.75, Charlie: -22.75 } },
    { id: 2, name: 'Japan Trip', participants: ['Alice', 'Diana'], expenses: 5, balances: { Alice: -120, Diana: 120 } },
  ]);
  const [selectedTripId, setSelectedTripId] = useState(1);
  const [tripName, setTripName] = useState('');
  const [participants, setParticipants] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expensePaidBy, setExpensePaidBy] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');

  const selectedTrip = trips.find(t => t.id === selectedTripId);

  const handleCreateTrip = () => {
    if (tripName && participants) {
      const newTrip = {
        id: Date.now(),
        name: tripName,
        participants: participants.split(',').map(p => p.trim()),
        expenses: 0,
        balances: {},
      };
      participants.split(',').forEach(p => {
        newTrip.balances[p.trim()] = 0;
      });
      setTrips([...trips, newTrip]);
      setTripName('');
      setParticipants('');
      setScreen('dashboard');
    }
  };

  const handleAddExpense = () => {
    if (expenseAmount && expensePaidBy && selectedTrip) {
      const updatedTrips = trips.map(t => {
        if (t.id === selectedTripId) {
          const amount = parseFloat(expenseAmount);
          const splitAmount = amount / t.participants.length;
          const updatedBalances = { ...t.balances };
          updatedBalances[expensePaidBy] += amount - splitAmount;
          t.participants.forEach(p => {
            if (p !== expensePaidBy) {
              updatedBalances[p] -= splitAmount;
            }
          });
          return {
            ...t,
            expenses: t.expenses + 1,
            balances: updatedBalances,
          };
        }
        return t;
      });
      setTrips(updatedTrips);
      setExpenseAmount('');
      setExpensePaidBy('');
      setExpenseDesc('');
      setScreen('detail');
    }
  };

  const handleSettleDebt = (from, to) => {
    const updatedTrips = trips.map(t => {
      if (t.id === selectedTripId) {
        const updatedBalances = { ...t.balances };
        const debtAmount = Math.abs(updatedBalances[from]);
        updatedBalances[from] = 0;
        updatedBalances[to] = updatedBalances[to] - debtAmount;
        return { ...t, balances: updatedBalances };
      }
      return t;
    });
    setTrips(updatedTrips);
  };

  const baseStyles = {
    container: { padding: spacing.lg, maxWidth: 600, margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif', color: colors.text, backgroundColor: colors.bg, minHeight: '100vh' },
    header: { fontSize: 28, fontWeight: 'bold', marginBottom: spacing.lg, color: colors.text },
    card: { backgroundColor: colors.white, padding: spacing.md, marginBottom: spacing.md, borderRadius: 8, border: `1px solid ${colors.border}` },
    button: { backgroundColor: colors.primary, color: colors.white, border: 'none', padding: `${spacing.sm}px ${spacing.md}px`, borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500 },
    input: { width: '100%', padding: spacing.sm, marginBottom: spacing.sm, border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, boxSizing: 'border-box' },
    text: { fontSize: 14, color: colors.textLight },
  };

  const navStyle = {
    display: 'flex',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
  };

  const navButtonStyle = (isActive) => ({
    ...baseStyles.button,
    backgroundColor: isActive ? colors.primary : colors.border,
    color: isActive ? colors.white : colors.text,
  });

  return (
    <div style={baseStyles.container}>
      {screen !== 'setup' && (
        <div style={navStyle}>
          <button style={navButtonStyle(screen === 'dashboard')} onClick={() => setScreen('dashboard')}>Trips</button>
          {selectedTrip && (
            <>
              <button style={navButtonStyle(screen === 'detail')} onClick={() => setScreen('detail')}>Expenses</button>
              <button style={navButtonStyle(screen === 'expense')} onClick={() => setScreen('expense')}>Add Expense</button>
              <button style={navButtonStyle(screen === 'settle')} onClick={() => setScreen('settle')}>Settle Up</button>
            </>
          )}
          <button style={navButtonStyle(screen === 'setup')} onClick={() => setScreen('setup')}>New Trip</button>
        </div>
      )}

      {screen === 'dashboard' && (
        <div>
          <div style={baseStyles.header}>Your Trips</div>
          {trips.map(trip => (
            <div key={trip.id} style={baseStyles.card} onClick={() => { setSelectedTripId(trip.id); setScreen('detail'); }} style={{ ...baseStyles.card, cursor: 'pointer' }}>
              <div style={{ fontWeight: 600, marginBottom: spacing.sm }}>{trip.name}</div>
              <div style={baseStyles.text}>{trip.participants.length} people • {trip.expenses} expenses</div>
              <div style={{ marginTop: spacing.sm, fontSize: 12, color: colors.success }}>You are owed ${Object.values(trip.balances).filter(b => b > 0).reduce((a, b) => a + b, 0).toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}

      {screen === 'detail' && selectedTrip && (
        <div>
          <div style={baseStyles.header}>{selectedTrip.name}</div>
          <div style={baseStyles.card}>
            <div style={{ fontWeight: 600, marginBottom: spacing.md }}>Balances</div>
            {selectedTrip.participants.map(p => (
              <div key={p} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing.sm, padding: spacing.sm, backgroundColor: colors.bg, borderRadius: 4 }}>
                <span>{p}</span>
                <span style={{ color: selectedTrip.balances[p] > 0 ? colors.success : colors.primary, fontWeight: 500 }}>
                  {selectedTrip.balances[p] > 0 ? '+' : ''} ${selectedTrip.balances[p].toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {screen === 'expense' && selectedTrip && (
        <div>
          <div style={baseStyles.header}>Add Expense</div>
          <div style={baseStyles.card}>
            <label style={{ display: 'block', marginBottom: spacing.sm, fontSize: 12, fontWeight: 500 }}>Description</label>
            <input style={baseStyles.input} type="text" placeholder="e.g. Dinner at restaurant" value={expenseDesc} onChange={(e) => setExpenseDesc(e.target.value)} />
            
            <label style={{ display: 'block', marginBottom: spacing.sm, fontSize: 12, fontWeight: 500 }}>Amount ($)</label>
            <input style={baseStyles.input} type="number" placeholder="0.00" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} />
            
            <label style={{ display: 'block', marginBottom: spacing.sm, fontSize: 12, fontWeight: 500 }}>Who Paid?</label>
            <select style={baseStyles.input} value={expensePaidBy} onChange={(e) => setExpensePaidBy(e.target.value)}>
              <option value="">Select person</option>
              {selectedTrip.participants.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            
            <button style={{ ...baseStyles.button, width: '100%' }} onClick={handleAddExpense}>Split Equally</button>
          </div>
        </div>
      )}

      {screen === 'settle' && selectedTrip && (
        <div>
          <div style={baseStyles.header}>Settle Up</div>
          <div style={baseStyles.card}>
            {selectedTrip.participants.map(person => {
              const balance = selectedTrip.balances[person];
              if (balance < 0) {
                const creditor = selectedTrip.participants.find(p => selectedTrip.balances[p] > 0);
                return (
                  <div key={person} style={{ padding: spacing.md, backgroundColor: colors.bg, borderRadius: 4, marginBottom: spacing.md }}>
                    <div style={{ marginBottom: spacing.sm }}><strong>{person}</strong> owes <strong>{creditor}</strong></div>
                    <div style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary, marginBottom: spacing.md }}>${Math.abs(balance).toFixed(2)}</div>
                    <button style={baseStyles.button} onClick={() => handleSettleDebt(person, creditor)}>Mark as Paid</button>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}

      {screen === 'setup' && (
        <div>
          <div style={baseStyles.header}>Create New Trip</div>
          <div style={baseStyles.card}>
            <label style={{ display: 'block', marginBottom: spacing.sm, fontSize: 12, fontWeight: 500 }}>Trip Name</label>
            <input style={baseStyles.input} type="text" placeholder="e.g. Vegas Weekend" value={tripName} onChange={(e) => setTripName(e.target.value)} />
            
            <label style={{ display: 'block', marginBottom: spacing.sm, fontSize: 12, fontWeight: 500 }}>Participants (comma-separated)</label>
            <input style={baseStyles.input} type="text" placeholder="Alice, Bob, Charlie" value={participants} onChange={(e) => setParticipants(e.target.value)} />
            
            <button style={{ ...baseStyles.button, width: '100%' }} onClick={handleCreateTrip}>Create Trip</button>
          </div>
        </div>
      )}
    </div>
  );
}
