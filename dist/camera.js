export const POSES={overview:{target:[.2,1.35,.65],width:6.6,height:3.8},basket:{target:[-1.15,1.25,.85],width:2.9,height:3.2},brew:{target:[-.55,1.3,.75],width:2.5,height:3.1},glass:{target:[1.9,.76,1.2],width:3.05,height:2.15},glassPour:{target:[.8,.85,1.05],width:3.1,height:2.3},served:{target:[1.4,.8,2.13],width:1.65,height:2.1},hero:{target:[1.6,.8,1.3],width:1.65,height:2.1}};
export class CameraDirector{
 constructor(camera,controls,reduced){this.camera=camera;this.controls=controls;this.reduced=reduced;this.pose='overview';this.tween=null;this.aspect=1;}
 destination(pose){const p=POSES[pose],fov=this.camera.fov*Math.PI/180;const distance=Math.max(p.height,p.width/this.aspect)/(2*Math.tan(fov/2))/.76;const target=[...p.target];return{target,position:[target[0]+distance*.08,target[1]+distance*.27,target[2]+distance*.96]};}
 go(pose,{immediate=false}={}){this.pose=pose;const end=this.destination(pose);if(immediate||this.reduced.matches){this.camera.position.fromArray(end.position);this.controls.target.fromArray(end.target);this.controls.update();this.tween=null;return;}this.tween={elapsed:0,from:this.camera.position.toArray(),target:this.controls.target.toArray(),end};}
 resize(aspect){this.aspect=aspect;this.go(this.pose,{immediate:true});}
 interrupt(){this.tween=null;}
 update(dt){if(!this.tween)return;const t=this.tween;t.elapsed=Math.min(1,t.elapsed+dt);const k=t.elapsed*t.elapsed*(3-2*t.elapsed);this.camera.position.fromArray(t.from.map((v,i)=>v+(t.end.position[i]-v)*k));this.controls.target.fromArray(t.target.map((v,i)=>v+(t.end.target[i]-v)*k));this.controls.update();if(t.elapsed>=1)this.tween=null;}
}
