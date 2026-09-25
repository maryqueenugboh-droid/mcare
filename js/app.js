const appointments=[
 {date:"24",month:"SEP",title:"Routine ANC Visit",time:"10:00 AM",place:"Demo Primary Health Centre",state:"Upcoming"},
 {date:"10",month:"AUG",title:"ANC Follow-up",time:"9:30 AM",place:"Demo Primary Health Centre",state:"Completed"},
 {date:"18",month:"JUL",title:"Routine ANC Visit",time:"11:00 AM",place:"Demo Primary Health Centre",state:"Completed"}
];
const vaccines=[
 ["BCG","Birth dose","completed"],["OPV","Polio dose","completed"],["Pentavalent","Primary series","completed"],["PCV","Pneumococcal series","completed"],["Measles-containing vaccine","Scheduled record","completed"],["Next scheduled dose","Review with provider","pending"],["Future dose","Review with provider","pending"],["Future dose","Review with provider","pending"]
];
const education=[
 ["♡","Preparing for ANC visits","What to bring, questions to ask and why keeping a consistent care record can be useful."],
 ["♧","Child immunisation","Understand the importance of keeping your child's immunisation record updated and checking due dates with a provider."],
 ["☀","Healthy pregnancy habits","General educational information about rest, nutrition, hydration and attending recommended appointments."],
 ["!","Warning signs","Learn why new or concerning symptoms should be discussed promptly with a qualified health professional."],
 ["▣","Birth preparedness","Prepare important contacts, documents, transport arrangements and questions ahead of delivery."],
 ["◉","Postnatal care","General education about follow-up care for mother and baby after birth."]
];
const $=x=>document.getElementById(x);
function toast(t){let e=$("toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),2500)}
function write(k,v){localStorage.setItem(k,JSON.stringify(v))}
function read(k,d=null){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}}
function audit(event){let a=read("mch_audit",[]);a.push({event,time:new Date().toISOString()});write("mch_audit",a)}
function show(page){document.querySelectorAll(".page").forEach(x=>x.classList.add("hidden"));$(page+"Page").classList.remove("hidden");document.querySelectorAll(".nav").forEach(x=>x.classList.toggle("active",x.dataset.page===page));if(page==="appointments")renderAppointments()}
function login(){let id=$("patientId").value.trim().toUpperCase(),pin=$("pin").value;if(id!=="MCH-001"||pin!=="1234"){audit("FAILED_LOGIN");toast("Demo credentials: MCH-001 / 1234");return}write("mch_session",{id,name:"Amara Demo"});audit("LOGIN_SUCCESS");$("login").classList.add("hidden");$("app").classList.remove("hidden");show("home")}
function logout(){audit("LOGOUT");localStorage.removeItem("mch_session");$("app").classList.add("hidden");$("login").classList.remove("hidden")}
function renderAppointments(){ $("appointments").innerHTML=appointments.map(a=>`<article class="appointment"><div class="appt-date"><b>${a.date}</b><small>${a.month}</small></div><div style="flex:1"><h3>${a.title}</h3><p>${a.time} · ${a.place}</p></div><span class="status">${a.state}</span></article>`).join("")}
$("loginBtn").onclick=login;$("logout").onclick=logout;$("mobileLogout").onclick=logout;
document.querySelectorAll(".nav").forEach(n=>n.onclick=()=>show(n.dataset.page));
document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>show(b.dataset.go));
$("themeBtn").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("mch_dark",document.body.classList.contains("dark"))};
$("saveNotes").onclick=()=>{write("mch_notes",$("careNotes").value);audit("CARE_NOTE_SAVED");toast("Care note saved locally.")};
$("addAppt").onclick=()=>{toast("Reminder form is simulated in this prototype.");audit("APPOINTMENT_REMINDER_OPENED")};
$("export").onclick=()=>{let data={profile:{id:"MCH-001",pregnancyWeek:28,childAge:"8 months"},appointments,vaccines,notes:read("mch_notes",""),audit:read("mch_audit",[])};let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));a.download="mothercare-demo-record.json";a.click()};
$("careNotes").value=read("mch_notes","");
$("vaccines").innerHTML=vaccines.map(v=>`<div class="vaccine ${v[2]==="pending"?"pending":""}"><div class="vcheck">${v[2]==="completed"?"✓":"○"}</div><div><b>${v[0]}</b><small>${v[1]}</small></div><span>${v[2]==="completed"?"Recorded":"Review due date"}</span></div>`).join("");
$("education").innerHTML=education.map(e=>`<article class="edu"><div class="edu-icon">${e[0]}</div><h3>${e[1]}</h3><p>${e[2]}</p></article>`).join("");
if(localStorage.getItem("mch_dark")==="true")document.body.classList.add("dark");
if(read("mch_session")){$("login").classList.add("hidden");$("app").classList.remove("hidden");show("home")}
