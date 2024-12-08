import * as THREE from 'three';

export class proxyCreator {

    
    constructor(scene, camera, radiusTop = 1, radiusBottom = 1, height = 2, position = new THREE.Vector3(0, 0, 0), name = "defaultCylinder", opacity = 1) {
       
        if (!scene) {
            throw new Error("A scene is required to initialize the Cylinder.");
        }

        this.scene = scene;
        this.camera = camera;
        this.radialSegments = 32;
        this.color = 0x23c71e;
        this.pulse = false;
        this.clock = new THREE.Clock();

        const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, this.radialSegments);
        const material = new THREE.MeshStandardMaterial({ 
            color: this.color, 
            opacity: opacity, 
            transparent: opacity < 1 
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.name = name;
        this.scene.add(this.mesh);

        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();

    }


    setRotation(x = 0, y = 0, z = 0) {
        this.mesh.rotation.set(x, y, z);
    }


    hide() {
        this.mesh.visible = false;
        this.mesh.raycast = function() {};
    }


    show() {
        this.mesh.visible = true;
        this.mesh.raycast = THREE.Mesh.prototype.raycast;
    }


    proxyDetection(meshName, callback) {
        window.addEventListener('click', (event) => {

            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;


            this.raycaster.setFromCamera(this.mouse, this.camera);


            const intersects = this.raycaster.intersectObject(this.mesh, true);


            if (intersects.length > 0 && this.mesh.name === meshName) {
                // console.log(`Clicked mesh: ${this.mesh.name}`);
                if (typeof callback === 'function') {
                    callback();  
                }
            }
        });
    }

    setOpacityPulse(pulse = false) {
        this.pulse = pulse; // Enable or disable pulsing
    }

    update(deltaTime) {

        if (this.pulse) {

            if (this.mesh && this.mesh.material) {
                this.elapsedTime = (this.elapsedTime || 0) + deltaTime;
                const pulseOpacity = Math.abs(Math.sin(this.elapsedTime * 2)) * 0.3; // Pulsing opacity from 0 to 0.3
                this.mesh.material.opacity = pulseOpacity;
            } else {
                console.warn("Mesh or material is not initialized properly for pulsing.");
            }
        }
    }

}


