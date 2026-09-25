import React, { useState } from "react";

const App = () => {
  // ----- shared styles -----
  const colors = {
    primary: "#4A90E2",
    accent: "#F5A623",
    bg: "#F9F9F9",
    text: "#333",
    light: "#FFF",
  };
  const spacing = {
    s: 8,
    m: 16,
    l: 24,
  };
  const base = {
    container: {
      fontFamily: "Arial, sans-serif",
      background: colors.bg,
      minHeight: "100vh",
      padding: spacing.m,
      color: colors.text,
    },
    header: {
      fontSize: 24,
      marginBottom: spacing.l,
      color: colors.primary,
    },
    button: {
      background: colors.primary,
      color: colors.light,
      border: "none",
      borderRadius: 4,
      padding: `${spacing.s}px ${spacing.m}px`,
      margin: spacing.s,
      cursor: "pointer",
    },
    tabBar: {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: colors.light,
      borderTop: `1px solid ${colors.accent}`,
      display: "flex",
      justifyContent: "space-around",
      padding: spacing.s,
    },
    card: {
      background: colors.light,
      borderRadius: 6,
      padding: spacing.m,
      marginBottom: spacing.m,
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    input: {
      width: "100%",
      padding: spacing.s,
      marginBottom: spacing.s,
      border: `1px solid ${colors.accent}`,
      borderRadius: 4,
    },
  };

  // ----- sample data -----
  const initialTrips = [
    {
      name: "Weekend NYC",
      participants: ["Alice", "Bob", "Cara"],
      expenses: [
        { who: "Alice", amount: 120, split: ["Alice", "Bob", "Cara"] },
        { who: "Bob", amount: 45, split: ["Bob", "Cara"] },
      ],
    },
    {
      name: "Ski Trip Alps",
      participants: ["Dan", "Eve", "Frank"],
      expenses: [{ who: "Eve", amount: 300, split: ["Dan", "Eve", "Frank"] }],
    },
  ];

  const [trips, setTrips] = useState(initialTrips);
  const [screen, setScreen] = useState("dashboard");
  const [activeIdx, setActiveIdx] = useState(0);
  const [newTripName, setNewTripName] = useState("");
  const [newParticipant, setNewParticipant] = useState("");
  const [expense, setExpense] = useState({ who: "", amount: "", split: [] });
  const [settleIdx, setSettleIdx] = useState(null);

  // ----- helpers -----
  const calculateBalances = (trip) => {
    const bal = {};
    trip.participants.forEach((p) => (bal[p] = 0));
    trip.expenses.forEach((e) => {
      const share = e.amount / e.split.length;
      e.split.forEach((p) => {
        bal[p] -= share;
      });
      bal[e.who] += e.amount;
    });
    return bal;
  };

  const balances = calculateBalances(trips[activeIdx]);

  // ----- screens -----
  let content = null;

  if (screen === "dashboard") {
    content = (
      <div>
        <div style={base.header}>Your Trips</div>
        {trips.map((t, i) => (
          <div
            key={i}
            style={base.card}
            onClick={() => {
              setActiveIdx(i);
              setScreen("tripDetail");
            }}
          >
            <strong>{t.name}</strong>
            <div>
              {t.participants.map((p) => (
                <span key={p} style={{ marginRight: spacing.s }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        ))}
        <button
          style={base.button}
          onClick={() => setScreen("tripSetup")}
        >
          + New Trip
        </button>
      </div>
    );
  } else if (screen === "tripDetail") {
    const trip = trips[activeIdx];
    content = (
      <div>
        <div style={base.header}>{trip.name}</div>
        <div style={base.card}>
          <strong>Balances</strong>
          {Object.entries(balances).map(([p, b]) => (
            <div key={p}>
              {p}: {b >= 0 ? "+" : "-"}${Math.abs(b).toFixed(2)}
            </div>
          ))}
        </div>
        <div style={base.card}>
          <strong>Expenses</strong>
          {trip.expenses.map((e, i) => (
            <div key={i} style={{ marginBottom: spacing.s }}>
              {e.who} paid ${e.amount} split among {e.split.join(", ")}
            </div>
          ))}
        </div>
        <button style={base.button} onClick={() => setScreen("addExpense")}>
          Add Expense
        </button>
        <button style={base.button} onClick={() => setScreen("settleUp")}>
          Settle Up
        </button>
      </div>
    );
  } else if (screen === "addExpense") {
    const trip = trips[activeIdx];
    content = (
      <div>
        <div style={base.header}>Add Expense – {trip.name}</div>
        <select
          style={base.input}
          value={expense.who}
          onChange={(e) => setExpense({ ...expense, who: e.target.value })}
        >
          <option value="">Who paid?</option>
          {trip.participants.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <input
          style={base.input}
          type="number"
          placeholder="Amount"
          value={expense.amount}
          onChange={(e) => setExpense({ ...expense, amount: +e.target.value })}
        />
        <div style={{ marginBottom: spacing.s }}>Split between:</div>
        {trip.participants.map((p) => (
          <label key={p} style={{ display: "block", marginBottom: spacing.s / 2 }}>
            <input
              type="checkbox"
              checked={expense.split.includes(p)}
              onChange={(e) => {
                const newSplit = e.target.checked
                  ? [...expense.split, p]
                  : expense.split.filter((x) => x !== p);
                setExpense({ ...expense, split: newSplit });
              }}
            />{" "}
            {p}
          </label>
        ))}
        <button
          style={base.button}
          onClick={() => {
            if (expense.who && expense.amount && expense.split.length) {
              const newTrips = [...trips];
              newTrips[activeIdx].expenses.push({
                who: expense.who,
                amount: expense.amount,
                split: expense.split,
              });
              setTrips(newTrips);
              setExpense({ who: "", amount: "", split: [] });
              setScreen("tripDetail");
            }
          }}
        >
          Save
        </button>
      </div>
    );
  } else if (screen === "settleUp") {
    const debtList = [];
    const names = Object.keys(balances);
    for (let i = 0; i < names.length; i++) {
      for (let j = 0; j < names.length; j++) {
        if (i !== j && balances[names[i]] < 0 && balances[names[j]] > 0) {
          const amount = Math.min(-balances[names[i]], balances[names[j]]);
          if (amount > 0) debtList.push({ from: names[i], to: names[j], amount });
        }
      }
    }
    content = (
      <div>
        <div style={base.header}>Settle Up – {trips[activeIdx].name}</div>
        {debtList.length === 0 ? (
          <div style={base.card}>All settled 🎉</div>
        ) : (
          debtList.map((d, i) => (
            <div key={i} style={base.card}>
              {d.from} owes {d.to} ${d.amount.toFixed(2)}
              <button
                style={{ ...base.button, background: colors.accent, marginLeft: spacing.s }}
                onClick={() => {
                  const newTrips = [...trips];
                  const bal = { ...balances };
                  bal[d.from] += d.amount;
                  bal[d.to] -= d.amount;
                  // Recompute balances by adjusting expenses not needed for demo
                  // Just close this debt visually
                  setSettleIdx(i);
                }}
              >
                Mark Paid
              </button>
            </div>
          ))
        )}
      </div>
    );
  } else if (screen === "tripSetup") {
    const current = trips[activeIdx] || { participants: [] };
    content = (
      <div>
        <div style={base.header}>Create New Trip</div>
        <input
          style={base.input}
          placeholder="Trip name"
          value={newTripName}
          onChange={(e) => setNewTripName(e.target.value)}
        />
        <input
          style={base.input}
          placeholder="Add participant"
          value={newParticipant}
          onChange={(e) => setNewParticipant(e.target.value)}
        />
        <button
          style={base.button}
          onClick={() => {
            if (newParticipant) {
              current.participants = [...current.participants, newParticipant];
              setNewParticipant("");
            }
          }}
        >
          + Participant
        </button>
        <div style={base.card}>
          {current.participants.map((p, i) => (
            <div key={i}>{p}</div>
          ))}
        </div>
        <button
          style={base.button}
          onClick={() => {
            if (newTripName && current.participants.length) {
              setTrips([...trips, { name: newTripName, participants: current.participants, expenses: [] }]);
              setNewTripName("");
              setNewParticipant("");
              setScreen("dashboard");
            }
          }}
        >
          Create Trip
        </button>
      </div>
    );
  }

  // ----- navigation bar -----
  const tabs = [
    { id: "dashboard", label: "Trips" },
    { id: "tripSetup", label: "New Trip" },
  ];
  return (
    <div style={base.container}>
      {content}
      <div style={base.tabBar}>
        {tabs.map((t) => (
          <button
            key={t.id}
            style={{
              ...base.button,
              background: screen === t.id ? colors.accent : colors.primary,
            }}
            onClick={() => setScreen(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
