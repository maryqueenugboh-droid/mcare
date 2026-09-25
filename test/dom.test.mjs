import {JSDOM} from 'jsdom';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
process.chdir(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
const tempDir=fs.mkdtempSync(path.join(os.tmpdir(),'mcare-dom-'));
import {spawn,spawnSync} from 'node:child_process';
const env={...process.env,PORT:'3188',DB_PATH:path.join(tempDir,'dom.sqlite')};
spawnSync(process.execPath,['server.mjs','--seed-demo'],{env});
const server=spawn(process.execPath,['server.mjs'],{env,stdio:['ignore','pipe','pipe']});await new Promise(r=>server.stdout.once('data',r));
const results=[];const failures=[];const root='public/';
function dom(){let d=new JSDOM(fs.readFileSync(root+'index.html','utf8'),{url:'http://localhost:3188',runScripts:'outside-only',pretendToBeVisual:true});const w=d.window;w.fetch=(url,opt)=>fetch(new URL(url,'http://localhost:3188'),opt);w.Chart=class{constructor(c,opts){this.options=opts;c.dataset.rendered='true'}destroy(){}};w.confirm=()=>true;w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};w.eval(fs.readFileSync(root+'vendor/jquery.min.js','utf8'));w.eval(fs.readFileSync(root+'app.js','utf8'));return d;}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));async function until(fn){for(let i=0;i<100;i++){if(fn())return;await sleep(30);}throw new Error('DOM condition timed out');}
function fill(d,k,v){const e=d.window.document.querySelector(k);assert.ok(e,'Missing '+k);e.value=v;}
const click=(d,k)=>{const e=d.window.document.querySelector(k);assert.ok(e,'Missing '+k);e.click()};
const submit=(d,k)=>d.window.document.querySelector(k).dispatchEvent(new d.window.Event('submit',{bubbles:true,cancelable:true}));
async function login(d,email){fill(d,'#email',email);fill(d,'#password','MotherCare2026!');submit(d,'#authForm');await until(()=>d.window.document.querySelector('#app').hidden===false&&d.window.document.querySelector('main h1'));}
async function go(d,k){click(d,`#nav [data-go="${k}"]`);await until(()=>d.window.document.querySelector(`nav [data-go="${k}"].active`));await until(()=>!d.window.document.querySelector('main [role=status]'));}
async function add(d,values){click(d,'#add');for(const[k,v]of Object.entries(values))fill(d,'#f_'+k,v);submit(d,'#recordForm');await until(()=>!d.window.document.querySelector('#editor').open);await until(()=>!d.window.document.querySelector('main [role=status]'));}
async function check(name,fn){try{await fn();results.push({name,status:'Passed'});console.log('PASS',name)}catch(e){failures.push(name+': '+e.message);throw e;}}
const m=dom(),p=dom(),a=dom();
try{
await check('Authentication form submits and opens saved mother session',()=>login(m,'mother@demo.test'));
await check('Pregnancy form saves and renders database values',async()=>{await go(m,'pregnancy');await add(m,{edd:'2027-01-01',lmp:'2026-03-27',status:'pregnant'});assert.match(m.window.document.querySelector('#listing').textContent,/2027-01-01/)});
await check('Appointment form saves and edits a record',async()=>{await go(m,'appointments');await add(m,{date:'2026-09-24',time:'09:00',facility:'Test clinic',reason:'ANC Test',status:'scheduled',reminderHours:'24'});click(m,'.edit');fill(m,'#f_notes','Bring card');submit(m,'#recordForm');await until(()=>!m.window.document.querySelector('#editor').open);await until(()=>m.window.document.querySelector('#listing')?.textContent.includes('Bring card'));});
await check('Maternal measurement submission and chart data path',async()=>{await go(m,'maternal');await add(m,{date:'2026-09-01',weight:'65',systolic:'120',diastolic:'80'});assert.match(m.window.document.querySelector('#listing').textContent,/65 kg/);assert.equal(m.window.document.querySelector('#trend').dataset.rendered,'true');});
let child;
await check('Child profile and child-linked growth form',async()=>{await go(m,'children');await add(m,{name:'DOM Baby',dob:'2026-01-01',sex:'female'});await go(m,'growth');click(m,'#add');child=m.window.document.querySelector('#f_childId option:nth-child(2)').value;fill(m,'#f_childId',child);fill(m,'#f_date','2026-09-01');fill(m,'#f_weight','8');fill(m,'#f_height','68');submit(m,'#recordForm');await until(()=>!m.window.document.querySelector('#editor').open);await until(()=>m.window.document.querySelector('#listing')?.textContent.includes('8 kg'));});
await check('Milestone and vaccine forms use selected child',async()=>{await go(m,'milestones');await add(m,{childId:child,date:'2026-09-01',title:'Sitting'});await go(m,'vaccines');await add(m,{childId:child,name:'Clinic dose',due:'2026-09-24'});assert.match(m.window.document.querySelector('#listing').textContent,/Clinic dose/);});
await check('Medication form and computed reminder screen',async()=>{await go(m,'medications');await add(m,{name:'Test medicine',instructions:'As prescribed',nextDose:'2026-09-01T08:00',status:'active'});await go(m,'notifications');assert.match(m.window.document.querySelector('main').textContent,/Test medicine/);});
await check('Provider session stays separate from mother session',async()=>{await login(p,'provider@demo.test');await go(p,'patients');click(p,'.select-patient');await until(()=>p.window.document.querySelector('#listing')?.textContent.includes('65 kg'));assert.equal(m.window.document.querySelector('#userRole').textContent,'mother');});
await check('Two-way messages render in both account views',async()=>{await go(m,'messages');fill(m,'#compose textarea','Question from mother');submit(m,'#compose');await until(()=>m.window.document.querySelector('#chat').textContent.includes('Question from mother'));await go(p,'messages');assert.match(p.window.document.querySelector('#chat').textContent,/Question from mother/);fill(p,'#compose textarea','Reply from provider');submit(p,'#compose');await until(()=>p.window.document.querySelector('#chat').textContent.includes('Reply from provider'));await go(m,'home');await go(m,'messages');assert.match(m.window.document.querySelector('#chat').textContent,/Reply from provider/);});
await check('Administrator view and content creation form',async()=>{await login(a,'admin@demo.test');await go(a,'admin');assert.match(a.window.document.querySelector('main').textContent,/User accounts/);await go(a,'education');await add(a,{title:'DOM article',category:'Education',body:'Test article content',source:'https://www.who.int/'});assert.match(a.window.document.querySelector('#listing').textContent,/DOM article/);});
await check('Profile and provider selection update',async()=>{await go(m,'profile');fill(m,'#f_name','Updated Demo');submit(m,'#profileForm');await until(()=>m.window.document.querySelector('#userName').textContent==='Updated Demo');});
await check('Saved records are escaped as text',async()=>{await go(m,'milestones');await add(m,{childId:child,date:'2026-09-01',title:'<img src=x onerror=alert(1)>'});assert.equal(m.window.document.querySelector('#listing img'),null);assert.match(m.window.document.querySelector('#listing').textContent,/<img/);});
}finally{for(const d of[m,p,a])d.window.close();await new Promise(resolve=>{server.once('exit',resolve);server.kill();});fs.rmSync(tempDir,{recursive:true,force:true});fs.writeFileSync('docs/dom-test-results.json',JSON.stringify({executedAt:new Date().toISOString(),environment:'jsdom 26.1.0; Chart stubbed, no visual rendering or browser layout verification',tests:results,failures},null,2));}
