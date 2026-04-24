const EnergyManager = {
    energyBlocks: [],
    spawnTimer: 0,
    levelConfig: null,
    collectParticles: [],
    
    init() {
        this.energyBlocks = [];
        this.spawnTimer = 0;
        this.collectParticles = [];
    },
    
    setLevelConfig(config) {
        this.levelConfig = config;
    },
    
    createEnergyBlock() {
        const group = new THREE.Group();
        
        const coreGeometry = new THREE.OctahedronGeometry(GameConfig.ENERGY.size, 0);
        const coreMaterial = new THREE.MeshPhongMaterial({
            color: GameConfig.ENERGY.color,
            emissive: GameConfig.ENERGY.glowColor,
            emissiveIntensity: 0.5,
            shininess: 100,
            transparent: true,
            opacity: 0.9
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        core.castShadow = true;
        group.add(core);
        
        const glowGeometry = new THREE.OctahedronGeometry(GameConfig.ENERGY.size * 1.5, 0);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: GameConfig.ENERGY.glowColor,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        group.add(glow);
        
        const ringGeometry = new THREE.TorusGeometry(GameConfig.ENERGY.size * 1.2, 0.05, 8, 16);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: GameConfig.ENERGY.color,
            transparent: true,
            opacity: 0.6
        });
        const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
        ring1.rotation.x = Math.PI / 2;
        group.add(ring1);
        
        const ring2 = new THREE.Mesh(ringGeometry, ringMaterial);
        ring2.rotation.y = Math.PI / 2;
        group.add(ring2);
        
        const light = new THREE.PointLight(GameConfig.ENERGY.glowColor, 1, 5);
        group.add(light);
        
        const spawnX = Utils.randomRange(-8, 8);
        group.position.set(spawnX, Utils.randomRange(0.5, 2.5), GameConfig.ENERGY.spawnZ);
        
        const energyBlock = {
            mesh: group,
            collected: false,
            rotationSpeed: 0.02,
            bobOffset: Math.random() * Math.PI * 2
        };
        
        SceneManager.add(group);
        this.energyBlocks.push(energyBlock);
        
        return energyBlock;
    },
    
    update(deltaTime, gameSpeed) {
        if (!this.levelConfig) return;
        
        this.spawnTimer++;
        
        if (this.spawnTimer >= this.levelConfig.energyFrequency) {
            this.createEnergyBlock();
            this.spawnTimer = 0;
        }
        
        for (let i = this.energyBlocks.length - 1; i >= 0; i--) {
            const block = this.energyBlocks[i];
            
            if (block.collected) {
                SceneManager.remove(block.mesh);
                this.energyBlocks.splice(i, 1);
                continue;
            }
            
            block.mesh.position.z -= gameSpeed;
            
            block.mesh.rotation.x += block.rotationSpeed;
            block.mesh.rotation.y += block.rotationSpeed * 1.5;
            
            const bob = Math.sin(Date.now() * 0.003 + block.bobOffset) * 0.2;
            block.mesh.position.y = 1 + bob;
            
            const pulseScale = 1 + Math.sin(Date.now() * 0.005) * 0.1;
            block.mesh.scale.set(pulseScale, pulseScale, pulseScale);
            
            if (block.mesh.position.z < GameConfig.ENERGY.despawnZ) {
                SceneManager.remove(block.mesh);
                this.energyBlocks.splice(i, 1);
            }
        }
        
        this.updateCollectParticles(deltaTime);
    },
    
    checkCollection(shipPosition, shipRadius) {
        let collected = 0;
        
        for (const block of this.energyBlocks) {
            if (block.collected) continue;
            
            const dx = block.mesh.position.x - shipPosition.x;
            const dy = block.mesh.position.y - shipPosition.y;
            const dz = block.mesh.position.z - shipPosition.z;
            
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            const collectDist = GameConfig.ENERGY.collectRadius + shipRadius;
            
            if (distance < collectDist) {
                block.collected = true;
                collected += GameConfig.ENERGY.value;
                this.createCollectEffect(block.mesh.position);
            }
        }
        
        return collected;
    },
    
    createCollectEffect(position) {
        for (let i = 0; i < 15; i++) {
            const geometry = new THREE.SphereGeometry(Utils.randomRange(0.05, 0.15), 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: GameConfig.ENERGY.color,
                transparent: true,
                opacity: 1
            });
            const particle = new THREE.Mesh(geometry, material);
            
            const angle = (i / 15) * Math.PI * 2;
            const speed = Utils.randomRange(0.1, 0.3);
            
            particle.userData.velocity = new THREE.Vector3(
                Math.cos(angle) * speed,
                Utils.randomRange(0.1, 0.3),
                Math.sin(angle) * speed
            );
            particle.userData.life = 1;
            
            particle.position.copy(position);
            this.collectParticles.push(particle);
            SceneManager.add(particle);
        }
    },
    
    updateCollectParticles(deltaTime) {
        for (let i = this.collectParticles.length - 1; i >= 0; i--) {
            const particle = this.collectParticles[i];
            
            particle.userData.life -= deltaTime * 2;
            particle.position.add(particle.userData.velocity);
            particle.userData.velocity.y -= 0.01;
            particle.material.opacity = particle.userData.life;
            particle.scale.multiplyScalar(0.98);
            
            if (particle.userData.life <= 0) {
                SceneManager.remove(particle);
                this.collectParticles.splice(i, 1);
            }
        }
    },
    
    clear() {
        for (const block of this.energyBlocks) {
            SceneManager.remove(block.mesh);
        }
        this.energyBlocks = [];
        
        for (const particle of this.collectParticles) {
            SceneManager.remove(particle);
        }
        this.collectParticles = [];
        
        this.spawnTimer = 0;
    }
};
