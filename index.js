import * as THREE from 'three';
import { Scene } from './scene.js';


// const hdriPath = '/hdri/studio011small.hdr';
const hdriPath = '/hdri/pine_attic_1k.hdr';
const modelPath = '/model/cardboard_box_5_2.glb';
const canvas = document.getElementById('canvas');
const mainScene = new Scene(canvas, hdriPath, modelPath);
mainScene.modelLoader.addAnnotation('open', new THREE.Vector3(0, 1.5, 0), '/icon/unboxing.png');
mainScene.modelLoader.addAnnotation('close', new THREE.Vector3(3, 2, 0), '/icon/box.png');
mainScene.modelLoader.setAnnotationVisibility('close', false);

mainScene.modelLoader.triggerInteraction('open', () => {
    
    mainScene.modelLoader.playAnimation('open_animation');
    mainScene.modelLoader.setAnnotationVisibility('open', false);
    setTimeout(()=>{
        mainScene.modelLoader.setAnnotationVisibility('close', true);
    }, 2000);
    
});

mainScene.modelLoader.triggerInteraction('close', () => {
    mainScene.modelLoader.playAnimation('close');
    mainScene.modelLoader.setAnnotationVisibility('close', false);
    setTimeout(()=>{
        mainScene.modelLoader.setAnnotationVisibility('open', true);
    }, 2400);
    
})


mainScene.animate();



