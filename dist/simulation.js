import {IcePhysics} from './ice-physics.js';
export const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
export const RECIPE={grounds:18,shot:36,milk:150,ice:10,sugar:5,turns:3};
export const HOMES={portafilter:[-1.9,.16,1.5],tamper:[-1.17,0,1.57],cup:[-.48,0,1.65],milk:[2.55,0,.35],glass:[1.6,0,1.3],spoon:[.65,.04,2.05],iceScoop:[3.05,.78,1.74]};
export const STATIONS={sugar:[.7,0,1.35],coaster:[1.4,.062,2.13]};
export const SLOTS={grinder:[-1.54,1.52,.58],group:[-.26,1.7,.55],brew:[-.26,.34,.61]};
const empty=()=>({coffee:0,milk:0,ice:0,sugar:0});
export const quantity=v=>Object.values(v.contents).reduce((a,b)=>a+b,0);
export const liquidVolume=v=>v.contents.coffee+v.contents.milk+v.contents.sugar*.65;
export const occupied=v=>liquidVolume(v)+v.contents.ice;
export class Playground{
 constructor(){this.reset();}
 reset(){this.generation=(this.generation||0)+1;this.power=true;this.objects=Object.fromEntries(Object.entries(HOMES).map(([id,p])=>[id,{id,position:[...p],held:false,slot:null,tilt:0}]));this.vessels={cup:{capacity:80,contents:empty()},milk:{capacity:450,contents:{...empty(),milk:450}},glass:{capacity:400,contents:empty()}};this.grounds=0;this.compression=0;this.lock=0;this.extracted=0;this.shotProgress=0;this.completedShots=0;this.grinding=false;this.brewing=false;this.pouring=null;this.flow=null;this.pressure=0;this.mixing=0;this.stirAngle=0;this.stirVelocity=0;this.sugarDissolved=0;this.sugarSkipped=false;this.spoonLoaded=false;this.iceScoopLoaded=4;this.overflow=empty();this.layers=[];this.ripple=0;this.served=false;this.icePhysics=new IcePhysics();this.ice=Array.from({length:RECIPE.ice},(_,i)=>({id:`ice${i}`,home:[2.55+(i%3)*.26,.22,1.6+Math.floor(i/3)*.28],position:[2.55+(i%3)*.26,.22,1.6+Math.floor(i/3)*.28],rotation:[i*.4,i*.7,i*.2],inside:false,held:false,velocity:[0,0,0]}));}
 object(id){return this.objects[id]??this.ice.find(c=>c.id===id);}
 pick(id){const o=this.object(id);if(!o||o.held||o.inside||(id==='portafilter'&&this.lock>.1))return false;if(id==='cup')this.brewing=false;if(id==='glass'){this.served=false;if(this.pouring){const from=this.pouring.from;this.pouring=null;this.flow=null;this.returnHome(from);}}if(this.pouring?.from===id){this.pouring=null;this.flow=null;}if(id==='iceScoop'&&!this.iceScoopLoaded)this.loadIceScoop();delete o.returnFrom;o.held=true;o.slot=null;return true;}
 put(id,p,slot=null){const o=this.object(id);if(!o)return false;delete o.returnFrom;o.position=[...p];o.slot=slot;o.held=false;o.tilt=0;return true;}
 supportY(surface){return (this.surfaces?.[surface]??(surface==='coaster'?.06:-.025))-(this.glassBottom??0)+.002;}
 returnHome(id){const o=this.object(id);if(!o||!HOMES[id])return false;const from=[...o.position];this.put(id,HOMES[id]);o.returnFrom=from;o.returnSerial=(o.returnSerial||0)+1;return true;}
 placeOnCounter(id,p){const o=this.object(id);if(!o)return false;const margin=id==='glass'?.44:id==='milk'?.35:.2;let x=clamp(p[0],-3.5+margin,3.5-margin),z=clamp(p[2],-1.6+margin,2.5-margin);if(x>-2.5-margin&&x<.95+margin&&z<1.05+margin)z=1.05+margin;const y=id==='glass'?this.supportY('counter'):id==='portafilter'?.16:id==='spoon'?.04:id.startsWith('ice')?.14:0;this.put(id,[x,y,z]);delete o.pourHome;if(id==='portafilter')this.lock=0;return true;}
 dock(id,slot){if(!((id==='portafilter'&&['grinder','group'].includes(slot))||(id==='cup'&&slot==='brew')))return false;this.put(id,SLOTS[slot],slot);return true;}
 twist(value){if(this.objects.portafilter.slot!=='group')return false;this.lock=clamp(value,0,1);if(this.lock<.9)this.brewing=false;return true;}
 tamp(value=1){if(this.grounds<1||this.lock>.1)return false;this.compression=Math.max(this.compression,clamp(value,0,1));return true;}
 beginGrind(){this.served=false;this.grinding=this.power&&this.objects.portafilter.slot==='grinder'&&this.grounds<RECIPE.grounds;return this.grinding;}
 brewProblem(){if(!this.power)return'power';if(this.grounds<RECIPE.grounds-.01)return'grind';if(this.compression<.65)return'tamp';if(this.objects.portafilter.slot!=='group'||this.lock<.9)return'lock';if(this.objects.cup.slot!=='brew')return'cup';if(this.vessels.cup.contents.coffee+RECIPE.shot-this.shotProgress>this.vessels.cup.capacity+.001)return'cupFull';return null;}
 beginBrew(){this.brewing=!this.brewProblem();return this.brewing;}
 stop({keepBrew=false,keepAutomatic=false}={}){this.grinding=false;if(!keepBrew)this.brewing=false;if(!keepAutomatic||!this.pouring?.automatic)this.pouring=null;this.stirVelocity=0;this.flow=null;}
 remaining(from){return from==='cup'?this.vessels.cup.contents.coffee:RECIPE.milk-this.vessels.glass.contents.milk;}
 canPour(from,to='glass'){return ['cup','milk'].includes(from)&&to==='glass'&&liquidVolume(this.vessels[from])>.001&&this.remaining(from)>.001&&occupied(this.vessels.glass)<400;}
 autoPour(from){if(!this.canPour(from))return false;const o=this.objects[from],g=this.objects.glass.position,h=from==='cup'?.36:.79;o.position=[g[0]+Math.sin(1.1)*h,g[1]+1.6-Math.cos(1.1)*h,g[2]];o.tilt=1.1;o.held=false;o.slot='pour';this.pouring={from,to:'glass',tilt:.85,automatic:true};return true;}
 pour(from,to,tilt){this.pouring=this.canPour(from,to)&&tilt>.05?{from,to,tilt:clamp(tilt,0,1)}:null;return!!this.pouring;}
 transfer(from,to,amount){if(!this.canPour(from,to))return 0;const a=this.vessels[from],b=this.vessels[to],key=from==='cup'?'coffee':'milk';const moved=Math.max(0,Math.min(amount,a.contents[key],this.remaining(from),b.capacity-occupied(b)));a.contents[key]-=moved;b.contents[key]+=moved;if(moved){this.served=false;const last=this.layers.at(-1);if(last?.ingredient===key)last.amount+=moved;else this.layers.push({ingredient:key,amount:moved});if(key==='coffee')this.mixing=Math.min(this.mixing,.7);this.ripple=1;}return moved;}
 get bucketRemaining(){return Math.max(0,this.ice.filter(c=>!c.inside).length-this.iceScoopLoaded);}
 loadIceScoop(){this.iceScoopLoaded=Math.min(4,this.ice.filter(c=>!c.inside).length);return this.iceScoopLoaded>0;}
 addIceScoop(){let added=0;const count=this.iceScoopLoaded;for(let i=0;i<count;i++){const c=this.ice.find(c=>!c.inside);if(!c||!this.addIce(c.id))break;c.position[1]+=i*.17;added++;}this.returnHome('iceScoop');this.loadIceScoop();return added;}
 addIce(id){const c=this.object(id),v=this.vessels.glass;if(!c||c.inside||v.contents.ice+20>v.capacity)return false;
 // Ice can be added after liquid. Displaced liquid is measured, never silently lost.
 const displaced=Math.max(0,occupied(v)+20-v.capacity),liquid=liquidVolume(v);if(displaced&&liquid){const ratio=Math.min(1,displaced/liquid);for(const key of ['coffee','milk','sugar']){const amount=v.contents[key]*ratio;v.contents[key]-=amount;this.overflow[key]+=amount;}}
 c.inside=true;c.held=false;this.iceScoopLoaded=Math.max(0,this.iceScoopLoaded-1);c.position=[((Number(id.slice(3))%3)-1)*.17,1.65,(Number(id.slice(3))%2-.5)*.22];c.velocity=[.03,-.2,.02];v.contents.ice+=20;this.ripple=1;return true;}
 scoop(){this.spoonLoaded=true;}
 addSugar(){if(!this.spoonLoaded)return false;this.spoonLoaded=false;const v=this.vessels.glass,amount=Math.min(RECIPE.sugar,Math.max(0,(v.capacity-occupied(v))/.65));if(amount<.00001)return false;this.served=false;v.contents.sugar+=amount;this.sugarSkipped=false;this.sugarDissolved=0;this.mixing=Math.min(this.mixing,.8);this.ripple=1;return true;}
 skipSugar(){this.sugarSkipped=true;this.spoonLoaded=false;}
 serveDrink(){if(occupied(this.vessels.glass)<1)return false;for(const id of ['milk','cup'])if(this.objects[id].slot==='pour')this.returnHome(id);this.stop();this.put('glass',[STATIONS.coaster[0],this.supportY('coaster'),STATIONS.coaster[2]],'coaster');this.served=true;if(this.objects.spoon.slot==='stir')this.returnHome('spoon');return true;}
 newDrink(){this.stop();this.returnHome('milk');this.returnHome('cup');this.vessels.glass.contents=empty();this.vessels.milk.contents.milk=450;this.returnHome('glass');this.returnHome('spoon');this.returnHome('iceScoop');this.spoonLoaded=false;this.sugarSkipped=false;this.mixing=0;this.stirAngle=0;this.stirVelocity=0;this.sugarDissolved=0;this.layers=[];this.ripple=0;this.served=false;this.overflow=empty();this.icePhysics=new IcePhysics();for(const c of this.ice){c.inside=false;c.held=false;c.position=[...c.home];c.velocity=[0,0,0];}this.loadIceScoop();return true;}
 stir(delta,dt=.016){if(this.vessels.glass.contents.coffee<1||this.vessels.glass.contents.milk<1)return false;const angle=clamp(delta,-.45,.45);this.stirAngle+=angle;this.stirVelocity=clamp(angle/Math.max(dt,.016),-8,8);this.mixing=clamp(this.mixing+Math.abs(angle)/(Math.PI*2*RECIPE.turns),0,1);this.sugarDissolved=this.mixing;this.ripple=1;return true;}
 tick(dt){dt=clamp(dt,0,.1);this.flow=null;this.ripple=Math.max(0,this.ripple-dt*.8);this.stirVelocity*=Math.exp(-dt*3);
 if(this.grinding){if(!this.power||this.objects.portafilter.slot!=='grinder')this.grinding=false;else{this.grounds=Math.min(RECIPE.grounds,this.grounds+dt*6);this.compression=0;if(this.grounds>=RECIPE.grounds){this.grinding=false;this.returnHome('portafilter');}}}
 if(this.brewing){if(this.brewProblem())this.brewing=false;else{const amount=Math.min(dt*6,RECIPE.shot-this.shotProgress);this.vessels.cup.contents.coffee+=amount;this.shotProgress+=amount;this.extracted+=amount;this.flow={from:'spout',to:'cup',amount};if(this.shotProgress>=RECIPE.shot-.001){this.brewing=false;this.shotProgress=0;this.completedShots++;this.grounds=0;this.compression=0;this.lock=0;this.returnHome('portafilter');}}}
 this.pressure+=((this.brewing?9:0)-this.pressure)*Math.min(1,dt*5);
 if(this.pouring){const{from,to,tilt,automatic}=this.pouring,amount=this.transfer(from,to,dt*65*tilt);if(amount>0)this.flow={from,to,amount};if(!this.canPour(from,to)){this.pouring=null;if(automatic)this.returnHome(from);}}
 this.icePhysics.update(this.ice,dt,{liquid:liquidVolume(this.vessels.glass),occupied:occupied(this.vessels.glass),stir:this.stirVelocity,glass:this.objects.glass.position});
 }
 get summary(){return`Grounds ${this.grounds.toFixed(0)} grams. ${this.compression>=.65?'Tamped':'Not tamped'}. ${this.lock>=.9?'Locked':'Unlocked'}. ${this.completedShots} espresso shots, ${this.extracted.toFixed(0)} millilitres extracted. Glass: ${this.ice.filter(c=>c.inside).length} ice cubes, ${this.vessels.glass.contents.milk.toFixed(0)} millilitres milk, ${this.vessels.glass.contents.coffee.toFixed(0)} millilitres espresso, ${this.vessels.glass.contents.sugar.toFixed(0)} grams sugar. ${this.mixing>=.99?'Coffee ready':`Stirred ${Math.round(this.mixing*100)} percent`}.`;}
}
