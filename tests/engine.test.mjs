import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Game,defaultDeck,validateDeck,judgement,SUPPORTED} from '../engine.js';
const cards=JSON.parse(fs.readFileSync(new URL('../TCG Data/data/cards_master.json',import.meta.url),'utf8')).cards;
const db=Object.fromEntries(cards.map(c=>[c.card_code,c]));
const make=()=>new Game(db,[defaultDeck(),defaultDeck()],{scenario:true,rng:()=>.5});
const find=(g,i,code)=>g.players[i].hand.find(x=>x.code===code).uid;
test('default deck obeys construction and supported registry',()=>{assert.deepEqual(validateDeck(defaultDeck(),db,true),[]);for(const code of SUPPORTED)assert.ok(db[code]);assert.equal(SUPPORTED.size,40);});
test('deck rejects duplicate characters, action copies and wrong exclusive character',()=>{let d=defaultDeck();d.push('BP01-030');assert.match(validateDeck(d,db).join(),/Level 0|เกิน/);d=defaultDeck();d[d.indexOf('SD02-007')]='SD01-010';assert.match(validateDeck(d,db).join(),/Action/);});
test('color triangle, speed tie, blue tie and absent cards',()=>{assert.equal(judgement(db['SD02-007'],db['SD01-020']),0);assert.equal(judgement(db['SD01-020'],db['SD02-008']),0);assert.equal(judgement(db['SD02-008'],db['SD02-007']),0);assert.equal(judgement(db['SD02-007'],db['SD02-007'],1),1);assert.equal(judgement(db['SD02-008'],db['SD01-013']),-1);assert.equal(judgement(null,null),-1);assert.equal(judgement(null,db['SD02-007']),1);});
test('Rover counter reveal adds two cards, requires activation and cannot repeat',()=>{const g=make();g.startCounter();g.select(find(g,0,'SD01-020'));g.select(find(g,1,'SD02-008'));assert.equal(g.phase,'counter');const q=g.queue.find(q=>q.x.code==='BP01-018');assert.ok(q);const n=g.players[0].hand.length;assert.throws(()=>g.next());g.activate(q.id);assert.equal(g.players[0].hand.length,n+2);assert.equal(g.revealed.length,2);assert.throws(()=>g.activate(q.id));g.next();assert.equal(g.counterWinner,0);const sensor=g.queue.find(q=>q.x.code==='SD01-020');g.activate(sensor.id);assert.equal(g.players[0].hand.length,n+3);g.next();assert.equal(g.phase,'combo');assert.equal(g.follow,0);assert.ok(g.playReason(0,g.players[0].hand[0],true));});
test('Incarnation pays selected resource, locks own leader and grants draw 3 plus 8 followups',()=>{const g=make();g.startCounter();g.select(find(g,0,'SD02-010'));g.select(find(g,1,'SD02-008'));assert.ok(g.choice);const pay=g.choice.items[1];g.answer([pay.uid]);assert.ok(g.players[0].trash.some(x=>x.uid===pay.uid));while(g.queue.length)g.activate(g.queue[0].id);assert.ok(g.players[0].locked);g.next();const q=g.queue.find(q=>q.x.code==='SD02-010');const before=g.players[0].hand.length;g.activate(q.id);assert.equal(g.players[0].hand.length,before+3);assert.equal(g.follow,8);g.next();g.combo(find(g,0,'SD01-017'));g.next();assert.equal(g.players[1].hp,19);assert.equal(g.follow,7);});
test('setup mulligan retains cards and first player draws only one',()=>{const g=new Game(db,[defaultDeck(),defaultDeck()],{rng:()=>.5});const before=g.players[0].hand[0].uid;g.setup(1,[before]);assert.equal(g.players[0].hand.length,5);assert.ok(!g.players[0].hand.some(x=>x.uid===before));g.setup(0,[]);assert.equal(g.phase,'action');assert.equal(g.players[0].hand.length,6);assert.equal(g.players[1].hand.length,5);});
test('charge once, action leveling costs hand and stacked abilities survive',()=>{const g=make();g.charge(g.players[0].hand[0].uid);assert.throws(()=>g.charge(g.players[0].hand[0].uid));const slot=g.players[0].chars.findIndex(s=>s[0].code==='BP01-018');const level=g.levelOptions(0,slot).find(x=>x.code==='BP01-017');g.level(slot,level.uid);assert.ok(g.choice);g.answer([g.choice.items[0].uid]);assert.equal(g.players[0].chars[slot].length,2);assert.equal(g.queue[0].x.code,'BP01-017');g.activate(g.queue[0].id);assert.throws(()=>g.level(slot,g.levelOptions(0,slot)[0].uid));});
test('end turn cleans actions and draws two for next player',()=>{const g=make();g.startCounter();g.select(find(g,0,'SD01-020'));g.select(find(g,1,'SD02-008'));while(g.queue.length)g.activate(g.queue[0].id);g.next();while(g.queue.length)g.activate(g.queue[0].id);g.next();g.endCounter();g.next();g.next();assert.equal(g.active,1);assert.equal(g.turn,2);assert.equal(g.phase,'action');assert.equal(g.players[0].action.length,0);assert.equal(g.players[1].hand.length,6);});
test('deck refresh and simultaneous loss',()=>{const g=make();const p=g.players[0];p.trash=p.deck.splice(0);g.check();assert.ok(p.deck.length);assert.equal(p.trash.length,0);g.players.forEach(p=>p.hp=0);g.check();assert.equal(g.winner,-1);assert.equal(g.phase,'finished');});
test('hand limit forces exact selected discard before advancing',()=>{const g=make();g.draw(0,6);g.endTurn();g.next();assert.ok(g.choice);const n=g.choice.count;assert.throws(()=>g.answer([]));g.answer(g.choice.items.slice(0,n).map(x=>x.uid));assert.equal(g.players[0].hand.length,8);assert.equal(g.active,1);});
test('Leader Skill blocks play with wrong leader',()=>{const g=make();const p=g.players[0];const x=p.deck.find(x=>x.code==='SD02-007');x.code='SD01-022';p.hand.push(p.deck.splice(p.deck.indexOf(x),1)[0]);p.leader=0;g.startCounter();assert.match(g.playReason(0,x),/Leader/);});
test('Character Deck level up resolves by target card without choosing the field slot',()=>{const g=make();const p=g.players[0];const target=p.reserve.find(x=>x.code==='BP01-029');g.levelFromDeck(target.uid);assert.ok(g.choice);g.answer([g.choice.items[0].uid]);assert.equal(p.chars.find(s=>g.card(s[0]).name_th==='Jinshi').length,2);});
test('every pending trigger can be skipped in the lab mode',()=>{const g=make();g.startCounter();g.select(find(g,0,'SD01-020'));g.select(find(g,1,'SD02-008'));assert.ok(g.queue.length);g.skipAll();assert.equal(g.queue.length,0);});
test('twenty seeded matches preserve every card across payments, triggers, leveling and recycling',()=>{
 const chars=[...SUPPORTED].filter(k=>db[k].card_type==='Character'),acts=[...SUPPORTED].filter(k=>db[k].card_type==='Action');
 for(let seed=1;seed<=20;seed++){
  let s=seed;const rng=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
  const d=[...chars,...Array.from({length:40},(_,j)=>acts[(j+seed)%acts.length])],g=new Game(db,[d,d],{rng});g.setup(seed%3);g.setup((seed+1)%3);
  for(let steps=0;steps<1500&&g.winner===null;steps++){
   if(g.choice)g.answer(g.choice.items.slice(0,g.choice.count).map(x=>x.uid));
   else if(g.queue.length)g.activate(g.queue[0].id);
   else if(g.phase==='action'){
    const p=g.players[g.active];let done=false;
    if(!p.used.level){for(let slot=0;slot<3;slot++){const x=g.levelOptions(g.active,slot).find(x=>+db[x.code].stats.Level<=p.hand.length);if(x){g.level(slot,x.uid);done=true;break;}}}
    if(!done&&!p.used.switch){g.switchAction((p.leader+1)%3);done=true;}
    if(!done&&!p.used.charge&&p.hand.length>1){g.charge(p.hand.at(-1).uid);done=true;}
    if(!done)g.startCounter();
   }else if(g.phase==='select'){const x=g.players[g.selectPlayer].hand.find(x=>!g.playReason(g.selectPlayer,x));if(x)g.select(x.uid);else g.passCounter();}
   else if(g.phase==='combo'){const x=g.players[g.counterWinner].hand.find(x=>!g.playReason(g.counterWinner,x,true));if(x)g.combo(x.uid);else g.endCounter();}
   else g.next();
   const all=g.players.flatMap(p=>[...p.hand,...p.deck,...p.reserve,...p.concerto,...p.trash,...p.action,...p.chars.flat()]);assert.equal(all.length,d.length*2);assert.equal(new Set(all.map(x=>x.uid)).size,all.length);
  }
  assert.notEqual(g.winner,null,'match must terminate');
 }
});
