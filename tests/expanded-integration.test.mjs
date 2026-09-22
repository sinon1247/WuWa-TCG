import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Game,validateDeck,color} from '../engine.js';
const cards=JSON.parse(fs.readFileSync(new URL('../TCG Data/data/cards_master.json',import.meta.url))).cards;
const db=Object.fromEntries(cards.map(c=>[c.card_code,c]));
test('90 seeded full matches across all character families preserve cards, legal choices and terminate',()=>{
 const teams=[['Camellya','Shorekeeper','Encore'],['Chixia','Sanhua','Encore'],['Shorekeeper','Sanhua','Camellya'],['Rover (M)','Rover (F)','Yangyang'],['Rover (M)','Jinshi','Sanhua'],['Rover (F)','Yangyang','Jinshi']];
 for(let seed=1;seed<=90;seed++){
  let r=seed;const rng=()=>{r=(r*1664525+1013904223)>>>0;return r/4294967296;};
  const names=teams[seed%teams.length],characters=cards.filter(c=>c.card_type==='Character'&&names.includes(c.name_th));
  // Cap each family at five cards while retaining its level-zero starter.
  const chars=names.flatMap(name=>characters.filter(c=>c.name_th===name).sort((a,b)=>+a.stats.Level-+b.stats.Level).slice(0,5));
  const pool=cards.filter(c=>c.card_type==='Action'&&(!c.stats['Exclusive Character name']||names.includes(c.stats['Exclusive Character name']))).map(c=>c.card_code);
  const actions=[];for(let n=0;actions.length<40;n++)actions.push(pool[(n+seed)%pool.length]);
  const deck=[...chars.map(c=>c.card_code),...actions];assert.deepEqual(validateDeck(deck,db),[]);
  const g=new Game(db,[deck,deck],{rng});g.setup(seed%3);g.setup((seed+1)%3);
  const original=new Set(g.players.flatMap(p=>[...p.hand,...p.deck,...p.reserve,...p.concerto,...p.trash,...p.action,...p.chars.flat()]).map(x=>x.uid));
  for(let step=0;step<2500&&g.winner===null;step++){
   try{
    if(g.choice){const opts=g.choice.items;const start=Math.floor(rng()*opts.length);const chosen=[...opts.slice(start),...opts.slice(0,start)].slice(0,g.choice.count);g.answer(chosen.map(x=>x.uid));}
    else if(g.queue.length){const q=g.queue[0];g.activate(q.id,q.optional&&rng()<.25);}
    else if(g.phase==='action'){
     const p=g.players[g.active];const levels=p.chars.flatMap((_,slot)=>g.levelOptions(g.active,slot).filter(x=>+db[x.code].stats.Level<=p.hand.length).map(x=>({slot,x})));
     if(!p.used.level&&levels.length){const a=levels[Math.floor(rng()*levels.length)];g.level(a.slot,a.x.uid);}
     else if(!p.used.switch&&!p.locked&&rng()<.5)g.switchAction((p.leader+1)%3);
     else if(!p.used.charge&&p.hand.length)g.charge(p.hand.at(-1).uid);
     else g.startCounter();
    }else if(g.phase==='select'){const i=g.selectPlayer,legal=g.players[i].hand.filter(x=>!g.playReason(i,x));if(legal.length)g.select(legal[Math.floor(rng()*legal.length)].uid);else g.passCounter();}
    else if(g.phase==='combo'){const i=g.counterWinner,legal=g.players[i].hand.filter(x=>!g.playReason(i,x,true));if(legal.length)g.combo(legal[Math.floor(rng()*legal.length)].uid);else g.endCounter();}
    else {assert.equal(typeof g.after,'function','phase needs a continuation: '+g.phase);g.next();}
   }catch(e){throw new Error('seed '+seed+' step '+step+' phase '+g.phase+': '+e.message,{cause:e});}
   const all=g.players.flatMap(p=>[...p.hand,...p.deck,...p.reserve,...p.concerto,...p.trash,...p.action,...p.chars.flat()]);
   assert.equal(all.length,original.size,'card count seed '+seed);assert.deepEqual(new Set(all.map(x=>x.uid)),original);
   for(const p of g.players){assert.ok(p.chars.every(s=>s.length));assert.ok(p.action.filter(x=>db[x.code].tags.includes('Echo')).length<=1);assert.ok(Number.isFinite(p.hp));}
  }
  assert.notEqual(g.winner,null,'seed '+seed+' must finish');
 }
});
