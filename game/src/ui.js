import { CONFIG } from './config.js';

export class UIManager {
  constructor() {
    this.highScore = 0;
  }

  drawHUD(ctx, score, lives, wave, shieldCooldown) {
    ctx.save();
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = '16px monospace';

    // Top-left: Score & High Score
    ctx.fillText(`SCORE: ${score}`, 20, 30);
    ctx.fillText(`HIGH:  ${Math.max(score, this.highScore)}`, 20, 52);

    // Top-center: Wave
    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = CONFIG.COLORS.CORE;
    ctx.fillText(`WAVE ${wave}`, CONFIG.WIDTH / 2 - 40, 30);

    // Top-right: Lives & Shield Status
    ctx.font = '16px monospace';
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.fillText(`LIVES: ${'♥ '.repeat(lives)}`, CONFIG.WIDTH - 150, 30);

    const shieldText = shieldCooldown <= 0 ? 'SHIELD: READY [S]' : `SHIELD: ${(shieldCooldown / 1000).toFixed(1)}s`;
    ctx.fillStyle = shieldCooldown <= 0 ? CONFIG.COLORS.SHIELD : '#666';
    ctx.fillText(shieldText, CONFIG.WIDTH - 190, 52);

    ctx.restore();
  }

  drawTitleScreen(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(5, 8, 17, 0.85)';
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

    ctx.textAlign = 'center';

    // Title
    ctx.fillStyle = CONFIG.COLORS.CORE;
    ctx.font = 'bold 36px monospace';
    ctx.shadowColor = CONFIG.COLORS.CORE;
    ctx.shadowBlur = 20;
    ctx.fillText('VOID SENTINEL', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 90);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#aaa';
    ctx.font = '16px monospace';
    ctx.fillText('DEFEND THE ORBITAL CORE FROM INCOMING DRONES', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 45);

    // Controls
    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    ctx.fillText('[A / D] or [Left / Right] - Orbit Core', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 10);
    ctx.fillText('[SPACE / W / Click] - Fire Plasma Cannons', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 35);
    ctx.fillText('[S / Down] - Deploy Pulse Shield', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 60);

    // Start prompt
    ctx.fillStyle = CONFIG.COLORS.PLAYER;
    ctx.font = 'bold 20px monospace';
    ctx.fillText('PRESS SPACE OR CLICK TO START', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 120);

    ctx.restore();
  }

  drawGameOver(ctx, score, wave) {
    ctx.save();
    ctx.fillStyle = 'rgba(5, 8, 17, 0.9)';
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

    ctx.textAlign = 'center';

    ctx.fillStyle = '#ff3366';
    ctx.font = 'bold 38px monospace';
    ctx.shadowColor = '#ff3366';
    ctx.shadowBlur = 20;
    ctx.fillText('CORE DESTROYED', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 70);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.fillText(`FINAL SCORE: ${score}`, CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 15);
    ctx.fillText(`WAVE REACHED: ${wave}`, CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 15);

    if (score >= this.highScore && score > 0) {
      ctx.fillStyle = CONFIG.COLORS.CORE;
      ctx.fillText('★ NEW HIGH SCORE! ★', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 50);
    }

    ctx.fillStyle = CONFIG.COLORS.PLAYER;
    ctx.font = 'bold 18px monospace';
    ctx.fillText('PRESS [R] OR CLICK TO RESTART', CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 100);

    ctx.restore();
  }
}
