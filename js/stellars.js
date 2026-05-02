const canvas = document.getElementById('starCanvas');
const ctx = canvas.getContext('2d');

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

const STAR_COLOR_WEIGHTS = {
    '#ffffff': 8, '#ffe9c4': 6, '#ffcc99ff': 6, '#bdf7ffff': 2,
    '#bdcbffff': 1, '#ffcc6f': 2, '#ffb5a3': 1, '#ffb6b6ff': 1
};

function buildWeightedColorArray(weights) {
    const arr = [];
    for (const color in weights) {
        for (let i = 0; i < weights[color]; i++) {
            arr.push(color);
        }
    }
    return arr;
}
const STAR_COLORS = buildWeightedColorArray(STAR_COLOR_WEIGHTS);

let rand = null;
let stars = [];
let phaseX, phaseY;

function generateStars(width, height) {
    const starCount = Math.floor(rand() * 1001) + 200;
    const newStars = [];
    for (let i = 0; i < starCount; i++) {
        newStars.push({
            x: rand() * width,
            y: rand() * height,
            radius: rand() * 1.5 + 0.3,
            alpha: rand() * 0.7 + 0.3,
            color: STAR_COLORS[Math.floor(rand() * STAR_COLORS.length)]
        });
    }
    return newStars;
}

function initGalaxy(seed) {
    const currentSeed = seed || Math.floor(Math.random() * 1e9);
    console.log("Seed:", currentSeed);
    const input = document.getElementById('seedInput');
    input.setAttribute("placeholder", currentSeed);
    
    rand = mulberry32(currentSeed);
    
    phaseX = rand() * Math.PI * 2;
    phaseY = rand() * Math.PI * 2;
    
    stars = generateStars(window.innerWidth * 1.2, window.innerHeight * 1.2);
}

window.updateGalaxy = function() {
    const input = document.getElementById('seedInput');
    const val = input.value ? parseInt(input.value) : null;
    initGalaxy(val);
    drawStars(stars);
}

function drawStars(stars, offsetX = 0, offsetY = 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const star of stars) {
        ctx.save();
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x + offsetX, star.y + offsetY, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        if(star.radius > 1.2) {
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

resizeCanvas();
initGalaxy();
animate();