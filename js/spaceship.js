const Spaceship = {
    mesh: null,
    group: null,
    targetX: 0,
    currentX: 0,
    engineLight: null,
    trailParticles: [],
    
    init() {
        this.createShip();
        this.createEngineLight();
        this.createTrail();
        this.setupControls();
    },
    
    createShip() {
        this.group = new THREE.Group();
        
        const skinData = Storage.getSelectedSkinData();
        const shipColor = skinData.color;
        
        const bodyGeometry = new THREE.ConeGeometry(0.6, 2.5, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: shipColor,
            shininess: 100,
            specular: 0x444444
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.x = Math.PI / 2;
        body.castShadow = true;
        this.group.add(body);
        
        const cockpitGeometry = new THREE.SphereGeometry(0.35, 16, 16);
        const cockpitMaterial = new THREE.MeshPhongMaterial({
            color: 0x00aaff,
            transparent: true,
            opacity: 0.7,
            shininess: 100,
            specular: 0xaaaaaa
        });
        const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
        cockpit.position.z = 0.3;
        cockpit.castShadow = true;
        this.group.add(cockpit);
        
        const wingGeometry = new THREE.BoxGeometry(2.5, 0.1, 0.8);
        const wingMaterial = new THREE.MeshPhongMaterial({
            color: shipColor,
            shininess: 80
        });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        wings.position.z = -0.5;
        wings.castShadow = true;
        this.group.add(wings);
        
        const stabilizerGeometry = new THREE.BoxGeometry(0.8, 0.3, 0.6);
        const stabilizer = new THREE.Mesh(stabilizerGeometry, wingMaterial);
        stabilizer.position.y = 0.25;
        stabilizer.position.z = -0.8;
        stabilizer.castShadow = true;
        this.group.add(stabilizer);
        
        const engineGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.8, 8);
        const engineMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333,
            shininess: 50
        });
        const engine = new THREE.Mesh(engineGeometry, engineMaterial);
        engine.rotation.x = -Math.PI / 2;
        engine.position.z = -1.5;
        engine.castShadow = true;
        this.group.add(engine);
        
        this.group.position.y = 0.5;
        this.group.position.z = 0;
    },
    
    createEngineLight() {
        this.engineLight = new THREE.PointLight(0x00aaff, 2, 10);
        this.engineLight.position.z = -2;
        this.engineLight.position.y = 0.5;
        this.group.add(this.engineLight);
    },
    
    createTrail() {
        this.trailParticles = [];
        
        for (let i = 0; i < 20; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: 0x00aaff,
                transparent: true,
                opacity: 0.8
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.visible = false;
            this.trailParticles.push({
                mesh: particle,
                life: 0,
                maxLife: 1
            });
            SceneManager.add(particle);
        }
    },
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (Game.state !== 'playing') return;
            
            switch(e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.targetX = Math.max(
                        GameConfig.SHIP.minX,
                        this.targetX - 2
                    );
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.targetX = Math.min(
                        GameConfig.SHIP.maxX,
                        this.targetX + 2
                    );
                    break;
            }
        });
    },
    
    update(deltaTime) {
        if (!this.group) return;
        
        const moveSpeed = GameConfig.SHIP.moveSpeed;
        this.currentX = Utils.lerp(this.currentX, this.targetX, moveSpeed);
        this.group.position.x = this.currentX;
        
        const tilt = (this.targetX - this.currentX) * 0.15;
        this.group.rotation.z = -tilt;
        
        const bobOffset = Math.sin(Date.now() * 0.003) * 0.1;
        this.group.position.y = 0.5 + bobOffset;
        
        this.updateTrail(deltaTime);
        this.updateEngineEffect();
    },
    
    updateTrail(deltaTime) {
        for (const particle of this.trailParticles) {
            if (particle.life > 0) {
                particle.life -= deltaTime * 2;
                particle.mesh.position.z -= deltaTime * 10;
                particle.mesh.scale.multiplyScalar(0.98);
                particle.mesh.material.opacity = particle.life / particle.maxLife;
                
                if (particle.life <= 0) {
                    particle.mesh.visible = false;
                }
            }
        }
        
        if (Math.random() < 0.5) {
            const available = this.trailParticles.find(p => p.life <= 0);
            if (available) {
                available.mesh.position.copy(this.group.position);
                available.mesh.position.z -= 1.8;
                available.mesh.position.x += Utils.randomRange(-0.2, 0.2);
                available.mesh.visible = true;
                available.life = available.maxLife;
                available.mesh.scale.set(1, 1, 1);
                available.mesh.material.opacity = 1;
            }
        }
    },
    
    updateEngineEffect() {
        const pulse = 0.8 + Math.sin(Date.now() * 0.01) * 0.2;
        if (this.engineLight) {
            this.engineLight.intensity = 2 * pulse;
        }
    },
    
    getPosition() {
        if (!this.group) return { x: 0, y: 0, z: 0 };
        return {
            x: this.group.position.x,
            y: this.group.position.y,
            z: this.group.position.z
        };
    },
    
    getCollisionRadius() {
        return 1.0;
    },
    
    addToScene() {
        if (this.group) {
            SceneManager.add(this.group);
        }
    },
    
    removeFromScene() {
        if (this.group) {
            SceneManager.remove(this.group);
        }
    },
    
    reset() {
        this.targetX = 0;
        this.currentX = 0;
        if (this.group) {
            this.group.position.x = 0;
            this.group.position.y = 0.5;
            this.group.rotation.z = 0;
        }
    },
    
    updateSkin() {
        if (this.group) {
            SceneManager.remove(this.group);
        }
        
        this.trailParticles.forEach(p => {
            SceneManager.remove(p.mesh);
        });
        
        this.createShip();
        this.createEngineLight();
        this.trailParticles = [];
        this.createTrail();
    },
    
    createExplosion() {
        const explosionGroup = new THREE.Group();
        
        for (let i = 0; i < 30; i++) {
            const size = Utils.randomRange(0.1, 0.3);
            const geometry = new THREE.SphereGeometry(size, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: Utils.randomChoice([0xff4400, 0xffaa00, 0xffff00, 0xff0000]),
                transparent: true,
                opacity: 1
            });
            const particle = new THREE.Mesh(geometry, material);
            
            particle.userData.velocity = new THREE.Vector3(
                Utils.randomRange(-1, 1),
                Utils.randomRange(-0.5, 1),
                Utils.randomRange(-1, 1)
            );
            particle.userData.life = 1;
            
            explosionGroup.add(particle);
        }
        
        explosionGroup.position.copy(this.group.position);
        SceneManager.add(explosionGroup);
        
        return explosionGroup;
    }
};
