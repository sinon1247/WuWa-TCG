// Explicit rules for the audited character families. No text parsing here.
const red='แดง',blue='ฟ้า',green='เขียว';
const color=c=>c.stats.Color??c.stats.Coloe;
const owner=c=>c.stats['Exclusive Character name'];
const tag=(c,t)=>c.tags.some(v=>v.toLowerCase().replace('nornal','normal')===t.toLowerCase());
const all=(g,i)=>g.players[i].chars.flat();
const leaders=(g,i)=>g.players[i].chars[g.players[i].leader];
const has=(g,i,code,leader=false)=>(leader?leaders(g,i):all(g,i)).some(x=>x.code===code);
export const characterCodes=new Set([...Array.from({length:15},(_,n)=>`BP01-${String(n+1).padStart(3,'0')}`),'BP01-025','BP01-026','BP01-027','BP01-031','BP01-032','BP01-033','SD01-005','SD01-006','SD02-003','SD02-004']);
export const actionCodes=new Set([...Array.from({length:31},(_,n)=>`BP01-${String(n+34).padStart(3,'0')}`),'BP01-072','BP01-076','BP01-077','SD01-007','SD01-008','SD01-009','SD01-010','SD01-011','SD02-012','SD02-013','SD02-014','SD02-015','SD02-016']);
// Remaining starter cards use the same rules, keyed by identity rather than translation.
for(const code of ['BP01-017','BP01-020','BP01-023','BP01-019','BP01-021','SD02-001','SD02-002'])characterCodes.add(code);
for(const code of ['BP01-067','BP01-068','SD02-017','SD02-018','SD02-019','SD02-020','SD02-021','SD02-022','SD02-023'])actionCodes.add(code);
export const leaderSkillCodes=new Set(['SD01-022','BP01-073','BP01-074','SD01-011','SD02-023','BP01-070','SD02-015','SD02-016','SD02-011','SD02-022','SD01-010','BP01-048','SD01-016','SD01-023','BP01-072','BP01-057','BP01-061','BP01-056','BP01-077']);
const echoSets={'BP01-034':['Molten Rift','Fusion'],'BP01-036':['Freezing Frost','Glacio'],'BP01-038':['Sierra Gale','Aero'],'BP01-040':['Havoc Eclipse','Havoc'],'BP01-042':['Celestial Light','Spectro']};
export function hasAdvantage(g,i){return g.turn>1&&g.advantagePlayer===i;}
export function resetTurn(g){for(const p of g.players){p.healTriggers={};p.damageAttempts=0;p.damagedThisTurn=0;p.playedThisTurn=[];p.introGrants=[];p.delayedDamage=[];p.noFollow=p.noFollowTurn===g.turn;}}
export function retrieveChoice(g,i,predicate,zone='hand'){
 const p=g.players[i];g.choose(zone==='hand'?'เลือกการ์ดจากกองทิ้งขึ้นมือ':'เลือกการ์ดจากกองทิ้งเข้า Concerto',i,p.trash.filter(x=>predicate(g.card(x))),1,xs=>{for(const x of xs)p[zone].push(g.remove(p,'trash',x));if(zone==='hand')g.revealed=[...xs];});
}
export function returnCharacter(g,i,x){const p=g.players[i];const stack=p.chars.find(s=>s.includes(x));if(!stack||stack.length<2)return;p.reserve.push(stack.splice(stack.indexOf(x),1)[0]);g.note(g.card(x).name_th+' กลับ Character Deck');}
export function applyLevel(g,i,slot,x){const p=g.players[i],old=[...(p.chars[slot]||[])];if(!old.length||!p.reserve.includes(x)||g.card(old.at(-1)).name_th!==g.card(x).name_th)throw Error('เป้าหมาย Level up ไม่ถูกต้อง');p.reserve.splice(p.reserve.indexOf(x),1);p.chars[slot].push(x);x.enteredTurn=g.turn;g.note('Level up '+g.card(x).name_th+' → '+g.card(x).stats.Level);for(const y of old)g.enterSkill(i,y,'levelUp');g.enterSkill(i,x,'enter');}
export function skillLevel(g,i,name,{forcedLevel=null,done=()=>{}}={}){
 const p=g.players[i],slot=p.chars.findIndex(s=>g.card(s.at(-1)).name_th===name);if(slot<0){done();return;}
 const items=forcedLevel===null?g.levelOptions(i,slot):p.reserve.filter(x=>g.card(x).name_th===name&&+g.card(x).stats.Level===forcedLevel);
 if(!items.length){done();return;}
 g.choose('เลือก '+name+' เพื่อ Level up ด้วยสกิล',i,items,1,xs=>{if(xs[0])applyLevel(g,i,slot,xs[0]);done();});
}
export function enterRule(g,i,x,event){
 if(!characterCodes.has(x.code))return false;
 const q=(idx,fn,opt=false)=>g.queueSkill(i,x,idx,fn,opt);
 if(event==='levelUp'&&['BP01-001','BP01-002'].includes(x.code))q(0,()=>returnCharacter(g,i,x));
 if(['enter','levelUp'].includes(event)){
  if(['BP01-017','BP01-020'].includes(x.code))q(0,()=>{const p=g.players[i],top=p.deck[0];if(!top)return;g.revealed=[top];g.choose('นำการ์ดที่เปิดเผยขึ้นมือ หรือข้ามเพื่อเก็บไว้บนเด็ค',i,[top],1,xs=>{if(xs.length&&p.deck[0]===top)p.hand.push(g.remove(p,'deck',top));},{optional:true});});
  if(x.code==='BP01-023')q(0,()=>g.take(i,1,'concerto',true),true);
  if(x.code==='BP01-003')q(0,()=>retrieveChoice(g,i,c=>tag(c,'Basic Attack')),true);
  if(x.code==='BP01-009')q(0,()=>retrieveChoice(g,i,c=>tag(c,'Intro Skill')),true);
  if(x.code==='BP01-013')q(0,()=>retrieveChoice(g,i,c=>owner(c)==='Encore'&&color(c)===red));
  if(x.code==='BP01-026')q(0,()=>retrieveChoice(g,i,c=>tag(c,'Normal Attack')),true);
  if(x.code==='BP01-032')q(0,()=>retrieveChoice(g,i,()=>true,'concerto'),true);
 }
 return true;
}
export function onSwitch(g,i,slots){for(const slot of slots)for(const x of g.players[i].chars[slot])if(x.code==='BP01-008')g.queueSkill(i,x,0,()=>{g.draw(i,1);g.discard(i,1,()=>{});},true);}
export function onHeal(g,i,amount){if(amount<=0)return;const p=g.players[i];p.healTriggers??={};for(const x of all(g,i))if(x.code==='BP01-006'){
 const used=p.healTriggers[x.uid]||0;if(used>=2)continue;
 // Skipping an optional trigger must not spend an activation. Recheck at
 // resolution as several heals can be queued before the player responds.
 g.queueSkill(i,x,0,()=>{if((p.healTriggers[x.uid]||0)>=2)return;p.healTriggers[x.uid]=(p.healTriggers[x.uid]||0)+1;g.draw(i,1);},true);
}}
export function incomingDamage(g,i,n){const p=g.players[i];if(n<=0)return 0;let value=n;if(has(g,i,'BP01-001',true))value++;
 if(!p.damageAttempts&&has(g,i,'BP01-002',true))value--;
 p.damageAttempts=(p.damageAttempts||0)+1;return Math.max(0,value);
}
export function attackBonus(g,i,x){const c=g.card(x);let n=0;if(color(c)===red&&owner(c)==='Camellya'&&has(g,i,'BP01-001',true))n++;
 if(color(c)===red&&owner(c)==='Encore'&&has(g,i,'BP01-011'))n++;
 if(owner(c)==='Chixia'&&leaderSkillCodes.has(x.code)&&has(g,i,'SD01-005'))n+=3;
 if(x.code==='BP01-055'&&g.players[i].hp>g.players[1-i].hp)n++;
 return n;
}
export function onPlay(g,i,x,event){const p=g.players[i],c=g.card(x);p.playedThisTurn??=[];const history=p.playedThisTurn;
 if(owner(c)==='Encore'&&tag(c,'Normal Attack')&&!history.some(y=>owner(g.card(y))==='Encore'&&tag(g.card(y),'Normal Attack'))&&has(g,i,'BP01-015',true)){x.bonus+=2;g.autoSkill(i,leaders(g,i).find(y=>y.code==='BP01-015'),'FIRST NORMAL · +2');}
 for(const source of p.concerto){const rule=echoSets[source.code];if(!rule)continue;const [set,element]=rule;
  if(tag(c,element)&&!history.some(y=>tag(g.card(y),element))&&new Set(p.concerto.filter(y=>tag(g.card(y),set)).map(y=>y.code)).size>=2){x.bonus++;g.autoSkill(i,source,'ECHO · +1');}
 }
 history.push(x);
 if(event==='combo'&&tag(c,'Intro Skill'))for(const grant of p.introGrants||[]){if(grant.remaining>0){grant.remaining--;g.queueSkill(i,grant.source,1,()=>g.draw(i,1));}}
}
export function characterRule(g,event,i,x,lead,win,oc,ec){
 if(!characterCodes.has(x.code))return false;
 const p=g.players[i],q=(idx,fn,opt=false)=>g.queueSkill(i,x,idx,fn,opt);
 if(event==='counter'&&lead&&x.code==='BP01-021'&&oc===green)q(0,()=>g.addTop(i,2),true);
 if(event==='judgement'&&lead){
  if(x.code==='BP01-019'&&win&&oc===green)q(0,()=>{g.follow+=3;});
  if(x.code==='SD02-002'&&!win&&oc===green&&ec===red)q(0,()=>g.addTop(i),true);
 }
 if(event==='end'&&lead&&x.code==='SD02-001')q(0,()=>g.draw(i,1));
 if(event==='counterStart'&&lead&&x.code==='BP01-007'&&p.hand.length<=4)q(0,()=>g.draw(i,Math.max(0,5-p.hand.length)));
 if(event==='counter'&&lead){
  if(x.code==='BP01-010'&&oc===green)q(0,()=>g.addTop(i),true);
  if(x.code==='BP01-027'&&oc===red)q(0,()=>g.damage(1-i,1));
  if(x.code==='BP01-033'&&oc===blue)q(0,()=>g.take(i,1,'concerto',true),true);
 }
 if(event==='judgement'&&lead){
  if(x.code==='BP01-005'&&win)q(0,()=>retrieveChoice(g,i,c=>tag(c,'Basic Attack')));
  if(['BP01-004','SD01-006'].includes(x.code)&&!win&&oc===red&&ec===blue)q(0,()=>g.addTop(i),true);
  if(x.code==='BP01-010'&&win&&oc===green)q(1,()=>g.heal(i,1));
  if(x.code==='SD02-004'&&!win&&oc===blue&&ec===green)q(0,()=>g.addTop(i),true);
  if(x.code==='BP01-031'&&win&&oc===blue&&!p.locked)q(0,()=>g.intro(i,x,'',()=>{},()=>{g.follow+=3;}),true);
  if(x.code==='BP01-014'&&!win&&g.counterWinner>=0&&ec===red&&g.selected?.[i]){const own=g.selected[i],c=g.card(own);if(owner(c)==='Encore'&&(tag(c,'Heavy Attack')||tag(c,'Forte Circuit')))q(0,()=>{p.delayedDamage??=[];p.delayedDamage.push({source:x,card:own});});}
 }
 if(event==='counterEnd'){
  if(x.code==='BP01-025'&&lead&&p.action.filter(y=>tag(g.card(y),'Normal Attack')).length>=2)q(0,()=>g.damage(1-i,3));
 }
 if(event==='end'){
  if(x.code==='BP01-011'&&x.enteredTurn!==g.turn)q(2,()=>returnCharacter(g,i,x));
  if(x.code==='BP01-012'&&lead&&g.players[1-i].damagedThisTurn>0)q(0,()=>retrieveChoice(g,i,c=>owner(c)==='Encore'));
  if(x.code==='SD02-003'&&lead)q(0,()=>g.take(i,1,'concerto',true));
 }
 return true;
}
export function actionRule(g,event,i,x){
 if(!actionCodes.has(x.code))return false;
 const p=g.players[i],enemy=g.players[1-i],win=g.counterWinner===i,adv=hasAdvantage(g,i),q=(idx,fn,opt=false)=>g.queueSkill(i,x,idx,fn,opt);
 const switchTo=name=>{const slot=p.chars.findIndex(s=>g.card(s.at(-1)).name_th===name);if(slot>=0&&slot!==p.leader&&!p.locked)g.switchLeader(i,slot);};
 if(event==='judgement'&&win){
  if(x.code==='BP01-068')q(0,()=>g.draw(i,1));
  if(x.code==='SD02-018')q(0,()=>{g.draw(i,1);g.discard(i,1,()=>{});});
  if(x.code==='SD02-020')q(0,()=>{g.draw(i,1);g.revealed=[...enemy.hand];});
  if(x.code==='SD02-021')q(0,()=>{g.draw(i,1);g.follow+=2;});
 }
 if(event==='combo'){
  if(x.code==='SD02-019')q(0,()=>g.intro(i,x,'Rover (M)',()=>g.draw(i,1)));
  if(x.code==='BP01-067'&&p.hand.length)q(0,()=>g.discardCost(i,1,()=>{x.bonus++;}),true);
 }
 if(event==='counter'){
  if(x.code==='BP01-048')q(0,()=>skillLevel(g,i,'Camellya'));
  if(x.code==='BP01-057')q(1,()=>{p.introGrants??=[];p.introGrants.push({source:x,remaining:2});});
  if(x.code==='BP01-059'&&adv&&g.leaderName(i)==='Encore')q(0,()=>{x.speedOverride=10;});
  if(x.code==='BP01-061')q(1,()=>{p.noFollow=true;});
  if(x.code==='BP01-062')q(1,()=>skillLevel(g,i,'Encore',{forcedLevel:2,done:()=>switchTo('Encore')}));
  if(x.code==='BP01-072'&&adv)q(0,()=>retrieveChoice(g,i,c=>tag(c,'Basic Attack')||tag(c,'Resonance Liberation')));
  if(x.code==='BP01-076'&&g.leaderName(i)!=='Sanhua'&&!p.locked)q(0,()=>switchTo('Sanhua'),true);
 }
 if(event==='judgement'){
  if(win){
   if(['BP01-047','BP01-051'].includes(x.code))q(0,()=>g.draw(i,1));
   if(x.code==='BP01-053')q(0,()=>g.heal(i,1));
   if(x.code==='BP01-056')q(1,()=>skillLevel(g,i,'Shorekeeper'));
   if(x.code==='BP01-057')q(2,()=>{g.heal(i,1);g.follow+=8;});
   if(x.code==='BP01-058')q(0,()=>g.draw(i,2));
   if(x.code==='BP01-076'&&g.leaderName(i)==='Sanhua')q(1,()=>skillLevel(g,i,'Sanhua'));
   if(x.code==='BP01-077'&&p.concerto.some(y=>owner(g.card(y))==='Sanhua')&&!p.locked)q(1,()=>g.intro(i,x,'',()=>{}),true);
   if(x.code==='SD02-013')q(0,()=>{g.follow+=2;});
   if(x.code==='SD02-015')q(0,()=>g.take(i,2,'concerto',true));
   if(x.code==='SD02-016')q(0,()=>{enemy.noFollowTurn=g.turn+1;});
  }else if(g.counterWinner>=0){
   if(x.code==='BP01-058'&&adv&&g.leaderName(i)==='Shorekeeper')q(1,()=>{enemy.noFollow=true;});
   if(x.code==='SD01-010'&&g.selected?.[1-i]&&color(g.card(g.selected[1-i]))===blue)q(0,()=>{if(p.action.includes(x))p.hand.push(g.remove(p,'action',x));});
  }
 }
 if(event==='combo'){
  if(x.code==='BP01-046')q(0,()=>g.intro(i,x,'Camellya',()=>skillLevel(g,i,'Camellya')));
  if(x.code==='BP01-050'&&p.action.length>=2)q(0,()=>{x.bonus++;});
  if(x.code==='BP01-054')q(0,()=>g.intro(i,x,'Shorekeeper',()=>g.heal(i,1)));
  if(x.code==='BP01-061')q(1,()=>{p.noFollow=true;});
  if(x.code==='BP01-063')q(0,()=>g.intro(i,x,'Encore',()=>retrieveChoice(g,i,c=>owner(c)==='Encore'&&color(c)===red&&!tag(c,'Intro Skill'))));
  if(x.code==='SD01-009')q(0,()=>g.intro(i,x,'Chixia',()=>{x.bonus+=2;}));
  if(x.code==='SD02-014')q(0,()=>g.intro(i,x,'Sanhua',()=>g.take(i,1,'concerto',true)));
 }
 if(event==='damageDealt'&&g.lastDamage?.i===1-i&&g.lastDamage.amount>0){
  if(x.code==='BP01-060'&&g.leaderName(i)==='Encore')q(0,()=>g.draw(i,1));
  if(adv){
   if(x.code==='BP01-035')q(1,()=>g.discard(1-i,Math.floor(enemy.hand.length/4),()=>{}));
   if(x.code==='BP01-037')q(1,()=>g.choose('เลือก Concerto ฝ่ายตรงข้ามลงกองทิ้ง',i,[...enemy.concerto],1,xs=>xs.forEach(y=>enemy.trash.push(g.remove(enemy,'concerto',y)))));
   if(x.code==='BP01-039')q(1,()=>{if(enemy.hand.length)enemy.deck.push(enemy.hand.splice(Math.floor(g.rng()*enemy.hand.length),1)[0]);});
   if(x.code==='BP01-041')q(1,()=>g.take(1-i,3,'trash'));
   if(x.code==='BP01-043')q(1,()=>g.choose('เลือก 2 ใบจากกองทิ้งฝ่ายตรงข้ามไปใต้เด็ค',i,[...enemy.trash],2,xs=>xs.forEach(y=>enemy.deck.push(g.remove(enemy,'trash',y)))));
  }
 }
 return true;
}
export function echoReason(g,i,x){return tag(g.card(x),'Echo')&&g.players[i].action.some(y=>tag(g.card(y),'Echo'))?'Action Area มี Echo ได้สูงสุด 1 ใบ':'';}
export function resolvedCard(g,x){const c=g.card(x);return x.speedOverride===undefined?c:{...c,stats:{...c.stats,Speed:x.speedOverride}};}
