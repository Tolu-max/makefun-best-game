import { CONFIG } from './config.js';
import { sfx } from './audio.js';

export class Player {
  constructor(cx, cy) {
    this.cx = cx;
    this.cy = cy;
    this.angle = 0;
    this.orbitRadius = CONFIG.ORBIT_RADIUS;
    this.lasers = [];
    this.lastFired = 0;
    this.shieldActive = false;
    this.shieldTimer = 0;
    this.shieldCooldown = 0;
  }

  update(keys, mouse, now) {
    // Rotation via keyboard A/D or Left/Right
    if (keys['KeyA'] || keys['ArrowLeft']) this.angle -= CONFIG.PLAYER_SPEED;
    if (keys['KeyD'] || keys['ArrowRight']) this.angle += CONFIG.PLAYER_SPEED;

    // Optional mouse targeting to face cursor
    if (mouse.down && mouse.x !== null) {
      const targetAngle = Math.atan2(mouse.y - this.cy, mouse.x - this.cx);
      const diff = targetAngle - this.angle;
      this.angle += Math.sin(diff) * 0.1;
    }

    // Shield trigger (S key or Down)
    if ((keys['KeyS'] || keys['ArrowDown']) && this.shieldCooldown <= 0 && !this.shieldActive) {
      this.shieldActive = true;
      this.shieldTimer = CONFIG.SHIELD_DURATION;
      this.shieldCooldown = CONFIG.SHIELD_COOLDOWN;
      sfx.shield();
    }

    if (this.shieldActive) {
      this.shieldTimer -= 16.6;
      if (this.shieldTimer <= 0) this.shieldActive = false;
    }
    if (this.shieldCooldown > 0) this.shieldCooldown -= 16.6;

    // Firing (Space, W, Up, or Mouse Click)
    if ((keys['Space'] || keys['KeyW'] || keys['ArrowUp'] || mouse.down) && now - this.lastFired > CONFIG.BASE_FIRE_RATE) {
      this.fire();
      this.lastFired = now;
    }

    // Update lasers
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const l = this.lasers[i];
      l.x += l.vx;
      l.y += l.vy;
      // Remove off-screen lasers
      if (l.x < 0 || l.x > CONFIG.WIDTH || l.y < 0 || l.y > CONFIG.HEIGHT) {
        this.lasers.splice(i, 1);
      }
    }
  }

  fire() {
    const px = this.cx + Math.cos(this.angle) * this.orbitRadius;
    const py = this.cy + Math.sin(this.angle) * this.orbitRadius;
    const speed = 9;
    this.lasers.push({
      x: px,
      y: py,
      vx: Math.cos(this.angle) * speed,
      vy: Math.sin(this.angle) * speed
    });
    sfx.laser();
  }

  draw(ctx) {
    const px = this.cx + Math.cos(this.angle) * this.orbitRadius;
    const py = this.cy + Math.sin(this.angle) * this.orbitRadius;

    // Draw Orbit Path
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.orbitRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw Core
    ctx.fillStyle = CONFIG.COLORS.CORE;
    ctx.shadowColor = CONFIG.COLORS.CORE;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, CONFIG.CORE_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Draw Shield if active
    if (this.shieldActive) {
      ctx.strokeStyle = CONFIG.COLORS.SHIELD;
      ctx.shadowColor = CONFIG.COLORS.SHIELD;
      ctx.shadowBlur = 20;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.cx, this.cy, this.orbitRadius + 15, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw Player Ship (Triangle)
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(this.angle + Math.PI / 2);
    ctx.fillStyle = CONFIG.COLORS.PLAYER;
    ctx.shadowColor = CONFIG.COLORS.PLAYER;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(8, 10);
    ctx.lineTo(-8, 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Draw Lasers
    ctx.fillStyle = CONFIG.COLORS.LASER;
    ctx.shadowColor = CONFIG.COLORS.LASER;
    ctx.shadowBlur = 8;
    for (const l of this.lasers) {
      ctx.beginPath();
      ctx.arc(l.x, l.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
}
