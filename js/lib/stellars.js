const canvas = document.getElementById('starCanvas');
const ctx = canvas.getContext('2d');

const THEMES = {
    dark: {
        bg: '#000000',
        colors: {
            '#ffffff': 8, '#ffe9c4': 6, '#ffcc99ff': 6, '#bdf7ffff': 2,
            '#bdcbffff': 1, '#ffcc6f': 2, '#ffb5a3': 1, '#ffb6b6ff': 1
        },
        alphaMin: 0.3,
        alphaRange: 0.7,
        radiusMax: 1.5,
        glow: true
    },
    light: {
        bg: '#f4f1ea',
        colors: {
            '#5a8f72': 4, '#7eb89a': 5, '#a8c4b0': 6, '#c4b8a0': 5,
            '#8a9e9a': 4, '#d4cfc4': 3, '#6a8fb0': 2, '#b8a890': 3
        },
        alphaMin: 0.12,
        alphaRange: 0.35,
        radiusMax: 2.2,
        glow: false
    }
};

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
}

function mulberry32(seed) {
    return function() {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function buildWeightedColorArray(weights) {
    const arr = [];
    for (const color in weights) {
        for (let i = 0; i < weights[color]; i++) {
            arr.push(color);
        }
    }
    return arr;
}

function getThemeName() {
    const t = document.documentElement.getAttribute('data-theme');
    return t === 'light' ? 'light' : 'dark';
}

let rand = null;
let stars = [];
let phaseX, phaseY;
let currentThemeName = getThemeName();
let themeConfig = THEMES[currentThemeName];
let starColors = buildWeightedColorArray(themeConfig.colors);
let lastSeed = null;

function generateStars(width, height) {
    const starCount = Math.floor(rand() * 1001) + 200;
    const newStars = [];
    for (let i = 0; i < starCount; i++) {
        newStars.push({
            x: rand() * width,
            y: rand() * height,
            radius: rand() * themeConfig.radiusMax + 0.3,
            alpha: rand() * themeConfig.alphaRange + themeConfig.alphaMin,
            color: starColors[Math.floor(rand() * starColors.length)]
        });
    }
    return newStars;
}

function initGalaxy(seed) {
    const currentSeed = seed ?? lastSeed ?? Math.floor(Math.random() * 1e9);
    lastSeed = currentSeed;
    console.log("Seed:", currentSeed);
    document.querySelectorAll('.seed-input').forEach((input) => {
        input.setAttribute("placeholder", currentSeed);
    });

    rand = mulberry32(currentSeed);
    phaseX = rand() * Math.PI * 2;
    phaseY = rand() * Math.PI * 2;
    stars = generateStars(window.innerWidth * 1.2, window.innerHeight * 1.2);
}

window.updateGalaxy = function(trigger) {
    const container = trigger && trigger.closest('.seed-container');
    const input = container
        ? container.querySelector('.seed-input')
        : document.querySelector('.seed-input');
    const parsed = input && input.value ? Number.parseInt(input.value, 10) : null;
    const val = Number.isFinite(parsed) ? parsed : null;
    initGalaxy(val);
    drawStars(stars);
}

function applySkyTheme(themeName) {
    const nextThemeName = themeName === 'light' ? 'light' : 'dark';
    if (nextThemeName === currentThemeName && stars.length > 0) return;

    currentThemeName = nextThemeName;
    themeConfig = THEMES[currentThemeName];
    starColors = buildWeightedColorArray(themeConfig.colors);
    initGalaxy(lastSeed);
    drawStars(stars);
}

window.setSkyTheme = applySkyTheme;

function drawStars(starList, offsetX = 0, offsetY = 0) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = themeConfig.bg;
    ctx.fillRect(0, 0, w, h);

    if (currentThemeName === 'light') {
        const g = ctx.createRadialGradient(w * 0.3, h * 0.2, 0, w * 0.3, h * 0.2, w * 0.7);
        g.addColorStop(0, 'rgba(126, 184, 154, 0.08)');
        g.addColorStop(0.5, 'rgba(196, 184, 160, 0.05)');
        g.addColorStop(1, 'rgba(244, 241, 234, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        const g2 = ctx.createRadialGradient(w * 0.75, h * 0.7, 0, w * 0.75, h * 0.7, w * 0.5);
        g2.addColorStop(0, 'rgba(106, 143, 176, 0.06)');
        g2.addColorStop(1, 'rgba(244, 241, 234, 0)');
        ctx.fillStyle = g2;
        ctx.fillRect(0, 0, w, h);
    }

    for (const star of starList) {
        ctx.save();
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x + offsetX, star.y + offsetY, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        if (themeConfig.glow && star.radius > 1.2) {
            ctx.shadowColor = star.color;
            ctx.shadowBlur = 8;
        }
        ctx.fill();
        ctx.restore();
    }
}

let t = 0;
function animate() {
    t += 0.01;
    if (phaseX !== undefined) {
        const offsetX = Math.sin(t * 0.7 + phaseX) * 20 + Math.cos(t * 0.3 + phaseX) * 8;
        const offsetY = Math.cos(t * 0.5 + phaseY) * 15 + Math.sin(t * 0.2 + phaseY) * 6;
        drawStars(stars, offsetX, offsetY);
    }
    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    resizeCanvas();
    drawStars(stars);
});

window.addEventListener('themechange', (e) => {
    applySkyTheme(e.detail && e.detail.theme);
});

const themeObserver = new MutationObserver(() => {
    const name = getThemeName();
    if (name !== currentThemeName) applySkyTheme(name);
});
themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

resizeCanvas();
applySkyTheme(getThemeName());
animate();
