import * as THREE from 'three';
import { Scene } from './scene.js';
import { proxyCreator } from './proxyCreator.js';

const hdriPath = '/hdri/empty_warehouse_01_1k.hdr';
const modelPath = '/model/cardboard_and_cream_anim03.glb';
const canvas = document.getElementById('canvas');
const mainScene = new Scene(canvas, hdriPath, modelPath);
mainScene.modelLoader.addAnnotation('open', new THREE.Vector3(0, 1.5, 0), '/icon/unboxing.png');
mainScene.modelLoader.addAnnotation('close', new THREE.Vector3(3, 2, 0), '/icon/box.png');
mainScene.modelLoader.addAnnotation('jarInBox', new THREE.Vector3(0, 3, 1), '/icon/undo.png', 0.33, 0.33); 

mainScene.modelLoader.setAnnotationVisibility('open', false);
mainScene.modelLoader.setAnnotationVisibility('close', false);
mainScene.modelLoader.setAnnotationVisibility('jarInBox', false);

mainScene.creamProxy.hide();
mainScene.capProxy.hide();


setTimeout(()=>{
    mainScene.modelLoader.setAnnotationVisibility('open', true);
}, 900);


mainScene.modelLoader.triggerInteraction('open', () => {
    
    mainScene.modelLoader.playAnimation('open_animation', 'close');
    mainScene.modelLoader.setAnnotationVisibility('open', false);
    mainScene.creamProxy.setOpacityPulse(true);
    setTimeout(()=>{
        mainScene.modelLoader.setAnnotationVisibility('close', true);
        mainScene.creamProxy.setOpacityPulse(true);
        mainScene.creamProxy.show();
    }, 1800);
    
});

mainScene.modelLoader.triggerInteraction('close', () => {
    mainScene.modelLoader.playAnimation('close', 'open_animation');
    mainScene.modelLoader.setAnnotationVisibility('close', false);
    setTimeout(()=>{
        mainScene.modelLoader.setAnnotationVisibility('open', true);
    }, 2400);
    
})

mainScene.creamProxy.proxyDetection('cream01Proxy', ()=>{
    mainScene.modelLoader.setAnnotationVisibility('close', false);
    mainScene.modelLoader.playAnimation('JarGoUpAnimation', 'JarGoDownAnimation');
    mainScene.creamProxy.hide();
    mainScene.creamProxy.setOpacityPulse(false);
    setTimeout(()=>{
        mainScene.capProxy.show();
        mainScene.capProxy.setOpacityPulse(true);
    }, 1500);

    mainScene.updateCameraTarget(0,2,0);
})

mainScene.capProxy.proxyDetection('cap01Proxy', ()=>{

    mainScene.modelLoader.playAnimation('CapGUpAnimation', 'CapGoDownAnimation');
    mainScene.capProxy.hide();
    setTimeout(()=>{
        mainScene.modelLoader.setAnnotationVisibility('jarInBox', true);
    }, 1300);
});


mainScene.modelLoader.triggerInteraction('jarInBox', ()=>{
    
    mainScene.modelLoader.playAnimation('CapGoDownAnimation', 'CapGUpAnimation');
    
    setTimeout(()=>{
        mainScene.modelLoader.playAnimation('JarGoDownAnimation','JarGoUpAnimation');
    }, 100);
    mainScene.modelLoader.setAnnotationVisibility('jarInBox', false);
    setTimeout(()=>{
        mainScene.modelLoader.setAnnotationVisibility('close', true);

    }, 2200);
    
    setTimeout(()=>{
        mainScene.creamProxy.show();
        mainScene.creamProxy.setOpacityPulse(true);
    }, 2400);


});





mainScene.animate();



