// Unit-test adapter only: real Three.js geometry/raycasting, no GPU or browser rendering.
export * from '../../dist/vendor/three.module.js';
import {Texture} from '../../dist/vendor/three.module.js';
export class WebGLRenderer{constructor(){this.domElement=document.createElement('canvas');this.shadowMap={};}setPixelRatio(){}setSize(w,h){this.domElement.clientWidth=w;this.domElement.clientHeight=h;}render(scene,camera){scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);}dispose(){}}
export class PMREMGenerator{fromScene(){return{texture:new Texture(),dispose(){}};}dispose(){}}
