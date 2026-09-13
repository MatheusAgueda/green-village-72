import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const root=process.env.GV_PROJECT_ROOT||process.cwd();
const {REFERENCE_VIDEOS}=await import(pathToFileURL(root+'/dist/reference-videos.js'));
const videos=REFERENCE_VIDEOS.videos.filter(v=>v.provider==='youtube');
assert.equal(videos.length,2);
class Node {
 constructor(){this.listeners=new Map();this.attributes=new Map();this.value='0';this.max='0';this.disabled=false;this.textContent='';this.children=[];this.classes=new Set();this.classList={add:value=>this.classes.add(value),remove:value=>this.classes.delete(value)};}
 addEventListener(name,fn){const list=this.listeners.get(name)||[];list.push(fn);this.listeners.set(name,list);}
 setAttribute(k,v){this.attributes.set(k,String(v));} removeAttribute(k){this.attributes.delete(k);}
 replaceChildren(...children){this.children=children;}
 fire(name){for(const listener of this.listeners.get(name)||[])listener({target:this});}
}
function fixture(video){const element=new Node(),nodes=new Map(['.youtube-status','.youtube-mount','input','output','.youtube-controls [data-yt-toggle]','[data-yt-fullscreen]'].map(key=>[key,new Node()]));nodes.get('input').value=String(video.sourceStartSeconds);nodes.get('input').max=String(video.sourceStartSeconds+video.duration_seconds);const start=new Node();element.querySelector=selector=>{assert.ok(nodes.has(selector),'Unexpected selector: '+selector);return nodes.get(selector);};element.querySelectorAll=selector=>{assert.equal(selector,'[data-yt-toggle]');return [start,nodes.get('.youtube-controls [data-yt-toggle]')];};return {element,nodes,start};}
const fixtures=new Map(videos.map(v=>[v.id,fixture(v)])),players=new Map(),intervals=[],errors=[];
const document=new Node();document.hidden=false;document.getElementById=id=>fixtures.get(id.replace(/^source-/,''))?.element;document.createElement=()=>new Node();
class Player {
 constructor(_node,options){this.options=options;this.state=-1;this.time=options.playerVars.start;this.duration=Math.ceil(videos.find(v=>v.youtubeId===options.videoId).sourceStartSeconds+videos.find(v=>v.youtubeId===options.videoId).duration_seconds);this.muted=true;this.volume=0;this.volumeWrites=[];this.unmuteCalls=0;this.playCalls=0;this.iframe=new Node();players.set(options.videoId,this);queueMicrotask(()=>options.events.onReady({target:this}));}
 getPlayerState(){return this.state;} getCurrentTime(){return this.time;} getDuration(){return this.duration;} getIframe(){return this.iframe;}
 setVolume(v){this.volume=v;this.volumeWrites.push(v);} unMute(){this.muted=false;this.unmuteCalls++;} isMuted(){return this.muted;} getVolume(){return this.volume;}
 seekTo(time){this.time=time;} playVideo(){this.playCalls++;this.state=1;this.options.events.onStateChange({target:this,data:1});}
 pauseVideo(){if(this.state===1||this.state===3){this.state=2;this.options.events.onStateChange({target:this,data:2});}} destroy(){this.destroyed=true;}
}
globalThis.document=document;globalThis.window={YT:{Player}};globalThis.location={origin:'http://localhost:4174'};globalThis.setInterval=fn=>{intervals.push(fn);return intervals.length;};
const {createYouTubeLibrary,youtubeMarkup}=await import(pathToFileURL(root+'/dist/youtube-library.js'));
let active=true,onPlayCalls=0;
const library=createYouTubeLibrary(videos,{isActive:()=>active,onPlay:()=>onPlayCalls++,onError:message=>errors.push(message)});
const [first,second]=videos;const player=v=>players.get(v.youtubeId);const tick=()=>intervals.forEach(fn=>fn());const settle=()=>new Promise(setImmediate);const results=[];
async function check(name,test){try{await test();results.push({name,pass:true});}catch(error){results.push({name,pass:false,message:error.message});}}
await check('Players load lazily; initial markup uses source time',()=>{assert.equal(players.size,0);for(const v of videos){const html=youtubeMarkup(v,s=>s);assert.ok(html.includes(`value="${v.sourceStartSeconds}"`));assert.ok(html.includes(`max="${v.sourceStartSeconds+v.duration_seconds}"`));}});
await check('Ready enables audio once and chapters retain source offsets',async()=>{
 for(const v of videos){await library.play(v.id,60);const p=player(v);assert.equal(p.time,v.sourceStartSeconds+60);assert.equal(p.unmuteCalls,1);assert.deepEqual(p.volumeWrites,[70]);assert.equal(p.muted,false);assert.equal(p.volume,70);assert.equal(p.options.playerVars.controls,1);assert.equal(p.options.playerVars.mute,0);assert.equal(p.iframe.tabIndex,0);}
 assert.equal(player(videos.find(v=>v.sourceStartSeconds===945)).time,1005);assert.equal(player(videos.find(v=>v.sourceStartSeconds===492)).time,552);
});
await check('Native seek before requested start displays and resumes the same source time',async()=>{
 await library.play(first.id,0);const p=player(first),f=fixtures.get(first.id);p.time=120;tick();assert.equal(Number(f.nodes.get('input').value),120);assert.ok(f.nodes.get('output').textContent.startsWith('2:00 / '));assert.equal(Number(f.nodes.get('input').max),p.duration);p.pauseVideo();f.nodes.get('.youtube-controls [data-yt-toggle]').fire('click');await settle();assert.equal(p.time,120);assert.equal(p.state,1);
});
await check('Custom slider seeks an absolute source time including before the chapter start',async()=>{
 const p=player(first),f=fixtures.get(first.id),slider=f.nodes.get('input');slider.value='30';slider.fire('input');assert.ok(f.nodes.get('output').textContent.startsWith('0:30 / '));slider.fire('change');await settle();assert.equal(p.time,30);assert.equal(p.state,1);
});
await check('Native mute and volume preferences survive chapter changes and custom pause/resume',async()=>{
 const p=player(first),f=fixtures.get(first.id);p.muted=true;p.volume=23;await library.play(first.id,60);tick();f.nodes.get('.youtube-controls [data-yt-toggle]').fire('click');f.nodes.get('.youtube-controls [data-yt-toggle]').fire('click');await settle();assert.equal(p.muted,true);assert.equal(p.volume,23);assert.equal(p.unmuteCalls,1);assert.deepEqual(p.volumeWrites,[70]);
});
await check('Starting another YouTube video pauses the previous one',async()=>{await library.play(first.id,60);await library.play(second.id,60);assert.equal(player(first).state,2);assert.equal(player(second).state,1);assert.ok(onPlayCalls>0);});
await check('Leaving the section cancels an in-flight request and pauses playback',async()=>{const p=player(first),before=p.playCalls;const pending=library.play(first.id,20);active=false;library.pauseAll();await pending;assert.equal(p.playCalls,before);assert.notEqual(player(first).state,1);assert.notEqual(player(second).state,1);await library.play(first.id,0);assert.equal(p.playCalls,before);active=true;});
await check('Inactive native play and hidden document cannot continue playback',async()=>{active=false;player(second).playVideo();assert.equal(player(second).state,2);active=true;await library.play(first.id,0);document.hidden=true;document.fire('visibilitychange');assert.equal(player(first).state,2);document.hidden=false;});
await check('No reader errors were emitted',()=>assert.deepEqual(errors,[]));
library.pauseAll();const report={sourceSha256:createHash('sha256').update(fs.readFileSync(root+'/dist/youtube-library.js')).digest('hex'),scope:'Actual module with lightweight DOM and deterministic fake YouTube IFrame API; no browser/network validation',results,passed:results.every(r=>r.pass)};
if(process.env.GV_AUDIT_REPORT)fs.writeFileSync(process.env.GV_AUDIT_REPORT,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));process.exitCode=report.passed?0:1;
