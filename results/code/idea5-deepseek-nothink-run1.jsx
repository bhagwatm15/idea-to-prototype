import React, { useState } from "react";

const T = {
  teal: "#0F8C78",
  tealLight: "#E6F5F2",
  navy: "#1D3557",
  gray: "#6B7A8F",
  line: "#E3E8EE",
  white: "#FFFFFF",
  bg: "#F6F8FA",
  green: "#2BA84A",
  amber: "#E8A23D",
};

const s = {
  app: { fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", background: T.bg, minHeight: "100vh", color: T.navy, maxWidth: 480, margin: "0 auto" },
  pad: { padding: 18 },
  header: { padding: "18px 18px 12px", fontSize: 22, fontWeight: 700, letterSpacing: -0.3 },
  card: { background: T.white, borderRadius: 14, padding: 16, border: `1px solid ${T.line}`, marginBottom: 12 },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  sub: { color: T.gray, fontSize: 13, marginTop: 3 },
  btn: { background: T.teal, color: T.white, border: "none", borderRadius: 10, padding: "11px 16px", fontSize: 15, fontWeight: 600, cursor: "pointer", width: "100%" },
  btnGhost: { background: T.tealLight, color: T.teal, border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  input: { width: "100%", boxSizing: "border-box", padding: "11px 12px", borderRadius: 10, border: `1px solid ${T.line}`, fontSize: 15, marginTop: 6, marginBottom: 12, background: T.white, color: T.navy },
  label: { fontSize: 13, fontWeight: 600, color: T.gray },
  nav: { position: "sticky", bottom: 0, display: "flex", background: T.white, borderTop: `1px solid ${T.line}` },
  tab: { flex: 1, padding: "12px 0", textAlign: "center", fontSize: 12, fontWeight: 600, cursor: "pointer", background: "none", border: "none" },
  initials: { width: 34, height: 34, borderRadius: "50%", background: T.tealLight, color: T.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, marginRight: 10 },
};

const money = (n) => (n < 0 ? "-$" : "$") + Math.abs(n).toFixed(2);
const uid = (a) => a.split(" ").map((x) => x[0]).join("");

export default function App() {
  const [screen, setScreen] = useState("dashboard");
  const [trips, setTrips] = useState([
    { id: 1, name: "Napa Wine Weekend", people: ["Maya Chen", "Jon Park", "Priya Patel", "Alex Rivera"], balances: { "Maya Chen": 84.5, "Jon Park": -32.25, "Priya Patel": -52.25, "Alex Rivera": 0 } },
    { id: 2, name: "Denver Ski Trip", people: ["Maya Chen", "Jon Park", "Sam Ortiz"], balances: { "Maya Chen": -45, "Jon Park": 62, "Sam Ortiz": -17 } },
  ]);
  const [activeTrip, setActiveTrip] = useState(0);
  const trip = trips[activeTrip];

  const expenses = {
    1: [
      { id: 1, desc: "Farmhouse dinner", amount: 156, paid: "Maya Chen", split: 4 },
      { id: 2, desc: "Vineyard tasting", amount: 89, paid: "Priya Patel", split: 4 },
      { id: 3, desc: "Airbnb (2 nights)", amount: 420, paid: "Jon Park", split: 4 },
    ],
    2: [
      { id: 1, desc: "Cabin rental", amount: 540, paid: "Jon Park", split: 3 },
      { id: 2, desc: "Lift tickets", amount: 240, paid: "Maya Chen", split: 3 },
      { id: 3, desc: "Groceries", amount: 78, paid: "Sam Ortiz", split: 3 },
    ],
  };
  const [newExp, setNewExp] = useState({ desc: "", amount: "", paid: trip.people[0] });
  const [settled, setSettled] = useState({});

  const debtsFor = (t) => {
    const owed = Object.entries(t.balances).filter(([, v]) => v < 0).map(([k, v]) => [k, -v]);
    const owedTo = Object.entries(t.balances).filter(([, v]) => v > 0).map(([k, v]) => [k, v]);
    const out = [];
    let i = 0, j = 0;
    while (i < owed.length && j < owedTo.length) {
      const amt = Math.min(owed[i][1], owedTo[j][1]);
      out.push({ from: owed[i][0], to: owedTo[j][0], amount: amt });
      owed[i][1] -= amt; owedTo[j][1] -= amt;
      if (owed[i][1] < 0.01) i++;
      if (owedTo[j][1] < 0.01) j++;
    }
    return out;
  };

  const tabs = [["dashboard", "Trips"], ["detail", "Expenses"], ["settle", "Settle"], ["setup", "New Trip"]];

  const Nav = (
    <div style={s.nav}>
      {tabs.map(([k, l]) => (
        <button key={k} style={{ ...s.tab, color: screen === k ? T.teal : T.gray }} onClick={() => setScreen(k)}>{l}</button>
      ))}
    </div>
  );

  if (screen === "dashboard") {
    return (
      <div style={s.app}>
        <div style={s.header}>TripTally</div>
        <div style={s.pad}>
          <div style={{ ...s.sub, marginBottom: 12 }}>Your active trips</div>
          {trips.map((t, i) => {
            const you = t.balances["Maya Chen"];
            const pos = you >= 0;
            return (
              <div key={t.id} style={{ ...s.card, cursor: "pointer" }} onClick={() => { setActiveTrip(i); setScreen("detail"); }}>
                <div style={s.row}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{t.name}</div>
                  <span style={{ fontSize: 13, color: T.gray }}>{t.people.length} people</span>
                </div>
                <div style={{ ...s.row, marginTop: 10 }}>
                  <span style={{ fontSize: 13, color: T.gray }}>{t.people.slice(0, 2).join(", ")}{t.people.length > 2 ? ` +${t.people.length - 2}` : ""}</span>
                  <span style={{ fontWeight: 700, color: pos ? T.green : T.amber }}>{pos ? "you are owed " : "you owe "}{money(Math.abs(you))}</span>
                </div>
              </div>
            );
          })}
          <button style={s.btn} onClick={() => setScreen("setup")}>+ Create a new trip</button>
        </div>
        {Nav}
      </div>
    );
  }

  if (screen === "detail") {
    return (
      <div style={s.app}>
        <div style={s.header}>{trip.name}</div>
        <div style={s.pad}>
          <div style={s.card}>
            <div style={{ ...s.label, marginBottom: 8 }}>PARTICIPANT BALANCES</div>
            {trip.people.map((p) => (
              <div key={p} style={{ ...s.row, marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={s.initials}>{uid(p)}</div>
                  <span style={{ fontWeight: 600 }}>{p}{p === "Maya Chen" ? " (you)" : ""}</span>
                </div>
                <span style={{ fontWeight: 700, color: trip.balances[p] >= 0 ? T.green : T.amber }}>
                  {trip.balances[p] >= 0 ? "+" : ""}{money(trip.balances[p]).replace("-", "-")}
                </span>
              </div>
            ))}
          </div>
          <div style={{ ...s.row, margin: "18px 0 10px" }}>
            <span style={{ fontWeight: 700 }}>Expenses</span>
            <button style={s.btnGhost} onClick={() => setScreen("add")}>+ Add expense</button>
          </div>
          {expenses[trip.id].map((e) => (
            <div key={e.id} style={{ ...s.card, marginBottom: 8 }}>
              <div style={s.row}>
                <span style={{ fontWeight: 600 }}>{e.desc}</span>
                <span style={{ fontWeight: 700 }}>{money(e.amount)}</span>
              </div>
              <div style={s.sub}>{e.paid} paid · split {e.split} ways · {money(e.amount / e.split)}/person</div>
            </div>
          ))}
        </div>
        {Nav}
      </div>
    );
  }

  if (screen === "add") {
    return (
      <div style={s.app}>
        <div style={s.header}>Add Expense</div>
        <div style={s.pad}>
          <div style={s.label}>WHAT WAS IT FOR?</div>
          <input style={s.input} placeholder="e.g. Coffee run" value={newExp.desc} onChange={(e) => setNewExp({ ...newExp, desc: e.target.value })} />
          <div style={s.label}>AMOUNT</div>
          <input style={s.input} placeholder="0.00" value={newExp.amount} onChange={(e) => setNewExp({ ...newExp, amount: e.target.value })} />
          <div style={s.label}>PAID BY</div>
          <select style={s.input} value={newExp.paid} onChange={(e) => setNewExp({ ...newExp, paid: e.target.value })}>
            {trip.people.map((p) => <option key={p}>{p}</option>)}
          </select>
          <div style={{ ...s.card, background: T.tealLight, border: "none" }}>
            <div style={{ ...s.row, fontSize: 13, color: T.teal, fontWeight: 600 }}>
              <span>Split equally</span><span>{trip.people.length} people</span>
            </div>
          </div>
          <button style={s.btn} onClick={() => { setScreen("detail"); }}>Save Expense</button>
          <button style={{ ...s.btnGhost, marginTop: 8, width: "100%" }} onClick={() => setScreen("detail")}>Cancel</button>
        </div>
        {Nav}
      </div>
    );
  }

  if (screen === "settle") {
    return (
      <div style={s.app}>
        <div style={s.header}>Settle Up</div>
        <div style={s.pad}>
          <div style={{ ...s.sub, marginBottom: 12 }}>{trip.name} — simplified debts</div>
          {debtsFor(trip).length === 0 ? (
            <div style={{ ...s.card, textAlign: "center", color: T.green, fontWeight: 600 }}>All settled up!</div>
          ) : debtsFor(trip).map((d, i) => {
            const key = `${trip.id}-${d.from}-${d.to}-${i}`;
            const done = settled[key];
            return (
              <div key={key} style={{ ...s.card, marginBottom: 8, opacity: done ? 0.55 : 1 }}>
                <div style={s.row}>
                  <span><b>{d.from}</b> <span style={{ color: T.gray }}>owes</span> <b>{d.to}</b></span>
                  <span style={{ fontWeight: 700 }}>{money(d.amount)}</span>
                </div>
                <button style={{ ...s.btn, marginTop: 10, background: done ? T.green : T.teal }} onClick={() => setSettled({ ...settled, [key]: !done })}>
                  {done ? "Settled ✓" : "Mark as settled"}
                </button>
              </div>
            );
          })}
        </div>
        {Nav}
      </div>
    );
  }

  return (
    <div style={s.app}>
      <div style={s.header}>New Trip</div>
      <div style={s.pad}>
        <div style={s.label}>TRIP NAME</div>
        <input style={s.input} placeholder="e.g. Tahoe Cabin Retreat" />
        <div style={s.label}>PARTICIPANTS</div>
        <div style={{ ...s.card, padding: 10 }}>
          {["Maya Chen (you)", "Jon Park", "Priya Patel"].map((p) => (
            <div key={p} style={{ ...s.row, padding: "6px 4px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={s.initials}>{uid(p)}</div>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{p}</span>
              </div>
              <span style={{ color: T.gray, cursor: "pointer" }}>✕</span>
            </div>
          ))}
        </div>
        <input style={s.input} placeholder="+ Add by name or email" />
        <button style={s.btn} onClick={() => setScreen("dashboard")}>Create Trip</button>
      </div>
      {Nav}
    </div>
  );
}
