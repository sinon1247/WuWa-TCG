let audioCtx=null;export function sfx(kind='move'){try{audioCtx??=new (window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();const f={shuffle:180,draw:520,move:300,clash:90,phase:240}[kind]||300;o.frequency.value=f;o.type=kind==='clash'?'sawtooth':'sine';g.gain.setValueAtTime(.0001,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(kind==='clash'?.12:.045,audioCtx.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+(kind==='clash'?.3:.12));o.connect(g).connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+.35);}catch{}}
import {locations,movements,groupsFor} from './movement.js';
const zoneNames={deck:'Action Deck',hand:'มือ',action:'Action Area',concerto:'Concerto',trash:'กองทิ้ง',reserve:'Character Deck',chars:'สนามตัวละคร'};
const selectors={deck:'.deck-pile',hand:'.hand-count',action:'.action-zone',concerto:'.resource',trash:'.discard',reserve:'.character-pile',chars:'.character-row'};
const rect=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
function zoneElement(i,zone,control){return zone==='hand'&&i===control?document.querySelector('.hand'):document.querySelector(`[data-player="${i}"] ${selectors[zone]}`);}
function cardElement(uid){return document.querySelector(`.arena .card[data-uid="${uid}"]`);}
export function capture(game,control){
 const positions=new Map(),zones={};
 for(let i=0;i<2;i++)for(const zone of Object.keys(selectors))zones[`${i}:${zone}`]=rect(zoneElement(i,zone,control));
 document.querySelectorAll('.arena .card[data-uid]').forEach(el=>positions.set(+el.dataset.uid,rect(el)));
 return {game,phase:game.phase,locations:locations(game),positions,zones,control,turn:game.turn,draw:game.lastDraw,hand:game.players.map(p=>p.hand.length)};
}
export function incomingPlayer(snapshot,game){if(snapshot.game!==game)return null;const group=groupsFor(movements(snapshot.locations,locations(game))).find(g=>g.to==='hand');return group?.i??(snapshot.turn!==game.turn?game.active:null);}
export async function animateMoves(snapshot,game,control,db){
 if(snapshot.game!==game)return;
 const moves=movements(snapshot.locations,locations(game));if(!moves.length)return;sfx(moves.some(m=>m.from==='deck'&&m.to==='hand')?'draw':'move');
 const groups=groupsFor(moves),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const layer=document.createElement('div');layer.className='motion-layer';layer.setAttribute('aria-live','polite');document.body.append(layer);
 const banner=document.createElement('div');banner.className='motion-banner';layer.append(banner);
 const destinations=moves.map(m=>cardElement(m.uid)).filter(Boolean);
 destinations.forEach(el=>el.style.visibility='hidden');
 // Hide a pending choice until the movement that caused it has finished.
 const overlay=document.querySelector('#overlay');overlay.style.visibility='hidden';
 try{
  for(const group of groups){
   const draw=group.from==='deck'&&group.to==='hand',isReveal=draw&&game.revealed?.some(x=>group.cards.some(m=>m.uid===x.uid)),isTurn=draw&&snapshot.draw!==game.lastDraw&&game.lastDraw?.reason==='turn'&&game.lastDraw.i===group.i;
   banner.replaceChildren();const title=document.createElement('strong'),detail=document.createElement('span');
   title.textContent=`P${group.i+1} · ${isTurn?'ช่วงจั่วต้นเทิร์น':draw?'นำการ์ดขึ้นมือ':group.to==='trash'?'ส่งการ์ดเข้ากองทิ้ง':'ย้ายการ์ด'} · ${group.cards.length} ใบ`;
   detail.textContent=`${zoneNames[group.from]} → ${zoneNames[group.to]}${group.to==='hand'?`  |  มือ ${snapshot.hand[group.i]} → ${game.players[group.i].hand.length} ใบ`:''}`;
   banner.append(title,detail);
   const fromZone=zoneElement(group.i,group.from,control),toZone=zoneElement(group.i,group.to,control);fromZone?.classList.add('motion-source');toZone?.classList.add('motion-target');
   await Promise.all(group.cards.map(async(m,index)=>{
    const from=snapshot.positions.get(m.uid)||snapshot.zones[`${m.i}:${m.from}`];
    const target=cardElement(m.uid),to=rect(target)||rect(zoneElement(m.i,m.to,control));
    if(!from||!to)return;
    const w=72,h=101;
    const point=r=>({x:Math.max(8,Math.min(innerWidth-w-8,r.x+(r.width-w)/2)),y:Math.max(95,Math.min(innerHeight-h-18,r.y+(r.height-h)/2))});
    const start=point(from),end=point(to),fly=document.createElement('div');fly.className='flying-card';
    const hidden=m.to==='deck'||(m.to==='action'&&game.phase==='select')||(m.to==='hand'&&m.i!==control&&!isReveal);
    if(hidden){fly.classList.add('flying-back');fly.textContent='✦';}else{const image=document.createElement('img');image.src='TCG%20Data/'+db[m.code].image.local_path;image.alt='';fly.append(image);}
    fly.style.left=start.x+'px';fly.style.top=start.y+'px';layer.append(fly);if(isReveal&&!reduced)await new Promise(r=>setTimeout(r,900));
    const dx=end.x-start.x,dy=end.y-start.y,duration=reduced?100:820,delay=reduced?0:Math.min(index*155,1100);
    try{await fly.animate(reduced?[{opacity:0},{opacity:1}]:[
     {transform:'translate(0,0) rotate(-5deg) scale(.9)',opacity:0},
     {offset:.12,transform:`translate(${dx*.08}px,${dy*.08-12}px) rotate(-3deg) scale(1.05)`,opacity:1},
     {offset:.55,transform:`translate(${dx*.55}px,${dy*.55-45}px) rotate(5deg) scale(1.13)`,opacity:1},
     {transform:`translate(${dx}px,${dy}px) rotate(0deg) scale(1)`,opacity:1}
    ],{duration,delay,easing:'cubic-bezier(.22,.7,.25,1)',fill:'both'}).finished;}catch{}finally{fly.remove();if(target){target.style.visibility='';target.classList.add('motion-arrived');}}
   }));
   fromZone?.classList.remove('motion-source');toZone?.classList.remove('motion-target');
  }
 }finally{destinations.forEach(el=>el.style.visibility='');overlay.style.visibility='';layer.remove();}
}

export async function animateClash(clash,game,db){
 sfx('clash');const layer=document.createElement('div');layer.className='clash-layer';
 const title=document.createElement('div');title.className='clash-title';title.textContent=clash.winner<0?'DRAW':'COUNTER CLASH';layer.append(title);
 const row=document.createElement('div');row.className='clash-row';
 clash.cards.forEach((card,i)=>{if(!card)return;const item=document.createElement('div');item.className=`clash-card ${i===clash.winner?'clash-win':'clash-lose'}`;const img=document.createElement('img');img.src='TCG%20Data/'+db[card.code].image.local_path;const label=document.createElement('b');label.textContent=i===clash.winner?'WIN':'LOSE';item.append(img,label);row.append(item);});layer.append(row);document.body.append(layer);
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){await new Promise(r=>setTimeout(r,250));layer.remove();return;}
 await new Promise(r=>setTimeout(r,1150));layer.remove();
}

export async function animateDamage(damage){
 if(!damage||!damage.amount)return;
 const hp=document.querySelector('[data-hp-player="'+damage.i+'"]');
 const layer=document.createElement('div');layer.className='damage-layer';
 const float=document.createElement('strong');float.textContent='−'+damage.amount;float.setAttribute('aria-label','รับความเสียหาย '+damage.amount);layer.append(float);document.body.append(layer);
 if(hp){const r=hp.getBoundingClientRect();layer.style.left=(r.left+r.width/2)+'px';layer.style.top=(r.top-10)+'px';const small=hp.querySelector('small'),label=small?.outerHTML||'<small>HP</small>';const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?0:760;hp.innerHTML=damage.before+label;const start=performance.now();const tick=now=>{const p=Math.min(1,(now-start)/duration);hp.firstChild.textContent=String(Math.round(damage.before-(damage.before-damage.after)*p));if(p<1)requestAnimationFrame(tick);};if(duration)requestAnimationFrame(tick);else hp.firstChild.textContent=String(damage.after);}
 await new Promise(r=>setTimeout(r,matchMedia('(prefers-reduced-motion: reduce)').matches?180:850));layer.remove();
}

export async function animateOpening(game,db){sfx('shuffle');
 const layer=document.createElement('div');layer.className='opening-layer';document.body.append(layer);
 const piles=[...document.querySelectorAll('.deck-pile')];piles.forEach((pile,index)=>{const r=pile.getBoundingClientRect();const stack=document.createElement('div');stack.className='shuffle-stack';stack.style.left=(r.left+r.width/2-60)+'px';stack.style.top=(r.top+r.height/2-72)+'px';for(let i=0;i<7;i++){const card=document.createElement('i');card.textContent='✦';card.style.setProperty('--i',i);stack.append(card);}const label=document.createElement('b');label.className='shuffle-label';label.textContent='SHUFFLE';stack.append(label);layer.append(stack);});
 await new Promise(r=>setTimeout(r,matchMedia('(prefers-reduced-motion: reduce)').matches?250:1250));layer.remove();
}

export async function animateReveal(before,game){if(!before||before.phase!=='setup'||game.phase==='setup')return;const cards=[...document.querySelectorAll('.character-slot .card')];if(!cards.length)return;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;await Promise.all(cards.map((el,i)=>el.animate(reduced?[{opacity:.7},{opacity:1}]:[{transform:'rotateY(180deg) scale(.92)',opacity:.35},{transform:'rotateY(90deg) scale(1.04)',opacity:.8},{transform:'rotateY(0) scale(1)',opacity:1}],{duration:reduced?160:720,delay:reduced?0:i*90,easing:'cubic-bezier(.2,.8,.25,1)',fill:'both'}).finished.catch(()=>{})));}


export async function animateLeaderSwap(before){if(!before?.leaders)return;const cards=[...document.querySelectorAll('.character-slot .card[data-uid]')];await Promise.all(cards.map((el,i)=>{const uid=+el.dataset.uid,from=before.positions.get(uid),to=rect(el);if(!from||!to)return Promise.resolve();const dx=from.x-to.x,dy=from.y-to.y;return el.animate([{transform:`translate(${dx}px,${dy}px) scale(.96)`},{transform:'translate(0,0) scale(1)'}],{duration:720,delay:i*80,easing:'cubic-bezier(.2,.8,.25,1)',fill:'both'}).finished.catch(()=>{});}));}

export async function animatePhase(phase){sfx('phase');const labels={setup:'เตรียมเกม',start:'เริ่มเทิร์น',draw:'จั่วการ์ด',action:'ACTION',select:'เลือก COUNTER',counter:'COUNTER SKILLS',judgement:'JUDGEMENT',combo:'FOLLOW-UP ATTACK',comboSkill:'COMBO SKILLS',counterEnd:'จบ COUNTER',end:'จบเทิร์น',finished:'จบเกม'};const layer=document.createElement('div');layer.className='phase-banner';layer.textContent='เข้าสู่ '+(labels[phase]||phase);document.body.append(layer);await new Promise(r=>setTimeout(r,matchMedia('(prefers-reduced-motion: reduce)').matches?180:650));layer.remove();}
