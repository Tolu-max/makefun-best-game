import { CONFIG } from './config.js';

export class EnemyManager {
  constructor(cx, cy) {
    this.cx = cx;
    this.cy = cy;
    this.enemies = [];
    this.spawnTimer = 0;
    this.wave = 1;
    this.waveKills = 0;
  }

  update(now, onKill) {
    const spawnInterval = Math.max(800, 2200 - this.wave * 180);
    if (now - this.spawnTimer > spawnInterval) {
      this.spawn();
      this.spawnTimer = now;
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      const dx = this.cx - e.x;
      const dy = this.cy - e.y;
      const dist = Math.hypot(dx, dy);

      if (dist > CONFIG.CORE_RADIUS) {
        e.x += (dx / dist) * e.speed;
        e.y += (dy / dist) * e.speed;
      }
    }
  }

  spawn() {
    const angle = Math.random() * Math.PI * 2;
    const spawnDist = 480;
    const isTank = Math.random() < Math.min(0.35, this.wave * 0.08);

    this.enemies.push({
      x: this.cx + Math.cos(angle) * spawnDist,
      y: this.cy + Math.sin(angle) * spawnDist,
      type: isTank ? 'tank' : 'scout',
      hp: isTank ? 3 : 1,
      speed: isTank ? 1.0 : (1.6 + Math.random() * 0.5),
      radius: isTank ? 16 : 9,
      color: isTank ? CONFIG.COLORS.ENEMY_TANK : CONFIG.COLORS.ENEMY_SCOUT,
      scoreVal: isTank ? 50 : 20
    });
  }

  draw(ctx) {
    ctx.save();
    for (const e of this.enemies) {
      ctx.fillStyle = e.color;
      ctx.shadowColor = e.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      if (e.type === 'tank') {
        ctx.rect(e.x - e.radius, e.y - e.radius, e.radius * 2, e.radius * 2);
      } else {
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      }
      ctx.fill();
    }
    ctx.restore();
  }

  clear() {
    this.enemies = [];
    this.wave = 1;
    this.waveKills = 0;
  }
}
