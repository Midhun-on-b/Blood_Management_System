import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, List, Search, X, Check } from 'lucide-react';
import HospitalLayout from '../../components/hospital/HospitalLayout';
import BloodGroupBadge from '../../components/hospital/BloodGroupBadge';
import HospitalLoadingSkeleton from '../../components/hospital/HospitalLoadingSkeleton';

const WARDS = ['All', 'Emergency', 'Surgery', 'Oncology', 'Maternity'];
const STATUSES = ['All', 'Critical', 'Stable', 'Admitted'];
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const ALL_WARDS = ['Emergency', 'Surgery', 'Oncology', 'Maternity', 'ICU', 'General'];

function avatarBg(bg){ if(bg?.startsWith('A')) return 'rgba(99,102,241,0.35)'; if(bg?.startsWith('B')) return 'rgba(34,197,94,0.25)'; if(bg?.startsWith('O')) return 'rgba(217,0,37,0.25)'; return 'rgba(168,85,247,0.3)'; }

function statusStyle(s){
if(s==='Critical') return {bg:'rgba(217,0,37,0.1)',border:'rgba(217,0,37,0.3)',color:'var(--red)',pulse:true};
if(s==='Stable') return {bg:'rgba(34,197,94,0.1)',border:'rgba(34,197,94,0.25)',color:'#22c55e',pulse:false};
return {bg:'rgba(255,255,255,0.05)',border:'rgba(255,255,255,0.1)',color:'var(--text3)',pulse:false};
}

function fmt(d){
  if(!d) return "-";
  const date = new Date(d);
  if(isNaN(date)) return "-";

  return date.toLocaleDateString('en-IN',{
    day:'2-digit',
    month:'short',
    year:'numeric'
  });
}
function initials(name){ return name?.split(' ').slice(0,2).map(n=>n[0]).join(''); }

function AddPatientModal({ onClose, refreshPatients }){

const [name,setName]=useState('');
const [age,setAge]=useState('');
const [gender,setGender]=useState('Male');
const [bg,setBg]=useState('');
const [ward,setWard]=useState('Emergency');
const [date,setDate]=useState('');
const [loading,setLoading]=useState(false);
const [done,setDone]=useState(false);

const iS={width:'100%',background:'#0A0A12',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,padding:'11px 14px',fontFamily:'var(--font-body)',fontSize:14,color:'#fff',outline:'none',boxSizing:'border-box'};
const lS={display:'block',fontFamily:'var(--font-mono)',fontSize:9,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:8,marginTop:14};

const handleSubmit = async () => {

setLoading(true);

try{

const res = await fetch("http://localhost:5000/patients",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({ name, age, gender, blood_group:bg, ward, admitted_on:date })
});

if(res.ok){
setDone(true);
refreshPatients();
}

}catch(err){
console.error("Error adding patient:",err);
}

setLoading(false);
};

return(
<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(6px)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}
onClick={e=>{if(e.target===e.currentTarget)onClose();}}>

<motion.div initial={{scale:0.93,opacity:0,y:20}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.93,opacity:0}}
style={{background:'#0F0F17',border:'1px solid rgba(217,0,37,0.2)',borderRadius:20,padding:40,width:'100%',maxWidth:460,position:'relative'}}>

<button onClick={onClose} style={{position:'absolute',top:20,right:20,background:'none',border:'none',cursor:'pointer'}}><X size={18} color="var(--text3)"/></button>

{done ? (

 <div style={{textAlign:'center',padding:'32px 0'}}>
 <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',delay:0.1}}
 style={{width:64,height:64,borderRadius:'50%',background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.3)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
 <Check size={28} color="#22c55e"/>
 </motion.div>

 <div style={{fontFamily:'var(--font-sub)',fontWeight:800,fontSize:22,color:'#fff',marginBottom:8}}>Patient Added!</div>

<button onClick={onClose} style={{background:'none',border:'1px solid rgba(255,255,255,0.12)',borderRadius:10,padding:'10px 28px',cursor:'pointer',fontFamily:'var(--font-body)',fontSize:14,color:'var(--text2)'}}>Close</button>

 </div>
 ) : (

<>

 <div style={{fontFamily:'var(--font-sub)',fontWeight:700,fontSize:24,color:'#fff',marginBottom:6}}>Add Patient</div>

<label style={lS}>PATIENT NAME</label>
<input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" style={iS}/>

 <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
 <div>
 <label style={lS}>AGE</label>
 <input type="number" value={age} onChange={e=>setAge(e.target.value)} style={iS}/>
 </div>

 <div>
 <label style={lS}>GENDER</label>
 <select value={gender} onChange={e=>setGender(e.target.value)} style={{...iS,cursor:'pointer'}}>
 {['Male','Female','Other'].map(g=> <option key={g}>{g}</option>)}
 </select>
 </div>
 </div>

<label style={lS}>BLOOD GROUP</label>

 <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:4}}>
 {BLOOD_TYPES.map(b=>(
 <button key={b} onClick={()=>setBg(b)} style={{padding:'5px 10px',borderRadius:8,cursor:'pointer',background:bg===b?'var(--red)':'rgba(255,255,255,0.05)',border:`1px solid ${bg===b?'var(--red)':'rgba(255,255,255,0.1)'}`,fontFamily:'var(--font-sub)',fontWeight:700,fontSize:11,color:'#fff'}}>
 {b}
 </button>
 ))}
 </div>

<label style={lS}>WARD</label>
<select value={ward} onChange={e=>setWard(e.target.value)} style={{...iS}}>
{ALL_WARDS.map(w=><option key={w}>{w}</option>)} </select>

<label style={lS}>ADMITTED ON</label>
<input type="date" value={date} onChange={e=>setDate(e.target.value)} style={iS}/>

 <div style={{display:'flex',gap:12,marginTop:24}}>
 <button onClick={onClose} style={{flex:1,background:'none',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,padding:'12px 0',cursor:'pointer',fontFamily:'var(--font-body)',fontSize:14,color:'var(--text2)'}}>Cancel</button>

<button onClick={handleSubmit} disabled={loading}
style={{flex:2,background:'var(--red)',border:'none',borderRadius:10,padding:'12px 0',cursor:'pointer',fontFamily:'var(--font-body)',fontSize:14,fontWeight:600,color:'#fff'}}>
{loading?'Adding...':'Add Patient →'} </button>

 </div>

</>
)}

</motion.div>
</motion.div>
);
}

export default function HospitalPatients(){

const [view,setView]=useState('grid');
const [ward,setWard]=useState('All');
const [status,setStatus]=useState('All');
const [search,setSearch]=useState('');
const [showModal,setShowModal]=useState(false);
const [patients,setPatients]=useState([]);
const [loading,setLoading]=useState(true);
const [error,setError]=useState('');

useEffect(()=>{ fetchPatients(); },[]);

const fetchPatients = async () => {
try{
const res = await fetch("http://localhost:5000/patients");
const data = await res.json();
setPatients(data);
setLoading(false);
}catch(err){
console.error(err);
setError('Unable to load patients.');
setLoading(false);
}
};

const filtered = patients.filter(p=>{
const mw = ward==='All'||p.ward===ward;
const ms = status==='All'||p.status===status;
const mq = p.name?.toLowerCase().includes(search.toLowerCase()) || p.patient_id?.toLowerCase().includes(search.toLowerCase());
return mw && ms && mq;
});

const criticalCount = patients.filter(p=>p.status==='Critical').length;

if(loading){
return (
<HospitalLayout title="Patients" page="PATIENTS">
<HospitalLoadingSkeleton showHero={false} cardCount={3} listRows={5} />
</HospitalLayout>
);
}

return( <HospitalLayout title="Patients" page="PATIENTS">

 <AnimatePresence>
 {showModal && <AddPatientModal onClose={()=>setShowModal(false)} refreshPatients={fetchPatients}/>}
 </AnimatePresence>

 <div style={{display:'flex',flexDirection:'column',gap:24}}>
{error && (
 <div style={{background:'#0F0F17',border:'1px solid rgba(248,113,113,0.28)',borderRadius:14,padding:14,color:'#f87171'}}>
 {error}
 </div>
)}

{/* Stats */}

 <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
 {[{label:'TOTAL PATIENTS',val:patients.length,color:'#fff'},{label:'CRITICAL PATIENTS',val:criticalCount,color:'var(--red)'},{label:'BLOOD REQUESTS',val:0,color:'#fff'}].map(({label,val,color},i)=>(
 <motion.div key={label} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.4,delay:i*0.07}}
 style={{background:'#0F0F17',border:'1px solid rgba(255,255,255,0.06)',borderRadius:16,padding:24}}>
 <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:14}}>{label}</div>
 <div style={{fontFamily:'var(--font-display)',fontSize:52,color,lineHeight:1}}>{val}</div>
 </motion.div>
 ))}
 </div>

{/* Header */}

 <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
 <div style={{fontFamily:'var(--font-sub)',fontWeight:700,fontSize:20,color:'#fff'}}>All Patients</div>

 <div style={{display:'flex',gap:10,alignItems:'center'}}>
 <button onClick={()=>setView('grid')} style={{background:view==='grid'?'rgba(217,0,37,0.12)':'none',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'7px',cursor:'pointer'}}><LayoutGrid size={16}/></button>
 <button onClick={()=>setView('table')} style={{background:view==='table'?'rgba(217,0,37,0.12)':'none',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'7px',cursor:'pointer'}}><List size={16}/></button>
 <button onClick={()=>setShowModal(true)} style={{background:'var(--red)',border:'none',cursor:'pointer',borderRadius:10,padding:'10px 18px',fontFamily:'var(--font-body)',fontSize:14,fontWeight:600,color:'#fff'}}>＋ Add Patient</button>
 </div>
 </div>

{/* Grid view */}
{view==='grid' && (

 <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
 {filtered.map((p,i)=>{
 const sts=statusStyle(p.status);
 return(
 <motion.div key={p.patient_id} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.35,delay:i*0.06}}
 style={{background:'#0F0F17',border:'1px solid rgba(255,255,255,0.06)',borderRadius:16,padding:24}}>
 <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
 <div style={{width:44,height:44,borderRadius:'50%',background:avatarBg(p.blood_group),display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-display)',fontSize:16,color:'#fff'}}>{initials(p.name)}</div>
 <span style={{display:'inline-flex',alignItems:'center',gap:4,background:sts.bg,border:`1px solid ${sts.border}`,borderRadius:100,padding:'2px 8px',fontFamily:'var(--font-mono)',fontSize:9,color:sts.color}}>
 {p.status?.toUpperCase()}
 </span>
 </div>

 <div style={{fontFamily:'var(--font-sub)',fontWeight:700,fontSize:16,color:'#fff',marginBottom:3}}>{p.name}</div>
 <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--text3)',marginBottom:6}}>{p.patient_id}</div>
 <div style={{fontFamily:'var(--font-body)',fontSize:13,color:'var(--text2)',marginBottom:14}}>{p.age} yrs · {p.gender}</div>

 <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:10}}>
 <BloodGroupBadge group={p.blood_group} small/>
 <span style={{background:'rgba(255,255,255,0.06)',borderRadius:100,padding:'3px 10px',fontFamily:'var(--font-mono)',fontSize:9,color:'var(--text3)'}}>{p.ward}</span>
 </div>

 <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--text3)'}}>Admitted: {fmt(p.admitted_on)}</div>
 </motion.div>
 );
 })}
 </div>
 )}

 </div>

 </HospitalLayout>
 );
}
