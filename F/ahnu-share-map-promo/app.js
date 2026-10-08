const SCENE_DURATION = 4300;
const scenes = [...document.querySelectorAll(".scene")];
const dots = [...document.querySelectorAll("[data-go]")];
const stage = document.querySelector("#stage");
const timelineFill = document.querySelector("#timelineFill");
const motionToggle = document.querySelector("#motionToggle");
const copyLink = document.querySelector("#copyLink");
const campusMap = document.querySelector("#campusMap");
const mapTiles = document.querySelector("#mapTiles");
const requestedScene = Number(new URLSearchParams(window.location.search).get("scene"));
const hasRequestedScene = Number.isInteger(requestedScene) && requestedScene >= 0 && requestedScene < scenes.length;

let currentScene = 0;
let playing = !hasRequestedScene && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let startedAt = performance.now();
let elapsedBeforePause = 0;
let animationFrame = 0;
let pointerStart = null;

const MAP_ZOOM = 12;
const MAP_CENTER = { latitude: 31.3644, longitude: 118.3831 };

function mapWorldPoint(latitude, longitude, zoom = MAP_ZOOM) {
  const worldSize = 256 * 2 ** zoom;
  const sinLatitude = Math.sin((latitude * Math.PI) / 180);
  return {
    x: ((longitude + 180) / 360) * worldSize,
    y:
      (0.5 -
        Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) *
      worldSize,
  };
}

function renderCampusMap() {
  const width = campusMap.clientWidth;
  const height = campusMap.clientHeight;
  if (!width || !height) return;
  const center = mapWorldPoint(MAP_CENTER.latitude, MAP_CENTER.longitude);
  const topLeft = { x: center.x - width / 2, y: center.y - height / 2 };
  const firstTileX = Math.floor(topLeft.x / 256);
  const firstTileY = Math.floor(topLeft.y / 256);
  const lastTileX = Math.floor((topLeft.x + width) / 256);
  const lastTileY = Math.floor((topLeft.y + height) / 256);
  mapTiles.replaceChildren();
  for (let tileY = firstTileY; tileY <= lastTileY; tileY += 1) {
    for (let tileX = firstTileX; tileX <= lastTileX; tileX += 1) {
      const tile = document.createElement("img");
      tile.className = "map-tile";
      tile.alt = "";
      tile.draggable = false;
      tile.src = `https://tile.openstreetmap.org/${MAP_ZOOM}/${tileX}/${tileY}.png`;
      tile.style.left = `${tileX * 256 - topLeft.x}px`;
      tile.style.top = `${tileY * 256 - topLeft.y}px`;
      mapTiles.append(tile);
    }
  }
  campusMap.querySelectorAll("[data-lat][data-lng]").forEach((pin) => {
    const point = mapWorldPoint(Number(pin.dataset.lat), Number(pin.dataset.lng));
    pin.style.left = `${point.x - topLeft.x}px`;
    pin.style.top = `${point.y - topLeft.y}px`;
  });
}

function sceneColor(index) {
  return ["#f8f2e6", "#173c2b", "#f8f2e6", "#173c2b", "#173c2b", "#f8f2e6"][index];
}

function renderScene(index, resetClock = true) {
  currentScene = (index + scenes.length) % scenes.length;
  scenes.forEach((scene, sceneIndex) => {
    const active = sceneIndex === currentScene;
    scene.classList.toggle("is-active", active);
    scene.setAttribute("aria-hidden", String(!active));
  });
  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === currentScene);
    dot.setAttribute("aria-current", dotIndex === currentScene ? "true" : "false");
  });
  stage.style.color = sceneColor(currentScene);
  if (resetClock) {
    startedAt = performance.now();
    elapsedBeforePause = 0;
    timelineFill.style.width = `${(currentScene / scenes.length) * 100}%`;
  }
}

function tick(now) {
  if (playing) {
    const elapsed = elapsedBeforePause + now - startedAt;
    const sceneProgress = Math.min(elapsed / SCENE_DURATION, 1);
    timelineFill.style.width = `${((currentScene + sceneProgress) / scenes.length) * 100}%`;
    if (sceneProgress >= 1) renderScene(currentScene + 1);
  }
  animationFrame = requestAnimationFrame(tick);
}

function setPlaying(nextPlaying) {
  if (playing === nextPlaying) return;
  playing = nextPlaying;
  if (playing) {
    startedAt = performance.now();
  } else {
    elapsedBeforePause += performance.now() - startedAt;
  }
  motionToggle.firstElementChild.textContent = playing ? "Ⅱ" : "▶";
  motionToggle.setAttribute("aria-label", playing ? "暂停动画" : "继续动画");
  motionToggle.setAttribute("title", playing ? "暂停动画" : "继续动画");
}

dots.forEach((dot) => dot.addEventListener("click", () => renderScene(Number(dot.dataset.go))));
motionToggle.addEventListener("click", () => setPlaying(!playing));

stage.addEventListener("pointerdown", (event) => {
  pointerStart = { x: event.clientX, y: event.clientY };
});

stage.addEventListener("pointerup", (event) => {
  if (!pointerStart) return;
  const deltaX = event.clientX - pointerStart.x;
  const deltaY = event.clientY - pointerStart.y;
  pointerStart = null;
  if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 46) return;
  const forward = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX < 0 : deltaY < 0;
  renderScene(currentScene + (forward ? 1 : -1));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "ArrowDown") renderScene(currentScene + 1);
  if (event.key === "ArrowLeft" || event.key === "ArrowUp") renderScene(currentScene - 1);
  if (event.key === " ") {
    event.preventDefault();
    setPlaying(!playing);
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && playing) setPlaying(false);
});

copyLink.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("https://map.florance.top");
    copyLink.textContent = "网址已复制";
    copyLink.classList.add("is-copied");
    window.setTimeout(() => {
      copyLink.textContent = "复制网址";
      copyLink.classList.remove("is-copied");
    }, 1800);
  } catch {
    window.location.href = "https://map.florance.top";
  }
});

renderScene(hasRequestedScene ? requestedScene : 0);
renderCampusMap();
window.addEventListener("resize", renderCampusMap);
motionToggle.firstElementChild.textContent = playing ? "Ⅱ" : "▶";
animationFrame = requestAnimationFrame(tick);
window.addEventListener("pagehide", () => cancelAnimationFrame(animationFrame));
