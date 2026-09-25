import React, { useState } from "react";

export default function App() {
  const C = { bg:"#f6f8fb", card:"#fff", pri:"#2f6f4f", priL:"#e3f1e9", text:"#1f2a33", sub:"#66788a", line:"#e3e8ee", warn:"#c2410c", ok:"#2f6f4f" };
  const S = {
    screen:{ minHeight:"100vh", background:C.bg, fontFamily:"'Segoe UI', Roboto, system-ui, sans-serif", color:C.text, paddingBottom:70 },
    wrap:{ maxWidth:520, margin:"0 auto", padding:"18px 16px" },
    h1:{ fontSize:22, fontWeight:700, margin:"0 0 4px" },
    sub:{ fontSize:13, color:C.sub, margin:"0 0 16px" },
    card:{ background:C.card, borderRadius:14, padding:14, marginBottom:10, boxShadow:"0 1px 3px rgba(20,40,60,.07)", border:`1px solid ${C.line}` },
    row:{ display:"flex", justifyContent:"space-between", alignItems:"center" },
    name:{ fontWeight:600, fontSize:15 },
    amt:{ fontWeight:700, fontSize:15 },
    small:{ fontSize:12, color:C.sub },
    btn:{ background:C.pri, color:"#fff", border:"none", borderRadius:10, padding:"11px 16px", fontSize:14, fontWeight:600, cursor:"pointer", width:"100%" },
    btn2:{ background:C.priL, color:C.pri, border:"none", borderRadius:10, padding:"9px 14px", fontSize:13, fontWeight:600, cursor:"pointer" },
    input:{ width:"100%", boxSizing:"border-box", padding:"10px 12px", borderRadius:10, border:`1px solid ${C.line}`, fontSize:14, marginBottom:10, background:"#fff", color:C.text },
    chip:{ display:"inline-block", background:C.priL, color:C.pri, borderRadius:20, padding:"4px 10px", fontSize:12, fontWeight:600, margin:"0 6px 6px 0" },
    nav:{ position:"fixed", bottom:0, left:0, right:0, background:"#fff", borderTop:`1px solid ${C.line}`, display:"flex", justifyContent:"space-around", padding:"8px 0 10px" },
    navItem:{ background:"none", border:"none", fontSize:11, fontWeight:600, cursor:"pointer", color:C.sub, padding:"4px 10px" },
  };

  const [screen, setScreen] = useState("dashboard");
  const [settled, setSettled] = useState([]);
  const [newName, setNewName] = useState("");
  const [people, setPeople] = useState(["Maya","Jonas","Priya","Theo"]);
  const [amount, setAmount] = useState("");

  const trips = [
    { id:1, name:"Lisbon Getaway", dates:"May 14 – 19", total:842.5, you:"+128.40" },
    { id:2, name:"Ski Weekend", dates:"Feb 2 – 4", total:615.0, you:"–64.00" },
    { id:3, name:"Office Lunch Club", dates:"Ongoing", total:212.75, you:"0.00" },
  ];
  const expenses = [
    { who:"Maya", desc:"Airbnb — 3 nights", amt:480.0, split:"4 people" },
    { who:"Jonas", desc:"Grocery run (Pingo Doce)", amt:96.4, split:"4 people" },
    { who:"You", desc:"Tram 28 tickets", amt:27.0, split:"3 people" },
    { who:"Priya", desc:"Dinner at Cervejaria Ramiro", amt:159.1, split:"4 people" },
  ];
  const balances = [
    { n:"Maya", b:"+112.50" }, { n:"Jonas", b:"+28.00" }, { n:"Priya", b:"–16.40" }, { n:"You", b:"–124.10" },
  ];
  const debtsBase = [
    { id:"d1", from:"You", to:"Maya", amt:96.5 },
    { id:"d2", from:"You", to:"Jonas", amt:27.6 },
    { id:"d3", from:"Priya", to:"Maya", amt:16.4 },
  ];
  const debts = debtsBase.filter(d => !settled.includes(d.id));

  const toggle = id => setSettled(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id]);

  const Tab = ({k,label}) => (
    <button style={{...S.navItem, color: screen===k ? C.pri : C.sub}} onClick={()=>setScreen(k)}>{label}</button>
  );

  let body;
  if (screen === "dashboard") {
    body = <>
      <h1>TripTally</h1>
      <p style={S.sub}>Split trip costs without the awkward math.</p>
      <button style={{...S.btn, marginBottom:14}} onClick={()=>setScreen("setup")}>+ New Trip</button>
      {trips.map(t => (
        <div key={t.id} style={S.card} onClick={()=>setScreen("detail")}>
          <div style={S.row}>
            <div>
              <div style={S.name}>{t.name}</div>
              <div style={S.small}>{t.dates} · ${t.total.toFixed(2)} total</div>
            </div>
            <div style={{...S.amt, color: t.you.startsWith("+") ? C.ok : t.you.startsWith("–") ? C.warn : C.sub}}>
              {t.you === "0.00" ? "settled" : t.you.startsWith("+") ? `you're owed $${t.you.slice(1)}` : `you owe $${t.you.slice(1)}`}
            </div>
          </div>
        </div>
      ))}
    </>;
  } else if (screen === "detail") {
    body = <>
      <h1>Lisbon Getaway</h1>
      <p style={S.sub}>May 14 – 19 · 4 travelers</p>
      <div style={S.card}>
        <div style={{...S.name, marginBottom:8}}>Balances</div>
        {balances.map(p => (
          <div key={p.n} style={{...S.row, padding:"3px 0"}}>
            <span style={S.small}>{p.n}</span>
            <span style={{fontWeight:600, fontSize:13, color:p.b.startsWith("+") ? C.ok : C.warn}}>{p.b}</span>
          </div>
        ))}
      </div>
      <div style={S.card}>
        <div style={{...S.name, marginBottom:8}}>Expenses</div>
        {expenses.map((e,i) => (
          <div key={i} style={{...S.row, padding:"7px 0", borderTop: i? `1px solid ${C.line}`:"none"}}>
            <div>
              <div style={{fontSize:14, fontWeight:600}}>{e.desc}</div>
              <div style={S.small}>{e.who} paid · split {e.split}</div>
            </div>
            <div style={S.amt}>${e.amt.toFixed(2)}</div>
          </div>
        ))}
      </div>
      <button style={S.btn2} onClick={()=>setScreen("settle")}>Settle up →</button>
    </>;
  } else if (screen === "add") {
    body = <>
      <h1>Add Expense</h1>
      <p style={S.sub}>Lisbon Getaway</p>
      <div style={S.card}>
        <input style={S.input} placeholder="What was it for?" defaultValue="Taxi to Belém" />
        <input style={S.input} placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} />
        <div style={S.small}>Paid by</div>
        <div style={{marginTop:8, marginBottom:12}}>{people.map(p=><span key={p} style={S.chip}>{p}</span>)}</div>
        <div style={S.small}>Split between</div>
        <div style={{marginTop:8}}>{(people).map(p=><span key={p} style={S.chip}>{p}</span>)}</div>
        <div style={{...S.small, marginTop:6}}>Split evenly — ${amount ? (Number(amount)/people.length).toFixed(2) : "0.00"} each</div>
      </div>
      <button style={S.btn} onClick={()=>setScreen("detail")}>Save Expense</button>
    </>;
  } else if (screen === "settle") {
    body = <>
      <h1>Settle Up</h1>
      <p style={S.sub}>Simplified debts for Lisbon Getaway</p>
      {debts.length === 0 && <div style={S.card}><div style={S.name}>All settled 🎉</div><div style={S.small}>Everyone's square.</div></div>}
      {debts.map(d => (
        <div key={d.id} style={S.card}>
          <div style={S.row}>
            <div>
              <div style={S.name}>{d.from} → {d.to}</div>
              <div style={S.small}>Mark as paid once you've transferred</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={S.amt}>${d.amt.toFixed(2)}</div>
              <button style={{...S.btn2, marginTop:6}} onClick={()=>toggle(d.id)}>Mark paid</button>
            </div>
          </div>
        </div>
      ))}
      {settled.length>0 && <button style={S.btn2} onClick={()=>setSettled([])}>Undo all settled</button>}
    </>;
  } else {
    body = <>
      <h1>New Trip</h1>
      <p style={S.sub}>Name it and add your travel crew.</p>
      <div style={S.card}>
        <input style={S.input} placeholder="Trip name" defaultValue="Barcelona Long Weekend" />
        <input style={S.input} placeholder="Add a person's name" value={newName} onChange={e=>setNewName(e.target.value)} />
        <button style={S.btn2} onClick={()=>{ if(newName.trim()){ setPeople([...people, newName.trim()]); setNewName(""); } }}>+ Add participant</button>
        <div style={{marginTop:12}}>
          {people.map(p => <span key={p} style={S.chip}>{p}</span>)}
        </div>
      </div>
      <button style={S.btn} onClick={()=>setScreen("dashboard")}>Create Trip</button>
    </>;
  }

  return (
    <div style={S.screen}>
      <div style={S.wrap}>{body}</div>
      <div style={S.nav}>
        <Tab k="dashboard" label="Trips" />
        <Tab k="detail" label="Detail" />
        <Tab k="add" label="Add" />
        <Tab k="settle" label="Settle" />
        <Tab k="setup" label="New" />
      </div>
    </div>
  );
}
