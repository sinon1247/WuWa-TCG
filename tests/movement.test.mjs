import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Game,defaultDeck} from '../engine.js';
import {locations,movements,groupsFor} from '../movement.js';
const db=Object.fromEntries(JSON.parse(fs.readFileSync(new URL('../TCG Data/data/cards_master.json',import.meta.url),'utf8')).cards.map(c=>[c.card_code,c]));
const make=()=>new Game(db,[defaultDeck(),defaultDeck()],{scenario:true,rng:()=>.5});
test('draw receipt distinguishes first-turn draw, ordinary turn and skill draws',()=>{
 const g=new Game(db,[defaultDeck(),defaultDeck()]);g.setup(0);g.setup(0);
 assert.deepEqual(g.lastTurnDraw,{i:0,count:1,before:5,after:6,turn:1,reason:'turn'});
 g.endTurn();g.next();assert.deepEqual(g.lastTurnDraw,{i:1,count:2,before:5,after:7,turn:2,reason:'turn'});
 const receipt=g.lastTurnDraw;g.draw(1,1);assert.equal(g.lastTurnDraw,receipt);assert.equal(g.lastDraw.reason,'skill');
});
test('movement identifies charge, draw and cost by physical card uid',()=>{
 const g=make();let before=locations(g);const x=g.players[0].hand[0];g.charge(x.uid);
 assert.deepEqual(movements(before,locations(g)),[{uid:x.uid,code:x.code,i:0,from:'hand',to:'concerto'}]);
 before=locations(g);g.draw(1,2);const moves=movements(before,locations(g));assert.equal(moves.length,2);assert.ok(moves.every(m=>m.from==='deck'&&m.to==='hand'&&m.i===1));
 before=locations(g);g.pay(0,1,()=>{});g.answer([g.choice.items[0].uid]);assert.equal(movements(before,locations(g))[0].to,'trash');
});
test('Action cleanup animations precede next-turn draws for either active player',()=>{
 const g=make();g.active=1;g.players[0].action.push(g.players[0].hand.pop());g.players[1].action.push(g.players[1].hand.pop());
 g.endTurn();const before=locations(g);g.next();const groups=groupsFor(movements(before,locations(g)));
 assert.equal(groups.length,3);assert.ok(groups.slice(0,2).every(g=>g.from==='action'&&g.to==='trash'));assert.equal(groups[2].to,'hand');assert.equal(groups[2].i,0);assert.equal(groups[2].cards.length,2);
});
test('view-only snapshots and phase changes do not invent card movement',()=>{const g=make(),before=locations(g);g.startCounter();assert.deepEqual(movements(before,locations(g)),[]);});
