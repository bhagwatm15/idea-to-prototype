import React, {useState} from "react";

const colors = {
  primary: "#2C3E50",
  secondary: "#34495E",
  accent: "#2980B9",
  bg: "#ECF0F1",
  card: "#FFFFFF",
  text: "#2C3E50"
};
const spacing = {p: 12, m: 12, r: 8, br: 4};
const btnStyle = {
  background: colors.accent,
  color: "#fff",
  border: "none",
  padding: `${spacing.p}px ${spacing.p * 2}px`,
  margin: spacing.r,
  borderRadius: spacing.br,
  cursor: "pointer"
};
const inputStyle = {
  width: "100%",
  padding: spacing.p,
  marginBottom: spacing.m,
  border: `1px solid ${colors.secondary}`,
  borderRadius: spacing.br,
  fontSize: 14
};

export default function App() {
  const [screen, setScreen] = useState("feed");
  const [decisions, setDecisions] = useState([
    {
      id: 1,
      title: "Adopt React 18",
      desc: "Upgrade UI library to React 18 for concurrent features.",
      rationale: "Improved performance and future‑proofing.",
      alternatives: ["Stay on 17", "Switch to Vue"],
      stakeholders: ["Alice", "Bob"],
      tags: ["frontend", "upgrade"],
      date: "2024-08-01",
      owner: "Alice",
      updates: ["Reviewed by team on 08/05."]
    },
    {
      id: 2,
      title: "Select Cloud Provider",
      desc: "Choose primary infrastructure host.",
      rationale: "Cost, compliance, and latency considerations.",
      alternatives: ["AWS", "GCP", "Azure"],
      stakeholders: ["Carol", "Dave"],
      tags: ["ops", "infrastructure"],
      date: "2024-07-15",
      owner: "Carol",
      updates: []
    },
    {
      id: 3,
      title: "Introduce Code Review Policy",
      desc: "Make peer reviews mandatory for all PRs.",
      rationale: "Raise code quality and knowledge sharing.",
      alternatives: ["Optional reviews", "Automated checks only"],
      stakeholders: ["Eve"],
      tags: ["process"],
      date: "2024-06-20",
      owner: "Eve",
      updates: ["Policy rolled out 06/30."]
    }
  ]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [team, setTeam] = useState(["Alice", "Bob", "Carol", "Dave", "Eve"]);
  const [tags, setTags] = useState(["frontend", "upgrade", "ops", "infrastructure", "process"]);

  // New Decision form state
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [rationale, setRationale] = useState("");
  const [alternatives, setAlternatives] = useState("");
  const [stakeholders, setStakeholders] = useState("");
  const [tagSelect, setTagSelect] = useState("");
  const [date, setDate] = useState("");

  const filtered = decisions.filter(d => {
    const matchText = d.title.toLowerCase().includes(search.toLowerCase()) ||
                      d.desc.toLowerCase().includes(search.toLowerCase());
    const matchTag = filterTag ? d.tags.includes(filterTag) : true;
    return matchText && matchTag;
  });

  const nav = (
    <div style={{display:"flex", background:colors.primary, padding:spacing.p}}>
      {["feed","new","search","team"].map(k=>(
        <button key=k style={{...btnStyle, background:screen===k?colors.accent:colors.secondary}} onClick={()=>{setScreen(k);setSelected(null);}}>{k==="feed"?"Decision Feed":k==="new"?"New Decision":k==="search"?"Search/Filter":k==="team"?"Team Settings":k}</button>
      ))}
    </div>
  );

  let body;
  if (screen==="feed") {
    body = (
      <div style={{padding:spacing.p}}>
        <h2 style={{color:colors.primary}}>Decision Log</h2>
        {filtered.map(d=>(
          <div key={d.id} style={{background:colors.card, padding:spacing.p, marginBottom:spacing.m, borderRadius:spacing.br, cursor:"pointer"}} onClick={()=>{setSelected(d);setScreen("detail");}}>
            <strong>{d.title}</strong> <span style={{color:colors.secondary}}>{d.date}</span>
            <p>{d.desc}</p>
            <small>Tags: {d.tags.join(", ")}</small>
          </div>
        ))}
        {filtered.length===0 && <p>No decisions match.</p>}
      </div>
    );
  } else if (screen==="new") {
    body = (
      <div style={{padding:spacing.p}}>
        <h2 style={{color:colors.primary}}>Add New Decision</h2>
        <input style={inputStyle} placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea style={inputStyle} placeholder="Short description" rows={2} value={desc} onChange={e=>setDesc(e.target.value)} />
        <textarea style={inputStyle} placeholder="Rationale (why)" rows={2} value={rationale} onChange={e=>setRationale(e.target.value)} />
        <input style={inputStyle} placeholder="Alternatives (comma‑separated)" value={alternatives} onChange={e=>setAlternatives(e.target.value)} />
        <input style={inputStyle} placeholder="Stakeholders (comma‑separated)" value={stakeholders} onChange={e=>setStakeholders(e.target.value)} />
        <select style={inputStyle} value={tagSelect} onChange={e=>setTagSelect(e.target.value)}>
          <option value="">Select tag</option>
          {tags.map(t=> <option key={t} value={t}>{t}</option>)}
        </select>
        <input style={inputStyle} type="date" value={date} onChange={e=>setDate(e.target.value)} />
        <button style={btnStyle} onClick={()=>{
          const newDec = {
            id: Date.now(),
            title,
            desc,
            rationale,
            alternatives: alternatives.split(",").map(s=>s.trim()).filter(Boolean),
            stakeholders: stakeholders.split(",").map(s=>s.trim()).filter(Boolean),
            tags: tagSelect? [tagSelect] : [],
            date,
            owner: "You",
            updates: []
          };
          setDecisions([newDec,...decisions]);
          setTitle("");setDesc("");setRationale("");setAlternatives("");setStakeholders("");setTagSelect("");setDate("");
          setScreen("feed");
        }}>Save Decision</button>
      </div>
    );
  } else if (screen==="detail" && selected) {
    body = (
      <div style={{padding:spacing.p}}>
        <h2 style={{color:colors.primary}}>{selected.title}</h2>
        <p><strong>Date:</strong> {selected.date} | <strong>Owner:</strong> {selected.owner}</p>
        <p>{selected.desc}</p>
        <p><strong>Rationale:</strong> {selected.rationale}</p>
        <p><strong>Alternatives:</strong> {selected.alternatives.join(", ")}</p>
        <p><strong>Stakeholders:</strong> {selected.stakeholders.join(", ")}</p>
        <p><strong>Tags:</strong> {selected.tags.join(", ")}</p>
        <h4>Updates</h4>
        {selected.updates.length===0 && <p>No updates yet.</p>}
        <ul>{selected.updates.map((u,i)=><li key={i}>{u}</li>)}</ul>
        <button style={btnStyle} onClick={()=>{
          const note = prompt("Add update note:");
          if(note){
            const upd = {...selected, updates:[...selected.updates,note]};
            setDecisions(decisions.map(d=>d.id===upd.id?upd:d));
            setSelected(upd);
          }
        }}>Add Update</button>
        <button style={btnStyle} onClick={()=>setScreen("feed")}>Back to Feed</button>
      </div>
    );
  } else if (screen==="search") {
    body = (
      <div style={{padding:spacing.p}}>
        <h2 style={{color:colors.primary}}>Search & Filter</h2>
        <input style={inputStyle} placeholder="Keyword…" value={search} onChange={e=>setSearch(e.target.value)} />
        <select style={inputStyle} value={filterTag} onChange={e=>setFilterTag(e.target.value)}>
          <option value="">All tags</option>
          {tags.map(t=> <option key={t} value={t}>{t}</option>)}
        </select>
        {filtered.map(d=>(
          <div key={d.id} style={{background:colors.card, padding:spacing.p, marginBottom:spacing.m, borderRadius:spacing.br}} onClick={()=>{setSelected(d);setScreen("detail");}}>
            <strong>{d.title}</strong> <small>{d.date}</small>
          </div>
        ))}
        {filtered.length===0 && <p>No matches.</p>}
      </div>
    );
  } else if (screen==="team") {
    body = (
      <div style={{padding:spacing.p}}>
        <h2 style={{color:colors.primary}}>Team Settings</h2>
        <h4>Members</h4>
        <ul>{team.map(m=> <li key={m}>{m}</li>)}</ul>
        <h4>Tags</h4>
        <ul>{tags.map(t=> <li key={t}>{t}</li>)}</ul>
        <p style={{color:colors.secondary, fontSize:12}}>Permissions are managed per‑project (placeholder).</p>
      </div>
    );
  }

  return (
    <div style={{fontFamily:"Arial,Helvetica,sans-serif", background:colors.bg, minHeight:"100vh", color:colors.text}}>
      {nav}
      <div>{body}</div>
    </div>
  );
}
