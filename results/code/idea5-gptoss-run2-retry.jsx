import React, { useState } from "react";

const primary = "#2F8F9D";
const accent = "#F2C94C";
const bg = "#FAFAFA";
const text = "#333";
const lightText = "#777";

const container = { maxWidth: 600, margin: "0 auto", padding: 20, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: text };
const header = { fontSize: 24, fontWeight: 600, marginBottom: 12 };
const subHeader = { fontSize: 18, fontWeight: 500, margin: "12px 0 8px" };
const button = { padding: "8px 16px", margin: 4, background: primary, color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" };
const navBar = { position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #ddd", display: "flex", justifyContent: "space-around", padding: 8 };
const input = { width: "100%", padding: 8, marginBottom: 8, border: "1px solid #ccc", borderRadius: 4 };
const label = { fontSize: 14, marginBottom: 4, display: "block", color: lightText };

export default function App() {
  const screens = ["Dashboard", "Detail", "AddExpense", "Settle", "Setup"];
  const [screen, setScreen] = useState("Dashboard");
  const [trips] = useState([
    { id: 1, name: "Beach Getaway", balance: -45 },
    { id: 2, name: "Mountain Hike", balance: 30 },
    { id: 3, name: "City Food Tour", balance: 0 }
  ]);
  const [selectedTrip] = useState(trips[0]);
  const [expenses] = useState([
    { id: 1, description: "Hotel", amount: 300, payer: "Alice", split: ["Alice", "Bob", "Charlie"] },
    { id: 2, description: "Dinner", amount: 120, payer: "Bob", split: ["Alice", "Bob", "Charlie"] },
    { id: 3, description: "Kayak Rental", amount: 90, payer: "Charlie", split: ["Bob", "Charlie"] }
  ]);
  const [participants] = useState(["Alice", "Bob", "Charlie"]);
  const [debts] = useState([
    { from: "Alice", to: "Bob", amount: 30 },
    { from: "Charlie", to: "Alice", amount: 15 }
  ]);

  const renderDashboard = () => (
    <div>
      <div style={header}>Your Trips</div>
      {trips.map(t => (
        <div key={t.id} style={{ padding: 8, borderBottom: "1px solid #eee" }}>
          <strong>{t.name}</strong>
          <span style={{ float: "right", color: t.balance < 0 ? "#D9534F" : "#5CB85C" }}>
            {t.balance < 0 ? `Owes $${-t.balance}` : t.balance > 0 ? `Gets $${t.balance}` : "Settled"}
          </span>
        </div>
      ))}
    </div>
  );

  const renderDetail = () => (
    <div>
      <div style={header}>{selectedTrip.name} Details</div>
      <div style={subHeader}>Expenses</div>
      {expenses.map(e => (
        <div key={e.id} style={{ marginBottom: 8, padding: 8, background: "#fff", borderRadius: 4, boxShadow: "0 1px 3px rgba(0,0,0,.1)" }}>
          <div><strong>{e.description}</strong> – ${e.amount}</div>
          <div style={{ fontSize: 12, color: lightText }}>Paid by {e.payer}; split among {e.split.join(", ")}</div>
        </div>
      ))}
      <div style={subHeader}>Current Balances</div>
      {participants.map(p => {
        const bal = participants.indexOf(p) * 10 - 10; // placeholder calc
        return (
          <div key={p} style={{ padding: 4 }}>
            {p}: <span style={{ color: bal < 0 ? "#D9534F" : "#5CB85C" }}>{bal < 0 ? `owes $${-bal}` : `gets $${bal}`}</span>
          </div>
        );
      })}
    </div>
  );

  const renderAddExpense = () => (
    <div>
      <div style={header}>Add Expense</div>
      <label style={label}>Description</label>
      <input style={input} placeholder="e.g., Dinner at Seaside" />
      <label style={label}>Amount ($)</label>
      <input style={input} type="number" placeholder="120" />
      <label style={label}>Who paid?</label>
      <select style={input}>
        {participants.map(p => <option key={p}>{p}</option>)}
      </select>
      <label style={label}>Split method</label>
      <select style={input}>
        <option>Evenly</option>
        <option>Exact amounts</option>
      </select>
      <button style={button}>Save Expense</button>
    </div>
  );

  const renderSettle = () => (
    <div>
      <div style={header}>Settle Up</div>
      {debts.map((d, i) => (
        <div key={i} style={{ padding: 8, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{d.from} owes {d.to} ${d.amount}</span>
          <button style={{ ...button, background: accent, color: "#333" }}>Mark Paid</button>
        </div>
      ))}
    </div>
  );

  const renderSetup = () => (
    <div>
      <div style={header}>Create New Trip</div>
      <label style={label}>Trip name</label>
      <input style={input} placeholder="e.g., Summer Road Trip" />
      <label style={label}>Participants (comma separated)</label>
      <input style={input} placeholder="Alice, Bob, Charlie" />
      <button style={button}>Create Trip</button>
    </div>
  );

  const renderScreen = () => {
    switch (screen) {
      case "Dashboard": return renderDashboard();
      case "Detail": return renderDetail();
      case "AddExpense": return renderAddExpense();
      case "Settle": return renderSettle();
      case "Setup": return renderSetup();
      default: return null;
    }
  };

  return (
    <div style={{ ...container, background: bg, minHeight: "100vh", paddingBottom: 60 }}>
      {renderScreen()}
      <div style={navBar}>
        {screens.map(s => (
          <button
            key={s}
            onClick={() => setScreen(s)}
            style={{ ...button, background: screen === s ? primary : "#ddd", color: screen === s ? "#fff" : "#333" }}
          >
            {s === "AddExpense" ? "Add" : s}
          </button>
        ))}
      </div>
    </div>
  );
}
