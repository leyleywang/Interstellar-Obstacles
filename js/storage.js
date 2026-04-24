const Storage = {
    totalEnergy: 0,
    unlockedLevels: 1,
    levelRecords: {},
    selectedSkin: "default",
    unlockedSkins: ["default"],
    medals: [],
    
    init() {
        this.load();
        this.applyDefaults();
    },
    
    load() {
        try {
            const totalEnergy = localStorage.getItem(GameConfig.STORAGE_KEYS.TOTAL_ENERGY);
            const unlockedLevels = localStorage.getItem(GameConfig.STORAGE_KEYS.UNLOCKED_LEVELS);
            const levelRecords = localStorage.getItem(GameConfig.STORAGE_KEYS.LEVEL_RECORDS);
            const selectedSkin = localStorage.getItem(GameConfig.STORAGE_KEYS.SELECTED_SKIN);
            const unlockedSkins = localStorage.getItem(GameConfig.STORAGE_KEYS.UNLOCKED_SKINS);
            const medals = localStorage.getItem(GameConfig.STORAGE_KEYS.MEDALS);
            
            if (totalEnergy !== null) this.totalEnergy = parseInt(totalEnergy);
            if (unlockedLevels !== null) this.unlockedLevels = parseInt(unlockedLevels);
            if (levelRecords !== null) this.levelRecords = JSON.parse(levelRecords);
            if (selectedSkin !== null) this.selectedSkin = selectedSkin;
            if (unlockedSkins !== null) this.unlockedSkins = JSON.parse(unlockedSkins);
            if (medals !== null) this.medals = JSON.parse(medals);
        } catch (e) {
            console.warn("Failed to load game data:", e);
        }
    },
    
    save() {
        try {
            localStorage.setItem(GameConfig.STORAGE_KEYS.TOTAL_ENERGY, this.totalEnergy.toString());
            localStorage.setItem(GameConfig.STORAGE_KEYS.UNLOCKED_LEVELS, this.unlockedLevels.toString());
            localStorage.setItem(GameConfig.STORAGE_KEYS.LEVEL_RECORDS, JSON.stringify(this.levelRecords));
            localStorage.setItem(GameConfig.STORAGE_KEYS.SELECTED_SKIN, this.selectedSkin);
            localStorage.setItem(GameConfig.STORAGE_KEYS.UNLOCKED_SKINS, JSON.stringify(this.unlockedSkins));
            localStorage.setItem(GameConfig.STORAGE_KEYS.MEDALS, JSON.stringify(this.medals));
        } catch (e) {
            console.warn("Failed to save game data:", e);
        }
    },
    
    applyDefaults() {
        if (this.unlockedLevels < 1) this.unlockedLevels = 1;
        if (!this.unlockedSkins || this.unlockedSkins.length === 0) {
            this.unlockedSkins = ["default"];
        }
        if (!this.selectedSkin || !this.unlockedSkins.includes(this.selectedSkin)) {
            this.selectedSkin = "default";
        }
    },
    
    addEnergy(amount) {
        this.totalEnergy += amount;
        this.save();
    },
    
    updateLevelRecord(level, energy, time) {
        const record = this.levelRecords[level] || { bestEnergy: 0, bestTime: Infinity };
        
        record.bestEnergy = Math.max(record.bestEnergy, energy);
        record.bestTime = Math.min(record.bestTime, time);
        record.lastPlayed = Date.now();
        
        this.levelRecords[level] = record;
        
        if (level < GameConfig.TOTAL_LEVELS && this.unlockedLevels <= level) {
            this.unlockedLevels = level + 1;
        }
        
        this.save();
    },
    
    checkMedal(level, energy) {
        let earnedMedal = null;
        
        for (let i = GameConfig.MEDALS.length - 1; i >= 0; i--) {
            const medal = GameConfig.MEDALS[i];
            if (level >= medal.minLevel && energy >= medal.minEnergy) {
                if (!this.medals.includes(medal.name)) {
                    this.medals.push(medal.name);
                    this.save();
                }
                earnedMedal = medal;
                break;
            }
        }
        
        return earnedMedal;
    },
    
    unlockSkin(skinId) {
        const skin = GameConfig.SHIP_SKINS.find(s => s.id === skinId);
        if (!skin) return false;
        
        if (this.unlockedSkins.includes(skinId)) return false;
        if (this.totalEnergy < skin.unlockCost) return false;
        
        this.totalEnergy -= skin.unlockCost;
        this.unlockedSkins.push(skinId);
        this.save();
        return true;
    },
    
    selectSkin(skinId) {
        if (this.unlockedSkins.includes(skinId)) {
            this.selectedSkin = skinId;
            this.save();
            return true;
        }
        return false;
    },
    
    getSelectedSkinData() {
        return GameConfig.SHIP_SKINS.find(s => s.id === this.selectedSkin) || GameConfig.SHIP_SKINS[0];
    },
    
    isSkinUnlocked(skinId) {
        return this.unlockedSkins.includes(skinId);
    },
    
    getLevelRecord(level) {
        return this.levelRecords[level] || null;
    }
};
