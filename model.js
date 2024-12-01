import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class ModelLoader {
    constructor(scene, modelPath, camera) {
        this.loader = new GLTFLoader();
        this.model = null;
        this.scene = scene;
        this.camera = camera;
        this.animations = [];
        this.mixer = null;
        this.annotations = {};
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.loadModel(modelPath);
    }

    async loadModel(modelPath) {
        
        try {
            // Fetch the modified GLB file as an ArrayBuffer
            const response = await fetch(modelPath);
            const arrayBuffer = await response.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
    
         
            if (uint8Array[0] === 0x67 && uint8Array[1] === 0x6C && uint8Array[2] === 0x74 && uint8Array[3] === 0x66) {
                uint8Array[2] = 0x54; 
                uint8Array[3] = 0x46; 
    
                // Create a Blob from the modified Uint8Array
                const revertedBlob = new Blob([uint8Array], { type: 'model/gltf-binary' });
                const revertedUrl = URL.createObjectURL(revertedBlob);
    
                // Load the reverted Blob into Three.js
                return new Promise((resolve, reject) => {
                    this.loader.load(
                        revertedUrl,
                        (gltf) => {
                            this.model = gltf.scene;
                            this.scene.add(this.model);

                            document.getElementById('loading-screen').style.display = 'none';
                            document.getElementById('canvas').style.display = 'block';
                            console.log('Model loaded and reversed successfully.');
                            // Clean up the URL object after loading
                            URL.revokeObjectURL(revertedUrl);
                            resolve(this.model);

                            //add animations in list
                            this.animations  = gltf.animations;
                            this.mixer = new THREE.AnimationMixer(this.model);

                        },
                        undefined,
                        (error) => {
                            console.error('Error loading reverted GLB:', error);
                            reject(error);
                        }
                    );
                });
            } else {
                throw new Error('File format is not as expected.');
            }
        } catch (error) {
            console.error('Error during the model loading process:', error);
            throw error;
        }
    }


    playAnimation(animationName = null) {
        if (!this.mixer || this.animations.length === 0) {
            console.warn('No animations available to play.');
            return;
        }
    
        let clip;
    
        // Find animation by name or default to the first
        if (animationName) {
            clip = this.animations.find((clip) => clip.name === animationName);
            if (!clip) {
                console.warn(`Animation "${animationName}" not found. Defaulting to the first animation.`);
            }
        }
    
        clip = clip || this.animations[0];
    
        if (clip) {
            const action = this.mixer.clipAction(clip);
            
            // Ensure previous action is stopped and reset
            this.mixer.stopAllAction();
    
            // Reset the animation action
            action.reset();
    
            // Set the loop type and other properties
            action.setLoop(THREE.LoopOnce); // Play only once
            action.clampWhenFinished = true; // Freeze at the last frame
    
            // Play the animation
            action.play();
    
            // Listen for when the animation ends
            action.onFinished = () => {
                // Explicitly set the time to the last frame
                action.time = clip.duration;
                action.paused = true;  // Pause the animation to freeze at the last frame
            };
        }
    }

    // playAnimation(animationName = null) {
    //     if (!this.mixer || this.animations.length === 0) {
    //         console.warn('No animations available to play.');
    //         return;
    //     }
    
    //     let clip;
    
    //     if (animationName) {
    //         clip = this.animations.find((clip) => clip.name === animationName);
    //         if (!clip) {
    //             console.warn(`Animation "${animationName}" not found. Defaulting to the first animation.`);
    //         }
    //     }
    
    //     // Default to the first animation if no name is provided or if the specified name doesn't exist
    //     clip = clip || this.animations[0];
        
    
    //     if (clip) {
    //         const action = this.mixer.clipAction(clip);
    //         action.reset(); 
    //         action.play();  
    //         action.clampWhenFinished = true;
    //         action.setLoop(THREE.LoopOnce);
    //         console.log(clip)
   
    //     }
    // }




    //no decoding process
    // loadModel(modelPath) {
    //     return new Promise((resolve, reject) => {
    //         this.loader.load(
    //             modelPath,
    //             (gltf) => {
    //                 this.model = gltf.scene;
    //                 this.animations  = gltf.animations;

    //                 this.scene.add(this.model);
    //                 this.mixer = new THREE.AnimationMixer(this.model);

    //                 this.animations.forEach((clip) => {
    //                     const action = this.mixer.clipAction(clip);
    //                     action.play();  
    //                     // action.setLoop(THREE.LoopRepeat, Infinity); // Set loop if needed
    //                     action.setLoop(THREE.LoopOnce, 1); // Set loop if needed
    //                     action.clampWhenFinished = true;
    //                 });

    //                 console.log('Model loaded successfully.');
                    
    //                 resolve();
    //             },
    //             undefined,
    //             (error) => {
    //                 console.error('Error loading model:', error);
    //                 reject(error);
    //             }
    //         );
    //     });
    // }

    //animation mixer update in order to run animation -> it runs in scene
    update(deltaTime){
        if(this.mixer){
            this.mixer.update(deltaTime);
        }
    }

    addAnnotation(name, position, textureUrl, width = 0.5, height = 0.5) {
        const spriteMaterial = new THREE.SpriteMaterial({
            map: new THREE.TextureLoader().load(textureUrl),
            depthTest: true,
            depthWrite: true,
            blending: THREE.NormalBlending,
        });

        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.copy(position);
        sprite.scale.set(width, height, 1);

        this.scene.add(sprite);

        // Store annotation
        this.annotations[name] = {
            sprite: sprite,
            onClick: null, // Default to null, will be set later
            onMouseClick: null,
        };

        // Update interaction after adding annotation
        this.updateInteraction(name);
    }


    /**
 * Sets the visibility of a specific annotation or all annotations.
 * @param {string} name - The name of the annotation to change visibility.
 *                        If 'all' is passed, the visibility of all annotations will be set.
 * @param {boolean} visible - Whether to make the annotation(s) visible or not.
 */
    setAnnotationVisibility(name, visible) {
        if(name === 'all'){
            for(const key in this.annotations){
                this.annotations[key].sprite.visible = visible;
                this.updateInteraction(key);
            }
        }else{
            const annotation = this.annotations[name];
            if (annotation) {
                annotation.sprite.visible = visible;
                this.updateInteraction(name); // Update interaction based on visibility
            } else {
                console.warn('Annotation with name ' + name + ' not found.');
            }
        }

    }

    updateInteraction(name) {
        const annotation = this.annotations[name];
        if (!annotation) {
            console.warn('Annotation with name ' + name + ' not found in updateInteraction.');
            return;
        }

        // Remove existing interaction if it exists
        if (annotation.onMouseClick) {
            window.removeEventListener('click', annotation.onMouseClick, false);
            annotation.onMouseClick = null;
        }

        // Set up new interaction if the annotation is visible and has an onClick handler
        if (annotation.sprite.visible && this.camera && annotation.onClick) {
            const raycaster = this.raycaster;
            const mouse = this.mouse;

            annotation.onMouseClick = (event) => {
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

                raycaster.setFromCamera(mouse, this.camera);
                const intersects = raycaster.intersectObject(annotation.sprite);

                if (intersects.length > 0) {
                    annotation.onClick();
                }
            };

            // Ensure that only one event listener is active for the annotation
            window.addEventListener('click', annotation.onMouseClick, false);
        }
    }

    triggerInteraction(name, onClick) {
        const annotation = this.annotations[name];
        if (annotation) {
            // Update the onClick function
            annotation.onClick = onClick;
            // Ensure interaction is updated
            this.updateInteraction(name);
        } else {
            console.warn('No annotation found for ' + name);
        }
    }
}
