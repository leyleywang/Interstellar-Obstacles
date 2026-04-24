const GameConfig = {
    TOTAL_LEVELS: 10,
    
    LEVELS: [
        { level: 1, name: "星际新手", baseSpeed: 0.15, obstacleFrequency: 120, maxObstacles: 3, energyFrequency: 180, hasMovingObstacles: false, bossType: "small", levelLength: 5000 },
        { level: 2, name: "太空探索者", baseSpeed: 0.18, obstacleFrequency: 100, maxObstacles: 4, energyFrequency: 150, hasMovingObstacles: false, bossType: "small", levelLength: 6000 },
        { level: 3, name: "银河旅者", baseSpeed: 0.20, obstacleFrequency: 90, maxObstacles: 5, energyFrequency: 140, hasMovingObstacles: false, bossType: "small", levelLength: 7000 },
        { level: 4, name: "星际飞行员", baseSpeed: 0.22, obstacleFrequency: 80, maxObstacles: 6, energyFrequency: 130, hasMovingObstacles: true, movingObstacleChance: 0.2, bossType: "medium", levelLength: 8000 },
        { level: 5, name: "太空战士", baseSpeed: 0.25, obstacleFrequency: 70, maxObstacles: 7, energyFrequency: 120, hasMovingObstacles: true, movingObstacleChance: 0.3, bossType: "medium", levelLength: 9000 },
        { level: 6, name: "银河守护者", baseSpeed: 0.28, obstacleFrequency: 60, maxObstacles: 8, energyFrequency: 110, hasMovingObstacles: true, movingObstacleChance: 0.4, bossType: "medium", levelLength: 10000 },
        { level: 7, name: "星际指挥官", baseSpeed: 0.30, obstacleFrequency: 55, maxObstacles: 9, energyFrequency: 100, hasMovingObstacles: true, movingObstacleChance: 0.5, bossType: "large", levelLength: 11000 },
        { level: 8, name: "太空英雄", baseSpeed: 0.33, obstacleFrequency: 50, maxObstacles: 10, energyFrequency: 90, hasMovingObstacles: true, movingObstacleChance: 0.6, bossType: "large", levelLength: 12000 },
        { level: 9, name: "银河传奇", baseSpeed: 0.36, obstacleFrequency: 45, maxObstacles: 11, energyFrequency: 80, hasMovingObstacles: true, movingObstacleChance: 0.7, bossType: "large", levelLength: 13000 },
        { level: 10, name: "星际之王", baseSpeed: 0.40, obstacleFrequency: 40, maxObstacles: 12, energyFrequency: 70, hasMovingObstacles: true, movingObstacleChance: 0.8, bossType: "ultimate", levelLength: 15000 }
    ],
    
    SHIP_SKINS: [
        { id: "default", name: "标准战机", color: 0x00aaff, unlockCost: 0, unlocked: true },
        { id: "fire", name: "烈焰战机", color: 0xff4400, unlockCost: 50, unlocked: false },
        { id: "ice", name: "冰霜战机", color: 0x00ffff, unlockCost: 80, unlocked: false },
        { id: "golden", name: "黄金战机", color: 0xffd700, unlockCost: 120, unlocked: false },
        { id: "purple", name: "暗影战机", color: 0x9933ff, unlockCost: 150, unlocked: false },
        { id: "rainbow", name: "彩虹战机", color: 0xff00ff, unlockCost: 200, unlocked: false }
    ],
    
    MEDALS: [
        { name: "青铜星际勋章", minEnergy: 5, minLevel: 1, icon: "🥉" },
        { name: "白银星际勋章", minEnergy: 10, minLevel: 3, icon: "🥈" },
        { name: "黄金星际勋章", minEnergy: 15, minLevel: 5, icon: "🥇" },
        { name: "铂金星际勋章", minEnergy: 20, minLevel: 7, icon: "💎" },
        { name: "钻石星际勋章", minEnergy: 25, minLevel: 9, icon: "💠" },
        { name: "传奇星际勋章", minEnergy: 30, minLevel: 10, icon: "👑" }
    ],
    
    SHIP: {
        width: 1.5,
        height: 0.5,
        depth: 2.5,
        moveSpeed: 0.15,
        maxX: 8,
        minX: -8
    },
    
    OBSTACLES: {
        types: [
            { name: "asteroid", minSize: 0.8, maxSize: 1.5, color: 0x8B4513 },
            { name: "debris", minSize: 0.5, maxSize: 1.2, color: 0x696969 },
            { name: "satellite", minSize: 0.6, maxSize: 1.0, color: 0x4682B4 }
        ],
        spawnZ: 50,
        despawnZ: -30,
        collisionRadius: 1.2
    },
    
    ENERGY: {
        size: 0.6,
        color: 0x00ff88,
        glowColor: 0x00ff00,
        spawnZ: 50,
        despawnZ: -30,
        collectRadius: 1.5,
        value: 1
    },
    
    BOSS: {
        small: { asteroidCount: 8, speed: 0.12 },
        medium: { asteroidCount: 12, speed: 0.15 },
        large: { asteroidCount: 18, speed: 0.18 },
        ultimate: { asteroidCount: 25, speed: 0.22 }
    },
    
    SCENE: {
        starCount: 2000,
        nebulaCount: 5,
        fogColor: 0x000820,
        fogDensity: 0.003
    },
    
    STORAGE_KEYS: {
        TOTAL_ENERGY: "interstellar_total_energy",
        UNLOCKED_LEVELS: "interstellar_unlocked_levels",
        LEVEL_RECORDS: "interstellar_level_records",
        SELECTED_SKIN: "interstellar_selected_skin",
        UNLOCKED_SKINS: "interstellar_unlocked_skins",
        MEDALS: "interstellar_medals"
    }
};
