import React, { useState } from "react";

const colors = {
  primary: "#2A9D8F",
  primaryDark: "#1F7A6F",
  accent: "#E76F51",
  bg: "#F7F9FA",
  card: "#FFFFFF",
  text: "#264653",
  subtext: "#6B7C80",
  border: "#E2E8E8",
};

const styles = {
  app: { fontFamily: "'Segoe UI', sans-serif", background: colors.bg, minHeight: "100vh", color: colors.text, maxWidth: 420, margin: "0 auto", paddingBottom: 70 },
  header: { padding: "20px 16px 10px", fontSize: 22, fontWeight: 700, color: colors.primaryDark },
  card: { background: colors.card, borderRadius: 12, padding: 14, margin: "8px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
  label: { fontSize: 13, color: colors.subtext, marginBottom: 4, display: "block" },
  input: { width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, marginBottom: 12, fontSize: 14, boxSizing: "border-box" },
  button: { background: colors.primary, color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  buttonOutline: { background: "#fff", color: colors.primary, border: `1px solid ${colors.primary}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  chip: (active) => ({ display: "inline-block", padding: "6px 12px", borderRadius: 20, marginRight: 6, marginBottom: 6, fontSize: 13, cursor: "pointer", border: `1px solid ${colors.primary}`, background: active ? colors.primary : "#fff", color: active ? "#fff" : colors.primary }),
  tabbar: { position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 420, margin: "0 auto", display: "flex", background: "#fff", borderTop: `1px solid ${colors.border}` },
  tab: (active) => ({ flex: 1, textAlign: "center", padding: "10px 0", fontSize: 11, color: active ? colors.primary : colors.subtext, fontWeight: active ? 700 : 400, cursor: "pointer" }),
};

export default function App() {
  const [screen, setScreen] = useState("dashboard");
  const [trips, setTrips] = useState([
    { id: 1, name: "Lake Tahoe Weekend", dest: "Tahoe, CA", people: ["Maya", "Jordan", "Priya", "Sam"],
      expenses: [
        { id: 1, desc: "Cabin rental", amount: 480, paidBy: "Maya", split: ["Maya", "Jordan", "Priya", "Sam"] },
        { id: 2, desc: "Groceries", amount: 96, paidBy: "Priya", split: ["Maya", "Jordan", "Priya", "Sam"] },
        { id: 3, desc: "Gas", amount: 60, paidBy: "Jordan", split: ["Maya", "Jordan", "Priya", "Sam"] },
      ], settlements: [] },
    { id: 2, name: "Bali Adventure", dest: "Bali, Indonesia", people: ["Chris", "Elena", "Noah"],
      expenses: [ { id: 1, desc: "Villa deposit", amount: 300, paidBy: "Chris", split: ["Chris", "Elena", "Noah"] } ], settlements: [] },
  ]);
  const [activeTripId, setActiveTripId] = useState(1);
  const [tripName, setTripName] = useState("");
  const [peopleInput, setPeopleInput] = useState("");
  const [newPeople, setNewPeople] = useState([]);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitWith, setSplitWith] = useState([]);

  const activeTrip = trips.find((t) => t.id === activeTripId);

  const computeBalances = (trip) => {
    const bal = {};
    trip.people.forEach((p) => (bal[p] = 0));
    trip.expenses.forEach((e) => {
      bal[e.paidBy] += e.amount;
      const share = e.amount / e.split.length;
      e.split.forEach((p) => (bal[p] -= share));
    });
    trip.settlements.forEach((s) => { bal[s.from] += s.amount; bal[s.to] -= s.amount; });
    return bal;
  };

  const computeDebts = (bal) => {
    const creditors = Object.entries(bal).filter(([, v]) => v > 0.01).map(([n, v]) => ({ n, v })).sort((a, b) => b.v - a.v);
    const debtors = Object.entries(bal).filter(([, v]) => v < -0.01).map(([n, v]) => ({ n, v: -v })).sort((a, b) => b.v - a.v);
    const res = [];
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const amt = Math.min(debtors[i].v, creditors[j].v);
      res.push({ from: debtors[i].n, to: creditors[j].n, amount: Math.round(amt * 100) / 100 });
      debtors[i].v -= amt; creditors[j].v -= amt;
      if (debtors[i].v < 0.01) i++;
      if (creditors[j].v < 0.01) j++;
    }
    return res;
  };

  const addTrip = () => {
    if (!tripName || newPeople.length === 0) return;
    const id = Date.now();
    setTrips([...trips, { id, name: tripName, dest: "New destination", people: newPeople, expenses: [], settlements: [] }]);
    setActiveTripId(id); setTripName(""); setNewPeople([]); setPeopleInput(""); setScreen("detail");
  };

  const addExpense = () => {
    if (!desc || !amount || !paidBy || splitWith.length === 0) return;
    const exp = { id: Date.now(), desc, amount: parseFloat(amount), paidBy, split: splitWith };
    setTrips(trips.map((t) => (t.id === activeTripId ? { ...t, expenses: [...t.expenses, exp] } : t)));
    setDesc(""); setAmount(""); setPaidBy(""); setSplitWith([]); setScreen("detail");
  };

  const settleDebt = (d) => {
    setTrips(trips.map((t) => (t.id === activeTripId ? { ...t, settlements: [...t.settlements, d] } : t)));
  };

  return (
    <div style={styles.app}>
      {screen === "dashboard" && (
        <>
          <div style={styles.header}>Your Trips</div>
          {trips.map((t) => {
            const bal = computeBalances(t);
            const snapshot = Object.entries(bal).find(([, v]) => Math.abs(v) > 0.01);
            return (
              <div key={t.id} style={styles.card} onClick={() => { setActiveTripId(t.id); setScreen("detail"); }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{t.name}</div>
                <div style={{ color: colors.subtext, fontSize: 13, marginBottom: 6 }}>{t.dest} · {t.people.length} people</div>
                <div style={{ fontSize: 13, color: snapshot ? (snapshot[1] > 0 ? colors.primary : colors.accent) : colors.subtext }}>
                  {snapshot ? `${snapshot[0]} ${snapshot[1] > 0 ? "is owed" : "owes"} $${Math.abs(snapshot[1]).toFixed(2)}` : "All settled up"}
                </div>
              </div>
            );
          })}
          <div style={{ margin: "16px" }}><button style={styles.button} onClick={() => setScreen("setup")}>+ New Trip</button></div>
        </>
      )}

      {screen === "detail" && activeTrip && (
        <>
          <div style={styles.header}>{activeTrip.name}</div>
          <div style={styles.card}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Balances</div>
            {Object.entries(computeBalances(activeTrip)).map(([n, v]) => (
              <div key={n} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4 }}>
                <span>{n}</span>
                <span style={{ color: v >= 0 ? colors.primary : colors.accent, fontWeight: 600 }}>{v >= 0 ? `+$${v.toFixed(2)}` : `-$${Math.abs(v).toFixed(2)}`}</span>
              </div>
            ))}
          </div>
          <div style={styles.card}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Expenses</div>
            {activeTrip.expenses.map((e) => (
              <div key={e.id} style={{ borderBottom: `1px solid ${colors.border}`, padding: "6px 0", fontSize: 14 }}>
                <div style={{ fontWeight: 600 }}>{e.desc} — ${e.amount.toFixed(2)}</div>
                <div style={{ color: colors.subtext, fontSize: 12 }}>Paid by {e.paidBy} · split {e.split.length} ways</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, margin: "8px 16px" }}>
            <button style={styles.button} onClick={() => setScreen("add")}>+ Add Expense</button>
            <button style={styles.buttonOutline} onClick={() => setScreen("settle")}>Settle Up</button>
          </div>
        </>
      )}

      {screen === "add" && activeTrip && (
        <>
          <div style={styles.header}>Add Expense</div>
          <div style={styles.card}>
            <label style={styles.label}>Description</label>
            <input style={styles.input} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. Dinner at The Shack" />
            <label style={styles.label}>Amount ($)</label>
            <input style={styles.input} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="45.00" type="number" />
            <label style={styles.label}>Paid by</label>
            <div>{activeTrip.people.map((p) => <span key={p} style={styles.chip(paidBy === p)} onClick={() => setPaidBy(p)}>{p}</span>)}</div>
            <label style={{ ...styles.label, marginTop: 10 }}>Split between</label>
            <div>{activeTrip.people.map((p) => (
              <span key={p} style={styles.chip(splitWith.includes(p))} onClick={() => setSplitWith(splitWith.includes(p) ? splitWith.filter((x) => x !== p) : [...splitWith, p])}>{p}</span>
            ))}</div>
            <div style={{ marginTop: 12 }}><button style={styles.button} onClick={addExpense}>Save Expense</button></div>
          </div>
        </>
      )}

      {screen === "settle" && activeTrip && (
        <>
          <div style={styles.header}>Settle Up</div>
          {computeDebts(computeBalances(activeTrip)).length === 0 && <div style={styles.card}>Everyone is settled up! 🎉</div>}
          {computeDebts(computeBalances(activeTrip)).map((d, idx) => (
            <div key={idx} style={styles.card}>
              <div style={{ fontSize: 14, marginBottom: 8 }}><b>{d.from}</b> owes <b>{d.to}</b> <span style={{ color: colors.accent, fontWeight: 700 }}>${d.amount.toFixed(2)}</span></div>
              <button style={styles.buttonOutline} onClick={() => settleDebt(d)}>Mark as Settled</button>
            </div>
          ))}
        </>
      )}

      {screen === "setup" && (
        <>
          <div style={styles.header}>Create a Trip</div>
          <div style={styles.card}>
            <label style={styles.label}>Trip name</label>
            <input style={styles.input} value={tripName} onChange={(e) => setTripName(e.target.value)} placeholder="e.g. Yosemite Camping Trip" />
            <label style={styles.label}>Add participant</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ ...styles.input, flex: 1 }} value={peopleInput} onChange={(e) => setPeopleInput(e.target.value)} placeholder="Name" />
              <button style={styles.buttonOutline} onClick={() => { if (peopleInput) { setNewPeople([...newPeople, peopleInput]); setPeopleInput(""); } }}>Add</button>
            </div>
            <div style={{ marginTop: 8 }}>{newPeople.map((p, i) => <span key={i} style={styles.chip(true)}>{p}</span>)}</div>
            <div style={{ marginTop: 12 }}><button style={styles.button} onClick={addTrip}>Create Trip</button></div>
          </div>
        </>
      )}

      <div style={styles.tabbar}>
        {[["dashboard", "Trips"], ["detail", "Trip"], ["add", "Add"], ["settle", "Settle"], ["setup", "New Trip"]].map(([key, label]) => (
          <div key={key} style={styles.tab(screen === key)} onClick={() => setScreen(key)}>{label}</div>
        ))}
      </div>
    </div>
  );
}
