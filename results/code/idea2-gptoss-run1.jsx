import React, {useState} from "react";

const colors = {primary:"#2C3E50",secondary:"#34495E",accent:"#1ABC9C",bg:"#F5F7FA",text:"#212529"};
const spacing = {xs:4,sm:8,md:16,lg:24};
const font = {family:"Arial,Helvetica,sans-serif",size:"14px"};

export default function App(){
  const [screen,setScreen]=useState("input");
  const [bullets,setBullets]=useState("- Completed API v2\n- QA testing 70%\n- Client demo scheduled");
  const [project,setProject]=useState("Project Alpha");
  const [tone,setTone]=useState("Professional");
  const [exec,setExec]=useState("");
  const [team,setTeam]=useState("");
  const [editTarget,setEditTarget]=useState("exec");
  const [history,setHistory]=useState([
    {date:"2024-09-20",project:"Beta Release",exec:"Beta on track, 60% complete.",team:"Team, finish UI work."},
    {date:"2024-09-18",project:"Data Migration",exec:"Migration 90% done.",team:"Ops, verify integrity."}
  ]);

  const generate =()=>{
    setExec(`${project}: On schedule, 85% complete. Next milestone 09/30.`);
    setTeam(`Team,\n- API v2 done\n- QA 70% done\n- Demo 09/28`);
    setScreen("dual");
    setHistory(prev=>[{date:new Date().toISOString().slice(0,10),project,exec,team},...prev].slice(0,10));
  };
  const copyToClipboard=(text)=>navigator.clipboard.writeText(text);
  const download = (name,content)=>{
    const blob=new Blob([content],{type:"text/plain"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=name;
    a.click();
  };
  const container={fontFamily:font.family,fontSize:font.size,color:colors.text,backgroundColor:colors.bg,minHeight:"100vh",padding:spacing.lg};
  const nav={display:"flex",gap:spacing.sm,marginBottom:spacing.md};
  const btn={padding:`${spacing.xs}px ${spacing.sm}px`,border:`1px solid ${colors.secondary}`,backgroundColor:colors.primary,color:"#fff",cursor:"pointer"};
  const activeBtn={...btn,backgroundColor:colors.accent};

  const renderScreen=()=>{
    if(screen==="input"){
      return (
        <div>
          <h2 style={{marginBottom:spacing.sm}}>New Status Update</h2>
          <label>Project name</label><br/>
          <input value={project} onChange={e=>setProject(e.target.value)} style={{width:"100%",marginBottom:spacing.sm}}/>
          <label>Context / Tone</label><br/>
          <select value={tone} onChange={e=>setTone(e.target.value)} style={{width:"100%",marginBottom:spacing.sm}}>
            <option>Professional</option>
            <option>Friendly</option>
            <option>Urgent</option>
          </select>
          <label>Raw bullet points</label><br/>
          <textarea value={bullets} onChange={e=>setBullets(e.target.value)} rows={6}
            style={{width:"100%",fontFamily:"monospace",marginBottom:spacing.sm}}/>
          <button onClick={generate} style={btn}>Generate Updates</button>
        </div>
      );
    }
    if(screen==="dual"){
      return (
        <div>
          <h2 style={{marginBottom:spacing.sm}}>Generated Updates</h2>
          <div style={{display:"flex",gap:spacing.md}}>
            <div style={{flex:1}}>
              <h4>Executive Summary</h4>
              <textarea value={exec} onChange={e=>setExec(e.target.value)} rows={8}
                style={{width:"100%",fontFamily:"monospace"}}/>
            </div>
            <div style={{flex:1}}>
              <h4>Team Update</h4>
              <textarea value={team} onChange={e=>setTeam(e.target.value)} rows={8}
                style={{width:"100%",fontFamily:"monospace"}}/>
            </div>
          </div>
          <div style={{marginTop:spacing.md}}>
            <button onClick={()=>setScreen("edit")} style={btn}>Edit / Refine</button>
            <button onClick={()=>setScreen("export")} style={{...btn,marginLeft:spacing.sm}}>Export / Share</button>
          </div>
        </div>
      );
    }
    if(screen==="edit"){
      return (
        <div>
          <h2 style={{marginBottom:spacing.sm}}>Edit & Refine</h2>
          <select value={editTarget} onChange={e=>setEditTarget(e.target.value)} style={{marginBottom:spacing.sm}}>
            <option value="exec">Executive Summary</option>
            <option value="team">Team Update</option>
          </select>
          <textarea
            value={editTarget==="exec"?exec:team}
            onChange={e=>editTarget==="exec"?setExec(e.target.value):setTeam(e.target.value)}
            rows={10}
            style={{width:"100%",fontFamily:"monospace",marginBottom:spacing.sm}}/>
          <div>
            <button onClick={()=>setScreen("dual")} style={btn}>Back</button>
          </div>
        </div>
      );
    }
    if(screen==="export"){
      return (
        <div>
          <h2 style={{marginBottom:spacing.sm}}>Export / Share</h2>
          <div style={{marginBottom:spacing.sm}}>
            <strong>Executive Summary</strong>
            <pre style={{backgroundColor:"#fff",padding:spacing.sm,whiteSpace:"pre-wrap"}}>{exec}</pre>
          </div>
          <div style={{marginBottom:spacing.sm}}>
            <strong>Team Update</strong>
            <pre style={{backgroundColor:"#fff",padding:spacing.sm,whiteSpace:"pre-wrap"}}>{team}</pre>
          </div>
          <button onClick={()=>copyToClipboard(exec+"\n\n"+team)} style={btn}>Copy All</button>
          <button onClick={()=>download(`${project}_Update.txt`,exec+"\n\n"+team)} style={{...btn,marginLeft:spacing.sm}}>Download</button>
          <button onClick={()=>alert("Sent to Slack (mock)")} style={{...btn,marginLeft:spacing.sm}}>Send to Slack</button>
        </div>
      );
    }
    if(screen==="history"){
      return (
        <div>
          <h2 style={{marginBottom:spacing.sm}}>Past Updates</h2>
          {history.map((h,i)=>(
            <div key={i} style={{border:`1px solid ${colors.secondary}`,padding:spacing.sm,marginBottom:spacing.xs}}>
              <div><strong>{h.project}</strong> – {h.date}</div>
              <button onClick={()=>{setExec(h.exec);setTeam(h.team);setProject(h.project);setScreen("dual");}} style={btn}>Load</button>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={container}>
      <div style={nav}>
        {["input","dual","edit","export","history"].map(s=>(
          <button key={s} onClick={()=>setScreen(s)} style={screen===s?activeBtn:btn}>{s.charAt(0).toUpperCase()+s.slice(1)}</button>
        ))}
      </div>
      {renderScreen()}
    </div>
  );
}
