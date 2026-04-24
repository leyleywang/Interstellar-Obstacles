const ObstacleManager = {
    obstacles: [],
    spawnTimer: 0,
    levelConfig: null,
    
    init() {
        this.obstacles = [];
        this.spawnTimer = 0;
    },
    
    setLevelConfig(config) {
        this.levelConfig = config;
    },
    
    createObstacle() {
        if (!this.levelConfig) return null;
        
        const type = Utils.randomChoice(GameConfig.OBSTACLES.types);
        const size = Utils.randomRange(type.minSize, type.maxSize);
        
        const group = new THREE.Group();
        
        let geometry;
        let material;
        
        if (type.name === 'asteroid') {
            geometry = new THREE.IcosahedronGeometry(size, 1);
            const positions = geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += Utils.randomRange(-0.2, 0.2);
                positions[i + 1] += Utils.randomRange(-0.2, 0.2);
                positions[i + 2] += Utils.randomRange(-0.2, 0.2);
            }
            geometry.computeVertexNormals();
            
            material = new THREE.MeshPhongMaterial({
                color: type.color,
                flatShading: true,
                shininess: 10
            });
        } else if (type.name === 'debris') {
            geometry = new THREE.BoxGeometry(size, size * 0.6, size);
            material = new THREE.MeshPhongMaterial({
                color: type.color,
                shininess: 20
            });
        } else {
            geometry = new THREE.CylinderGeometry(size * 0.3, size * 0.5, size, 8);
            material = new THREE.MeshPhongMaterial({
                color: type.color,
                shininess: 50
            });
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
        
        if (type.name === 'satellite') {
            const solarPanelGeometry = new THREE.BoxGeometry(size * 2, size * 0.1, size * 0.6);
            const solarPanelMaterial = new THREE.MeshPhongMaterial({
                color: 0x2244aa,
                shininess: 80
            });
            
            const panelLeft = new THREE.Mesh(solarPanelGeometry, solarPanelMaterial);
            panelLeft.position.x = -size;
            panelLeft.castShadow = true;
            group.add(panelLeft);
            
            const panelRight = new THREE.Mesh(solarPanelGeometry, solarPanelMaterial);
            panelRight.position.x = size;
            panelRight.castShadow = true;
            group.add(panelRight);
        }
        
        const isMoving = this.levelConfig.hasMovingObstacles && 
                         Math.random() < (this.levelConfig.movingObstacleChance || 0);
        
        const spawnX = Utils.randomRange(-8, 8);
        
        group.position.set(spawnX, Utils.randomRange(0, 2), GameConfig.OBSTACLES.spawnZ);
        
        const obstacle = {
            mesh: group,
            type: type.name,
            size: size,
            isMoving: isMoving,
            moveDirection: Math.random() > 0.5 ? 1 : -1,
            moveSpeed: Utils.randomRange(0.02, 0.05),
            rotationSpeed: {
                x: Utils.randomRange(-0.02, 0.02),
                y: Utils.randomRange(-0.02, 0.02),
                z: Utils.randomRange(-0.02, 0.02)
            },
            hit: false
        };
        
        SceneManager.add(group);
        this.obstacles.push(obstacle);
        
        return obstacle;
    },
    
    update(deltaTime, gameSpeed) {
        if (!this.levelConfig) return;
        
        this.spawnTimer++;
        
        if (this.spawnTimer >= this.levelConfig.obstacleFrequency) {
            if (this.obstacles.length < this.levelConfig.maxObstacles) {
                this.createObstacle();
            }
            this.spawnTimer = 0;
        }
        
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            
            obstacle.mesh.position.z -= gameSpeed;
            
            if (obstacle.isMoving) {
                obstacle.mesh.position.x += obstacle.moveDirection * obstacle.moveSpeed;
                
                if (obstacle.mesh.position.x > 8 || obstacle.mesh.position.x < -8) {
                    obstacle.moveDirection *= -1;
                }
            }
            
            obstacle.mesh.rotation.x += obstacle.rotationSpeed.x;
            obstacle.mesh.rotation.y += obstacle.rotationSpeed.y;
            obstacle.mesh.rotation.z += obstacle.rotationSpeed.z;
            
            if (obstacle.mesh.position.z < GameConfig.OBSTACLES.despawnZ) {
                SceneManager.remove(obstacle.mesh);
                this.obstacles.splice(i, 1);
            }
        }
    },
    
    checkCollision(shipPosition, shipRadius) {
        for (const obstacle of this.obstacles) {
            if (obstacle.hit) continue;
            
            const dx = obstacle.mesh.position.x - shipPosition.x;
            const dy = obstacle.mesh.position.y - shipPosition.y;
            const dz = obstacle.mesh.position.z - shipPosition.z;
            
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            const collisionDist = obstacle.size * GameConfig.OBSTACLES.collisionRadius + shipRadius;
            
            if (distance < collisionDist) {
                obstacle.hit = true;
                return obstacle;
            }
        }
        return null;
    },
    
    clear() {
        for (const obstacle of this.obstacles) {
            SceneManager.remove(obstacle.mesh);
        }
        this.obstacles = [];
        this.spawnTimer = 0;
    },
    
    createExplosionParticles(position) {
        const group = new THREE.Group();
        
        for (let i = 0; i < 20; i++) {
            const geometry = new THREE.SphereGeometry(Utils.randomRange(0.05, 0.2), 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: Utils.randomChoice([0xff4400, 0xff8800, 0xffaa00, 0x884400]),
                transparent: true,
                opacity: 1
            });
            const particle = new THREE.Mesh(geometry, material);
            
            particle.userData.velocity = new THREE.Vector3(
                Utils.randomRange(-0.3, 0.3),
                Utils.randomRange(-0.2, 0.3),
                Utils.randomRange(-0.3, 0.3)
            );
            particle.userData.life = 1;
            
            particle.position.copy(position);
            group.add(particle);
        }
        
        SceneManager.add(group);
        return group;
    }
};
