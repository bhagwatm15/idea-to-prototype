import React, {useState} from "react";

const App = () => {
  // shared styles
  const palette = {
    bg: "#f5f7fa",
    surface: "#ffffff",
    primary: "#2b6cb0",
    accent: "#38a169",
    text: "#2d3748",
    muted: "#a0aec0"
  };
  const layout = {
    container: {fontFamily: "Arial, sans-serif", color: palette.text, background: palette.bg, minHeight: "100vh"},
    header: {padding: "10px 20px", background: palette.surface, borderBottom: `1px solid ${palette.muted}`},
    navBtn: (active) => ({
      padding: "8px 12px",
      margin: "0 4px",
      border: "none",
      background: active ? palette.primary : palette.surface,
      color: active ? "#fff" : palette.text,
      cursor: "pointer"
    }),
    card: {background: palette.surface, padding: "12px", margin: "8px 0", borderRadius: "4px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)"},
    input: {width: "100%", padding: "8px", margin: "6px 0", border: `1px solid ${palette.muted}`, borderRadius: "4px"},
    btn: {padding: "8px 16px", background: palette.accent, color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer"}
  };

  // app state
  const [screen, setScreen] = useState("feed");
  const [decisions, setDecisions] = useState([
    {id:1,title:"Adopt New CI Pipeline",desc:"Switch to GitHub Actions",rationale:"Faster feedback",alt:"Jenkins, CircleCI",stake:"DevOps, QA",tags:["process"],date:"2024-07-01"},
    {id:2,title:"Quarterly Marketing Budget",desc:"Allocate $150k to digital ads",rationale:"Higher ROI",alt:"Print, Events",stake:"Marketing, Finance",tags:["budget"],date:"2024-06-15"},
    {id:3,title:"Remote Work Policy",desc:"Hybrid 3/2 office",rationale:"Employee satisfaction",alt:"Full remote, Full office",stake:"HR, Ops",tags:["policy"],date:"2024-05-20"}
  ]);
  const [selectedId, setSelectedId] = useState(null);
  const emptyForm = {title:"",desc:"",rationale:"",alt:"",stake:"",tags:"",date:""};
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState({keyword:"",tag:"",owner:"",from:"",to:""});

  // helpers
  const saveDecision = () => {
    const newId = decisions.length ? Math.max(...decisions.map(d=>d.id))+1 : 1;
    setDecisions([...decisions,{...form,id:newId}]);
    setForm(emptyForm);
    setScreen("feed");
  };
  const filtered = decisions.filter(d=>{
    const kw = filter.keyword.toLowerCase();
    return (
      (!filter.keyword || d.title.toLowerCase().includes(kw) || d.desc.toLowerCase().includes(kw)) &&
      (!filter.tag || d.tags.includes(filter.tag)) &&
      (!filter.from || d.date >= filter.from) &&
      (!filter.to || d.date <= filter.to)
    );
  });

  // main render
  return (
    <div style={layout.container}>
      <header style={layout.header}>
        <button style={layout.navBtn(screen==="feed")} onClick={()=>setScreen("feed")}>Decision Feed</button>
        <button style={layout.navBtn(screen==="new")} onClick={()=>setScreen("new")}>New Decision</button>
        <button style={layout.navBtn(screen==="search")} onClick={()=>setScreen("search")}>Search & Filter</button>
        <button style={layout.navBtn(screen==="settings")} onClick={()=>setScreen("settings")}>Team Settings</button>
      </header>

      {screen==="feed" && (
        <div style={{padding:"20px"}}>
          <h2>Decision Log</h2>
          {decisions.map(d=>(
            <div key={d.id} style={layout.card} onClick={()=>{setSelectedId(d.id);setScreen("detail");}}>
              <strong>{d.title}</strong>
              <p style={{margin:"4px 0",color:palette.muted}}>{d.date} • {d.tags.join(", ")}</p>
            </div>
          ))}
        </div>
      )}

      {screen==="new" && (
        <div style={{padding:"20px"}}>
          <h2>Log a New Decision</h2>
          <input style={layout.input} placeholder="Title" value={form.title}
            onChange={e=>setForm({...form,title:e.target.value})}/>
          <input style={layout.input} placeholder="Short description" value={form.desc}
            onChange={e=>setForm({...form,desc:e.target.value})}/>
          <input style={layout.input} placeholder="Rationale" value={form.rationale}
            onChange={e=>setForm({...form,rationale:e.target.value})}/>
          <input style={layout.input} placeholder="Alternatives considered" value={form.alt}
            onChange={e=>setForm({...form,alt:e.target.value})}/>
          <input style={layout.input} placeholder="Key stakeholders (comma separated)" value={form.stake}
            onChange={e=>setForm({...form,stake:e.target.value})}/>
          <input style={layout.input} placeholder="Tags (comma separated)" value={form.tags}
            onChange={e=>setForm({...form,tags:e.target.value})}/>
          <input style={layout.input} type="date" value={form.date}
            onChange={e=>setForm({...form,date:e.target.value})}/>
          <button style={layout.btn} onClick={saveDecision}>Save Decision</button>
        </div>
      )}

      {screen==="detail" && (
        <div style={{padding:"20px"}}>
          {(() => {
            const d = decisions.find(x=>x.id===selectedId);
            if (!d) return <p>Not found.</p>;
            return (
              <>
                <h2>{d.title}</h2>
                <p style={{color:palette.muted}}>{d.date} • {d.tags.join(", ")}</p>
                <p><strong>Description:</strong> {d.desc}</p>
                <p><strong>Rationale:</strong> {d.rationale}</p>
                <p><strong>Alternatives:</strong> {d.alt}</p>
                <p><strong>Stakeholders:</strong> {d.stake}</p>
                <button style={layout.btn} onClick={()=>{setScreen("feed");}}>Back to Feed</button>
              </>
            );
          })()}
        </div>
      )}

      {screen==="search" && (
        <div style={{padding:"20px"}}>
          <h2>Search & Filter Decisions</h2>
          <input style={layout.input} placeholder="Keyword" value={filter.keyword}
            onChange={e=>setFilter({...filter,keyword:e.target.value})}/>
          <input style={layout.input} placeholder="Tag" value={filter.tag}
            onChange={e=>setFilter({...filter,tag:e.target.value})}/>
          <input style={layout.input} type="date" placeholder="From" value={filter.from}
            onChange={e=>setFilter({...filter,from:e.target.value})}/>
          <input style={layout.input} type="date" placeholder="To" value={filter.to}
            onChange={e=>setFilter({...filter,to:e.target.value})}/>
          <h3>Results ({filtered.length})</h3>
          {filtered.map(d=>(
            <div key={d.id} style={layout.card} onClick={()=>{setSelectedId(d.id);setScreen("detail");}}>
              <strong>{d.title}</strong>
              <p style={{margin:"4px 0",color:palette.muted}}>{d.date}</p>
            </div>
          ))}
        </div>
      )}

      {screen==="settings" && (
        <div style={{padding:"20px"}}>
          <h2>Team Settings</h2>
          <p><strong>Members:</strong> Alice (Owner), Bob (Editor), Carol (Viewer)</p>
          <p><strong>Tags:</strong> process, budget, policy, design</p>
          <p><strong>Permissions:</strong> Editors can add/update decisions; Viewers can only read.</p>
        </div>
      )}
    </div>
  );
};

export default App;
