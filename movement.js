// Presentation-only snapshots; no game state or rules are changed by animation.
export function locations(game){
 const result=new Map();
 game.players.forEach((p,i)=>{
  for(const zone of ['deck','hand','action','concerto','trash','reserve'])
   for(const x of p[zone])result.set(x.uid,{uid:x.uid,code:x.code,i,zone});
  p.chars.forEach((stack,slot)=>stack.forEach(x=>result.set(x.uid,{uid:x.uid,code:x.code,i,zone:'chars',slot})));
 });
 return result;
}
export function movements(before,after){
 return [...after.values()].flatMap(to=>{const from=before.get(to.uid);return from&&(from.zone!==to.zone||from.i!==to.i)?[{uid:to.uid,code:to.code,i:to.i,from:from.zone,to:to.zone}]:[];});
}
export function groupsFor(moves){
 const groups=[];
 for(const move of moves){let group=groups.find(g=>g.i===move.i&&g.from===move.from&&g.to===move.to);if(!group){group={i:move.i,from:move.from,to:move.to,cards:[]};groups.push(group);}group.cards.push(move);}
 // Cleanup is shown before the next player's draw, even if player 1 is the next player.
 return groups.sort((a,b)=>(a.to==='hand'?1:0)-(b.to==='hand'?1:0));
}
