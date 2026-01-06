"use client";

import React, { useState, useEffect, useRef } from "react";
import { RotateCcw } from "lucide-react";

const GraphRunner = () => {
  const canvasRef = useRef(null);

  // -----------------------------
  // React state (UI / meta)
  // -----------------------------
  const [gameState, setGameState] = useState("menu"); // menu | playing | paused | gameover | levelcomplete | finished
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);

  // "Full game" additions
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(45); // per-level timer
  const [multiplier, setMultiplier] = useState(1);
  const [bestScore, setBestScore] = useState(0);
  const [muted, setMuted] = useState(true);

  // -----------------------------
  // Progressive level generator (30 levels)
  // -----------------------------
  const generateLevelConfig = (levelNum) => {
    const progress = (levelNum - 1) / 29; // 0..1 (for 30 levels)
    const adaptiveCount = Math.floor(2 + progress * 10); // 2..12
    const railCount = Math.floor(1 + progress * 7); // 1..8
    const checkpointCount = Math.floor(1 + progress * 8); // 1..9
    const adaptiveSpeed = 1.8 + progress * 2.6; // 1.8..4.4
    const railSpeed = 1.2 + progress * 2.2; // 1.2..3.4

    // Adaptive enemies around center
    const adaptiveEnemies = [];
    for (let i = 0; i < adaptiveCount; i++) {
      const angle = (i / adaptiveCount) * Math.PI * 2;
      const radius = 140 + progress * 120;
      adaptiveEnemies.push({
        x: 400 + Math.cos(angle) * radius,
        y: 300 + Math.sin(angle) * radius,
        radius: 8,
        speed: adaptiveSpeed,
      });
    }

    // Rail enemies
    const railEnemies = [];
    for (let i = 0; i < railCount; i++) {
      if (i % 3 === 0) {
        railEnemies.push({
          path: Array.from({ length: 16 }, (_, j) => ({
            x: 100 + j * 40,
            y: 110 + i * 60,
          })),
          speed: railSpeed,
        });
      } else if (i % 3 === 1) {
        railEnemies.push({
          path: Array.from({ length: 10 }, (_, j) => ({
            x: 140 + i * 75,
            y: 120 + j * 45,
          })),
          speed: railSpeed,
        });
      } else {
        railEnemies.push({
          path: Array.from({ length: 12 }, (_, j) => ({
            x: 90 + j * 55,
            y: 140 + j * 35,
          })),
          speed: railSpeed,
        });
      }
    }

    // Checkpoints
    const checkpointPositions = [
      { x: 200, y: 150 },
      { x: 750, y: 300 },
      { x: 400, y: 450 },
      { x: 150, y: 300 },
      { x: 650, y: 450 },
      { x: 400, y: 150 },
      { x: 200, y: 450 },
      { x: 650, y: 150 },
      { x: 400, y: 300 },
    ];
    const checkpoints = [];
    for (let i = 0; i < checkpointCount; i++) {
      const p = checkpointPositions[i % checkpointPositions.length];
      checkpoints.push({ x: p.x, y: p.y, radius: 15, id: i });
    }

    // Safe zones shrink with difficulty
    const safeZoneSize = 78 - progress * 46; // ~78..32
    const safeZones = [
      { x: 50, y: 50, width: safeZoneSize, height: safeZoneSize },
      { x: 800 - 50 - safeZoneSize, y: 600 - 50 - safeZoneSize, width: safeZoneSize, height: safeZoneSize },
    ];

    // Level timer (harder levels give less time)
    const levelTime = Math.max(18, Math.floor(50 - progress * 28)); // 50..18

    // Power-ups frequency
    const powerUpCount = Math.floor(1 + progress * 2); // 1..3

    return { adaptiveEnemies, railEnemies, safeZones, checkpoints, levelTime, powerUpCount };
  };

  // -----------------------------
  // Original 10 levels (kept), but game supports up to 30 via generator
  // -----------------------------
  const levelConfigs = {
    1: {
      adaptiveEnemies: [{ x: 300, y: 150, radius: 8, speed: 1.5 }],
      railEnemies: [{ path: Array.from({ length: 16 }, (_, i) => ({ x: 100 + i * 40, y: 300 })), speed: 1.0 }],
      safeZones: [
        { x: 50, y: 50, width: 70, height: 50 },
        { x: 680, y: 500, width: 70, height: 50 },
      ],
      checkpoints: [{ x: 750, y: 300, radius: 15, id: 0 }],
      levelTime: 45,
      powerUpCount: 1,
    },
    2: {
      adaptiveEnemies: [
        { x: 300, y: 150, radius: 8, speed: 1.8 },
        { x: 500, y: 450, radius: 8, speed: 1.8 },
      ],
      railEnemies: [{ path: Array.from({ length: 16 }, (_, i) => ({ x: 100 + i * 40, y: 300 })), speed: 1.2 }],
      safeZones: [
        { x: 50, y: 50, width: 70, height: 50 },
        { x: 680, y: 500, width: 70, height: 50 },
      ],
      checkpoints: [{ x: 750, y: 300, radius: 15, id: 0 }],
      levelTime: 42,
      powerUpCount: 1,
    },
    3: {
      adaptiveEnemies: [
        { x: 200, y: 150, radius: 8, speed: 2.0 },
        { x: 600, y: 200, radius: 8, speed: 2.0 },
        { x: 400, y: 450, radius: 8, speed: 2.0 },
      ],
      railEnemies: [
        { path: Array.from({ length: 16 }, (_, i) => ({ x: 100 + i * 40, y: 300 })), speed: 1.3 },
        { path: Array.from({ length: 9 }, (_, i) => ({ x: 600, y: 200 + i * 40 })), speed: 1.3 },
      ],
      safeZones: [
        { x: 50, y: 50, width: 65, height: 45 },
        { x: 680, y: 500, width: 65, height: 45 },
      ],
      checkpoints: [
        { x: 400, y: 150, radius: 15, id: 0 },
        { x: 750, y: 300, radius: 15, id: 1 },
      ],
      levelTime: 40,
      powerUpCount: 1,
    },
    4: {
      adaptiveEnemies: [
        { x: 150, y: 100, radius: 8, speed: 2.2 },
        { x: 650, y: 150, radius: 8, speed: 2.2 },
        { x: 300, y: 450, radius: 8, speed: 2.2 },
        { x: 600, y: 450, radius: 8, speed: 2.2 },
      ],
      railEnemies: [
        { path: Array.from({ length: 16 }, (_, i) => ({ x: 100 + i * 40, y: 300 })), speed: 1.5 },
        { path: Array.from({ length: 9 }, (_, i) => ({ x: 600, y: 200 + i * 40 })), speed: 1.5 },
        { path: Array.from({ length: 9 }, (_, i) => ({ x: 200, y: 200 + i * 40 })), speed: 1.5 },
      ],
      safeZones: [
        { x: 50, y: 50, width: 60, height: 40 },
        { x: 680, y: 500, width: 60, height: 40 },
      ],
      checkpoints: [
        { x: 200, y: 150, radius: 15, id: 0 },
        { x: 750, y: 300, radius: 15, id: 1 },
        { x: 400, y: 450, radius: 15, id: 2 },
      ],
      levelTime: 38,
      powerUpCount: 1,
    },
    5: {
      adaptiveEnemies: [
        { x: 200, y: 120, radius: 8, speed: 2.4 },
        { x: 600, y: 120, radius: 8, speed: 2.4 },
        { x: 150, y: 300, radius: 8, speed: 2.4 },
        { x: 650, y: 300, radius: 8, speed: 2.4 },
        { x: 400, y: 480, radius: 8, speed: 2.4 },
      ],
      railEnemies: [
        { path: Array.from({ length: 16 }, (_, i) => ({ x: 100 + i * 40, y: 300 })), speed: 1.6 },
        { path: Array.from({ length: 9 }, (_, i) => ({ x: 600, y: 150 + i * 40 })), speed: 1.6 },
        { path: Array.from({ length: 9 }, (_, i) => ({ x: 200, y: 150 + i * 40 })), speed: 1.6 },
      ],
      safeZones: [
        { x: 50, y: 50, width: 55, height: 35 },
        { x: 680, y: 500, width: 55, height: 35 },
      ],
      checkpoints: [
        { x: 300, y: 150, radius: 15, id: 0 },
        { x: 700, y: 300, radius: 15, id: 1 },
        { x: 400, y: 500, radius: 15, id: 2 },
      ],
      levelTime: 36,
      powerUpCount: 2,
    },
    6: {
      adaptiveEnemies: [
        { x: 200, y: 100, radius: 8, speed: 2.6 },
        { x: 600, y: 100, radius: 8, speed: 2.6 },
        { x: 100, y: 300, radius: 8, speed: 2.6 },
        { x: 700, y: 300, radius: 8, speed: 2.6 },
        { x: 400, y: 500, radius: 8, speed: 2.6 },
        { x: 300, y: 350, radius: 8, speed: 2.6 },
      ],
      railEnemies: [
        { path: Array.from({ length: 16 }, (_, i) => ({ x: 100 + i * 40, y: 280 })), speed: 1.7 },
        { path: Array.from({ length: 16 }, (_, i) => ({ x: 100 + i * 40, y: 320 })), speed: 1.7 },
        { path: Array.from({ length: 9 }, (_, i) => ({ x: 550, y: 150 + i * 40 })), speed: 1.7 },
        { path: Array.from({ length: 9 }, (_, i) => ({ x: 250, y: 150 + i * 40 })), speed: 1.7 },
      ],
      safeZones: [
        { x: 50, y: 50, width: 50, height: 30 },
        { x: 680, y: 500, width: 50, height: 30 },
      ],
      checkpoints: [
        { x: 250, y: 150, radius: 15, id: 0 },
        { x: 750, y: 300, radius: 15, id: 1 },
        { x: 400, y: 500, radius: 15, id: 2 },
        { x: 100, y: 450, radius: 15, id: 3 },
      ],
      levelTime: 34,
      powerUpCount: 2,
    },
    7: {
      adaptiveEnemies: [
        { x: 200, y: 80, radius: 8, speed: 2.8 },
        { x: 600, y: 80, radius: 8, speed: 2.8 },
        { x: 80, y: 300, radius: 8, speed: 2.8 },
        { x: 720, y: 300, radius: 8, speed: 2.8 },
        { x: 400, y: 520, radius: 8, speed: 2.8 },
        { x: 250, y: 380, radius: 8, speed: 2.8 },
        { x: 550, y: 380, radius: 8, speed: 2.8 },
      ],
      railEnemies: [
        { path: Array.from({ length: 16 }, (_, i) => ({ x: 100 + i * 40, y: 270 })), speed: 1.8 },
        { path: Array.from({ length: 16 }, (_, i) => ({ x: 100 + i * 40, y: 330 })), speed: 1.8 },
        { path: Array.from({ length: 9 }, (_, i) => ({ x: 550, y: 120 + i * 40 })), speed: 1.8 },
        { path: Array.from({ length: 9 }, (_, i) => ({ x: 250, y: 120 + i * 40 })), speed: 1.8 },
      ],
      safeZones: [
        { x: 50, y: 50, width: 45, height: 25 },
        { x: 680, y: 500, width: 45, height: 25 },
      ],
      checkpoints: [
        { x: 200, y: 120, radius: 15, id: 0 },
        { x: 750, y: 280, radius: 15, id: 1 },
        { x: 400, y: 520, radius: 15, id: 2 },
        { x: 100, y: 400, radius: 15, id: 3 },
        { x: 650, y: 480, radius: 15, id: 4 },
      ],
      levelTime: 32,
      powerUpCount: 2,
    },
    8: {
      adaptiveEnemies: [
        { x: 200, y: 60, radius: 8, speed: 3.0 },
        { x: 600, y: 60, radius: 8, speed: 3.0 },
        { x: 60, y: 300, radius: 8, speed: 3.0 },
        { x: 740, y: 300, radius: 8, speed: 3.0 },
        { x: 400, y: 540, radius: 8, speed: 3.0 },
        { x: 250, y: 380, radius: 8, speed: 3.0 },
        { x: 550, y: 380, radius: 8, speed: 3.0 },
        { x: 400, y: 200, radius: 8, speed: 3.0 },
      ],
      railEnemies: [
        { path: Array.from({ length: 16 }, (_, i) => ({ x: 100 + i * 40, y: 260 })), speed: 1.9 },
        { path: Array.from({ length: 16 }, (_, i) => ({ x: 100 + i * 40, y: 340 })), speed: 1.9 },
        { path: Array.from({ length: 9 }, (_, i) => ({ x: 550, y: 100 + i * 40 })), speed: 1.9 },
        { path: Array.from({ length: 9 }, (_, i) => ({ x: 250, y: 100 + i * 40 })), speed: 1.9 },
        { path: Array.from({ length: 12 }, (_, i) => ({ x: 100 + i * 50, y: 450 })), speed: 1.9 },
      ],
      safeZones: [
        { x: 50, y: 50, width: 40, height: 20 },
        { x: 680, y: 500, width: 40, height: 20 },
      ],
      checkpoints: [
        { x: 200, y: 100, radius: 15, id: 0 },
        { x: 750, y: 280, radius: 15, id: 1 },
        { x: 400, y: 540, radius: 15, id: 2 },
        { x: 100, y: 400, radius: 15, id: 3 },
        { x: 650, y: 460, radius: 15, id: 4 },
        { x: 350, y: 200, radius: 15, id: 5 },
      ],
      levelTime: 30,
      powerUpCount: 2,
    },
    9: {
      adaptiveEnemies: [
        { x: 200, y: 60, radius: 8, speed: 3.2 },
        { x: 600, y: 60, radius: 8, speed: 3.2 },
        { x: 50, y: 300, radius: 8, speed: 3.2 },
        { x: 750, y: 300, radius: 8, speed: 3.2 },
        { x: 400, y: 540, radius: 8, speed: 3.2 },
        { x: 250, y: 380, radius: 8, speed: 3.2 },
        { x: 550, y: 380, radius: 8, speed: 3.2 },
        { x: 400, y: 180, radius: 8, speed: 3.2 },
        { x: 300, y: 280, radius: 8, speed: 3.2 },
      ],
      railEnemies: [
        { path: Array.from({ length: 16 }, (_, i) => ({ x: 100 + i * 40, y: 250 })), speed: 2.0 },
        { path: Array.from({ length: 16 }, (_, i) => ({ x: 100 + i * 40, y: 350 })), speed: 2.0 },
        { path: Array.from({ length: 9 }, (_, i) => ({ x: 550, y: 80 + i * 40 })), speed: 2.0 },
        { path: Array.from({ length: 9 }, (_, i) => ({ x: 250, y: 80 + i * 40 })), speed: 2.0 },
        { path: Array.from({ length: 12 }, (_, i) => ({ x: 100 + i * 50, y: 440 })), speed: 2.0 },
      ],
      safeZones: [
        { x: 50, y: 50, width: 35, height: 15 },
        { x: 680, y: 500, width: 35, height: 15 },
      ],
      checkpoints: [
        { x: 200, y: 100, radius: 15, id: 0 },
        { x: 750, y: 280, radius: 15, id: 1 },
        { x: 400, y: 540, radius: 15, id: 2 },
        { x: 100, y: 400, radius: 15, id: 3 },
        { x: 650, y: 460, radius: 15, id: 4 },
        { x: 350, y: 180, radius: 15, id: 5 },
        { x: 550, y: 300, radius: 15, id: 6 },
      ],
      levelTime: 28,
      powerUpCount: 2,
    },
    10: {
      adaptiveEnemies: [
        { x: 200, y: 60, radius: 8, speed: 3.5 },
        { x: 600, y: 60, radius: 8, speed: 3.5 },
        { x: 40, y: 300, radius: 8, speed: 3.5 },
        { x: 760, y: 300, radius: 8, speed: 3.5 },
        { x: 400, y: 540, radius: 8, speed: 3.5 },
        { x: 250, y: 380, radius: 8, speed: 3.5 },
        { x: 550, y: 380, radius: 8, speed: 3.5 },
        { x: 400, y: 160, radius: 8, speed: 3.5 },
        { x: 300, y: 280, radius: 8, speed: 3.5 },
        { x: 500, y: 280, radius: 8, speed: 3.5 },
      ],
      railEnemies: [
        { path: Array.from({ length: 16 }, (_, i) => ({ x: 100 + i * 40, y: 240 })), speed: 2.2 },
        { path: Array.from({ length: 16 }, (_, i) => ({ x: 100 + i * 40, y: 360 })), speed: 2.2 },
        { path: Array.from({ length: 9 }, (_, i) => ({ x: 550, y: 60 + i * 40 })), speed: 2.2 },
        { path: Array.from({ length: 9 }, (_, i) => ({ x: 250, y: 60 + i * 40 })), speed: 2.2 },
        { path: Array.from({ length: 12 }, (_, i) => ({ x: 100 + i * 50, y: 430 })), speed: 2.2 },
        { path: Array.from({ length: 12 }, (_, i) => ({ x: 100 + i * 50, y: 170 })), speed: 2.2 },
      ],
      safeZones: [
        { x: 50, y: 50, width: 30, height: 10 },
        { x: 680, y: 500, width: 30, height: 10 },
      ],
      checkpoints: [
        { x: 200, y: 100, radius: 15, id: 0 },
        { x: 750, y: 280, radius: 15, id: 1 },
        { x: 400, y: 540, radius: 15, id: 2 },
        { x: 100, y: 400, radius: 15, id: 3 },
        { x: 650, y: 460, radius: 15, id: 4 },
        { x: 350, y: 160, radius: 15, id: 5 },
        { x: 550, y: 300, radius: 15, id: 6 },
        { x: 250, y: 500, radius: 15, id: 7 },
      ],
      levelTime: 26,
      powerUpCount: 3,
    },
  };

  // -----------------------------
  // Refs for "always-current" values (prevents stale closures)
  // -----------------------------
  const uiRef = useRef({
    mode: "menu",
    level: 1,
    lives: 3,
    multiplier: 1,
    muted: true,
  });

  useEffect(() => {
    uiRef.current.mode = gameState;
  }, [gameState]);

  useEffect(() => {
    uiRef.current.level = level;
  }, [level]);

  useEffect(() => {
    uiRef.current.lives = lives;
  }, [lives]);

  useEffect(() => {
    uiRef.current.multiplier = multiplier;
  }, [multiplier]);

  useEffect(() => {
    uiRef.current.muted = muted;
  }, [muted]);

  // -----------------------------
  // Game world ref (mutable)
  // -----------------------------
  const gameRef = useRef({
    player: { x: 400, y: 300, radius: 8, vx: 0, vy: 0, speed: 240 }, // speed now pixels/sec
    adaptiveEnemies: [],
    railEnemies: [],
    safeZones: [],
    checkpoints: [],
    visitedCheckpoints: new Set(),
    grid: { cols: 20, rows: 15, cellSize: 40 },
    levelWidth: 800,
    levelHeight: 600,
    gameActive: false,

    // Full-game additions
    lastTs: 0,
    invulnUntil: 0,
    lastSafeSpawn: { x: 70, y: 70 },
    particles: [],
    powerUps: [],
    slowUntil: 0,
    shieldUntil: 0,
    comboUntil: 0,
    timeLeftInternal: 45,
  });

  // -----------------------------
  // Local storage for best score
  // -----------------------------
  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem("graph_runner_best") || "0");
      if (!Number.isNaN(saved)) setBestScore(saved);
    } catch {}
  }, []);

  const persistBest = (newScore) => {
    try {
      localStorage.setItem("graph_runner_best", String(newScore));
    } catch {}
  };

  // -----------------------------
  // Helpers
  // -----------------------------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const playBeep = (freq = 440, dur = 0.06, type = "sine", gain = 0.03) => {
    if (uiRef.current.muted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.value = gain;
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
      osc.onended = () => ctx.close();
    } catch {}
  };

  const spawnParticles = (x, y, count = 14) => {
    const g = gameRef.current;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 40 + Math.random() * 180;
      g.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0.35 + Math.random() * 0.35,
        maxLife: 0.7,
        r: 1 + Math.random() * 2,
      });
    }
  };

  const randomPowerUps = (count) => {
    const kinds = ["shield", "slow", "score"];
    const out = [];
    for (let i = 0; i < count; i++) {
      const kind = kinds[Math.floor(Math.random() * kinds.length)];
      out.push({
        id: `${Date.now()}_${i}_${Math.random().toString(16).slice(2)}`,
        kind,
        x: 120 + Math.random() * 560,
        y: 120 + Math.random() * 360,
        radius: 10,
        bob: Math.random() * Math.PI * 2,
      });
    }
    return out;
  };

  // -----------------------------
  // Simplified Dijkstra pathfinding (kept)
  // -----------------------------
  const findPath = (start, goal, game) => {
    const { cols, rows, cellSize } = game.grid;
    const startCell = { x: Math.floor(start.x / cellSize), y: Math.floor(start.y / cellSize) };
    const goalCell = { x: Math.floor(goal.x / cellSize), y: Math.floor(goal.y / cellSize) };

    const distances = {};
    const previous = {};
    const unvisited = new Set();

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const key = `${x},${y}`;
        distances[key] = Infinity;
        unvisited.add(key);
      }
    }

    const startKey = `${startCell.x},${startCell.y}`;
    distances[startKey] = 0;

    while (unvisited.size > 0) {
      let current = null;
      let minDist = Infinity;

      unvisited.forEach((key) => {
        if (distances[key] < minDist) {
          minDist = distances[key];
          current = key;
        }
      });

      if (current === null || distances[current] === Infinity) break;

      const [cx, cy] = current.split(",").map(Number);
      unvisited.delete(current);

      const neighbors = [
        { x: cx + 1, y: cy },
        { x: cx - 1, y: cy },
        { x: cx, y: cy + 1 },
        { x: cx, y: cy - 1 },
      ];

      neighbors.forEach((n) => {
        if (n.x >= 0 && n.x < cols && n.y >= 0 && n.y < rows) {
          const nKey = `${n.x},${n.y}`;
          const newDist = distances[current] + 1;
          if (newDist < distances[nKey]) {
            distances[nKey] = newDist;
            previous[nKey] = current;
          }
        }
      });
    }

    const path = [];
    let current = `${goalCell.x},${goalCell.y}`;
    while (current && previous[current]) {
      const [x, y] = current.split(",").map(Number);
      path.unshift({ x: x * cellSize + cellSize / 2, y: y * cellSize + cellSize / 2 });
      current = previous[current];
    }

    return path;
  };

  // -----------------------------
  // Level config resolver (10 hard-coded + 20 generated)
  // -----------------------------
  const getLevelConfig = (lvl) => {
    if (levelConfigs[lvl]) return levelConfigs[lvl];
    return generateLevelConfig(lvl);
  };

  // -----------------------------
  // Initialize / reset per level
  // -----------------------------
  useEffect(() => {
    const game = gameRef.current;
    const config = getLevelConfig(level);

    game.visitedCheckpoints.clear();
    game.safeZones = config.safeZones;
    game.checkpoints = config.checkpoints;

    // Reset player and spawns
    game.player.x = 70;
    game.player.y = 70;
    game.player.vx = 0;
    game.player.vy = 0;
    game.lastSafeSpawn = { x: 70, y: 70 };

    // Reset effects
    game.invulnUntil = 0;
    game.slowUntil = 0;
    game.shieldUntil = 0;
    game.comboUntil = 0;
    game.particles = [];
    game.powerUps = randomPowerUps(config.powerUpCount ?? 1);

    // Internal timer
    const t = config.levelTime ?? 45;
    game.timeLeftInternal = t;
    setTimeLeft(t);

    // Enemies
    game.adaptiveEnemies = (config.adaptiveEnemies || []).map((e) => ({
      x: e.x,
      y: e.y,
      radius: e.radius,
      speed: e.speed,
      path: [],
      lastPathUpdate: 0,
    }));

    game.railEnemies = (config.railEnemies || []).map((e) => ({
      x: e.path[0].x,
      y: e.path[0].y,
      radius: 7,
      speed: e.speed,
      path: e.path,
      pathIndex: 0,
    }));

    // If we are currently playing, continue playing; otherwise remain in menu/paused overlays
    // (this avoids forcing "playing" whenever a level changes from UI)
    if (uiRef.current.mode === "playing") {
      game.gameActive = true;
    }
  }, [level]);

  // -----------------------------
  // Start / Pause / Resume
  // -----------------------------
  const startGame = () => {
    const game = gameRef.current;
    setScore(0);
    setMultiplier(1);
    setLives(3);
    setLevel(1);

    // Ensure level init happens, then start
    setTimeout(() => {
      game.lastTs = performance.now();
      game.gameActive = true;
      setGameState("playing");
      playBeep(660, 0.08, "square", 0.03);
      playBeep(880, 0.08, "square", 0.03);
    }, 0);
  };

  const pauseGame = () => {
    const game = gameRef.current;
    if (uiRef.current.mode !== "playing") return;
    game.gameActive = false;
    setGameState("paused");
    playBeep(220, 0.08, "sine", 0.025);
  };

  const resumeGame = () => {
    const game = gameRef.current;
    if (uiRef.current.mode !== "paused") return;
    game.lastTs = performance.now();
    game.gameActive = true;
    setGameState("playing");
    playBeep(440, 0.06, "sine", 0.02);
  };

  // -----------------------------
  // Life / hit handling (full game)
  // -----------------------------
  const handleHit = () => {
    const game = gameRef.current;
    const now = performance.now();
    if (now < game.invulnUntil) return;

    // Shield absorbs one hit
    if (now < game.shieldUntil) {
      game.shieldUntil = 0;
      game.invulnUntil = now + 700;
      spawnParticles(game.player.x, game.player.y, 22);
      playBeep(160, 0.07, "sawtooth", 0.02);
      return;
    }

    setMultiplier(1);
    game.comboUntil = 0;
    game.invulnUntil = now + 1100;

    setLives((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        game.gameActive = false;
        setGameState("gameover");
        playBeep(120, 0.14, "sine", 0.03);
        playBeep(90, 0.18, "sine", 0.03);

        // best score update
        setBestScore((b) => {
          const best = Math.max(b, score);
          if (best !== b) persistBest(best);
          return best;
        });

        return 0;
      }

      // Respawn at last safe spawn
      game.player.x = game.lastSafeSpawn.x;
      game.player.y = game.lastSafeSpawn.y;
      spawnParticles(game.player.x, game.player.y, 18);
      playBeep(180, 0.09, "triangle", 0.02);
      return next;
    });
  };

  // -----------------------------
  // Main game loop (kept as interval, now dt-based)
  // -----------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const game = gameRef.current;
    let keys = {};

    const handleKeyDown = (e) => {
      const k = e.key.toLowerCase();
      keys[k] = true;

      // Pause toggle
      if (k === "p" || k === "escape") {
        if (uiRef.current.mode === "playing") pauseGame();
        else if (uiRef.current.mode === "paused") resumeGame();
      }

      // Quick start from menu
      if (k === "enter" && uiRef.current.mode === "menu") startGame();
    };
    const handleKeyUp = (e) => {
      keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const gameLoop = setInterval(() => {
      // Always render a "living" canvas background even in menu/pause
      const now = performance.now();

      // Delta time (seconds)
      const dt = Math.min(0.033, Math.max(0.008, (now - (game.lastTs || now)) / 1000));
      game.lastTs = now;

      // Background
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, game.levelWidth, game.levelHeight);

      // Grid
      ctx.strokeStyle = "#16213e";
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= game.grid.cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * game.grid.cellSize, 0);
        ctx.lineTo(i * game.grid.cellSize, game.levelHeight);
        ctx.stroke();
      }
      for (let i = 0; i <= game.grid.rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * game.grid.cellSize);
        ctx.lineTo(game.levelWidth, i * game.grid.cellSize);
        ctx.stroke();
      }

      // If not active gameplay, still draw current level layout + entities
      const isPlaying = uiRef.current.mode === "playing" && game.gameActive;

      // Update timer only while playing
      if (isPlaying) {
        // Slow-time powerup halves "enemy time" but timer continues normally (keeps pressure)
        game.timeLeftInternal = Math.max(0, game.timeLeftInternal - dt);
        const rounded = Math.ceil(game.timeLeftInternal);
        if (rounded !== timeLeft) setTimeLeft(rounded);

        if (game.timeLeftInternal <= 0) {
          game.gameActive = false;
          setGameState("gameover");

          setBestScore((b) => {
            const best = Math.max(b, score);
            if (best !== b) persistBest(best);
            return best;
          });
        }
      }

      // Safe zones
      ctx.fillStyle = "rgba(34, 139, 34, 0.30)";
      game.safeZones.forEach((zone) => {
        ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
        ctx.strokeStyle = "#22dd22";
        ctx.lineWidth = 2;
        ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
      });

      // Determine safe zone & update last safe spawn
      let inSafeZone = false;
      game.safeZones.forEach((zone) => {
        const inside =
          game.player.x > zone.x &&
          game.player.x < zone.x + zone.width &&
          game.player.y > zone.y &&
          game.player.y < zone.y + zone.height;
        if (inside) {
          inSafeZone = true;
          // Update spawn point while in safe zone
          game.lastSafeSpawn = { x: clamp(game.player.x, zone.x + 10, zone.x + zone.width - 10), y: clamp(game.player.y, zone.y + 10, zone.y + zone.height - 10) };
        }
      });

      // Power-ups (render + collect)
      game.powerUps.forEach((p) => {
        p.bob += dt * 3;
        const by = p.y + Math.sin(p.bob) * 4;

        let color = "#b388ff";
        if (p.kind === "shield") color = "#00e5ff";
        if (p.kind === "slow") color = "#ffd166";
        if (p.kind === "score") color = "#7cff6b";

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, by, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // inner glyph
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath();
        ctx.arc(p.x, by, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      if (isPlaying) {
        // Player movement (pixels/sec)
        let vx = 0;
        let vy = 0;
        if (keys["arrowup"] || keys["w"]) vy = -1;
        if (keys["arrowdown"] || keys["s"]) vy = 1;
        if (keys["arrowleft"] || keys["a"]) vx = -1;
        if (keys["arrowright"] || keys["d"]) vx = 1;

        // Normalize diagonal
        const mag = Math.hypot(vx, vy) || 1;
        vx /= mag;
        vy /= mag;

        // Slight speed boost if combo is active
        const comboBoost = now < game.comboUntil ? 1.06 : 1.0;

        game.player.x += vx * game.player.speed * comboBoost * dt;
        game.player.y += vy * game.player.speed * comboBoost * dt;

        // Boundary collision
        game.player.x = clamp(game.player.x, game.player.radius, game.levelWidth - game.player.radius);
        game.player.y = clamp(game.player.y, game.player.radius, game.levelHeight - game.player.radius);

        // Collect powerups
        if (game.powerUps.length > 0) {
          const remaining = [];
          for (const p of game.powerUps) {
            const by = p.y + Math.sin(p.bob) * 4;
            const dx = game.player.x - p.x;
            const dy = game.player.y - by;
            if (Math.hypot(dx, dy) < game.player.radius + p.radius) {
              spawnParticles(p.x, by, 18);
              playBeep(720, 0.06, "square", 0.02);

              if (p.kind === "shield") {
                game.shieldUntil = now + 9000; // 9s shield
              } else if (p.kind === "slow") {
                game.slowUntil = now + 6500; // 6.5s slow enemies
              } else if (p.kind === "score") {
                setScore((prev) => prev + 250 * uiRef.current.multiplier);
                game.comboUntil = now + 2800;
              }
            } else {
              remaining.push(p);
            }
          }
          game.powerUps = remaining;
        }

        // Update adaptive enemies
        const enemyTimeScale = now < game.slowUntil ? 0.55 : 1.0;

        game.adaptiveEnemies.forEach((enemy) => {
          if (Date.now() - enemy.lastPathUpdate > 500) {
            enemy.path = findPath(enemy, game.player, game);
            enemy.lastPathUpdate = Date.now();
          }

          if (enemy.path.length > 0) {
            const target = enemy.path[0];
            const dx = target.x - enemy.x;
            const dy = target.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 5) {
              enemy.path.shift();
            } else {
              const sp = enemy.speed * 60 * dt * enemyTimeScale; // keeps similar feel vs original
              enemy.x += (dx / dist) * sp;
              enemy.y += (dy / dist) * sp;
            }
          }

          // Collision check
          if (!inSafeZone) {
            const dx = game.player.x - enemy.x;
            const dy = game.player.y - enemy.y;
            if (Math.sqrt(dx * dx + dy * dy) < game.player.radius + enemy.radius) {
              handleHit();
            }
          }
        });

        // Update rail enemies
        game.railEnemies.forEach((enemy) => {
          if (enemy.path.length > 0) {
            const targetIdx = Math.floor(enemy.pathIndex % enemy.path.length);
            const target = enemy.path[targetIdx];
            const dx = target.x - enemy.x;
            const dy = target.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const sp = enemy.speed * 60 * dt * enemyTimeScale;
            if (dist < sp) {
              enemy.pathIndex += 1;
            } else {
              enemy.x += (dx / dist) * sp;
              enemy.y += (dy / dist) * sp;
            }
          }

          // Collision check
          if (!inSafeZone) {
            const dx = game.player.x - enemy.x;
            const dy = game.player.y - enemy.y;
            if (Math.sqrt(dx * dx + dy * dy) < game.player.radius + enemy.radius) {
              handleHit();
            }
          }
        });

        // Checkpoints (score + combo multiplier)
        game.checkpoints.forEach((checkpoint) => {
          const dx = game.player.x - checkpoint.x;
          const dy = game.player.y - checkpoint.y;
          if (Math.sqrt(dx * dx + dy * dy) < game.player.radius + checkpoint.radius) {
            if (!game.visitedCheckpoints.has(checkpoint.id)) {
              game.visitedCheckpoints.add(checkpoint.id);

              // Combo logic: chain checkpoints quickly to raise multiplier up to 5
              const comboWindowMs = 2400;
              const inCombo = now < game.comboUntil;
              const nextMult = clamp(inCombo ? uiRef.current.multiplier + 1 : 1, 1, 5);
              setMultiplier(nextMult);
              game.comboUntil = now + comboWindowMs;

              const award = 100 * nextMult;
              setScore((prev) => prev + award);
              spawnParticles(checkpoint.x, checkpoint.y, 18);
              playBeep(520 + nextMult * 80, 0.07, "triangle", 0.02);

              if (game.visitedCheckpoints.size === game.checkpoints.length) {
                game.gameActive = false;

                // Time bonus
                const timeBonus = Math.floor(game.timeLeftInternal) * 20;
                setScore((prev) => prev + timeBonus);
                setGameState("levelcomplete");
                playBeep(880, 0.08, "square", 0.03);
                playBeep(990, 0.08, "square", 0.03);
              }
            }
          }
        });
      }

      // Draw checkpoints
      game.checkpoints.forEach((checkpoint) => {
        ctx.fillStyle = game.visitedCheckpoints.has(checkpoint.id) ? "#ffaa00" : "#ff6b6b";
        ctx.beginPath();
        ctx.arc(checkpoint.x, checkpoint.y, checkpoint.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw enemies
      ctx.fillStyle = "#ff1744";
      game.adaptiveEnemies.forEach((enemy) => {
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = "#ff9800";
      game.railEnemies.forEach((enemy) => {
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw player (blink when invulnerable)
      const invuln = now < game.invulnUntil;
      const visible = !invuln || Math.floor(now / 90) % 2 === 0;
      if (visible) {
        ctx.fillStyle = "#00d4ff";
        ctx.beginPath();
        ctx.arc(game.player.x, game.player.y, game.player.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw shield ring
      if (now < game.shieldUntil) {
        ctx.strokeStyle = "rgba(0, 229, 255, 0.9)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(game.player.x, game.player.y, game.player.radius + 7, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Particles
      if (game.particles.length > 0) {
        const next = [];
        for (const p of game.particles) {
          p.life -= dt;
          if (p.life > 0) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= 0.92;
            p.vy *= 0.92;
            next.push(p);

            const alpha = clamp(p.life / p.maxLife, 0, 1);
            ctx.fillStyle = `rgba(255,255,255,${alpha * 0.9})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        game.particles = next;
      }

      // HUD overlays inside canvas (subtle)
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(10, 10, 240, 72);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "14px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillText(`Lives: ${uiRef.current.lives}`, 20, 32);
      ctx.fillText(`Timer: ${Math.max(0, Math.ceil(game.timeLeftInternal))}s`, 20, 52);
      ctx.fillText(`Multiplier: x${uiRef.current.multiplier}`, 20, 72);

      // Slow indicator
      if (now < game.slowUntil) {
        ctx.fillStyle = "rgba(255, 209, 102, 0.22)";
        ctx.fillRect(0, 0, game.levelWidth, game.levelHeight);
      }
    }, 1000 / 60);

    return () => {
      clearInterval(gameLoop);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
    // Intentionally empty deps: loop uses refs to avoid stale state
  }, [timeLeft, score]);

  // -----------------------------
  // Reset / Next
  // -----------------------------
  const resetGame = () => {
    const game = gameRef.current;
    game.gameActive = false;

    setGameState("menu");
    setScore(0);
    setMultiplier(1);
    setLives(3);
    setLevel(1);

    // Reset internal level timer
    const cfg = getLevelConfig(1);
    const t = cfg.levelTime ?? 45;
    game.timeLeftInternal = t;
    setTimeLeft(t);
  };

  const nextLevel = () => {
    const game = gameRef.current;
    const maxLevels = 30;

    if (level < maxLevels) {
      setMultiplier(1);
      setLevel((prev) => prev + 1);

      // Continue playing seamlessly
      setTimeout(() => {
        const cfg = getLevelConfig(uiRef.current.level + 1);
        const t = cfg.levelTime ?? 45;
        game.timeLeftInternal = t;
        setTimeLeft(t);

        game.lastTs = performance.now();
        game.gameActive = true;
        setGameState("playing");
      }, 0);
    } else {
      setGameState("finished");

      setBestScore((b) => {
        const best = Math.max(b, score);
        if (best !== b) persistBest(best);
        return best;
      });
    }
  };

  // -----------------------------
  // UI
  // -----------------------------
  const maxLevels = 30;

  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center overflow-hidden">
      <div className="flex flex-col items-center justify-center">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">Graph Runner</h1>

          <div className="flex gap-6 justify-center text-lg text-white flex-wrap">
            <div>
              Level: <span className="text-yellow-400">{level}/{maxLevels}</span>
            </div>
            <div>
              Score: <span className="text-yellow-400">{score}</span>
            </div>
            <div>
              Lives: <span className="text-yellow-400">{lives}</span>
            </div>
            <div>
              Time: <span className="text-yellow-400">{timeLeft}s</span>
            </div>
            <div>
              Best: <span className="text-yellow-400">{bestScore}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center gap-3">
            <button
              onClick={() => setMuted((m) => !m)}
              className="text-xs px-3 py-1 rounded border border-cyan-400 text-cyan-200 hover:bg-cyan-400/10"
            >
              Sound: {muted ? "Off" : "On"}
            </button>

            {gameState === "playing" && (
              <button
                onClick={pauseGame}
                className="text-xs px-3 py-1 rounded border border-yellow-400 text-yellow-200 hover:bg-yellow-400/10"
              >
                Pause (P / Esc)
              </button>
            )}

            {gameState === "paused" && (
              <button
                onClick={resumeGame}
                className="text-xs px-3 py-1 rounded border border-green-400 text-green-200 hover:bg-green-400/10"
              >
                Resume
              </button>
            )}
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border-4 border-cyan-400 bg-gray-950 shadow-lg shadow-cyan-500"
        />

        <div className="text-center text-white max-w-2xl mt-6">
          <p className="mb-2 text-sm text-gray-300">
            <strong>Controls:</strong> Arrow Keys or WASD to move • P / Esc to pause
          </p>
          <p className="text-xs text-gray-400">
            Blue = Player | Red = Smart enemies (Dijkstra) | Orange = Rail enemies | Green = Safe zones
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Power-ups: Cyan = Shield • Yellow = Slow • Green = Score Burst • Chain checkpoints quickly for multiplier (max x5)
          </p>
        </div>
      </div>

      {/* MENU */}
      {gameState === "menu" && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-lg text-center border-2 border-cyan-500 w-[520px] max-w-[92vw]">
            <h2 className="text-3xl font-bold text-cyan-400 mb-3">Graph Runner</h2>
            <p className="text-white mb-4">
              Survive 30 levels. Touch all checkpoints without getting caught.
            </p>

            <div className="text-left text-sm text-gray-200 bg-black/20 rounded p-4 mb-5">
              <div className="mb-2 font-semibold text-gray-100">How to win</div>
              <ul className="list-disc ml-5 space-y-1">
                <li>Collect every checkpoint (red circles) to complete a level.</li>
                <li>Use safe zones (green) to avoid collisions and set respawn.</li>
                <li>Power-ups help: shield, slow-time, and score bursts.</li>
                <li>Chain checkpoints fast to increase multiplier up to x5.</li>
              </ul>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={startGame}
                className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2 px-6 rounded"
              >
                Start Game (Enter)
              </button>
              <button
                onClick={() => {
                  setScore(0);
                  setMultiplier(1);
                  setLives(3);
                  setLevel(1);
                  setGameState("playing");
                  const game = gameRef.current;
                  const cfg = getLevelConfig(1);
                  const t = cfg.levelTime ?? 45;
                  game.timeLeftInternal = t;
                  setTimeLeft(t);
                  game.lastTs = performance.now();
                  game.gameActive = true;
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded"
              >
                Quick Play
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-400">
              Tip: Press P / Esc anytime to pause.
            </div>
          </div>
        </div>
      )}

      {/* PAUSED */}
      {gameState === "paused" && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-lg text-center border-2 border-yellow-400 w-[460px] max-w-[92vw]">
            <h2 className="text-3xl font-bold text-yellow-300 mb-2">Paused</h2>
            <p className="text-white mb-6">Score: {score} • Lives: {lives} • Multiplier: x{multiplier}</p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={resumeGame}
                className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-6 rounded"
              >
                Resume
              </button>
              <button
                onClick={resetGame}
                className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2 px-6 rounded"
              >
                <RotateCcw size={20} /> Exit to Menu
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-400">
              P / Esc to resume.
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER */}
      {gameState === "gameover" && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-lg text-center border-2 border-red-500 w-[460px] max-w-[92vw]">
            <h2 className="text-3xl font-bold text-red-500 mb-3">Game Over</h2>
            <p className="text-white mb-2">Final Score: {score}</p>
            <p className="text-gray-300 mb-6 text-sm">Best Score: {bestScore}</p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  // Restart from level 1 (full reset), but start immediately
                  setScore(0);
                  setMultiplier(1);
                  setLives(3);
                  setLevel(1);
                  setGameState("playing");
                  const game = gameRef.current;
                  const cfg = getLevelConfig(1);
                  const t = cfg.levelTime ?? 45;
                  game.timeLeftInternal = t;
                  setTimeLeft(t);
                  game.lastTs = performance.now();
                  game.gameActive = true;
                }}
                className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2 px-6 rounded"
              >
                <RotateCcw size={20} /> Try Again
              </button>
              <button
                onClick={resetGame}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded"
              >
                Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEVEL COMPLETE */}
      {gameState === "levelcomplete" && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-lg text-center border-2 border-green-500 w-[460px] max-w-[92vw]">
            <h2 className="text-3xl font-bold text-green-400 mb-2">Level {level} Complete</h2>
            <p className="text-white mb-2">Score: {score}</p>
            <p className="text-gray-300 mb-6 text-sm">
              Next level gets tougher. Use safe zones to reset positioning and avoid chain hits.
            </p>
            <button
              onClick={nextLevel}
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2 px-6 rounded"
            >
              {level === maxLevels ? "Finish Game" : "Next Level"}
            </button>
          </div>
        </div>
      )}

      {/* FINISHED */}
      {gameState === "finished" && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-lg text-center border-2 border-yellow-400 w-[460px] max-w-[92vw]">
            <h2 className="text-3xl font-bold text-yellow-300 mb-2">You Win</h2>
            <p className="text-white mb-2">All {maxLevels} Levels Complete</p>
            <p className="text-white mb-2 text-2xl">Final Score: {score}</p>
            <p className="text-gray-300 mb-6 text-sm">Best Score: {Math.max(bestScore, score)}</p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={startGame}
                className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2 px-6 rounded"
              >
                Play Again
              </button>
              <button
                onClick={resetGame}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded"
              >
                Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphRunner;
