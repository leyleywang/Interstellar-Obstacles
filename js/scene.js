const SceneManager = {
    scene: null,
    camera: null,
    renderer: null,
    canvas: null,
    
    stars: null,
    nebulae: [],
    
    init() {
        this.canvas = document.getElementById('game-canvas');
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLights();
        this.createStars();
        this.createNebulae();
        this.createGround();
        
        window.addEventListener('resize', () => this.onResize());
        this.onResize();
    },
    
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(
            GameConfig.SCENE.fogColor,
            GameConfig.SCENE.fogDensity
        );
        this.scene.background = new THREE.Color(GameConfig.SCENE.fogColor);
    },
    
    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 3, -5);
        this.camera.lookAt(0, 1, 10);
    },
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    },
    
    createLights() {
        const ambientLight = new THREE.AmbientLight(0x404060, 0.4);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, -5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        this.scene.add(directionalLight);
        
        const pointLight1 = new THREE.PointLight(0x00aaff, 1, 50);
        pointLight1.position.set(-10, 5, 20);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0xff4400, 0.5, 50);
        pointLight2.position.set(10, 3, 30);
        this.scene.add(pointLight2);
    },
    
    createStars() {
        const starGeometry = new THREE.BufferGeometry();
        const starPositions = [];
        const starColors = [];
        const starSizes = [];
        
        for (let i = 0; i < GameConfig.SCENE.starCount; i++) {
            starPositions.push(
                Utils.randomRange(-100, 100),
                Utils.randomRange(0, 100),
                Utils.randomRange(-50, 200)
            );
            
            const colorChoice = Math.random();
            if (colorChoice < 0.7) {
                starColors.push(1, 1, 1);
            } else if (colorChoice < 0.85) {
                starColors.push(0.7, 0.8, 1);
            } else {
                starColors.push(1, 0.8, 0.7);
            }
            
            starSizes.push(Utils.randomRange(0.02, 0.1));
        }
        
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
        starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        });
        
        this.stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.stars);
    },
    
    createNebulae() {
        const nebulaColors = [0x4400aa, 0xaa0044, 0x0044aa, 0x00aa44, 0xaa4400];
        
        for (let i = 0; i < GameConfig.SCENE.nebulaCount; i++) {
            const nebulaGeometry = new THREE.SphereGeometry(
                Utils.randomRange(20, 40),
                32,
                32
            );
            
            const nebulaMaterial = new THREE.MeshBasicMaterial({
                color: nebulaColors[i % nebulaColors.length],
                transparent: true,
                opacity: Utils.randomRange(0.03, 0.08),
                side: THREE.BackSide
            });
            
            const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
            nebula.position.set(
                Utils.randomRange(-60, 60),
                Utils.randomRange(20, 60),
                Utils.randomRange(50, 150)
            );
            
            this.nebulae.push(nebula);
            this.scene.add(nebula);
        }
    },
    
    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(50, 500);
        const groundMaterial = new THREE.MeshBasicMaterial({
            color: 0x000820,
            transparent: true,
            opacity: 0.3
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -5;
        ground.position.z = 100;
        this.scene.add(ground);
        
        this.createGridLines();
    },
    
    createGridLines() {
        const gridGroup = new THREE.Group();
        
        for (let z = 0; z < 200; z += 5) {
            const lineGeometry = new THREE.BufferGeometry();
            const points = [];
            
            points.push(-20, 0, z);
            points.push(20, 0, z);
            
            lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
            
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0x004488,
                transparent: true,
                opacity: 0.15
            });
            
            const line = new THREE.Line(lineGeometry, lineMaterial);
            gridGroup.add(line);
        }
        
        for (let x = -20; x <= 20; x += 5) {
            const lineGeometry = new THREE.BufferGeometry();
            const points = [];
            
            points.push(x, 0, 0);
            points.push(x, 0, 200);
            
            lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
            
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0x004488,
                transparent: true,
                opacity: 0.15
            });
            
            const line = new THREE.Line(lineGeometry, lineMaterial);
            gridGroup.add(line);
        }
        
        gridGroup.position.y = -4;
        this.scene.add(gridGroup);
        this.gridLines = gridGroup;
    },
    
    onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    },
    
    update(deltaTime, speed) {
        if (this.stars) {
            const positions = this.stars.geometry.attributes.position.array;
            for (let i = 2; i < positions.length; i += 3) {
                positions[i] -= speed * 0.5;
                if (positions[i] < -50) {
                    positions[i] = 200;
                }
            }
            this.stars.geometry.attributes.position.needsUpdate = true;
        }
        
        if (this.gridLines) {
            this.gridLines.position.z -= speed * 0.3;
            if (this.gridLines.position.z < -5) {
                this.gridLines.position.z = 0;
            }
        }
        
        const time = Date.now() * 0.0001;
        this.nebulae.forEach((nebula, index) => {
            nebula.rotation.y += 0.0001 * (index + 1);
            nebula.position.x = Math.sin(time + index) * 10;
        });
    },
    
    render() {
        this.renderer.render(this.scene, this.camera);
    },
    
    add(object) {
        this.scene.add(object);
    },
    
    remove(object) {
        this.scene.remove(object);
    }
};
