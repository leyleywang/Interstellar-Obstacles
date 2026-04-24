const UI = {
    elements: {},
    
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.hideAllMenus();
    },
    
    cacheElements() {
        this.elements = {
            gameHud: document.getElementById('game-hud'),
            levelDisplay: document.getElementById('level-display'),
            energyDisplay: document.getElementById('energy-display'),
            progressFill: document.getElementById('progress-fill'),
            timeDisplay: document.getElementById('time-display'),
            
            startScreen: document.getElementById('start-screen'),
            levelSelectScreen: document.getElementById('level-select-screen'),
            levelGrid: document.getElementById('level-grid'),
            statsScreen: document.getElementById('stats-screen'),
            statsContent: document.getElementById('stats-content'),
            skinsScreen: document.getElementById('skins-screen'),
            skinsContent: document.getElementById('skins-content'),
            gameOverScreen: document.getElementById('game-over-screen'),
            levelCompleteScreen: document.getElementById('level-complete-screen'),
            bossWarning: document.getElementById('boss-warning'),
            
            failLevel: document.getElementById('fail-level'),
            failEnergy: document.getElementById('fail-energy'),
            failTime: document.getElementById('fail-time'),
            
            completeLevel: document.getElementById('complete-level'),
            completeEnergy: document.getElementById('complete-energy'),
            completeTime: document.getElementById('complete-time'),
            medalDisplay: document.getElementById('medal-display'),
            medalName: document.getElementById('medal-name'),
            
            nextLevelBtn: document.getElementById('next-level-btn')
        };
    },
    
    setupEventListeners() {
        document.getElementById('start-btn').addEventListener('click', () => {
            this.showLevelSelect();
        });
        
        document.getElementById('stats-btn').addEventListener('click', () => {
            this.showStats();
        });
        
        document.getElementById('skins-btn').addEventListener('click', () => {
            this.showSkins();
        });
        
        document.getElementById('back-from-levels').addEventListener('click', () => {
            this.showStartScreen();
        });
        
        document.getElementById('back-from-stats').addEventListener('click', () => {
            this.showStartScreen();
        });
        
        document.getElementById('back-from-skins').addEventListener('click', () => {
            this.showStartScreen();
        });
        
        document.getElementById('retry-btn').addEventListener('click', () => {
            Game.retryLevel();
        });
        
        document.getElementById('exit-btn').addEventListener('click', () => {
            Game.exitToMenu();
        });
        
        document.getElementById('next-level-btn').addEventListener('click', () => {
            Game.nextLevel();
        });
        
        document.getElementById('exit-to-menu-btn').addEventListener('click', () => {
            Game.exitToMenu();
        });
    },
    
    hideAllMenus() {
        this.elements.gameHud.style.display = 'none';
        this.elements.startScreen.style.display = 'none';
        this.elements.levelSelectScreen.style.display = 'none';
        this.elements.statsScreen.style.display = 'none';
        this.elements.skinsScreen.style.display = 'none';
        this.elements.gameOverScreen.style.display = 'none';
        this.elements.levelCompleteScreen.style.display = 'none';
        this.elements.bossWarning.style.display = 'none';
    },
    
    showStartScreen() {
        this.hideAllMenus();
        this.elements.startScreen.style.display = 'flex';
    },
    
    showLevelSelect() {
        this.hideAllMenus();
        this.elements.levelSelectScreen.style.display = 'flex';
        this.renderLevelGrid();
    },
    
    renderLevelGrid() {
        const grid = this.elements.levelGrid;
        grid.innerHTML = '';
        
        for (let i = 1; i <= GameConfig.TOTAL_LEVELS; i++) {
            const levelConfig = GameConfig.LEVELS[i - 1];
            const isUnlocked = i <= Storage.unlockedLevels;
            const record = Storage.getLevelRecord(i);
            const isCompleted = record !== null;
            
            const btn = document.createElement('button');
            btn.className = 'level-btn';
            if (isCompleted) btn.classList.add('completed');
            btn.disabled = !isUnlocked;
            
            btn.innerHTML = `
                <span>${i}</span>
                ${isCompleted ? '<span class="level-stars">★★★</span>' : ''}
            `;
            btn.title = levelConfig.name;
            
            if (isUnlocked) {
                btn.addEventListener('click', () => {
                    Game.startLevel(i);
                });
            }
            
            grid.appendChild(btn);
        }
    },
    
    showStats() {
        this.hideAllMenus();
        this.elements.statsScreen.style.display = 'flex';
        this.renderStats();
    },
    
    renderStats() {
        const content = this.elements.statsContent;
        content.innerHTML = '';
        
        const totalEnergyDiv = document.createElement('div');
        totalEnergyDiv.className = 'stat-item';
        totalEnergyDiv.innerHTML = `
            <span class="stat-level">总能量</span>
            <span class="stat-info"><span>收集: ${Storage.totalEnergy}</span></span>
        `;
        content.appendChild(totalEnergyDiv);
        
        if (Storage.medals.length > 0) {
            const medalsDiv = document.createElement('div');
            medalsDiv.className = 'stat-item';
            medalsDiv.innerHTML = `
                <span class="stat-level">勋章</span>
                <span class="stat-medal">${Storage.medals.map(m => {
                    const medal = GameConfig.MEDALS.find(g => g.name === m);
                    return medal ? medal.icon : '🏅';
                }).join(' ')}</span>
            `;
            content.appendChild(medalsDiv);
        }
        
        for (let i = 1; i <= GameConfig.TOTAL_LEVELS; i++) {
            const record = Storage.getLevelRecord(i);
            const levelConfig = GameConfig.LEVELS[i - 1];
            
            const div = document.createElement('div');
            div.className = 'stat-item';
            
            if (record) {
                div.innerHTML = `
                    <span class="stat-level">关卡 ${i}</span>
                    <span class="stat-info">
                        <span>最高能量: ${record.bestEnergy}</span>
                        <span>最快用时: ${Utils.formatTime(record.bestTime)}</span>
                    </span>
                `;
            } else {
                div.innerHTML = `
                    <span class="stat-level">关卡 ${i}</span>
                    <span class="stat-info"><span>未解锁</span></span>
                `;
                div.style.opacity = '0.5';
            }
            
            content.appendChild(div);
        }
    },
    
    showSkins() {
        this.hideAllMenus();
        this.elements.skinsScreen.style.display = 'flex';
        this.renderSkins();
    },
    
    renderSkins() {
        const content = this.elements.skinsContent;
        content.innerHTML = '';
        
        const grid = document.createElement('div');
        grid.className = 'skins-grid';
        
        const energyInfo = document.createElement('div');
        energyInfo.style.cssText = 'margin-bottom: 20px; text-align: center; color: #88aacc;';
        energyInfo.innerHTML = `当前能量: <span style="color: #ffff00; font-weight: bold;">${Storage.totalEnergy}</span>`;
        content.appendChild(energyInfo);
        
        for (const skin of GameConfig.SHIP_SKINS) {
            const isUnlocked = Storage.isSkinUnlocked(skin.id);
            const isSelected = Storage.selectedSkin === skin.id;
            
            const div = document.createElement('div');
            div.className = 'skin-item';
            if (!isUnlocked) div.classList.add('locked');
            if (isSelected) div.classList.add('selected');
            
            const colorHex = '#' + skin.color.toString(16).padStart(6, '0');
            
            div.innerHTML = `
                <div class="skin-preview" style="background: radial-gradient(circle, ${colorHex} 0%, transparent 70%);">
                    🚀
                </div>
                <div class="skin-name">${skin.name}</div>
                <div class="skin-cost">
                    ${isUnlocked ? 
                        (isSelected ? '✓ 已选择' : '点击选择') : 
                        `<span class="energy-icon">⚡</span> ${skin.unlockCost} 能量`
                    }
                </div>
            `;
            
            div.addEventListener('click', () => {
                if (isUnlocked) {
                    if (Storage.selectSkin(skin.id)) {
                        Spaceship.updateSkin();
                        this.renderSkins();
                    }
                } else {
                    if (Storage.unlockSkin(skin.id)) {
                        this.renderSkins();
                    } else {
                        alert(`能量不足！需要 ${skin.unlockCost} 能量来解锁此皮肤。`);
                    }
                }
            });
            
            grid.appendChild(div);
        }
        
        content.appendChild(grid);
    },
    
    showGameHud() {
        this.hideAllMenus();
        this.elements.gameHud.style.display = 'flex';
    },
    
    updateHud(level, energy, progress, time) {
        if (this.elements.levelDisplay) {
            this.elements.levelDisplay.textContent = level;
        }
        if (this.elements.energyDisplay) {
            this.elements.energyDisplay.textContent = energy;
        }
        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = `${progress}%`;
        }
        if (this.elements.timeDisplay) {
            this.elements.timeDisplay.textContent = Utils.formatTime(time);
        }
    },
    
    showGameOver(level, energy, time) {
        this.hideAllMenus();
        this.elements.gameOverScreen.style.display = 'flex';
        
        this.elements.failLevel.textContent = level;
        this.elements.failEnergy.textContent = energy;
        this.elements.failTime.textContent = Utils.formatTime(time);
    },
    
    showLevelComplete(level, energy, time, medal) {
        this.hideAllMenus();
        this.elements.levelCompleteScreen.style.display = 'flex';
        
        this.elements.completeLevel.textContent = level;
        this.elements.completeEnergy.textContent = energy;
        this.elements.completeTime.textContent = Utils.formatTime(time);
        
        if (medal) {
            this.elements.medalDisplay.style.display = 'block';
            this.elements.medalName.textContent = medal.icon + ' ' + medal.name;
        } else {
            this.elements.medalDisplay.style.display = 'none';
        }
        
        if (level >= GameConfig.TOTAL_LEVELS) {
            this.elements.nextLevelBtn.style.display = 'none';
        } else {
            this.elements.nextLevelBtn.style.display = 'block';
        }
    },
    
    showBossWarning() {
        this.elements.bossWarning.style.display = 'block';
        setTimeout(() => {
            this.elements.bossWarning.style.display = 'none';
        }, 3000);
    }
};
