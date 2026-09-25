import React, {useState} from 'react';
export default function App() {
  // ----- shared styles -----
  const colors = {primary:'#4A90E2',bg:'#F9FAFC',text:'#333',accent:'#FF6F61'};
  const spacing = {xs:4, sm:8, md:16, lg:24};
  const style = {
    app:{fontFamily:'Arial,Helvetica,sans-serif',background:colors.bg,color:colors.text,minHeight:'100vh',padding:spacing.lg},
    header:{fontSize:24,marginBottom:spacing.lg,color:colors.primary},
    btn:{padding:`${spacing.sm}px ${spacing.md}px`,margin:spacing.sm,border:'none',borderRadius:4,cursor:'pointer'},
    nav:{position:'fixed',bottom:0,left:0,right:0,background:colors.primary,display:'flex',justifyContent:'space-around',padding:spacing.sm},
    input:{padding:spacing.sm,marginBottom:spacing.sm,width:'100%',boxSizing:'border-box'},
    card:{background:'#fff',borderRadius:6,padding:spacing.md,marginBottom:spacing.md,boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}
  };
  const btnPrimary = {...style.btn,background:colors.primary,color:'#fff'};
  const btnAccent = {...style.btn,background:colors.accent,color:'#fff'};
  // ----- state -----
  const [screen,setScreen]=useState('dashboard'); // dashboard|detail|add|settle|setup
  const [tripIdx,setTripIdx]=useState(null);
  const [trips,setTrips]=useState([
    {
      name:'Beach Getaway',
      participants:['Alice','Bob','Cara'],
      expenses:[
        {desc:'Hotel',amount:300,paidBy:'Alice',split:['Alice','Bob','Cara']},
        {desc:'Dinner',amount:90,paidBy:'Bob',split:['Alice','Bob','Cara']},
        {desc:'Surfboards',amount:60,paidBy:'Cara',split:['Bob','Cara']}
      ]
    },
    {
      name:'Ski Trip',
      participants:['Dan','Eve','Frank'],
      expenses:[
        {desc:'Lift Tickets',amount:450,paidBy:'Dan',split:['Dan','Eve','Frank']},
        {desc:'Cabin',amount:600,paidBy:'Eve',split:['Dan','Eve','Frank']}
      ]
    }
  ]);
  const [newTripName,setNewTripName]=useState('');
  const [newParticipants,setNewParticipants]=useState('');
  const [expDesc,setExpDesc]=useState('');
  const [expAmt,setExpAmt]=useState('');
  const [expPaidBy,setExpPaidBy]=useState('');
  const [expSplit,setExpSplit]=useState('');
  // ----- helpers -----
  const computeBalances = (trip) => {
    const bal = {};
    trip.participants.forEach(p=>bal[p]=0);
    trip.expenses.forEach(e=>{
      const share = e.amount / e.split.length;
      e.split.forEach(p=>bal[p]-=share);
      bal[e.paidBy]+=e.amount;
    });
    return bal;
  };
  const simplifyDebts = (balances) => {
    const owes = [], owed = [];
    Object.entries(balances).forEach(([p,amt])=> (amt<0?owes:{name:p,amt}): (amt>0?owed:{name:p,amt}));
    const list=[];
    owes.forEach(o=>{
      let need = -o.amt;
      for(let i=0;i<owed.length && need>0;i++){
        const r=owed[i];
        if(r.amt===0) continue;
        const pay=Math.min(need,r.amt);
        list.push({from:o.name,to:r.name,amt:pay});
        need-=pay; r.amt-=pay;
      }
    });
    return list;
  };
  // ----- render screens -----
  let body=null;
  if(screen==='dashboard'){
    body=(
      <div>
        <div style={style.header}>Your Trips</div>
        {trips.map((t,i)=>(
          <div key=i style={style.card} onClick={()=>{setTripIdx(i);setScreen('detail');}} >
            <strong>{t.name}</strong><br/>
            Participants: {t.participants.join(', ')}
          </div>
        ))}
        <button style={btnPrimary} onClick={()=>setScreen('setup')}>Create New Trip</button>
      </div>
    );
  } else if(screen==='detail'){
    const trip=trips[tripIdx];
    const balances=computeBalances(trip);
    body=(
      <div>
        <div style={style.header}>{trip.name} – Details</div>
        <div style={style.card}>
          <strong>Expenses</strong>
          {trip.expenses.map((e,ei)=>(
            <div key=ei style={{marginTop:spacing.sm}}>
              {e.desc}: ${e.amount} paid by {e.paidBy} split among {e.split.join(', ')}
            </div>
          ))}
        </div>
        <div style={style.card}>
          <strong>Balances</strong>
          {Object.entries(balances).map(([p,amt])=>(
            <div key=p>{p}: ${amt.toFixed(2)}</div>
          ))}
        </div>
        <button style={btnPrimary} onClick={()=>setScreen('add')}>Add Expense</button>
        <button style={btnAccent} onClick={()=>setScreen('settle')}>Settle Up</button>
        <button style={style.btn} onClick={()=>setScreen('dashboard')}>Back</button>
      </div>
    );
  } else if(screen==='add'){
    const trip=trips[tripIdx];
    const save=()=>{
      const splitArr=expSplit.split(',').map(s=>s.trim()).filter(s=>s);
      const newExp={desc:expDesc,amount:parseFloat(expAmt)||0,paidBy:expPaidBy,split:splitArr};
      const upd=trips.map((t,i)=>i===tripIdx?{...t,expenses:[...t.expenses,newExp]}:t);
      setTrips(upd);
      setExpDesc('');setExpAmt('');setExpPaidBy('');setExpSplit('');
      setScreen('detail');
    };
    body=(
      <div>
        <div style={style.header}>Add Expense – {trip.name}</div>
        <input style={style.input} placeholder="What was bought?" value={expDesc} onChange={e=>setExpDesc(e.target.value)}/>
        <input style={style.input} placeholder="Amount (e.g. 45.60)" value={expAmt} onChange={e=>setExpAmt(e.target.value)}/>
        <input style={style.input} placeholder="Paid by (name)" value={expPaidBy} onChange={e=>setExpPaidBy(e.target.value)}/>
        <input style={style.input} placeholder="Split between (comma list)" value={expSplit} onChange={e=>setExpSplit(e.target.value)}/>
        <button style={btnPrimary} onClick={save}>Save</button>
        <button style={style.btn} onClick={()=>setScreen('detail')}>Cancel</button>
      </div>
    );
  } else if(screen==='settle'){
    const trip=trips[tripIdx];
    const balances=computeBalances(trip);
    const debts=simplifyDebts(balances);
    body=(
      <div>
        <div style={style.header}>Settle Up – {trip.name}</div>
        {debts.length===0 ?
          <div style={style.card}>All settled! 🎉</div> :
          debts.map((d,i)=>(
            <div key=i style={style.card}>
              {d.from} owes {d.to} ${d.amt.toFixed(2)}
              <button style={{...style.btn,marginLeft:spacing.sm}} onClick={()=>{ /* mark as settled placeholder */ }}>Mark Paid</button>
            </div>
          ))
        }
        <button style={style.btn} onClick={()=>setScreen('detail')}>Back</button>
      </div>
    );
  } else if(screen==='setup'){
    const createTrip=()=>{
      const parts=newParticipants.split(',').map(p=>p.trim()).filter(p=>p);
      const newTrip={name:newTripName,participants:parts,expenses:[]};
      setTrips([...trips,newTrip]);
      setNewTripName('');setNewParticipants('');
      setScreen('dashboard');
    };
    body=(
      <div>
        <div style={style.header}>Create New Trip</div>
        <input style={style.input} placeholder="Trip name (e.g. City Escape)" value={newTripName} onChange={e=>setNewTripName(e.target.value)}/>
        <input style={style.input} placeholder="Participants (comma separated)" value={newParticipants} onChange={e=>setNewParticipants(e.target.value)}/>
        <button style={btnPrimary} onClick={createTrip}>Create</button>
        <button style={style.btn} onClick={()=>setScreen('dashboard')}>Cancel</button>
      </div>
    );
  }
  // ----- navigation bar -----
  const navBtn = (label, target) => (
    <button key=label style={{...style.btn,color:'#fff',background:screen===target?colors.accent:colors.primary}} onClick={()=>{setScreen(target);if(target!=='detail')setTripIdx(null);}}>
      {label}
    </button>
  );
  return (
    <div style={style.app}>
      {body}
      <div style={style.nav}>
        {navBtn('Dashboard','dashboard')}
        {navBtn('Setup','setup')}
      </div>
    </div>
  );
}
