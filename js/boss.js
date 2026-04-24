const BossManager = {
    asteroids: [],
    active: false,
    bossType: null,
    bossConfig: null,
    health: 0,
    maxHealth: 0,
    destroyedCount: 0,
    targetCount: 0,
    
    init() {
        this.asteroids = [];
        this.active = false;
        this.health = 0;
        this.destroyedCount = 0;
    },
    
    startBoss(bossType) {
        this.bossType = bossType;
        this.bossConfig = GameConfig.BOSS[bossType];
        this.targetCount = this.bossConfig.asteroidCount;
        this.destroyedCount = 0;
        this.active = true;
        
        this.spawnBossAsteroids();
        this.showWarning();
    },
    
    showWarning() {
        const warning = document.getElementById('boss-warning');
        if (warning) {
            warning.style.display = 'block';
            setTimeout(() => {
                warning.style.display = 'none';
            }, 3000);
        }
    },
    
    spawnBossAsteroids() {
        const count = this.bossConfig.asteroidCount;
        
        for (let i = 0; i < count; i++) {
            this.spawnAsteroid();
        }
    },
    
    spawnAsteroid() {
        const group = new THREE.Group();
        
        const size = Utils.randomRange(0.8, 1.8);
        const geometry = new THREE.IcosahedronGeometry(size, 1);
        
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += Utils.randomRange(-0.3, 0.3);
            positions[i + 1] += Utils.randomRange(-0.3, 0.3);
            positions[i + 2] += Utils.randomRange(-0.3, 0.3);
        }
        geometry.computeVertexNormals();
        
        const colorVariation = Math.random();
        let color;
        if (colorVariation < 0.5) {
            color = 0x8B4513;
        } else if (colorVariation < 0.8) {
            color = 0x654321;
        } else {
            color = 0xA0522D;
        }
        
        const material = new THREE.MeshPhongMaterial({
            color: color,
            flatShading: true,
            shininess: 10
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
        
        const glowGeometry = new THREE.IcosahedronGeometry(size * 1.1, 1);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4400,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        group.add(glow);
        
        const spawnZ = Utils.randomRange(30, 60);
        const spawnX = Utils.randomRange(-7, 7);
        
        group.position.set(spawnX, Utils.randomRange(0.5, 3), spawnZ);
        
        const asteroid = {
            mesh: group,
            size: size,
            health: 1,
            movePattern: Math.floor(Math.random() * 3),
            phase: Math.random() * Math.PI * 2,
            speed: this.bossConfig.speed * Utils.randomRange(0.8, 1.2),
            rotationSpeed: {
                x: Utils.randomRange(-0.03, 0.03),
                y: Utils.randomRange(-0.03, 0.03),
                z: Utils.randomRange(-0.03, 0.03)
            }
        };
        
        SceneManager.add(group);
        this.asteroids.push(asteroid);
    },
    
    update(deltaTime) {
        if (!this.active) return false;
        
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const asteroid = this.asteroids[i];
            
            asteroid.mesh.position.z -= asteroid.speed;
            
            if (asteroid.movePattern === 1) {
                asteroid.mesh.position.x = Math.sin(Date.now() * 0.002 + asteroid.phase) * 5;
            } else if (asteroid.movePattern === 2) {
                asteroid.mesh.position.x += Math.sin(Date.now() * 0.003 + asteroid.phase) * 0.05;
                asteroid.mesh.position.x = Utils.clamp(asteroid.mesh.position.x, -8, 8);
            }
            
            asteroid.mesh.rotation.x += asteroid.rotationSpeed.x;
            asteroid.mesh.rotation.y += asteroid.rotationSpeed.y;
            asteroid.mesh.rotation.z += asteroid.rotationSpeed.z;
            
            const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.05;
            asteroid.mesh.scale.set(pulse, pulse, pulse);
            
            if (asteroid.mesh.position.z < -30) {
                SceneManager.remove(asteroid.mesh);
                this.asteroids.splice(i, 1);
                
                if (this.asteroids.length < this.targetCount * 0.3) {
                    this.spawnAsteroid();
                }
            }
        }
        
        return this.destroyedCount >= this.targetCount;
    },
    
    checkCollision(shipPosition, shipRadius) {
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const asteroid = this.asteroids[i];
            
            const dx = asteroid.mesh.position.x - shipPosition.x;
            const dy = asteroid.mesh.position.y - shipPosition.y;
            const dz = asteroid.mesh.position.z - shipPosition.z;
            
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            const collisionDist = asteroid.size * 1.2 + shipRadius;
            
            if (distance < collisionDist) {
                this.destroyAsteroid(i);
                return true;
            }
        }
        return false;
    },
    
    destroyAsteroid(index) {
        const asteroid = this.asteroids[index];
        
        this.createExplosion(asteroid.mesh.position.clone());
        
        SceneManager.remove(asteroid.mesh);
        this.asteroids.splice(index, 1);
        this.destroyedCount++;
        
        if (this.asteroids.length < this.targetCount * 0.2 && this.destroyedCount < this.targetCount) {
            this.spawnAsteroid();
        }
    },
    
    createExplosion(position) {
        const group = new THREE.Group();
        
        for (let i = 0; i < 25; i++) {
            const size = Utils.randomRange(0.08, 0.25);
            const geometry = new THREE.SphereGeometry(size, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: Utils.randomChoice([0xff4400, 0xff8800, 0xffaa00, 0xffff00, 0xff0000]),
                transparent: true,
                opacity: 1
            });
            const particle = new THREE.Mesh(geometry, material);
            
            const angle = (i / 25) * Math.PI * 2;
            const speed = Utils.randomRange(0.1, 0.4);
            
            particle.userData.velocity = new THREE.Vector3(
                Math.cos(angle) * speed,
                Utils.randomRange(0.05, 0.3),
                Math.sin(angle) * speed
            );
            particle.userData.life = 1;
            
            particle.position.copy(position);
            group.add(particle);
        }
        
        SceneManager.add(group);
        
        const explosionGroup = group;
        explosionGroup.userData.particles = [];
        explosionGroup.children.forEach(child => {
            explosionGroup.userData.particles.push(child);
        });
    },
    
    getProgress() {
        if (!this.active) return 100;
        return (this.destroyedCount / this.targetCount) * 100;
    },
    
    endBoss() {
        this.active = false;
        this.clear();
    },
    
    clear() {
        for (const asteroid of this.asteroids) {
            SceneManager.remove(asteroid.mesh);
        }
        this.asteroids = [];
        this.active = false;
    }
};
