import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {createBasket,updatePuck} from '../dist/basket.js';
test('compressed grounds remain visible through the actual basket geometry at every usable dose',()=>{
 const {basket,puck}=createBasket(new THREE.MeshBasicMaterial(),new THREE.MeshBasicMaterial());
 for(const grams of [2,5,12,18,22])for(const compression of [0,.65,1]){
  updatePuck(puck,grams,compression);basket.updateMatrixWorld(true);puck.updateMatrixWorld(true);
  for(const x of [0,.08,-.08]){
   const ray=new THREE.Raycaster(new THREE.Vector3(x,1,0),new THREE.Vector3(0,-1,0));
   const hit=ray.intersectObjects([basket,puck])[0];
   assert.equal(hit?.object,puck,`${grams}g at compression ${compression} must show coffee, not metal`);
  }
 }
});
