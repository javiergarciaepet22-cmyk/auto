import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, ArrowLeft, ArrowRight, Zap, Target, Pause } from 'lucide-react';

interface ArcadeGameCanvasProps {
  onGameOver?: (score: number) => void;
}

interface ProjectileData {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
}

interface ExplosionData {
  x: number;
  y: number;
  color: string;
  age: number;
  lifetime: number;
  particles: Array<{
    vx: number;
    vy: number;
    size: number;
    color: string;
  }>;
}

export const ArcadeGameCanvas: React.FC<ArcadeGameCanvasProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('arcade_runner_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [speedKmh, setSpeedKmh] = useState<number>(84);
  const [nitroGauge, setNitroGauge] = useState<number>(100);
  const [ammoCount, setAmmoCount] = useState<number>(8);
  const [isNitroActiveState, setIsNitroActiveState] = useState<boolean>(false);

  // Audio Context synth for retro sound effects
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playTone = useCallback((freq: number, type: OscillatorType, duration: number, vol = 0.08) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtxClass();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio might be blocked by browser policy until gesture
    }
  }, [soundEnabled]);

  // Keys ref
  const keysRef = useRef<{ left: boolean; right: boolean; nitro: boolean; shoot: boolean }>({
    left: false,
    right: false,
    nitro: false,
    shoot: false,
  });

  // Game internal state
  const gameStateRef = useRef({
    width: 440,
    height: 640,
    roadLeft: 55,
    roadRight: 385,
    roadWidth: 330,
    laneCount: 3,
    lanes: [110, 220, 330],
    playerX: 220,
    playerY: 530,
    playerW: 44,
    playerH: 76,
    baseRoadSpeed: 7,
    roadSpeed: 7,
    stripesY: 0,
    curbsY: 0,
    spawnTimer: 0,
    minSpawnCooldown: 42,
    score: 0,
    gameOver: false,
    isPaused: false,
    nitroGauge: 100,
    isNitroActive: false,
    ammoCount: 8,
    ammoMax: 12,
    shootCooldown: 0,
    projectiles: [] as ProjectileData[],
    explosions: [] as ExplosionData[],
    npcs: [] as Array<{
      x: number;
      y: number;
      w: number;
      h: number;
      speed: number;
      color: string;
      accent: string;
    }>,
    colorPalette: [
      { main: '#e74c3c', accent: '#c0392b' },
      { main: '#f39c12', accent: '#d68910' },
      { main: '#9b59b6', accent: '#8e44ad' },
      { main: '#1abc9c', accent: '#16a085' },
      { main: '#3498db', accent: '#2980b9' },
      { main: '#e67e22', accent: '#d35400' },
    ]
  });

  const fireWeapon = useCallback(() => {
    const s = gameStateRef.current;
    if (s.ammoCount > 0 && s.shootCooldown <= 0 && !s.gameOver && !s.isPaused) {
      s.ammoCount -= 1;
      s.shootCooldown = 10;
      setAmmoCount(s.ammoCount);

      // Disparos duales frontales
      s.projectiles.push(
        { x: s.playerX - 11, y: s.playerY - s.playerH / 2 - 6, w: 6, h: 18, speed: 17 },
        { x: s.playerX + 11, y: s.playerY - s.playerH / 2 - 6, w: 6, h: 18, speed: 17 }
      );

      // Efecto de sonido retro láser
      playTone(880, 'square', 0.08, 0.07);
    }
  }, [playTone]);

  const resetGame = useCallback(() => {
    const s = gameStateRef.current;
    s.playerX = s.lanes[1];
    s.playerY = 530;
    s.baseRoadSpeed = 7;
    s.roadSpeed = 7;
    s.spawnTimer = 0;
    s.minSpawnCooldown = 42;
    s.score = 0;
    s.gameOver = false;
    s.isPaused = false;
    s.nitroGauge = 100;
    s.isNitroActive = false;
    s.ammoCount = 8;
    s.shootCooldown = 0;
    s.projectiles = [];
    s.explosions = [];
    s.npcs = [];
    keysRef.current = { left: false, right: false, nitro: false, shoot: false };

    setScore(0);
    setNitroGauge(100);
    setAmmoCount(8);
    setIsNitroActiveState(false);
    setGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
    playTone(520, 'triangle', 0.15, 0.1);
  }, [playTone]);

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') {
        keysRef.current.left = true;
      } else if (key === 'arrowright' || key === 'd') {
        keysRef.current.right = true;
      } else if (key === 'arrowup' || key === 'w' || key === 'shift') {
        keysRef.current.nitro = true;
      } else if (key === ' ' || key === 'j') {
        if (gameStateRef.current.gameOver) {
          resetGame();
        } else {
          fireWeapon();
        }
      } else if (key === 'r') {
        if (gameStateRef.current.gameOver) {
          resetGame();
        }
      } else if (key === 'p') {
        if (!gameStateRef.current.gameOver) {
          setIsPaused(prev => {
            const next = !prev;
            gameStateRef.current.isPaused = next;
            return next;
          });
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') {
        keysRef.current.left = false;
      } else if (key === 'arrowright' || key === 'd') {
        keysRef.current.right = false;
      } else if (key === 'arrowup' || key === 'w' || key === 'shift') {
        keysRef.current.nitro = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [resetGame, fireWeapon]);

  // Main Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const s = gameStateRef.current;

      if (!s.gameOver && !s.isPaused) {
        // 1. Nitro management
        if (keysRef.current.nitro && s.nitroGauge > 0) {
          s.isNitroActive = true;
          s.nitroGauge = Math.max(0, s.nitroGauge - 0.75);
          s.roadSpeed = s.baseRoadSpeed * 1.8;
          setNitroGauge(Math.round(s.nitroGauge));
          setIsNitroActiveState(true);
        } else {
          s.isNitroActive = false;
          s.roadSpeed = s.baseRoadSpeed;
          setIsNitroActiveState(false);
        }

        // Score progression (nitro grants 2x points per frame)
        s.score += s.isNitroActive ? 0.5 : 0.25;
        setScore(Math.floor(s.score));

        // Speed calculation
        s.baseRoadSpeed = Math.min(15, 7 + s.score / 250);
        s.minSpawnCooldown = Math.max(20, Math.floor(42 - s.score / 300));
        setSpeedKmh(Math.floor(s.roadSpeed * 12));

        if (s.shootCooldown > 0) {
          s.shootCooldown--;
        }

        // Update road animation
        s.stripesY = (s.stripesY + s.roadSpeed) % 80;
        s.curbsY = (s.curbsY + s.roadSpeed) % 60;

        // Player steering
        let dx = 0;
        const speedX = 7.5 * (s.isNitroActive ? 1.3 : 1.0);
        if (keysRef.current.left) dx -= speedX;
        if (keysRef.current.right) dx += speedX;

        if (dx !== 0) {
          const minX = s.roadLeft + s.playerW / 2 + 6;
          const maxX = s.roadRight - s.playerW / 2 - 6;
          s.playerX = Math.max(minX, Math.min(maxX, s.playerX + dx));
        }

        // Spawn NPCs
        s.spawnTimer++;
        if (s.spawnTimer >= s.minSpawnCooldown) {
          s.spawnTimer = 0;
          const laneIdx = Math.floor(Math.random() * s.laneCount);
          const spawnX = s.lanes[laneIdx];

          const tooClose = s.npcs.some(npc => Math.abs(npc.x - spawnX) < 20 && npc.y < 120);
          if (!tooClose) {
            const palette = s.colorPalette[Math.floor(Math.random() * s.colorPalette.length)];
            s.npcs.push({
              x: spawnX,
              y: -s.playerH,
              w: s.playerW,
              h: s.playerH,
              speed: (Math.random() * 4.5) - 1.0,
              color: palette.main,
              accent: palette.accent
            });
          }
        }

        // Update projectiles and check hits with NPCs
        const activeProjectiles: ProjectileData[] = [];
        const destroyedNpcIndices = new Set<number>();

        for (const p of s.projectiles) {
          p.y -= p.speed;
          let hit = false;

          const pBox = {
            x1: p.x - p.w / 2,
            y1: p.y - p.h / 2,
            x2: p.x + p.w / 2,
            y2: p.y + p.h / 2
          };

          for (let i = 0; i < s.npcs.length; i++) {
            if (destroyedNpcIndices.has(i)) continue;
            const npc = s.npcs[i];
            const nBox = {
              x1: npc.x - npc.w / 2 + 4,
              y1: npc.y - npc.h / 2 + 5,
              x2: npc.x + npc.w / 2 - 4,
              y2: npc.y + npc.h / 2 - 5
            };

            const collides = !(
              pBox.x2 < nBox.x1 ||
              pBox.x1 > nBox.x2 ||
              pBox.y2 < nBox.y1 ||
              pBox.y1 > nBox.y2
            );

            if (collides) {
              hit = true;
              destroyedNpcIndices.add(i);
              s.score += 75;

              // Spawn explosion particles
              const particles = [];
              for (let k = 0; k < 16; k++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = Math.random() * 5 + 2;
                particles.push({
                  vx: Math.cos(angle) * spd,
                  vy: Math.sin(angle) * spd,
                  size: Math.random() * 5 + 4,
                  color: ['#ff4757', '#ffa502', '#eccc68', '#ffffff', npc.color][Math.floor(Math.random() * 5)]
                });
              }
              s.explosions.push({
                x: npc.x,
                y: npc.y,
                color: npc.color,
                age: 0,
                lifetime: 16,
                particles
              });

              playTone(200, 'sawtooth', 0.2, 0.12);
              break;
            }
          }

          if (!hit && p.y > -20) {
            activeProjectiles.push(p);
          }
        }
        s.projectiles = activeProjectiles;

        // Filter out destroyed NPCs
        if (destroyedNpcIndices.size > 0) {
          s.npcs = s.npcs.filter((_, idx) => !destroyedNpcIndices.has(idx));
        }

        // Update explosions
        for (const exp of s.explosions) {
          exp.age++;
          for (const pt of exp.particles) {
            pt.vx *= 0.95;
            pt.vy *= 0.95;
          }
        }
        s.explosions = s.explosions.filter(exp => exp.age < exp.lifetime);

        // Player collision bounds
        const pBox = {
          x1: s.playerX - s.playerW / 2 + 4,
          y1: s.playerY - s.playerH / 2 + 5,
          x2: s.playerX + s.playerW / 2 - 4,
          y2: s.playerY + s.playerH / 2 - 5
        };

        // Move & check NPCs
        const survivingNpcs = [];
        for (const npc of s.npcs) {
          npc.y += s.roadSpeed + npc.speed;

          const nBox = {
            x1: npc.x - npc.w / 2 + 4,
            y1: npc.y - npc.h / 2 + 5,
            x2: npc.x + npc.w / 2 - 4,
            y2: npc.y + npc.h / 2 - 5
          };

          // Collision check AABB
          const collides = !(
            pBox.x2 < nBox.x1 ||
            pBox.x1 > nBox.x2 ||
            pBox.y2 < nBox.y1 ||
            pBox.y1 > nBox.y2
          );

          if (collides) {
            s.gameOver = true;
            setGameOver(true);
            playTone(150, 'sawtooth', 0.4, 0.15);

            const finalScore = Math.floor(s.score);
            if (finalScore > highScore) {
              setHighScore(finalScore);
              localStorage.setItem('arcade_runner_highscore', finalScore.toString());
            }
            if (onGameOver) onGameOver(finalScore);
            break;
          }

          if (npc.y < s.height + 100) {
            survivingNpcs.push(npc);
          } else {
            // ====================================================
            // NPC ESQUIVADO CON ÉXITO: Recarga de Nitro y Balas
            // ====================================================
            s.score += 25;
            s.nitroGauge = Math.min(100, s.nitroGauge + 25);
            s.ammoCount = Math.min(s.ammoMax, s.ammoCount + 2);
            setNitroGauge(Math.round(s.nitroGauge));
            setAmmoCount(s.ammoCount);
            playTone(700, 'sine', 0.06, 0.05); // Sonido suave de recarga
          }
        }

        if (!s.gameOver) {
          s.npcs = survivingNpcs;
        }
      }

      // ========================================================
      // RENDERING SECTION
      // ========================================================

      // 1. Grass background
      ctx.fillStyle = '#1e392a';
      ctx.fillRect(0, 0, s.width, s.height);

      // 2. Asphalt road
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(s.roadLeft, 0, s.roadWidth, s.height);

      // 3. Roadside Curbs (Animated)
      const curbH = 30;
      for (let y = -curbH + s.curbsY; y < s.height + curbH; y += curbH) {
        const isRed = Math.floor((y - s.curbsY) / curbH) % 2 === 0;
        ctx.fillStyle = isRed ? '#ef4444' : '#f8fafc';
        // Left curb
        ctx.fillRect(s.roadLeft - 10, y, 10, curbH);
        // Right curb
        ctx.fillRect(s.roadRight, y, 10, curbH);
      }

      // 4. Lane divider dashed lines (Yellow)
      const stripeH = 45;
      const gapH = 35;
      const step = stripeH + gapH;

      ctx.fillStyle = '#eab308';
      for (let l = 1; l < s.laneCount; l++) {
        const x = s.roadLeft + l * (s.roadWidth / s.laneCount);
        for (let y = -step + s.stripesY; y < s.height + step; y += step) {
          ctx.fillRect(x - 3, y, 6, stripeH);
        }
      }

      // 5. Render Projectiles (dual plasma)
      for (const p of s.projectiles) {
        ctx.fillStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(p.x - p.w / 2, p.y - p.h / 2, p.w, p.h, 3);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(p.x - 1, p.y - p.h / 2 + 2, 2, p.h - 4);
        ctx.shadowBlur = 0;
      }

      // 6. Render Explosions
      for (const exp of s.explosions) {
        for (const pt of exp.particles) {
          const px = exp.x + pt.vx * exp.age;
          const py = exp.y + pt.vy * exp.age;
          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.arc(px, py, Math.max(1, pt.size * (1 - exp.age / exp.lifetime)), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 7. Render NPCs
      for (const npc of s.npcs) {
        drawVehicle(ctx, npc.x, npc.y, npc.w, npc.h, npc.color, npc.accent, false);
      }

      // 8. Render Player (with Nitro thruster flames if active)
      if (s.isNitroActive) {
        const flameLen = Math.random() * 14 + 18;
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(s.playerX - 16, s.playerY + s.playerH / 2);
        ctx.lineTo(s.playerX - 10, s.playerY + s.playerH / 2);
        ctx.lineTo(s.playerX - 13, s.playerY + s.playerH / 2 + flameLen);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(s.playerX + 10, s.playerY + s.playerH / 2);
        ctx.lineTo(s.playerX + 16, s.playerY + s.playerH / 2);
        ctx.lineTo(s.playerX + 13, s.playerY + s.playerH / 2 + flameLen);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      drawVehicle(ctx, s.playerX, s.playerY, s.playerW, s.playerH, '#0284c7', s.isNitroActive ? '#38bdf8' : '#1e293b', true);

      // 9. Top HUD Overlay (Score and Speed)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(s.roadLeft, 12, s.roadWidth, 42, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `PUNTOS: ${Math.floor(s.score)}   |   VEL: ${Math.floor(s.roadSpeed * 12)} km/h`,
        s.width / 2,
        37
      );

      // 10. Bottom HUD Bar (Nitro Gauge & Ammo status)
      const botHudY = s.height - 42;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(s.roadLeft, botHudY, s.roadWidth, 34, 6);
      ctx.fill();
      ctx.stroke();

      // Nitro bar
      const nitroW = 120 * (s.nitroGauge / 100);
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(s.roadLeft + 8, botHudY + 7, 120, 20);
      ctx.fillStyle = s.nitroGauge > 20 ? '#06b6d4' : '#f43f5e';
      ctx.fillRect(s.roadLeft + 8, botHudY + 7, nitroW, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`NITRO ${Math.round(s.nitroGauge)}% [W/▲]`, s.roadLeft + 14, botHudY + 20);

      // Ammo display
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.textAlign = 'right';
      const bullets = '•'.repeat(s.ammoCount);
      ctx.fillText(`BALAS: ${s.ammoCount}/${s.ammoMax} ${bullets}`, s.roadRight - 10, botHudY + 20);

      // 11. Game Over Overlay
      if (s.gameOver) {
        ctx.fillStyle = 'rgba(10, 14, 20, 0.88)';
        ctx.fillRect(0, 0, s.width, s.height);

        ctx.fillStyle = '#111827';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(40, s.height / 2 - 130, s.width - 80, 250, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('¡GAME OVER!', s.width / 2, s.height / 2 - 75);

        ctx.fillStyle = '#ffffff';
        ctx.font = '15px system-ui, -apple-system, sans-serif';
        ctx.fillText(`Puntaje Final: ${Math.floor(s.score)}`, s.width / 2, s.height / 2 - 30);

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
        ctx.fillText(`Récord Histórico: ${Math.max(Math.floor(s.score), highScore)}`, s.width / 2, s.height / 2 - 5);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
        ctx.fillText('Presiona [ESPACIO] o [R]', s.width / 2, s.height / 2 + 45);
        ctx.font = '12px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('o pulsa el botón de abajo para reiniciar', s.width / 2, s.height / 2 + 68);
      }

      // 12. Pause Overlay
      if (s.isPaused && !s.gameOver) {
        ctx.fillStyle = 'rgba(10, 14, 20, 0.75)';
        ctx.fillRect(0, 0, s.width, s.height);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSA', s.width / 2, s.height / 2);

        ctx.fillStyle = '#f59e0b';
        ctx.font = '14px system-ui, -apple-system, sans-serif';
        ctx.fillText('Presiona P para continuar', s.width / 2, s.height / 2 + 30);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [highScore, soundEnabled, playTone, onGameOver]);

  // Vehicle drawing subroutine
  const drawVehicle = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    mainColor: string,
    accentColor: string,
    isPlayer: boolean
  ) => {
    const w2 = w / 2;
    const h2 = h / 2;

    // 1. Wheels
    ctx.fillStyle = '#111111';
    ctx.fillRect(x - w2 - 2, y - h2 + 8, 7, 14);
    ctx.fillRect(x + w2 - 5, y - h2 + 8, 7, 14);
    ctx.fillRect(x - w2 - 2, y + h2 - 22, 7, 14);
    ctx.fillRect(x + w2 - 5, y + h2 - 22, 7, 14);

    // 2. Chassis body
    ctx.fillStyle = mainColor;
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x - w2, y - h2, w, h, 6);
    ctx.fill();
    ctx.stroke();

    // 3. Sport racing stripes and dual cannons if player
    if (isPlayer) {
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(x - 3, y - h2, 6, h);

      // Cannons mounted on front
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x - 12, y - h2 - 5, 3, 8);
      ctx.fillRect(x + 9, y - h2 - 5, 3, 8);
    }

    // 4. Windshield & Roof
    if (isPlayer) {
      // Player faces UP
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(x - w2 + 6, y - 6);
      ctx.lineTo(x + w2 - 6, y - 6);
      ctx.lineTo(x + w2 - 9, y - 20);
      ctx.lineTo(x - w2 + 9, y - 20);
      ctx.closePath();
      ctx.fill();

      // Roof
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x - w2 + 7, y - 5, w - 14, 19);

      // Rear glass
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x - w2 + 8, y + 16, w - 16, 8);

      // Headlights front
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.ellipse(x - w2 + 7, y - h2 + 3, 4, 3, 0, 0, Math.PI * 2);
      ctx.ellipse(x + w2 - 7, y - h2 + 3, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tail brake lights
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x - w2 + 4, y + h2 - 5, 8, 3);
      ctx.fillRect(x + w2 - 12, y + h2 - 5, 8, 3);
    } else {
      // NPC faces DOWN
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(x - w2 + 6, y + 6);
      ctx.lineTo(x + w2 - 6, y + 6);
      ctx.lineTo(x + w2 - 9, y + 20);
      ctx.lineTo(x - w2 + 9, y + 20);
      ctx.closePath();
      ctx.fill();

      // Roof
      ctx.fillStyle = accentColor;
      ctx.fillRect(x - w2 + 7, y - 14, w - 14, 18);

      // Rear glass
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x - w2 + 8, y - 24, w - 16, 8);

      // Headlights pointing down
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.ellipse(x - w2 + 7, y + h2 - 4, 4, 3, 0, 0, Math.PI * 2);
      ctx.ellipse(x + w2 - 7, y + h2 - 4, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tail lights on top
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x - w2 + 4, y - h2 + 2, 8, 3);
      ctx.fillRect(x + w2 - 12, y - h2 + 2, 8, 3);
    }
  };

  return (
    <div id="arcade-simulator-container" className="flex flex-col items-center">
      {/* Top Game Controls Bar */}
      <div className="w-full max-w-[440px] flex items-center justify-between px-3 py-2 bg-slate-900 border-x border-t border-slate-700 rounded-t-xl text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-mono font-medium text-slate-200">Motor Tkinter + Nitro & Arma</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            id="toggle-sound-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition"
            title={soundEnabled ? 'Silenciar audio' : 'Activar audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            id="pause-game-btn"
            onClick={() => {
              if (!gameOver) {
                setIsPaused(prev => {
                  const next = !prev;
                  gameStateRef.current.isPaused = next;
                  return next;
                });
              }
            }}
            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition"
            title="Pausar / Reanudar (Tecla P)"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            id="restart-game-btn"
            onClick={resetGame}
            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition"
            title="Reiniciar (Espacio / R)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Game Canvas */}
      <div className="relative shadow-2xl border-x border-b border-slate-700 bg-slate-950 overflow-hidden">
        <canvas
          id="arcade-canvas"
          ref={canvasRef}
          width={440}
          height={640}
          className="block select-none touch-none cursor-crosshair"
          onClick={() => {
            if (gameOver) resetGame();
          }}
        />
      </div>

      {/* On-screen touch and keyboard controls */}
      <div className="w-full max-w-[440px] mt-3 flex flex-col space-y-2">
        {/* Steering buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            id="steer-left-btn"
            onPointerDown={() => (keysRef.current.left = true)}
            onPointerUp={() => (keysRef.current.left = false)}
            onPointerLeave={() => (keysRef.current.left = false)}
            className="flex items-center justify-center py-2.5 px-3 bg-slate-800 hover:bg-slate-700 active:bg-blue-600 border border-slate-700 active:border-blue-400 rounded-lg text-white font-medium text-xs shadow transition select-none active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5 text-cyan-400" />
            <span>IZQUIERDA (A / ◄)</span>
          </button>
          <button
            id="steer-right-btn"
            onPointerDown={() => (keysRef.current.right = true)}
            onPointerUp={() => (keysRef.current.right = false)}
            onPointerLeave={() => (keysRef.current.right = false)}
            className="flex items-center justify-center py-2.5 px-3 bg-slate-800 hover:bg-slate-700 active:bg-blue-600 border border-slate-700 active:border-blue-400 rounded-lg text-white font-medium text-xs shadow transition select-none active:scale-[0.98]"
          >
            <span>DERECHA (D / ►)</span>
            <ArrowRight className="w-4 h-4 ml-1.5 text-cyan-400" />
          </button>
        </div>

        {/* Combat and Nitro action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            id="nitro-boost-btn"
            onPointerDown={() => (keysRef.current.nitro = true)}
            onPointerUp={() => (keysRef.current.nitro = false)}
            onPointerLeave={() => (keysRef.current.nitro = false)}
            className={`flex items-center justify-center py-3 px-3 rounded-lg font-bold text-xs shadow transition select-none active:scale-[0.98] border ${
              isNitroActiveState
                ? 'bg-cyan-500 text-slate-950 border-cyan-300 ring-2 ring-cyan-400'
                : 'bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border-cyan-700/80'
            }`}
          >
            <Zap className="w-4 h-4 mr-1.5 text-cyan-400 animate-pulse" />
            <span>NITRO TURBO [W/▲] ({nitroGauge}%)</span>
          </button>

          <button
            id="shoot-weapon-btn"
            onClick={fireWeapon}
            className={`flex items-center justify-center py-3 px-3 rounded-lg font-bold text-xs shadow transition select-none active:scale-[0.98] border ${
              ammoCount > 0
                ? 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 border-amber-400'
                : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
            }`}
          >
            <Target className="w-4 h-4 mr-1.5" />
            <span>DISPARAR CAÑÓN ({ammoCount})</span>
          </button>
        </div>

        {gameOver && (
          <button
            id="overlay-restart-btn"
            onClick={resetGame}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold rounded-lg shadow-lg flex items-center justify-center space-x-2 transition active:scale-[0.99]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>JUGAR DE NUEVO (Espacio / R)</span>
          </button>
        )}
      </div>
    </div>
  );
};
