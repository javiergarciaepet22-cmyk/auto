import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, ArrowLeft, ArrowRight, Zap, Target, Pause, ShoppingBag, Coins, Sparkles } from 'lucide-react';
import { CAR_CATALOG, COLOR_OPTIONS, NEON_OPTIONS, CustomizationSettings, CoinItem, FloatingText } from '../types';
import { GarageModal } from './GarageModal';

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

const DEFAULT_CUSTOMIZATION: CustomizationSettings = {
  selectedCarId: 'apex_runner',
  primaryColor: '#0284c7',
  neonUnderglow: '#00f0ff',
  spoilerStyle: 'standard',
  purchasedCars: ['apex_runner'],
  engineLevel: 0,
  nitroLevel: 0,
  ammoLevel: 0,
  wallet: 250 // Starter funds so player can start having fun right away!
};

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

  // Customization & Garage State
  const [isGarageOpen, setIsGarageOpen] = useState<boolean>(false);
  const [customization, setCustomization] = useState<CustomizationSettings>(() => {
    try {
      const saved = localStorage.getItem('arcade_runner_customization');
      if (saved) {
        return { ...DEFAULT_CUSTOMIZATION, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_CUSTOMIZATION;
  });

  // Keep a ref to latest customization for the 60fps loop
  const customizationRef = useRef<CustomizationSettings>(customization);
  useEffect(() => {
    customizationRef.current = customization;
    try {
      localStorage.setItem('arcade_runner_customization', JSON.stringify(customization));
    } catch {
      // ignore
    }
  }, [customization]);

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

  // Play coin pickup chime
  const playCoinSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtxClass();
      }
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // ignore
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
    lightPostsY: 0,
    spawnTimer: 0,
    coinSpawnTimer: 0,
    minSpawnCooldown: 42,
    score: 0,
    sessionMoneyEarned: 0,
    gameOver: false,
    isPaused: false,
    nitroGauge: 100,
    isNitroActive: false,
    ammoCount: 8,
    ammoMax: 12,
    shootCooldown: 0,
    projectiles: [] as ProjectileData[],
    explosions: [] as ExplosionData[],
    coins: [] as CoinItem[],
    floatingTexts: [] as FloatingText[],
    lightPosts: [
      { y: 50 }, { y: 250 }, { y: 450 }, { y: 650 }
    ],
    npcs: [] as Array<{
      x: number;
      y: number;
      w: number;
      h: number;
      speed: number;
      color: string;
      accent: string;
      type: 'sport' | 'truck' | 'police' | 'muscle';
      beaconTimer?: number;
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

  // Current equipped car object
  const equippedCar = CAR_CATALOG.find(c => c.id === customization.selectedCarId) || CAR_CATALOG[0];

  const addCash = useCallback((amount: number, x?: number, y?: number) => {
    setCustomization(prev => {
      const nextWallet = prev.wallet + amount;
      return { ...prev, wallet: nextWallet };
    });
    gameStateRef.current.sessionMoneyEarned += amount;

    if (x !== undefined && y !== undefined) {
      gameStateRef.current.floatingTexts.push({
        id: Math.random(),
        x,
        y,
        text: `+$${amount}`,
        color: '#fbbf24',
        age: 0,
        lifetime: 30
      });
    }
  }, []);

  const fireWeapon = useCallback(() => {
    const s = gameStateRef.current;
    if (s.ammoCount > 0 && s.shootCooldown <= 0 && !s.gameOver && !s.isPaused) {
      s.ammoCount -= 1;
      s.shootCooldown = 10;
      setAmmoCount(s.ammoCount);

      const isTitan = customizationRef.current.selectedCarId === 'titan_enforcer';

      if (isTitan) {
        // Quad cannons for Titan Enforcer!
        s.projectiles.push(
          { x: s.playerX - 16, y: s.playerY - s.playerH / 2 - 6, w: 6, h: 18, speed: 18 },
          { x: s.playerX - 6, y: s.playerY - s.playerH / 2 - 8, w: 6, h: 18, speed: 18 },
          { x: s.playerX + 6, y: s.playerY - s.playerH / 2 - 8, w: 6, h: 18, speed: 18 },
          { x: s.playerX + 16, y: s.playerY - s.playerH / 2 - 6, w: 6, h: 18, speed: 18 }
        );
      } else {
        // Dual front cannons
        s.projectiles.push(
          { x: s.playerX - 11, y: s.playerY - s.playerH / 2 - 6, w: 6, h: 18, speed: 17 },
          { x: s.playerX + 11, y: s.playerY - s.playerH / 2 - 6, w: 6, h: 18, speed: 17 }
        );
      }

      playTone(880, 'square', 0.08, 0.07);
    }
  }, [playTone]);

  const resetGame = useCallback(() => {
    const s = gameStateRef.current;
    const curCustom = customizationRef.current;
    const car = CAR_CATALOG.find(c => c.id === curCustom.selectedCarId) || CAR_CATALOG[0];

    s.playerX = s.lanes[1];
    s.playerY = 530;
    s.baseRoadSpeed = car.baseSpeed + curCustom.engineLevel * 0.7;
    s.roadSpeed = s.baseRoadSpeed;
    s.spawnTimer = 0;
    s.coinSpawnTimer = 0;
    s.minSpawnCooldown = 42;
    s.score = 0;
    s.sessionMoneyEarned = 0;
    s.gameOver = false;
    s.isPaused = false;
    s.nitroGauge = car.nitroCapacity;
    s.isNitroActive = false;
    s.ammoMax = car.ammoCapacity + curCustom.ammoLevel * 2;
    s.ammoCount = s.ammoMax;
    s.shootCooldown = 0;
    s.projectiles = [];
    s.explosions = [];
    s.coins = [];
    s.floatingTexts = [];
    s.npcs = [];
    keysRef.current = { left: false, right: false, nitro: false, shoot: false };

    setScore(0);
    setNitroGauge(car.nitroCapacity);
    setAmmoCount(s.ammoMax);
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
      } else if (key === 'g') {
        // Open garage shortcut
        setIsGarageOpen(prev => !prev);
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
      const curCustom = customizationRef.current;
      const activeCar = CAR_CATALOG.find(c => c.id === curCustom.selectedCarId) || CAR_CATALOG[0];

      if (!s.gameOver && !s.isPaused && !isGarageOpen) {
        // 1. Nitro management
        const nitroMax = activeCar.nitroCapacity;
        if (keysRef.current.nitro && s.nitroGauge > 0) {
          s.isNitroActive = true;
          s.nitroGauge = Math.max(0, s.nitroGauge - 0.7);
          s.roadSpeed = s.baseRoadSpeed * 1.8;
          setNitroGauge(Math.round(s.nitroGauge));
          setIsNitroActiveState(true);
        } else {
          s.isNitroActive = false;
          s.roadSpeed = s.baseRoadSpeed;
          setIsNitroActiveState(false);
        }

        // Score progression
        s.score += s.isNitroActive ? 0.5 : 0.25;
        setScore(Math.floor(s.score));

        // Speed calculation based on car engine upgrade + current distance
        const baseCalculated = activeCar.baseSpeed + curCustom.engineLevel * 0.7 + s.score / 280;
        s.baseRoadSpeed = Math.min(18, baseCalculated);
        s.minSpawnCooldown = Math.max(18, Math.floor(40 - s.score / 320));
        setSpeedKmh(Math.floor(s.roadSpeed * 12));

        if (s.shootCooldown > 0) {
          s.shootCooldown--;
        }

        // Road animation offsets
        s.stripesY = (s.stripesY + s.roadSpeed) % 80;
        s.curbsY = (s.curbsY + s.roadSpeed) % 60;
        s.lightPostsY = (s.lightPostsY + s.roadSpeed) % 200;

        // Player lateral steering with handling multiplier
        let dx = 0;
        const steerSpeed = activeCar.handling * (s.isNitroActive ? 1.25 : 1.0);
        if (keysRef.current.left) dx -= steerSpeed;
        if (keysRef.current.right) dx += steerSpeed;

        if (dx !== 0) {
          const minX = s.roadLeft + s.playerW / 2 + 6;
          const maxX = s.roadRight - s.playerW / 2 - 6;
          s.playerX = Math.max(minX, Math.min(maxX, s.playerX + dx));
        }

        // 2. Spawn Coins on the road
        s.coinSpawnTimer++;
        if (s.coinSpawnTimer >= 55) {
          s.coinSpawnTimer = 0;
          const laneIdx = Math.floor(Math.random() * s.laneCount);
          s.coins.push({
            id: Math.random(),
            x: s.lanes[laneIdx] + (Math.random() * 20 - 10),
            y: -30,
            value: Math.random() > 0.8 ? 25 : 15,
            rotation: 0
          });
        }

        // Update coins and check pickup
        const playerBox = {
          x1: s.playerX - s.playerW / 2 + 4,
          y1: s.playerY - s.playerH / 2 + 5,
          x2: s.playerX + s.playerW / 2 - 4,
          y2: s.playerY + s.playerH / 2 - 5
        };

        const remainingCoins: CoinItem[] = [];
        for (const coin of s.coins) {
          coin.y += s.roadSpeed;
          coin.rotation += 0.08;

          // Check pickup
          const coinDist = Math.hypot(coin.x - s.playerX, coin.y - s.playerY);
          if (coinDist < 32) {
            // Picked up!
            addCash(coin.value, coin.x, coin.y);
            playCoinSound();
          } else if (coin.y < s.height + 40) {
            remainingCoins.push(coin);
          }
        }
        s.coins = remainingCoins;

        // 3. Spawn NPCs
        s.spawnTimer++;
        if (s.spawnTimer >= s.minSpawnCooldown) {
          s.spawnTimer = 0;
          const laneIdx = Math.floor(Math.random() * s.laneCount);
          const spawnX = s.lanes[laneIdx];

          const tooClose = s.npcs.some(npc => Math.abs(npc.x - spawnX) < 25 && npc.y < 130);
          if (!tooClose) {
            const palette = s.colorPalette[Math.floor(Math.random() * s.colorPalette.length)];
            const typeRoll = Math.random();
            let type: 'sport' | 'truck' | 'police' | 'muscle' = 'sport';
            let w = s.playerW;
            let h = s.playerH;

            if (typeRoll < 0.2) {
              type = 'police';
            } else if (typeRoll < 0.45) {
              type = 'truck';
              w = 48;
              h = 100;
            } else if (typeRoll < 0.7) {
              type = 'muscle';
            }

            s.npcs.push({
              x: spawnX,
              y: -h - 10,
              w,
              h,
              speed: (Math.random() * 4.2) - 1.0,
              color: type === 'police' ? '#1e293b' : palette.main,
              accent: type === 'police' ? '#ffffff' : palette.accent,
              type,
              beaconTimer: 0
            });
          }
        }

        // 4. Update projectiles and check hits with NPCs
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
              addCash(30, npc.x, npc.y); // $30 bonus for destroying car!

              // Spawn explosion particles
              const particles = [];
              for (let k = 0; k < 18; k++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = Math.random() * 6 + 2;
                particles.push({
                  vx: Math.cos(angle) * spd,
                  vy: Math.sin(angle) * spd,
                  size: Math.random() * 6 + 4,
                  color: ['#ff4757', '#ffa502', '#eccc68', '#ffffff', npc.color][Math.floor(Math.random() * 5)]
                });
              }
              s.explosions.push({
                x: npc.x,
                y: npc.y,
                color: npc.color,
                age: 0,
                lifetime: 18,
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

        // Update floating texts
        for (const ft of s.floatingTexts) {
          ft.age++;
          ft.y -= 1.2;
        }
        s.floatingTexts = s.floatingTexts.filter(ft => ft.age < ft.lifetime);

        // Move & check NPCs
        const survivingNpcs = [];
        for (const npc of s.npcs) {
          npc.y += s.roadSpeed + npc.speed;
          if (npc.beaconTimer !== undefined) {
            npc.beaconTimer++;
          }

          const nBox = {
            x1: npc.x - npc.w / 2 + 4,
            y1: npc.y - npc.h / 2 + 5,
            x2: npc.x + npc.w / 2 - 4,
            y2: npc.y + npc.h / 2 - 5
          };

          // Collision check AABB
          const collides = !(
            playerBox.x2 < nBox.x1 ||
            playerBox.x1 > nBox.x2 ||
            playerBox.y2 < nBox.y1 ||
            playerBox.y1 > nBox.y2
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

          if (npc.y < s.height + 120) {
            survivingNpcs.push(npc);
          } else {
            // NPC esquivado con éxito
            s.score += 25;
            const refillBonus = 25 * (1 + curCustom.nitroLevel * 0.1);
            s.nitroGauge = Math.min(nitroMax, s.nitroGauge + refillBonus);
            s.ammoCount = Math.min(s.ammoMax, s.ammoCount + 2);
            setNitroGauge(Math.round(s.nitroGauge));
            setAmmoCount(s.ammoCount);
            addCash(5); // $5 bonus for dodging
            playTone(700, 'sine', 0.05, 0.04);
          }
        }

        if (!s.gameOver) {
          s.npcs = survivingNpcs;
        }
      }

      // ========================================================
      // RENDERING SECTION (HIGH FIDELITY GRAPHICS)
      // ========================================================

      // 1. Dark Grass / Landscape background with depth
      ctx.fillStyle = '#102219';
      ctx.fillRect(0, 0, s.width, s.height);

      // Distant tree silhouette lines on grass sides
      ctx.fillStyle = '#0b1912';
      ctx.fillRect(0, 0, s.roadLeft - 10, s.height);
      ctx.fillRect(s.roadRight + 10, 0, s.width - (s.roadRight + 10), s.height);

      // 2. Asphalt Road with subtle dark blue hue
      const roadGradient = ctx.createLinearGradient(s.roadLeft, 0, s.roadRight, 0);
      roadGradient.addColorStop(0, '#111827');
      roadGradient.addColorStop(0.5, '#1e293b');
      roadGradient.addColorStop(1, '#111827');
      ctx.fillStyle = roadGradient;
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

      // 4. Street Lamp Posts on the roadside (Enhanced graphics)
      for (let y = -200 + s.lightPostsY; y < s.height + 200; y += 200) {
        // Left light cone onto road
        const gradL = ctx.createRadialGradient(s.roadLeft, y, 5, s.roadLeft, y, 70);
        gradL.addColorStop(0, 'rgba(254, 240, 138, 0.18)');
        gradL.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = gradL;
        ctx.beginPath();
        ctx.arc(s.roadLeft, y, 70, 0, Math.PI * 2);
        ctx.fill();

        // Left post & lamp
        ctx.fillStyle = '#64748b';
        ctx.fillRect(s.roadLeft - 22, y - 4, 12, 8);
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(s.roadLeft - 16, y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Right light cone onto road
        const gradR = ctx.createRadialGradient(s.roadRight, y, 5, s.roadRight, y, 70);
        gradR.addColorStop(0, 'rgba(254, 240, 138, 0.18)');
        gradR.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = gradR;
        ctx.beginPath();
        ctx.arc(s.roadRight, y, 70, 0, Math.PI * 2);
        ctx.fill();

        // Right post & lamp
        ctx.fillStyle = '#64748b';
        ctx.fillRect(s.roadRight + 10, y - 4, 12, 8);
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(s.roadRight + 16, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Lane divider dashed lines (Yellow neon)
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

      // 6. Render Coins (Animated spinning gold coins with sparkle)
      for (const coin of s.coins) {
        ctx.save();
        ctx.translate(coin.x, coin.y);

        // Outer glow
        ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();

        // Spinning scale calculation
        const scaleX = Math.cos(coin.rotation);
        ctx.scale(scaleX, 1);

        // Gold coin body
        const coinGrad = ctx.createLinearGradient(-12, -12, 12, 12);
        coinGrad.addColorStop(0, '#fde047');
        coinGrad.addColorStop(0.5, '#eab308');
        coinGrad.addColorStop(1, '#ca8a04');
        ctx.fillStyle = coinGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Dollar symbol
        if (Math.abs(scaleX) > 0.4) {
          ctx.fillStyle = '#78350f';
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('$', 0, 1);
        }

        ctx.restore();
      }

      // 7. Render Projectiles (dual plasma)
      for (const p of s.projectiles) {
        ctx.fillStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(p.x - p.w / 2, p.y - p.h / 2, p.w, p.h, 3);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(p.x - 1, p.y - p.h / 2 + 2, 2, p.h - 4);
        ctx.shadowBlur = 0;
      }

      // 8. Render Explosions
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

      // 9. Render NPCs
      for (const npc of s.npcs) {
        drawNpcVehicle(ctx, npc);
      }

      // 10. Render Player with Customizations!
      // Underglow Neon Glow
      if (curCustom.neonUnderglow !== 'none') {
        const glowColor = curCustom.neonUnderglow;
        const underGlow = ctx.createRadialGradient(s.playerX, s.playerY, 10, s.playerX, s.playerY, 48);
        underGlow.addColorStop(0, glowColor);
        underGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = underGlow;
        ctx.beginPath();
        ctx.ellipse(s.playerX, s.playerY, 36, 52, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Nitro thruster flames
      if (s.isNitroActive) {
        const flameLen = Math.random() * 16 + 22;
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 16;
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

      drawCustomPlayerVehicle(ctx, s.playerX, s.playerY, s.playerW, s.playerH, curCustom, activeCar, s.isNitroActive);

      // 11. Render Floating Texts (e.g. +$15, +$30)
      for (const ft of s.floatingTexts) {
        const alpha = Math.max(0, 1 - ft.age / ft.lifetime);
        ctx.save();
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = alpha;
        ctx.font = 'bold 14px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      // 12. Top HUD Overlay (Score, Speed & Wallet)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(s.roadLeft, 10, s.roadWidth, 48, 10);
      ctx.fill();
      ctx.stroke();

      // Top row in HUD
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`PTS: ${Math.floor(s.score)}`, s.roadLeft + 14, 28);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`${Math.floor(s.roadSpeed * 12)} km/h`, s.width / 2, 28);

      // Wallet in HUD
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`💰 $${curCustom.wallet.toLocaleString()}`, s.roadRight - 14, 28);

      // Sub row: Equipped Car Name & Garage prompt
      ctx.font = '9px system-ui, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'left';
      ctx.fillText(`AUTO: ${activeCar.name.toUpperCase()}`, s.roadLeft + 14, 46);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`[G] ABRIR GARAJE`, s.roadRight - 14, 46);

      // 13. Bottom HUD Bar (Nitro Gauge & Ammo status)
      const botHudY = s.height - 44;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(s.roadLeft, botHudY, s.roadWidth, 36, 8);
      ctx.fill();
      ctx.stroke();

      // Nitro bar
      const nitroPercent = Math.min(1, s.nitroGauge / activeCar.nitroCapacity);
      const nitroW = 120 * nitroPercent;
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(s.roadLeft + 10, botHudY + 8, 120, 20);
      ctx.fillStyle = s.nitroGauge > 25 ? '#06b6d4' : '#f43f5e';
      ctx.fillRect(s.roadLeft + 10, botHudY + 8, nitroW, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`NITRO ${Math.round(nitroPercent * 100)}%`, s.roadLeft + 16, botHudY + 22);

      // Ammo display
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.textAlign = 'right';
      const bullets = '•'.repeat(Math.min(12, s.ammoCount));
      ctx.fillText(`CAÑÓN: ${s.ammoCount}/${s.ammoMax} ${bullets}`, s.roadRight - 12, botHudY + 22);

      // 14. Game Over Overlay
      if (s.gameOver) {
        ctx.fillStyle = 'rgba(10, 14, 20, 0.88)';
        ctx.fillRect(0, 0, s.width, s.height);

        ctx.fillStyle = '#111827';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(40, s.height / 2 - 150, s.width - 80, 280, 14);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('¡GAME OVER!', s.width / 2, s.height / 2 - 100);

        ctx.fillStyle = '#ffffff';
        ctx.font = '15px system-ui, -apple-system, sans-serif';
        ctx.fillText(`Puntos: ${Math.floor(s.score)}`, s.width / 2, s.height / 2 - 65);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
        ctx.fillText(`Plata Ganada: +$${s.sessionMoneyEarned}`, s.width / 2, s.height / 2 - 38);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
        ctx.fillText(`Billetera Total: $${curCustom.wallet.toLocaleString()}`, s.width / 2, s.height / 2 - 12);

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
        ctx.fillText(`Récord Histórico: ${Math.max(Math.floor(s.score), highScore)}`, s.width / 2, s.height / 2 + 15);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
        ctx.fillText('Presiona [ESPACIO] para reiniciar', s.width / 2, s.height / 2 + 55);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px system-ui, -apple-system, sans-serif';
        ctx.fillText('o abre el Garaje para mejorar tu auto', s.width / 2, s.height / 2 + 80);
      }

      // 15. Pause Overlay
      if (s.isPaused && !s.gameOver) {
        ctx.fillStyle = 'rgba(10, 14, 20, 0.78)';
        ctx.fillRect(0, 0, s.width, s.height);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSA', s.width / 2, s.height / 2 - 20);

        ctx.fillStyle = '#f59e0b';
        ctx.font = '14px system-ui, -apple-system, sans-serif';
        ctx.fillText('Presiona P para continuar', s.width / 2, s.height / 2 + 15);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [highScore, soundEnabled, playTone, playCoinSound, addCash, isGarageOpen, onGameOver]);

  // Render player car with specific model customizations
  const drawCustomPlayerVehicle = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    custom: CustomizationSettings,
    car: (typeof CAR_CATALOG)[0],
    isNitro: boolean
  ) => {
    const w2 = w / 2;
    const h2 = h / 2;
    const color = custom.primaryColor;

    // 1. Wheels
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - w2 - 2, y - h2 + 8, 7, 14);
    ctx.fillRect(x + w2 - 5, y - h2 + 8, 7, 14);
    ctx.fillRect(x - w2 - 2, y + h2 - 22, 7, 14);
    ctx.fillRect(x + w2 - 5, y + h2 - 22, 7, 14);

    // Wheel rims
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x - w2, y - h2 + 12, 3, 6);
    ctx.fillRect(x + w2 - 3, y - h2 + 12, 3, 6);
    ctx.fillRect(x - w2, y + h2 - 18, 3, 6);
    ctx.fillRect(x + w2 - 3, y + h2 - 18, 3, 6);

    // 2. Chassis based on car bodyType
    ctx.fillStyle = color;
    ctx.strokeStyle = isNitro ? '#38bdf8' : '#0f172a';
    ctx.lineWidth = 2;

    if (car.bodyType === 'tank') {
      // Wider armored block with cowcatcher front bar
      ctx.beginPath();
      ctx.roundRect(x - w2 - 2, y - h2, w + 4, h, 4);
      ctx.fill();
      ctx.stroke();

      // Armor plating lines
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(x - w2, y - 6, w, 4);

      // 4 Cannons on front
      ctx.fillStyle = '#475569';
      ctx.fillRect(x - 17, y - h2 - 7, 3, 10);
      ctx.fillRect(x - 7, y - h2 - 9, 3, 11);
      ctx.fillRect(x + 4, y - h2 - 9, 3, 11);
      ctx.fillRect(x + 14, y - h2 - 7, 3, 10);
    } else if (car.bodyType === 'hyper') {
      // Le Mans prototype with teardrop aero body
      ctx.beginPath();
      ctx.moveTo(x - w2 + 8, y - h2);
      ctx.lineTo(x + w2 - 8, y - h2);
      ctx.lineTo(x + w2, y - 10);
      ctx.lineTo(x + w2 - 3, y + h2);
      ctx.lineTo(x - w2 + 3, y + h2);
      ctx.lineTo(x - w2, y - 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Huge carbon GT rear wing
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x - w2 - 4, y + h2 - 7, w + 8, 6);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x - w2 - 4, y + h2 - 8, 3, 8);
      ctx.fillRect(x + w2 + 1, y + h2 - 8, 3, 8);

      // Cannons
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x - 12, y - h2 - 4, 3, 7);
      ctx.fillRect(x + 9, y - h2 - 4, 3, 7);
    } else if (car.bodyType === 'muscle') {
      // Muscle car with wide front hood & scoop
      ctx.beginPath();
      ctx.roundRect(x - w2, y - h2, w, h, 4);
      ctx.fill();
      ctx.stroke();

      // Double racing white stripes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 7, y - h2, 4, h);
      ctx.fillRect(x + 3, y - h2, 4, h);

      // Supercharger air intake scoop on hood
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x - 6, y - h2 + 8, 12, 10);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(x - 4, y - h2 + 10, 8, 3);

      // Cannons
      ctx.fillStyle = '#475569';
      ctx.fillRect(x - 12, y - h2 - 5, 3, 8);
      ctx.fillRect(x + 9, y - h2 - 5, 3, 8);
    } else if (car.bodyType === 'cyber') {
      // Angular stealth cyber car
      ctx.beginPath();
      ctx.moveTo(x, y - h2 - 3);
      ctx.lineTo(x + w2, y - h2 + 14);
      ctx.lineTo(x + w2 - 2, y + h2);
      ctx.lineTo(x - w2 + 2, y + h2);
      ctx.lineTo(x - w2, y - h2 + 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Neon cyan aerodynamic side fins
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(x - w2 - 2, y + 4, 2, 18);
      ctx.fillRect(x + w2, y + 4, 2, 18);

      // Dual cyber fins at back
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x - 15, y + h2 - 10, 5, 12);
      ctx.fillRect(x + 10, y + h2 - 10, 5, 12);

      // Cannons
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(x - 11, y - h2 - 5, 3, 8);
      ctx.fillRect(x + 8, y - h2 - 5, 3, 8);
    } else {
      // Standard sport model (Apex Runner)
      ctx.beginPath();
      ctx.roundRect(x - w2, y - h2, w, h, 6);
      ctx.fill();
      ctx.stroke();

      // Sport racing stripe
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(x - 3, y - h2, 6, h);

      // Cannons
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x - 12, y - h2 - 5, 3, 8);
      ctx.fillRect(x + 9, y - h2 - 5, 3, 8);
    }

    // 3. Windshield & Cabin Glass
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

    // Rear window
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - w2 + 8, y + 16, w - 16, 8);

    // Front headlights
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(x - w2 + 7, y - h2 + 3, 4, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w2 - 7, y - h2 + 3, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail brake lights
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x - w2 + 4, y + h2 - 5, 8, 3);
    ctx.fillRect(x + w2 - 12, y + h2 - 5, 8, 3);
  };

  // Render NPC vehicles
  const drawNpcVehicle = (
    ctx: CanvasRenderingContext2D,
    npc: (typeof gameStateRef.current.npcs)[0]
  ) => {
    const { x, y, w, h, color, accent, type, beaconTimer } = npc;
    const w2 = w / 2;
    const h2 = h / 2;

    // 1. Wheels
    ctx.fillStyle = '#111111';
    ctx.fillRect(x - w2 - 2, y - h2 + 8, 7, 14);
    ctx.fillRect(x + w2 - 5, y - h2 + 8, 7, 14);
    ctx.fillRect(x - w2 - 2, y + h2 - 22, 7, 14);
    ctx.fillRect(x + w2 - 5, y + h2 - 22, 7, 14);

    if (type === 'truck') {
      // Freight Box Truck
      ctx.fillStyle = color;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.fillRect(x - w2, y - h2, w, h);
      ctx.strokeRect(x - w2, y - h2, w, h);

      // Front cab section
      ctx.fillStyle = accent;
      ctx.fillRect(x - w2 + 4, y + h2 - 28, w - 8, 24);

      // Cab windshield
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x - w2 + 6, y + h2 - 22, w - 12, 8);

      // Cargo roof stripes
      ctx.fillStyle = '#334155';
      ctx.fillRect(x - w2 + 6, y - h2 + 10, w - 12, 4);
      ctx.fillRect(x - w2 + 6, y - h2 + 26, w - 12, 4);
      ctx.fillRect(x - w2 + 6, y - h2 + 42, w - 12, 4);

      // Headlights pointing down
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x - w2 + 5, y + h2 - 4, 8, 3);
      ctx.fillRect(x + w2 - 13, y + h2 - 4, 8, 3);
      return;
    }

    // Chassis body
    ctx.fillStyle = color;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x - w2, y - h2, w, h, 6);
    ctx.fill();
    ctx.stroke();

    // Windshield & Roof (facing DOWN)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(x - w2 + 6, y + 6);
    ctx.lineTo(x + w2 - 6, y + 6);
    ctx.lineTo(x + w2 - 9, y + 20);
    ctx.lineTo(x - w2 + 9, y + 20);
    ctx.closePath();
    ctx.fill();

    // Roof
    ctx.fillStyle = accent;
    ctx.fillRect(x - w2 + 7, y - 14, w - 14, 18);

    // Police rooftop siren beacon
    if (type === 'police' && beaconTimer !== undefined) {
      const isBlue = Math.floor(beaconTimer / 8) % 2 === 0;
      ctx.fillStyle = isBlue ? '#3b82f6' : '#ef4444';
      ctx.shadowColor = isBlue ? '#3b82f6' : '#ef4444';
      ctx.shadowBlur = 8;
      ctx.fillRect(x - 8, y - 6, 16, 5);
      ctx.shadowBlur = 0;
    }

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
  };

  return (
    <div id="arcade-simulator-container" className="flex flex-col items-center">
      {/* Top Game Controls Bar */}
      <div className="w-full max-w-[440px] flex items-center justify-between px-3 py-2 bg-slate-900 border-x border-t border-slate-700 rounded-t-xl text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-mono font-medium text-slate-200">Motor Tkinter + Garaje & Monedas</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <button
            id="open-garage-header-btn"
            onClick={() => setIsGarageOpen(true)}
            className="flex items-center space-x-1 px-2 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded font-semibold text-[11px] transition"
            title="Abrir Garaje y Tienda de Autos"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Garaje</span>
          </button>
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
            <span>NITRO TURBO ({nitroGauge}%)</span>
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

        {/* Quick Garage & Shop button */}
        <div className="flex items-center space-x-2">
          <button
            id="bottom-garage-trigger-btn"
            onClick={() => setIsGarageOpen(true)}
            className="flex-1 py-2.5 px-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-[0.99] text-slate-950 font-bold text-xs rounded-lg shadow flex items-center justify-center space-x-2 transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>TALLER DE AUTOS & GARAJE (💰 ${customization.wallet.toLocaleString()})</span>
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

      {/* Garage & Car Customizer Modal */}
      <GarageModal
        isOpen={isGarageOpen}
        onClose={() => setIsGarageOpen(false)}
        customization={customization}
        onUpdateCustomization={setCustomization}
        onPlaySound={playTone}
      />
    </div>
  );
};
