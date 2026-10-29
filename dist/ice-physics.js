// Small, fixed-step rigid-particle approximation: gravity, buoyancy, contacts,
// drag and resting sleep. No time-driven bobbing or perpetual orbit animation.
const STEP=1/120,RADIUS=.116;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export class IcePhysics{
 constructor(){this.accumulator=0;this.signature='';this.quiet=0;this.sleeping=false;this.previousGlass=null;}
 update(cubes,dt,{liquid,occupied,stir,glass}){
  const bodies=cubes.filter(c=>c.inside),signature=`${liquid.toFixed(4)}:${occupied.toFixed(4)}:${bodies.length}`;
  const moved=this.previousGlass&&glass.some((v,i)=>Math.abs(v-this.previousGlass[i])>.0001);
  const disturbed=signature!==this.signature||Math.abs(stir)>.03||moved;
  if(disturbed){this.sleeping=false;this.quiet=0;}
  this.signature=signature;this.previousGlass=[...glass];
  if(!bodies.length||this.sleeping)return;
  this.accumulator+=Math.min(dt,.1);
  while(this.accumulator>=STEP){this.accumulator-=STEP;this.step(bodies,STEP,liquid,occupied,stir,disturbed);}
 }
 step(bodies,h,liquid,occupied,stir,disturbed){
  const surface=.14+occupied/400*1.16,target=Math.max(.24,surface+.015),before=bodies.map(c=>[...c.position]);
  for(const c of bodies){const p=c.position,v=c.velocity,wet=liquid>0&&p[1]<surface+.18;
   const ax=-p[2]*stir*.32,az=p[0]*stir*.32;
   v[0]+=(ax-v[0])*Math.min(1,h*6);v[2]+=(az-v[2])*Math.min(1,h*6);
   v[1]+=(wet?24*(target-p[1])-11*v[1]:-5-1.5*v[1])*h;
   for(let k=0;k<3;k++)p[k]+=v[k]*h;
   c.rotation[1]+=stir*h*.16;
  }
  // Iterative position contacts resolve stacked cubes without injecting bounce energy.
  for(let pass=0;pass<8;pass++){
   for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){
    const a=bodies[i],b=bodies[j],d=a.position.map((v,k)=>v-b.position[k]);let length=Math.hypot(...d);
    if(length>=RADIUS*2)continue;if(length<1e-7){d[0]=1;d[1]=d[2]=0;length=1;}
    const n=d.map(v=>v/length),overlap=RADIUS*2-Math.hypot(...a.position.map((v,k)=>v-b.position[k]));
    for(let k=0;k<3;k++){a.position[k]+=n[k]*overlap*.5;b.position[k]-=n[k]*overlap*.5;}
    const closing=a.velocity.reduce((sum,v,k)=>sum+(v-b.velocity[k])*n[k],0);
    if(closing<0)for(let k=0;k<3;k++){a.velocity[k]-=n[k]*closing*.5;b.velocity[k]+=n[k]*closing*.5;}
   }
   for(const c of bodies){const p=c.position,v=c.velocity;
    if(p[1]<.24){p[1]=.24;v[1]=Math.max(0,v[1])*.04;v[0]*=.8;v[2]*=.8;}
    const r=Math.hypot(p[0],p[2]),maxR=.17+clamp((p[1]-.14)/1.28,0,1)*.11;
    if(r>maxR){const nx=p[0]/r,nz=p[2]/r;p[0]=nx*maxR;p[2]=nz*maxR;const outward=v[0]*nx+v[2]*nz;if(outward>0){v[0]-=outward*nx;v[2]-=outward*nz;}}
   }
  }
  const travel=Math.max(...bodies.map((c,i)=>Math.hypot(...c.position.map((v,k)=>v-before[i][k]))));
  if(!disturbed&&travel<.00012){this.quiet+=h;}else this.quiet=0;
  if(this.quiet>.65){this.sleeping=true;this.accumulator=0;for(const c of bodies)c.velocity=[0,0,0];}
 }
}
