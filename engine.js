import * as rules from './card-rules.js';
export const TEAM=['Jinshi','Rover (F)','Yangyang'];
export const color=c=>c.stats.Color??c.stats.Coloe;
export const owner=c=>c.stats['Exclusive Character name'];
export const text=a=>a.custom_th?.trim()||a.original_th||'';
const red='แดง',blue='ฟ้า',green='เขียว';
export const SUPPORTED=new Set(['BP01-030','BP01-029','SD02-006','SD02-005','BP01-028','BP01-018','SD01-002','BP01-017','SD01-001','BP01-016','BP01-024','SD01-004','BP01-023','SD01-003','BP01-022','SD01-017','SD01-018','SD01-019','SD01-020','SD01-021','SD01-022','SD01-023','SD01-012','SD01-013','SD01-014','SD01-015','SD01-016','SD02-007','SD02-008','SD02-009','SD02-010','SD02-011','BP01-065','BP01-066','BP01-069','BP01-070','BP01-071','BP01-073','BP01-074','BP01-075']);
export const SHOREKEEPER_SUPPORTED=new Set(['BP01-006','BP01-007','BP01-008','BP01-009','BP01-010','BP01-052','BP01-053','BP01-054','BP01-055','BP01-056','BP01-057','BP01-058']);
export const CAMELLYA_SUPPORTED=new Set(['BP01-001','BP01-002','BP01-003','BP01-004','BP01-005','BP01-044','BP01-045','BP01-046','BP01-047','BP01-048','BP01-049','BP01-050','BP01-051']);
// Only registered, explicitly implemented card codes are playable.
export const isSupported=code=>SUPPORTED.has(code)||rules.characterCodes.has(code)||rules.actionCodes.has(code);
export function validateDeck(deck,db,playable=false){
 const errors=[],cards=deck.map(code=>db[code]);if(cards.some(c=>!c))return ['มีรหัสการ์ดที่ไม่รู้จัก'];
 const chars=cards.filter(c=>c.card_type==='Character'),acts=cards.filter(c=>c.card_type==='Action'),names=[...new Set(chars.map(c=>c.name_th))];
 if(chars.length<3||chars.length>15)errors.push('Character Deck ต้องมี 3–15 ใบ');
 if(names.length!==3)errors.push('ต้องมีตัวละครต่างชื่อกัน 3 ชื่อ');
 for(const n of names)if(chars.filter(c=>c.name_th===n&&+c.stats.Level===0).length!==1)errors.push(n+' ต้องมี Level 0 หนึ่งใบ');
 if(acts.length!==40)errors.push(`Action Deck ต้องมี 40 ใบ (ขณะนี้ ${acts.length})`);
 for(const code of new Set(deck)){const c=db[code],count=deck.filter(x=>x===code).length;if(count>(c.card_type==='Character'?1:3))errors.push(code+' เกินจำนวนที่ใส่ได้');}
 if(acts.some(c=>owner(c)&&!names.includes(owner(c))))errors.push('มี Action ของตัวละครที่ไม่อยู่ในเด็ค');
 if(playable&&cards.some(c=>!isSupported(c.card_code)))errors.push('เดโมนี้รองรับเฉพาะการ์ดที่มีป้ายสกิลพร้อมใช้');return errors;
}
export function defaultDeck(){return ['BP01-030','BP01-029','SD02-005','BP01-018','BP01-017','SD01-001','BP01-024','BP01-023','SD01-003',...['SD02-007','SD02-008','SD02-009','SD02-010','BP01-075','SD01-017','SD01-018','SD01-019','SD01-020','SD01-012','SD01-013','SD01-014'].flatMap(c=>[c,c,c]),'SD01-015','SD01-015','SD01-021','BP01-066'];}
export function judgement(a,b,active=0){if(!a&&!b)return -1;if(!a)return 1;if(!b)return 0;const x=color(a),y=color(b);if(x===y){if(x===blue)return -1;return +a.stats.Speed===+b.stats.Speed?active:(+a.stats.Speed>+b.stats.Speed?0:1);}return ({[red]:green,[green]:blue,[blue]:red})[x]===y?0:1;}
export class Game{
 constructor(db,decks,{scenario=false,seedConcerto=true,rng=Math.random}={}){
  this.practice=scenario;this.seedConcerto=seedConcerto;this.lastDamage=null;this.lastDraw=null;this.lastTurnDraw=null;this.db=db;this.rng=rng;this.serial=0;this.turn=1;this.active=0;this.phase='setup';this.queue=[];this.choice=null;this.log=[];this.winner=null;this.revealed=[];this.after=null;this.follow=0;this.comboAllowed=false;this.autoSkillEvents=[];this.counterWinner=-1;this.advantagePlayer=-1;this.counterOccurred=false;
  for(const d of decks){const e=validateDeck(d,db,true);if(e.length)throw Error(e.join(' / '));}
  this.players=decks.map((d,i)=>{const all=d.map(code=>({code,uid:++this.serial,bonus:0})),chars=all.filter(x=>db[x.code].card_type==='Character'),base=chars.filter(x=>+db[x.code].stats.Level===0);return {name:'ผู้เล่น '+(i+1),hp:20,hand:[],deck:this.shuffle(all.filter(x=>db[x.code].card_type==='Action')),reserve:chars.filter(x=>!base.includes(x)),chars:base.map(x=>[x]),leader:0,concerto:[],trash:[],action:[],used:{},locked:false,noFollow:false,taxTurn:0};});
  this.players.forEach((p,i)=>this.draw(i,5));this.setupPlayer=0;this.note('เริ่มเกม • HP 20 • มือ 5 ใบ');if(scenario)this.scenario();
 }
 card(x){return this.db[x.code];} note(s){this.log.unshift(`T${this.turn} · ${s}`);this.log=this.log.slice(0,150);}
 shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(this.rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 check(){const lost=this.players.map(p=>p.hp<=0||(!p.deck.length&&!p.trash.length));if(lost.some(Boolean)){this.winner=lost.every(Boolean)?-1:lost[0]?1:0;this.phase='finished';this.queue=[];this.choice=null;this.after=null;this.note(this.winner<0?'เสมอ':this.players[this.winner].name+' ชนะ');return;}for(const p of this.players)if(!p.deck.length&&p.trash.length){p.deck=this.shuffle(p.trash.splice(0));this.note(p.name+' สับกองทิ้งกลับเข้าเด็ค');}}
 take(i,n,zone='hand',reveal=false){const p=this.players[i],got=[];for(let j=0;j<n;j++){if(!p.deck.length){this.check();if(this.winner!==null)break;}const x=p.deck.shift();if(!x)break;p[zone].push(x);got.push(x);this.check();if(this.winner!==null)break;}if(reveal)this.revealed=got;return got;}
 draw(i,n,reason='skill'){const before=this.players[i].hand.length;const got=this.take(i,n);this.lastDraw={i,count:got.length,before,after:this.players[i].hand.length,turn:this.turn,reason};if(reason==='turn')this.lastTurnDraw=this.lastDraw;this.note(this.players[i].name+' '+(reason==='turn'?'จั่วต้นเทิร์น ':'จั่ว ')+got.length+' ใบ · มือ '+before+' → '+this.players[i].hand.length);}
 addTop(i,n=1){const got=this.take(i,n,'hand',true);this.note(this.players[i].name+' เปิดเผยและนำขึ้นมือ '+got.length+' ใบ');}
 heal(i,n){const p=this.players[i],before=p.hp;p.hp=Math.min(20,before+Math.max(0,n));this.note(p.name+' ฟื้นฟู '+(p.hp-before)+' HP');rules.onHeal(this,i,p.hp-before);}
 damage(i,n){const amount=rules.incomingDamage(this,i,Math.max(0,n)),p=this.players[i],before=p.hp,after=Math.max(0,before-amount);p.hp=after;p.damagedThisTurn=(p.damagedThisTurn||0)+(before-after);this.lastDamage={i,amount:before-after,before,after,turn:this.turn};this.note(p.name+' รับ '+(before-after)+' ดาเมจ');}
 top(i,slot){return this.players[i].chars[slot].at(-1);}
 leaderName(i){return this.card(this.top(i,this.players[i].leader)).name_th;}
 choose(label,i,items,count,done,{optional=false}={}){if(!items.length||count===0){done([]);return;}this.choice={label,i,items,count:Math.min(count,items.length),done,optional};}
 answer(ids){const c=this.choice;if(!c)throw Error('ไม่มีรายการให้เลือก');if(new Set(ids).size!==ids.length||ids.some(id=>!c.items.some(x=>x.uid===id))||(!(c.optional&&ids.length===0)&&ids.length!==c.count))throw Error('เลือกการ์ดให้ครบตามจำนวน');this.choice=null;c.done(c.items.filter(x=>ids.includes(x.uid)));this.check();}
 remove(p,zone,x){const a=p[zone],idx=a.findIndex(y=>y.uid===x.uid);if(idx<0)throw Error('ไม่พบการ์ด');const removed=a.splice(idx,1)[0];if(zone==='action'){removed.bonus=0;delete removed.speedOverride;delete removed.costMod;}return removed;}
 pay(i,n,done){const p=this.players[i];if(p.concerto.length<n)throw Error('Concerto ไม่พอ');this.choose('เลือกการ์ด Concerto เพื่อจ่าย '+n+' cost',i,[...p.concerto],n,xs=>{xs.forEach(x=>p.trash.push(this.remove(p,'concerto',x)));done();});}
 discardCost(i,n,done){if(this.players[i].hand.length<n)return false;this.discard(i,n,done);return true;}
 discard(i,n,done){const p=this.players[i];this.choose('เลือกการ์ดทิ้ง '+n+' ใบ',i,[...p.hand],n,xs=>{xs.forEach(x=>p.trash.push(this.remove(p,'hand',x)));done();});}
 queueSkill(i,x,index,run,optional=false){const a=this.card(x).abilities[index];if(a)this.queue.push({id:++this.serial,i,x,index,ability:a,run,optional});}
 activate(id,skip=false){if(this.choice||this.winner!==null)throw Error('ต้องทำรายการเลือกให้เสร็จก่อน');const k=this.queue.findIndex(q=>q.id===id);if(k<0)throw Error('สกิลนี้ไม่อยู่ในจังหวะใช้งาน');const q=this.queue[k];if(this.queue[0].i!==q.i)throw Error('รอสกิลของเจ้าของเทิร์นก่อน');this.queue.splice(k,1);this.note(`${this.players[q.i].name} ${skip?'ข้าม':'Activate'} ${q.ability.ability_id}`);if(!skip)q.run();this.check();}
 skipAll(){if(this.choice||!this.queue.length)throw Error('ไม่มีสกิลให้ข้าม');const ids=[...this.queue].map(q=>q.id);for(const id of ids)this.activate(id,true);}
 busy(){return this.queue.length||this.choice||this.winner!==null;}
 requireAction(){if(this.busy()||this.phase!=='action')throw Error('ยังไม่ใช่ช่วง Action ที่ทำได้');}
 setup(leader,mulligan=[]){if(this.phase!=='setup'||this.choice)throw Error('ไม่อยู่ช่วงเตรียมเกม');const i=this.setupPlayer,p=this.players[i];if(!p.chars[leader])throw Error('ลีดเดอร์ไม่ถูกต้อง');if(new Set(mulligan).size!==mulligan.length||mulligan.some(id=>!p.hand.some(x=>x.uid===id)))throw Error('เลือกมือไม่ถูกต้อง');p.leader=leader;const original=[...p.hand],slots=original.map((x,n)=>mulligan.includes(x.uid)?n:-1).filter(n=>n>=0),back=original.filter(x=>mulligan.includes(x.uid)),kept=original.filter(x=>!mulligan.includes(x.uid));p.hand=kept;p.deck.push(...back);this.draw(i,back.length,'mulligan');const fresh=back.length?p.hand.splice(-back.length):[];if(fresh.length===back.length){const rebuilt=[];let ki=0,fi=0;for(let n=0;n<original.length;n++)rebuilt[n]=slots.includes(n)?fresh[fi++]:kept[ki++];p.hand=rebuilt;}this.shuffle(p.deck);if(i===0)this.setupPlayer=1;else this.beginTurn();}
 beginTurn(){this.counterOccurred=false;this.phase='start';this.startDrawBonus=0;this.players.forEach(p=>{p.used={};p.locked=false;p.noFollow=false;p.action.forEach(x=>x.bonus=0);});rules.resetTurn(this);this.counterWinner=-1;this.follow=0;this.revealed=[];this.charEvent('start',this.active);this.after=()=>{this.phase='action';this.draw(this.active,(this.turn===1?1:2)+this.startDrawBonus,'turn');this.note('ช่วง Action • '+this.players[this.active].name);};if(!this.queue.length)this.next();}
 switchLeader(i,slot,done=()=>{}){const p=this.players[i];if(p.locked||slot===p.leader||!p.chars[slot])throw Error('สลับ Leader ไม่ได้');const old=p.leader;p.leader=slot;rules.onSwitch(this,i,[old,slot]);this.note(p.name+' เปลี่ยน Leader เป็น '+this.leaderName(i));done();}
 switchAction(slot){this.requireAction();const p=this.players[this.active];if(p.used.switch)throw Error('สลับแล้วในเทิร์นนี้');this.switchLeader(this.active,slot);p.used.switch=true;}
 charge(uid){this.requireAction();const p=this.players[this.active];if(p.used.charge)throw Error('ชาร์จแล้วในเทิร์นนี้');p.concerto.push(this.remove(p,'hand',{uid}));p.used.charge=true;this.note('ชาร์จการ์ดเข้า Concerto');this.check();}
 levelOptions(i,slot){const p=this.players[i],c=this.card(this.top(i,slot));return p.reserve.filter(x=>{const n=this.card(x);return x.code!=='BP01-011'&&n.name_th===c.name_th&&[+c.stats.Level,+c.stats.Level+1].includes(+n.stats.Level);});}
 level(slot,uid){this.requireAction();const i=this.active,p=this.players[i],x=this.levelOptions(i,slot).find(x=>x.uid===uid);if(p.used.level||!x||p.hand.length<+this.card(x).stats.Level)throw Error('Level up ไม่ได้');p.used.level=true;this.discard(i,+this.card(x).stats.Level,()=>{rules.applyLevel(this,i,slot,x);});}
 levelFromDeck(uid){this.requireAction();const p=this.players[this.active],x=p.reserve.find(y=>y.uid===uid);if(!x)throw Error('ไม่พบเป้าหมายใน Character Deck');const slot=p.chars.findIndex(stack=>this.card(stack.at(-1)).name_th===this.card(x).name_th);if(slot<0)throw Error('ต้องเลือกตัวละครชื่อเดียวกัน');this.level(slot,uid);}
 enterSkill(i,x,event='enter'){rules.enterRule(this,i,x,event);}
 findName(i,name,zone='deck'){const p=this.players[i],a=p[zone]||[];return a.find(y=>this.card(y).name_th===name||this.card(y).name_en===name);}
 retrieve(i,pred,note='นำการ์ดขึ้นมือ'){const p=this.players[i],z=p.trash.find(pred);if(!z)return false;p.trash.splice(p.trash.indexOf(z),1);p.hand.push(z);this.note(`${p.name} ${note}`);return true;}
 autoSkill(i,x,label='AUTO SKILL'){this.autoSkillEvents.push({i,uid:x.uid,label});}
 autoLevel(i,name){rules.skillLevel(this,i,name);}
 cost(i,x){return Math.max(0,+this.card(x).stats.cost+(x.costMod||0)-(x.code==='BP01-062'&&rules.hasAdvantage(this,i)?1:0)+(this.players[i].taxTurn===this.turn&&color(this.card(x))===red?1:0));}
 playReason(i,x,combo=false){const p=this.players[i],c=this.card(x);if(this.busy())return 'ทำสกิลหรือรายการเลือกที่ค้างอยู่ก่อน';if(!p.hand.some(y=>y.uid===x.uid))return 'การ์ดไม่อยู่บนมือ';if(!isSupported(x.code))return 'สกิลยังไม่รองรับ';if(combo){if(this.phase!=='combo'||i!==this.counterWinner)return 'ยังไม่ใช่จังหวะ Combo';if(!this.comboAllowed||p.noFollow||this.follow<=0)return 'ไม่มีสิทธิ์โจมตีต่อเนื่อง';if(color(c)!==red)return 'Combo ต้องใช้การ์ดสีแดง';}else if(this.phase!=='select'||this.selectPlayer!==i)return 'ยังไม่ถึงจังหวะเลือก Counter';if(rules.leaderSkillCodes.has(x.code)&&owner(c)!==this.leaderName(i))return 'ต้องใช้ Leader '+owner(c);const echo=rules.echoReason(this,i,x);if(echo)return echo;if(p.concerto.length<this.cost(i,x))return 'Concerto ไม่พอ';return '';}
 startCounter(){this.requireAction();this.counterOccurred=true;this.selected=[null,null];this.phase='counterStart';this.charEvent('counterStart',this.active);this.after=()=>{this.phase='select';this.selectPlayer=this.active;this.note('เลือก Counter คว่ำหน้า • เจ้าของเทิร์นเลือกก่อน');};if(!this.queue.length&&!this.choice)this.next();}
 select(uid){const i=this.selectPlayer,p=this.players[i],x=p.hand.find(x=>x.uid===uid);if(!x)throw Error('ไม่พบการ์ด');const reason=this.playReason(i,x);if(reason)throw Error(reason);this.selected[i]=this.remove(p,'hand',x);p.action.push(x);this.selectedDone();}
 passCounter(){if(this.phase!=='select'||this.busy())throw Error('ข้ามไม่ได้');const i=this.selectPlayer;if(i===this.active&&this.players[i].hand.some(x=>!this.playReason(i,x)))throw Error('เจ้าของเทิร์นต้องเลือกการ์ดที่ใช้ได้');if(i===this.active)this.revealed=[...this.players[i].hand];this.selectedDone();}
 selectedDone(){if(this.selectPlayer===this.active){this.selectPlayer=1-this.active;return;}this.phase='counter';const order=[this.active,1-this.active];const payNext=k=>{if(k===2){for(const i of order)if(this.selected[i])rules.onPlay(this,i,this.selected[i],'counter');for(const i of order)this.charEvent('counter',i);for(const i of order)if(this.selected[i])this.actionEvent('counter',i,this.selected[i]);this.sortQueue();this.after=()=>this.judge();return;}const i=order[k],x=this.selected[i];if(x)this.pay(i,this.cost(i,x),()=>payNext(k+1));else payNext(k+1);};payNext(0);}
 sortQueue(){this.queue.sort((a,b)=>(a.i===this.active?0:1)-(b.i===this.active?0:1));}
  judge(){this.phase='judgement';this.counterWinner=judgement(...this.selected.map(x=>x?rules.resolvedCard(this,x):null),this.active);this.lastClash={cards:this.selected.map(x=>x?{code:x.code,uid:x.uid}:null),winner:this.counterWinner};this.comboAllowed=this.counterWinner>=0&&color(this.card(this.selected[this.counterWinner]))===red;this.follow=this.comboAllowed?Infinity:0;this.note(this.counterWinner<0?'ผล Counter: เสมอ':'ชนะ Counter: '+this.players[this.counterWinner].name);for(const i of [this.active,1-this.active])this.charEvent('judgement',i);for(const i of [this.active,1-this.active])if(this.selected[i])this.actionEvent('judgement',i,this.selected[i]);this.sortQueue();this.after=()=>{if(this.counterWinner>=0){this.damage(1-this.counterWinner,this.attack(this.counterWinner,this.selected[this.counterWinner]));this.actionEvent('damageDealt',this.counterWinner,this.selected[this.counterWinner]);this.check();if(this.winner===null)this.phase='combo';}else this.endCounter();};}
 attack(i,x){return Math.max(0,+this.card(x).stats.attack+(x.bonus||0)+rules.attackBonus(this,i,x));}
  combo(uid){const i=this.counterWinner,p=this.players[i],x=p.hand.find(x=>x.uid===uid);if(!x)throw Error('ไม่พบการ์ด');const reason=this.playReason(i,x,true);if(reason)throw Error(reason);this.pay(i,this.cost(i,x),()=>{p.action.push(this.remove(p,'hand',x));this.follow--;this.phase='comboSkill';rules.onPlay(this,i,x,'combo');this.actionEvent('combo',i,x);if(p.chars[p.leader].some(y=>y.code==='SD02-005')){x.bonus++;this.note('Jinshi Leader: Combo +1 ดาเมจ');}this.after=()=>{this.damage(1-i,this.attack(i,x));this.actionEvent('damageDealt',i,x);this.check();if(this.winner===null)this.phase='combo';};});}
 endCounter(){if(this.busy())throw Error('ทำสกิลที่ค้างก่อน');this.phase='counterEnd';for(const i of [this.active,1-this.active]){this.charEvent('counterEnd',i);for(const d of this.players[i].delayedDamage||[])this.queueSkill(i,d.source,0,()=>this.damage(1-i,this.attack(i,d.card)));this.players[i].delayedDamage=[];for(const x of [...this.players[i].action])this.actionEvent('counterEnd',i,x);}this.after=()=>this.endTurn();}
 endTurn(){if(this.busy())throw Error('ทำสกิลที่ค้างก่อน');this.phase='end';for(const i of [this.active,1-this.active])this.charEvent('end',i);this.after=()=>{for(const p of this.players){p.action.forEach(x=>{x.bonus=0;delete x.speedOverride;delete x.costMod;});p.trash.push(...p.action.splice(0));}this.check();if(this.winner!==null)return;const finish=()=>{this.advantagePlayer=this.counterOccurred?this.counterWinner:1-this.active;this.active=1-this.active;this.turn++;this.beginTurn();};const excess=this.players[this.active].hand.length-8;if(excess>0)this.discard(this.active,excess,finish);else finish();};}
 next(){if(this.busy())throw Error('ดำเนินสกิลหรือเลือกการ์ดที่ค้างก่อน');const fn=this.after;this.after=null;if(fn)fn();}
 charEvent(event,i){const p=this.players[i],own=this.selected?.[i],opp=this.selected?.[1-i],oc=own?color(this.card(own)):null,ec=opp?color(this.card(opp)):null,win=this.counterWinner===i;
  for(let slot=0;slot<p.chars.length;slot++)for(const x of p.chars[slot]){const lead=slot===p.leader,q=(fn,opt=false)=>this.queueSkill(i,x,0,fn,opt);if(rules.characterRule(this,event,i,x,lead,win,oc,ec))continue;
   if(event==='start'&&x.code==='SD01-001'){this.startDrawBonus=(this.startDrawBonus||0)+1;this.autoSkill(i,x,'START TURN · DRAW');this.note('Rover (F) · สกิลเริ่มเทิร์น: เพิ่มจั่ว 1 ใบอัตโนมัติ');}
   if(event==='end'&&i===this.active&&x.code==='BP01-022'&&p.hand.length&&!p.locked&&slot!==p.leader)q(()=>this.discardCost(i,1,()=>this.switchLeader(i,slot)));
   if(event==='counter'&&lead){if(x.code==='BP01-007'&&p.hand.length<=4)q(()=>this.draw(i,5-p.hand.length),true);if(x.code==='BP01-010'&&oc===green)q(()=>this.addTop(i),true);if(x.code==='BP01-018'&&oc===green)q(()=>this.addTop(i,2),true);if(x.code==='BP01-030'&&oc===red){this.autoSkill(i,x,'COUNTER · DAMAGE');this.damage(1-i,1);}if(x.code==='BP01-024'&&oc===blue)q(()=>this.take(i,1,'concerto',true),true);if(x.code==='SD01-003'&&ec===red)q(()=>{const enemy=this.players[1-i];this.choose('ฝ่ายตรงข้ามเลือกจ่าย 1 Concerto หรือไม่เลือกเพื่อรับ 3 ดาเมจ',1-i,[...enemy.concerto],1,xs=>{if(xs.length)enemy.trash.push(this.remove(enemy,'concerto',xs[0]));else this.damage(1-i,3);},{optional:true});});}
   if(event==='judgement'&&lead){if(x.code==='BP01-005'&&win){const z=p.trash.find(y=>y.code==='BP01-044');if(z){p.trash.splice(p.trash.indexOf(z),1);p.hand.push(z);this.note('Camellya นำ Basic Attack กลับมือ');}}if(x.code==='BP01-004'&&!win&&oc===red&&ec===blue)q(()=>this.addTop(i),true);if(x.code==='BP01-010'&&win&&oc===green)this.heal(i,1);if(x.code==='BP01-029'&&win&&oc===red){this.autoSkill(i,x,'JUDGEMENT · DAMAGE');this.damage(1-i,2);}if((x.code==='SD01-002'&&oc===green&&ec===red||x.code==='SD02-006'&&oc===red&&ec===blue||x.code==='SD01-004'&&oc===blue&&ec===green)&&!win)q(()=>this.addTop(i),true);if(x.code==='BP01-016'&&win&&oc===green&&ec===blue&&p.hand.length<8)q(()=>this.draw(i,Math.max(0,8-p.hand.length)));if(x.code==='BP01-028'&&win&&i===this.active)q(()=>{const got=this.take(i,5,'hand',true);for(const y of got)if(owner(this.card(y))!=='Jinshi')p.trash.push(this.remove(p,'hand',y));});}
  }
 }
 intro(i,x,target,effect,afterSwitch=()=>{}){const p=this.players[i];if(p.locked)return;const options=p.chars.map((stack,slot)=>({...stack.at(-1),slot})).filter(z=>z.slot!==p.leader);this.choose('เลือกตัวละครสลับเข้า Leader',i,options,1,xs=>{if(!xs.length)return;this.switchLeader(i,xs[0].slot);afterSwitch();if(this.leaderName(i)===target)effect();});}
 actionEvent(event,i,x){if(rules.actionRule(this,event,i,x))return;const p=this.players[i],win=this.counterWinner===i,q=(idx,fn,opt=false)=>this.queueSkill(i,x,idx,fn,opt),follow=n=>{this.follow+=n;};
  if(event==='counter'){if(x.code==='BP01-055'&&p.hp>this.players[1-i].hp)x.bonus+=1;if(x.code==='SD02-010')q(0,()=>{p.locked=true;});if(x.code==='BP01-074')q(2,()=>{p.noFollow=true;});}
  if(event==='judgement'&&win){
   const simple={'SD01-015':[1,1],'SD01-021':[1,2],'SD01-013':[0,2],'BP01-069':[0,1],'BP01-066':[1,0],'BP01-075':[1,0]};
   if(simple[x.code])q(0,()=>{const [n,f]=simple[x.code];if(n)this.draw(i,n);follow(f);});
   if(x.code==='SD02-010')q(1,()=>{this.draw(i,3);follow(8);});
   if(x.code==='SD01-018')q(0,()=>{this.draw(i,1);this.discard(i,1,()=>{});});
   if(x.code==='SD01-020')q(0,()=>{this.draw(i,1);this.revealed=[...this.players[1-i].hand];this.note('Sensor: เปิดเผยมือฝ่ายตรงข้าม');});
   if(x.code==='SD01-023')q(0,()=>{this.heal(i,5);});
   if(x.code==='SD01-016')q(0,()=>{this.players[1-i].taxTurn=this.turn+1;});
   if(x.code==='BP01-070')q(0,()=>this.choose('เลือกการ์ดสีฟ้าจากกองทิ้งขึ้นมือ',i,p.trash.filter(y=>color(this.card(y))===blue),1,xs=>xs.forEach(y=>p.hand.push(this.remove(p,'trash',y)))));
   if(x.code==='BP01-073')q(1,()=>this.choose('ค้นหา Incarnation ในเด็ค',i,p.deck.filter(y=>y.code==='SD02-010'),1,xs=>{xs.forEach(y=>p.hand.push(this.remove(p,'deck',y)));this.revealed=[...xs];this.shuffle(p.deck);}));
  }
  if(event==='combo'){
   if(x.code==='BP01-050'&&p.action.length>=2)q(0,()=>{x.bonus+=1;});
   if(x.code==='BP01-067'&&p.hand.length)q(0,()=>this.discardCost(i,1,()=>{x.bonus++;}),true);
   if(x.code==='SD01-019')q(0,()=>this.intro(i,x,'Rover (F)',()=>this.draw(i,1)));
   if(x.code==='SD01-014')q(0,()=>this.intro(i,x,'Yangyang',()=>this.take(i,1,'concerto',true)));
   if(x.code==='SD02-009')q(0,()=>this.intro(i,x,'Jinshi',()=>{x.bonus+=2;}));
   if(x.code==='SD02-011'&&p.action.length>=3)q(0,()=>{x.bonus+=3;});
   if(x.code==='BP01-074'){q(1,()=>{x.bonus+=p.action.length;});q(2,()=>{p.noFollow=true;});}
   if(x.code==='BP01-065'&&p.hand.length)q(0,()=>this.discardCost(i,1,()=>{x.bonus++;}),true);
   if(x.code==='BP01-071'&&(p.playedThisTurn||[]).some(y=>this.card(y).tags.includes('Airborn')))q(0,()=>this.take(i,1,'concerto',true));
  }
  if(event==='counterEnd'&&x.code==='BP01-069'&&this.leaderName(i)==='Yangyang'&&p.concerto.length)q(1,()=>{if(this.leaderName(i)==='Yangyang'&&p.concerto.length&&p.action.includes(x))this.pay(i,1,()=>p.hand.push(this.remove(p,'action',x)));},true);
 }
 scenario(){
  for(let i=0;i<2;i++){const p=this.players[i];p.deck.push(...p.hand.splice(0));const wanted=i===0?['SD01-020','SD01-017','SD01-019','SD02-010','SD01-014']:['SD02-008','SD02-007','SD01-013','SD02-009','SD01-012'];for(const code of wanted){const at=p.deck.findIndex(x=>x.code===code);if(at>=0)p.hand.push(p.deck.splice(at,1)[0]);}if(this.seedConcerto)this.take(i,3,'concerto');p.leader=p.chars.findIndex(s=>this.card(s.at(-1)).name_th===(i===0?'Rover (F)':'Jinshi'));}
  this.phase='action';this.note('ฉากทดลอง: มือกำหนดไว้ • '+(this.seedConcerto?'Concerto เตรียมไว้ 3 ใบ':'Concerto เริ่มว่างตามกฎ'));
 }
}




