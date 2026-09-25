import React, { useState } from 'react';

const C = { bg:'#F5F7F5', panel:'#FFFFFF', ink:'#1E2A2B', sub:'#657477', line:'#E3E8E6', accent:'#2E6F5E', soft:'#EAF3EE', warn:'#A96B33', danger:'#A2453B' };
const TONE = { danger:C.danger, warn:C.warn, ok:C.accent };
const S = {
  page:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,sans-serif',background:C.bg,color:C.ink,minHeight:'100vh',padding:'28px 20px',boxSizing:'border-box',fontSize:14,lineHeight:1.5},
  wrap:{maxWidth:880,margin:'0 auto'},
  brand:{fontSize:20,fontWeight:700,letterSpacing:'-0.01em'},
  h1:{fontSize:24,fontWeight:700,letterSpacing:'-0.02em',margin:'6px 0 2px'},
  label:{fontSize:11,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:C.sub,margin:'14px 0 6px'},
  title:{fontSize:15,fontWeight:600},
  sub:{fontSize:13,color:C.sub,marginTop:2},
  card:{background:C.panel,border:'1px solid '+C.line,borderRadius:12,padding:'14px 16px',marginBottom:10},
  row:{display:'flex',gap:12,alignItems:'center'},
  flex:{flex:1},
  chip:{fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:999,border:'1px solid',marginRight:6,marginTop:8,display:'inline-block'},
  btn:{background:C.accent,color:'#fff',border:'none',borderRadius:8,padding:'8px 14px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'},
  ghost:{background:'transparent',color:C.accent,border:'1px solid '+C.line,borderRadius:8,padding:'7px 13px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',marginTop:10},
  back:{fontSize:13,color:C.accent,cursor:'pointer',fontWeight:600},
  note:{background:C.soft,color:C.accent,border:'1px solid '+C.accent,borderRadius:8,padding:'8px 12px',fontSize:13,fontWeight:600},
  tab:on=>({background:on?C.accent:'#fff',color:on?'#fff':C.sub,border:'1px solid '+(on?C.accent:C.line),borderRadius:8,padding:'7px 12px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'})
};

const P = [
  { id:'northwind', name:'Northwind Migration', tone:'danger', flags:['Blocked','Client waiting'], touched:'2h ago',
    tagline:'
