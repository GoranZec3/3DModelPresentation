import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { ModelLoader } from './model.js'; 
import { proxyCreator } from './proxyCreator.js';


export  class Scene{
    constructor(canvas, hdriPath, modelPath){

        this.scene = new THREE.Scene;
        this.hdriPath = hdriPath;

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
        this.camera.position.set(-3, 3, 3);

        this.renderer = new THREE.WebGLRenderer({canvas, antialias: true, powerPreference: "high-performance"});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.toneMappingExposure = 0.75;
        

        this.loadHDRI(hdriPath);

        this.modelLoader = new ModelLoader(this.scene, modelPath, this.camera);
        this.clock = new THREE.Clock();
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
        this.scene.add(this.ambientLight);

        // this.creamProxy = new proxyCreator(this.scene, this.camera, 0.35, 0.35, 0.55, new THREE.Vector3(0.38, 0.38,-0.33), 'cream01Proxy', 0); 

        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshStandardMaterial({ metalness: 0.7, roughness: 0.2 });
        this.cube = new THREE.Mesh(geometry, material);
        // this.scene.add(this.cube);

        window.addEventListener('resize', ()=> this.onWindowResize());

        this.setupOrbitControls();
        this.createGradientBackground();
        this.initializeProxyCreator();
    }

    initializeProxyCreator() {
        //have to call proxyCreator.update() in animation in order to acheive pulsing effect
        this.creamProxy = new proxyCreator(this.scene, this.camera, 0.35, 0.35, 0.55, new THREE.Vector3(0.38, 0.38, -0.33), 'cream01Proxy',0);
        this.creamProxy.setRotation(0, 0, Math.PI / 2);

        this.capProxy = new proxyCreator(this.scene, this.camera, 0.35, 0.35, 0.23, new THREE.Vector3(0.125, 2.34, 0.006), 'cap01Proxy', 0);
        this.capProxy.setRotation(0,0,0);
        
    }

    createGradientBackground() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 512;

        // Create a linear gradient from top to bottom (or modify the direction)
        const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#e2af7f'); // Starting orange
        gradient.addColorStop(0.5, '#FFB84D'); // Light orange at the middle
        gradient.addColorStop(1, '#998870'); // Fading to a light yellow at the bottom

        // Apply gradient to the canvas
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Create a texture from the canvas and apply it as background
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter; // Smooth the texture
        texture.magFilter = THREE.LinearFilter; // Smooth the texture
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;

        this.scene.background = texture;
    }

    loadHDRI() {
        const rgbeLoader = new RGBELoader();
        rgbeLoader.load(this.hdriPath, (texture) => {
            texture.mapping = THREE.EquirectangularRefractionMapping;

            this.scene.environment = texture;

            
        });
    }



    setupOrbitControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enablePan = false;
        this.controls.enableZoom = true;
        this.controls.rotateSpeed = 1.5;
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 0;
        this.controls.maxDistance = 20;
        this.controls.target.set(0, 0, 0); // Set the orbit target (adjust as needed)
        this.controls.update();
    }

    updateCameraTarget(x, y, z, duration=1) {
        const start = this.controls.target.clone(); // Current target position
        const end = new THREE.Vector3(x, y, z); // New target position

        // smooth transition
        this.targetTransition = {
            start,
            end,
            duration,
            elapsed: 0,
        };
    }

    smoothTransitionControler(deltaTime){
        if (this.targetTransition) {
            const { start, end, duration, elapsed } = this.targetTransition;

   
            this.targetTransition.elapsed += deltaTime;

            // interpolation factor
            const t = Math.min(this.targetTransition.elapsed / duration, 1);

            // Interpolate between start and end
            this.controls.target.lerpVectors(start, end, t);

            // If the transition is complete, clear it
            if (t >= 1) {
                this.targetTransition = null;
            }

            this.controls.update(); 
        }
    }


    onWindowResize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate(){
        requestAnimationFrame(() => this.animate());
        this.controls.update();


        const deltaTime = this.clock.getDelta();

        this.smoothTransitionControler(deltaTime);
        
        
        this.creamProxy.update(deltaTime);
        this.capProxy.update(deltaTime);

        if (this.modelLoader) {
            this.modelLoader.update(deltaTime); // Update the animations
        }

   

        this.renderer.render(this.scene, this.camera);
    }
}