import * as THREE from './vendor/three.module.js';

// The rim must have an open centre: a capped cylinder hides the compressed puck.
export function createBasket(metal,coffee){
 const profile=[[0,-.065],[.19,-.065],[.22,.065],[.198,.065],[.168,-.043],[0,-.043]];
 const basket=new THREE.Mesh(new THREE.LatheGeometry(profile.map(([x,y])=>new THREE.Vector2(x,y)),48),metal);
 const puck=new THREE.Mesh(new THREE.CylinderGeometry(.193,.168,.04,48),coffee);
 basket.castShadow=basket.receiveShadow=puck.receiveShadow=true;
 return{basket,puck};
}
export function updatePuck(puck,grounds,compression){
 const height=.045+Math.min(1,grounds/18)*.075*(1-compression*.25);
 puck.visible=grounds>.1;
 puck.position.y=-.035+height/2;
 puck.scale.y=height/.04;
}
