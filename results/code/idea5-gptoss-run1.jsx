import React,{useState}from'react';export default function App(){const theme={bg:'#f5faff',primary:'#0066cc',secondary:'#0099ff',text:'#222',card:'#fff',border:'#e0e0e0'};const space={xs:4,sm:8,md:16,lg:24};const btn={padding:space.sm,border:'none',borderRadius:4,color:'#fff',backgroundColor:theme.primary,cursor:'pointer'};const [screen,setScreen]=useState('dashboard');const [tripId,setTripId]=useState(null);const [trips,setTrips]=useState([{id:1,name:'Beach Getaway',participants:['Alice','Bob','Cara'],expenses:[{id:1,desc:'Hotel',amt:300,paidBy:'Alice',split:['Alice','Bob','Cara']},{id:2,desc:'Dinner',amt:90,paidBy:'Bob',split:['Bob','Cara']}]},{id:2,name:'Mountain Hike',participants:['Dan','Eli','Fay'],expenses:[]}]);const getTrip=id=>trips.find(t=>t.id===id);const recalc=(trip)=>{const bal={};trip.participants.forEach(p=>bal[p]=0);trip.expenses.forEach(e=>{const share=e.amt/e.split.length;e.split.forEach(p=>bal[p]-=share);bal[e.paidBy]+=e.amt});return bal};const handleAddExpense=(t,desc,amt,paid,split)=>{const newExp={id:Date.now(),desc,amt:+amt,paidBy:paid,split};const upd={...t,expenses:[...t.expenses,newExp]};setTrips(trips.map(tr=>tr.id===t.id?upd:tr));};const handleSettle=()=>{if(!tripId)return;const t=getTrip(tripId);const cleared={...t,expenses:[]};setTrips(trips.map(tr=>tr.id===t.id?cleared:tr));setScreen('detail');};const renderNav=()=>(
<div style={{display:'flex',justifyContent:'space-around',padding:space.sm,borderTop:`1px solid ${theme.border}`}}>
<button style={btn} onClick={()=>{setScreen('dashboard');setTripId(null)}}>Dashboard</button>
<button style={btn} onClick={()=>setScreen('setup')}>New Trip</button>
</div>
);if(screen==='dashboard'){return(
<div style={{fontFamily:'Arial,sans-serif',backgroundColor:theme.bg,minHeight:'100vh',color:theme.text}}>
<h2 style={{padding:space.md}}>TripTally</h2>
<div style={{padding:space.md}}>
{trips.map(t=>{const bal=recalc(t);const total=Object.values(bal).reduce((a,b)=>a+b,0);return(
<div key=t.id style={{backgroundColor:theme.card,border:`1px solid ${theme.border}`,borderRadius:8,padding:space.md,marginBottom:space.sm}}>
<h3>{t.name}</h3>
<p>Overall balance: ${total.toFixed(2)}</p>
<button style={btn} onClick={()=>{setTripId(t.id);setScreen('detail')}}>Open</button>
</div>
);})}
</div>
{renderNav()}
</div>
); }if(screen==='detail' && tripId){const trip=getTrip(tripId);const bal=recalc(trip);return(
<div style={{fontFamily:'Arial,sans-serif',backgroundColor:theme.bg,minHeight:'100vh',color:theme.text}}>
<h2 style={{padding:space.md}}>{trip.name}</h2>
<div style={{padding:space.md}}>
<h3>Expenses</h3>
{trip.expenses.map(e=>(
<div key=e.id style={{backgroundColor:theme.card,border:`1px solid ${theme.border}`,borderRadius:8,padding:space.sm,marginBottom:space.xs}}>
<strong>{e.desc}</strong> – ${e.amt} paid by {e.paidBy}
</div>
))}
<button style={btn} onClick={()=>setScreen('addExpense')}>Add Expense</button>
<h3 style={{marginTop:space.md}}>Balances</h3>
{trip.participants.map(p=>(
<div key=p style={{padding:space.xs}}>{p}: ${bal[p].toFixed(2)}</div>
))}
<button style={btn} onClick={()=>setScreen('settle')}>Settle Up</button>
</div>
{renderNav()}
</div>
);}if(screen==='addExpense' && tripId){const trip=getTrip(tripId);const [desc,setDesc]=useState('');const [amt,setAmt]=useState('');const [paid,setPaid]=useState(trip.participants[0]);const [split,setSplit]=useState(trip.participants.join(','));return(
<div style={{fontFamily:'Arial,sans-serif',backgroundColor:theme.bg,minHeight:'100vh',color:theme.text}}>
<h2 style={{padding:space.md}}>Add Expense – {trip.name}</h2>
<div style={{padding:space.md}}>
<input placeholder='Description' value={desc} onChange={e=>setDesc(e.target.value)} style={{width:'100%',padding:space.xs,marginBottom:space.sm}}/>
<input placeholder='Amount' type='number' value={amt} onChange={e=>setAmt(e.target.value)} style={{width:'100%',padding:space.xs,marginBottom:space.sm}}/>
<select value={paid} onChange={e=>setPaid(e.target.value)} style={{width:'100%',padding:space.xs,marginBottom:space.sm}}>
{trip.participants.map(p=><option key=p value=p>{p}</option>)}
</select>
<input placeholder='Split (comma separated names)' value={split} onChange={e=>setSplit(e.target.value)} style={{width:'100%',padding:space.xs,marginBottom:space.sm}}/>
<button style={btn} onClick={()=>{handleAddExpense(trip,desc,amt,paid,split.split(',').map(s=>s.trim()));setScreen('detail');}}>Save</button>
</div>
{renderNav()}
</div>
);}if(screen==='settle' && tripId){const trip=getTrip(tripId);const bal=recalc(trip);const debts=Object.entries(bal).filter(([,v])=>v<0);return(
<div style={{fontFamily:'Arial,sans-serif',backgroundColor:theme.bg,minHeight:'100vh',color:theme.text}}>
<h2 style={{padding:space.md}}>Settle Up – {trip.name}</h2>
<div style={{padding:space.md}}>
{debts.length===0?<p>All settled!</p>:debts.map(([who,amt])=>(
<div key=who style={{backgroundColor:theme.card,border:`1px solid ${theme.border}`,borderRadius:8,padding:space.sm,marginBottom:space.xs}}>
{who} owes ${Math.abs(amt).toFixed(2)}
</div>
))}
<button style={btn} onClick={()=>{handleSettle();setTripId(null);setScreen('dashboard');}}>Mark All Paid</button>
</div>
{renderNav()}
</div>
);}if(screen==='setup'){const [name,setName]=useState('');const [list,setList]=useState('');return(
<div style={{fontFamily:'Arial,sans-serif',backgroundColor:theme.bg,minHeight:'100vh',color:theme.text}}>
<h2 style={{padding:space.md}}>Create New Trip</h2>
<div style={{padding:space.md}}>
<input placeholder='Trip name' value={name} onChange={e=>setName(e.target.value)} style={{width:'100%',padding:space.xs,marginBottom:space.sm}}/>
<input placeholder='Participants (comma separated)' value={list} onChange={e=>setList(e.target.value)} style={{width:'100%',padding:space.xs,marginBottom:space.sm}}/>
<button style={btn} onClick={()=>{const participants=list.split(',').map(s=>s.trim()).filter(Boolean);const newTrip={id:Date.now(),name,participants,expenses:[]};setTrips([...trips,newTrip]);setScreen('dashboard');}} >Create</button>
</div>
{renderNav()}
</div>
);}return null;}
