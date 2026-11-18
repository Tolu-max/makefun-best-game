import { CONFIG } from './config.js';
import { sfx } from './audio.js';
import { Player } from './player.js';
import { EnemyManager } from './enemies.js';
import { ParticleSystem } from './particles.js';
import { UIManager } from './ui.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const cx = CONFIG.WIDTH / 2;
const cy = CONFIG.HEIGHT / 2;

const player = new Player(cx, cy);
const enemies = new EnemyManager(cx, cy);
const particles = new ParticleSystem();
const ui = new UIManager();

let gameState = 'START'; // 'START' | 'PLAYING' | 'GAMEOVER'
let score = 0;
let lives = CONFIG.MAX_LIVES;

const keys = {};
const mouse = { x: null, y: null, down: false };

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  sfx.init();

  if (gameState === 'START' && (e.code === 'Space' || e.code === 'Enter')) {
    startGame();
  } else if (gameState === 'GAMEOVER' && (e.code === 'KeyR' || e.code === 'Space')) {
    startGame();
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

canvas.addEventListener('mousedown', () => {
  mouse.down = true;
  sfx.init();
  if (gameState === 'START' || gameState === 'GAMEOVER') {
    startGame();
  }
});

window.addEventListener('mouseup', () => {
  mouse.down = false;
});

function startGame() {
  score = 0;
  lives = CONFIG.MAX_LIVES;
  enemies.clear();
  particles.clear();
  player.lasers = [];
  player.shieldActive = false;
  player.shieldCooldown = 0;
  gameState = 'PLAYING';
}

function handleCollisions() {
  // Laser vs Enemy
  for (let i = player.lasers.length - 1; i >= 0; i--) {
    const l = player.lasers[i];
    for (let j = enemies.enemies.length - 1; j >= 0; j--) {
      const e = enemies.enemies[j];
      const dist = Math.hypot(l.x - e.x, l.y - e.y);
      if (dist < e.radius + 4) {
        player.lasers.splice(i, 1);
        e.hp--;
        particles.burst(l.x, l.y, e.color, 8);
        sfx.explosion();

        if (e.hp <= 0) {
          score += e.scoreVal;
          enemies.waveKills++;
          particles.burst(e.x, e.y, e.color, 16);
          enemies.enemies.splice(j, 1);

          // Level up wave every 10 kills
          if (enemies.waveKills >= enemies.wave * 10) {
            enemies.wave++;
            enemies.waveKills = 0;
          }
        }
        break;
      }
    }
  }

  // Enemy vs Core or Shield
  for (let i = enemies.enemies.length - 1; i >= 0; i--) {
    const e = enemies.enemies[i];
    const distToCenter = Math.hypot(this_cx - e.x, this_cy - e.y);

    // Shield defense
    if (player.shieldActive && distToCenter <= player.orbitRadius + 20) {
      particles.burst(e.x, e.y, CONFIG.COLORS.SHIELD, 14);
      enemies.enemies.splice(i, 1);
      score += 15;
      sfx.explosion();
      continue;
    }

    // Impact with Core
    if (distToCenter <= CONFIG.CORE_RADIUS + e.radius) {
      enemies.enemies.splice(i, 1);
      particles.burst(e.x, e.y, '#ff0033', 25);
      lives--;
      sfx.explosion();

      if (lives <= 0) {
        gameState = 'GAMEOVER';
        ui.highScore = Math.max(ui.highScore, score);
        sfx.gameOver();
      }
    }
  }
}
const this_cx = cx;
const this_cy = cy;

function loop(now) {
  ctx.clearRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

  if (gameState === 'PLAYING') {
    player.update(keys, mouse, now);
    enemies.update(now);
    handleCollisions();
  }
  particles.update();

  // Rendering
  player.draw(ctx);
  enemies.draw(ctx);
  particles.draw(ctx);

  if (gameState === 'PLAYING') {
    ui.drawHUD(ctx, score, lives, enemies.wave, player.shieldCooldown);
  } else if (gameState === 'START') {
    ui.drawTitleScreen(ctx);
  } else if (gameState === 'GAMEOVER') {
    ui.drawGameOver(ctx, score, enemies.wave);
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
