const Game = {
    state: 'menu',
    currentLevel: 1,
    levelConfig: null,
    
    collectedEnergy: 0,
    totalDistance: 0,
    levelLength: 0,
    gameTime: 0,
    lastTime: 0,
    deltaTime: 0,
    
    bossPhase: false,
    bossCompleted: false,
    explosion: null,
    
    animationId: null,
    
    init() {
        Storage.init();
        SceneManager.init();
        Spaceship.init();
        ObstacleManager.init();
        EnergyManager.init();
        BossManager.init();
        UI.init();
        
        this.setupEventListeners();
        this.startMenuLoop();
    },
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.state === 'playing') {
                    this.exitToMenu();
                }
            }
        });
    },
    
    startMenuLoop() {
        this.state = 'menu';
        UI.showStartScreen();
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.lastTime = performance.now();
        this.menuLoop();
    },
    
    menuLoop() {
        if (this.state !== 'menu') return;
        
        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        SceneManager.update(this.deltaTime, 0.05);
        SceneManager.render();
        
        this.animationId = requestAnimationFrame(() => this.menuLoop());
    },
    
    startLevel(level) {
        this.currentLevel = level;
        this.levelConfig = GameConfig.LEVELS[level - 1];
        this.levelLength = this.levelConfig.levelLength;
        
        this.collectedEnergy = 0;
        this.totalDistance = 0;
        this.gameTime = 0;
        this.bossPhase = false;
        this.bossCompleted = false;
        
        Spaceship.reset();
        Spaceship.updateSkin();
        Spaceship.addToScene();
        
        ObstacleManager.init();
        ObstacleManager.setLevelConfig(this.levelConfig);
        
        EnergyManager.init();
        EnergyManager.setLevelConfig(this.levelConfig);
        
        BossManager.init();
        
        this.state = 'playing';
        UI.showGameHud();
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.lastTime = performance.now();
        this.gameLoop();
    },
    
    gameLoop() {
        if (this.state !== 'playing') return;
        
        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.gameTime += this.deltaTime;
        
        const gameSpeed = this.levelConfig.baseSpeed;
        
        if (!this.bossPhase) {
            this.totalDistance += gameSpeed * 10;
            
            const progress = Math.min(100, (this.totalDistance / this.levelLength) * 100);
            
            if (progress >= 90) {
                this.startBossPhase();
            }
            
            ObstacleManager.update(this.deltaTime, gameSpeed);
            EnergyManager.update(this.deltaTime, gameSpeed);
        } else {
            const bossDefeated = BossManager.update(this.deltaTime);
            
            if (bossDefeated && !this.bossCompleted) {
                this.bossCompleted = true;
                this.completeLevel();
                return;
            }
        }
        
        Spaceship.update(this.deltaTime);
        SceneManager.update(this.deltaTime, gameSpeed);
        
        this.checkCollisions();
        
        const progress = this.bossPhase ? 
            BossManager.getProgress() : 
            Math.min(100, (this.totalDistance / this.levelLength) * 100);
        
        UI.updateHud(
            this.currentLevel,
            this.collectedEnergy,
            progress,
            this.gameTime
        );
        
        SceneManager.render();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    },
    
    startBossPhase() {
        this.bossPhase = true;
        
        ObstacleManager.clear();
        EnergyManager.clear();
        
        BossManager.startBoss(this.levelConfig.bossType);
        UI.showBossWarning();
    },
    
    checkCollisions() {
        const shipPos = Spaceship.getPosition();
        const shipRadius = Spaceship.getCollisionRadius();
        
        if (!this.bossPhase) {
            const obstacleHit = ObstacleManager.checkCollision(shipPos, shipRadius);
            if (obstacleHit) {
                this.gameOver();
                return;
            }
            
            const energyCollected = EnergyManager.checkCollection(shipPos, shipRadius);
            if (energyCollected > 0) {
                this.collectedEnergy += energyCollected;
            }
        } else {
            const bossHit = BossManager.checkCollision(shipPos, shipRadius);
            if (bossHit) {
            }
        }
    },
    
    gameOver() {
        this.state = 'gameover';
        
        this.explosion = Spaceship.createExplosion();
        Spaceship.removeFromScene();
        
        setTimeout(() => {
            UI.showGameOver(
                this.currentLevel,
                this.collectedEnergy,
                this.gameTime
            );
            this.cleanupGame();
        }, 500);
    },
    
    completeLevel() {
        this.state = 'complete';
        
        Storage.updateLevelRecord(
            this.currentLevel,
            this.collectedEnergy,
            this.gameTime
        );
        
        Storage.addEnergy(this.collectedEnergy);
        
        const medal = Storage.checkMedal(this.currentLevel, this.collectedEnergy);
        
        UI.showLevelComplete(
            this.currentLevel,
            this.collectedEnergy,
            this.gameTime,
            medal
        );
        
        this.cleanupGame();
    },
    
    cleanupGame() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        ObstacleManager.clear();
        EnergyManager.clear();
        BossManager.clear();
        Spaceship.removeFromScene();
    },
    
    retryLevel() {
        this.cleanupGame();
        this.startLevel(this.currentLevel);
    },
    
    nextLevel() {
        this.cleanupGame();
        if (this.currentLevel < GameConfig.TOTAL_LEVELS) {
            this.startLevel(this.currentLevel + 1);
        } else {
            this.exitToMenu();
        }
    },
    
    exitToMenu() {
        this.cleanupGame();
        this.state = 'menu';
        UI.showStartScreen();
        this.startMenuLoop();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});
