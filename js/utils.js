const Utils = {
    randomRange(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    },
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    
    lerp(start, end, t) {
        return start + (end - start) * t;
    },
    
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },
    
    createParticleMaterial(color, size = 0.1) {
        return new THREE.PointsMaterial({
            color: color,
            size: size,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
    },
    
    createGlowMaterial(color, intensity = 1.5) {
        return new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.6
        });
    },
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};
