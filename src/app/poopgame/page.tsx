"use client";

import { useEffect, useRef } from "react";
import styles from "./poopgame.module.css";

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Player extends GameObject {
  speed: number;
  velY: number;
  jumping: boolean;
  doubleJumped: boolean;
  worldX: number;
}

interface Poop extends GameObject {
  collected: boolean;
  worldX: number;
}

interface Platform extends GameObject {
  worldX: number;
}

export default function PoopGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const scoreDisplay = scoreRef.current;
    if (!canvas || !scoreDisplay) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Game world settings
    const WORLD_WIDTH = 3000;
    const VIEWPORT_WIDTH = canvas.width;
    const GROUND_HEIGHT = 20;
    let cameraX = 0;

    // Player object with size properties
    const player: Player = {
      x: 50,
      y: 300,
      width: 30,
      height: 50,
      speed: 3,
      velY: 0,
      jumping: false,
      doubleJumped: false,
      worldX: 50,
    };

    const poopEmoji = "💩";
    const poops: Poop[] = [];
    const platforms: Platform[] = [];
    let score = 0;
    const gravity = 0.25;
    const jumpForce = -12;
    const maxFallSpeed = 8;
    const keys: { [key: string]: boolean } = {};
    const finishLine = {
      worldX: WORLD_WIDTH - 100,
      x: 0,
      y: 0,
      width: 20,
      height: canvas.height,
    };

    // Generate platforms
    function generatePlatforms() {
      const platformCount = 15;
      for (let i = 0; i < platformCount; i++) {
        platforms.push({
          worldX: 300 + i * 200,
          x: 0,
          y: Math.random() * (canvas!.height - 150) + 100,
          width: 100,
          height: 20,
        });
      }
    }

    // Generate poop piles
    function generatePoop(): Poop {
      const worldX = Math.random() * (WORLD_WIDTH - 200) + 100;
      return {
        worldX,
        x: 0,
        y: Math.random() * (canvas!.height - 100),
        width: 20,
        height: 20,
        collected: false,
      };
    }

    // Initialize game with platforms and poop piles
    generatePlatforms();
    for (let i = 0; i < 20; i++) {
      poops.push(generatePoop());
    }

    // Event listeners for controls
    const handleKeyDown = (e: KeyboardEvent) => (keys[e.key] = true);
    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key] = false;
      // Reset double jump when releasing up arrow
      if (e.key === "ArrowUp" && player.velY < 0) {
        player.velY = Math.max(player.velY, -6);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Collision detection
    function collides(a: GameObject, b: GameObject) {
      return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
      );
    }

    // Draw player as a stick figure
    function drawPlayer() {
      if (!ctx) return;

      ctx.save();
      ctx.translate(player.x, player.y);

      // Head
      ctx.fillStyle = "#FFDAB9";
      ctx.beginPath();
      ctx.arc(15, 10, 8, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(15, 18);
      ctx.lineTo(15, 35);
      ctx.stroke();

      // Arms
      ctx.beginPath();
      ctx.moveTo(15, 20);
      ctx.lineTo(5, 30);
      ctx.moveTo(15, 20);
      ctx.lineTo(25, 30);
      ctx.stroke();

      // Legs
      ctx.beginPath();
      ctx.moveTo(15, 35);
      ctx.lineTo(10, 50);
      ctx.moveTo(15, 35);
      ctx.lineTo(20, 50);
      ctx.stroke();

      ctx.restore();
    }

    function checkPlatformCollisions() {
      let onPlatform = false;
      platforms.forEach((platform) => {
        const playerBottom = player.y + player.height;
        const platformTop = platform.y;
        const wasAbovePlatform = playerBottom - player.velY <= platformTop;

        if (
          player.worldX < platform.worldX + platform.width &&
          player.worldX + player.width > platform.worldX &&
          playerBottom >= platformTop &&
          playerBottom <= platform.y + platform.height &&
          wasAbovePlatform
        ) {
          player.y = platform.y - player.height;
          player.velY = 0;
          player.jumping = false;
          player.doubleJumped = false;
          onPlatform = true;
        }
      });
      return onPlatform;
    }

    function update() {
      // Handle jumping first
      if (keys["ArrowUp"]) {
        if (!player.jumping) {
          player.velY = jumpForce;
          player.jumping = true;
        } else if (!player.doubleJumped) {
          player.velY = jumpForce * 0.85;
          player.doubleJumped = true;
        }
      }

      // Apply gravity with fall speed limit
      player.velY += gravity;
      player.velY = Math.min(player.velY, maxFallSpeed);
      player.y += player.velY;

      // Movement
      if (keys["ArrowLeft"]) {
        player.worldX -= player.speed;
        player.worldX = Math.max(0, player.worldX);
      }
      if (keys["ArrowRight"]) {
        player.worldX += player.speed;
        player.worldX = Math.min(WORLD_WIDTH - player.width, player.worldX);
      }

      // Floor collision
      if (player.y + player.height > canvas!.height - GROUND_HEIGHT) {
        player.y = canvas!.height - GROUND_HEIGHT - player.height;
        player.velY = 0;
        player.jumping = false;
        player.doubleJumped = false;
      }

      // Platform collisions
      checkPlatformCollisions();

      // Update camera position
      cameraX = player.worldX - VIEWPORT_WIDTH / 3;
      cameraX = Math.max(0, Math.min(cameraX, WORLD_WIDTH - VIEWPORT_WIDTH));

      // Update player screen position based on camera
      player.x = player.worldX - cameraX;

      // Check poop collection
      poops.forEach((poop) => {
        poop.x = poop.worldX - cameraX;
        if (!poop.collected && collides(player, poop)) {
          poop.collected = true;
          score += 10;
          scoreDisplay!.textContent = score.toString();
        }
      });

      // Check finish line collision
      finishLine.x = finishLine.worldX - cameraX;
      if (player.worldX > finishLine.worldX) {
        alert(`Congratulations! You finished with ${score} points!`);
        // Reset game
        player.worldX = 50;
        player.x = 50;
        player.y = 300;
        cameraX = 0;
        poops.forEach((poop) => (poop.collected = false));
        score = 0;
        scoreDisplay!.textContent = "0";
      }
    }

    function draw() {
      if (!ctx) return;

      // Clear canvas
      ctx.fillStyle = "#87CEEB";
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);

      // Draw ground
      ctx.fillStyle = "#228B22";
      ctx.fillRect(
        0,
        canvas!.height - GROUND_HEIGHT,
        canvas!.width,
        GROUND_HEIGHT
      );

      // Draw platforms
      ctx.fillStyle = "#8B4513";
      platforms.forEach((platform) => {
        platform.x = platform.worldX - cameraX;
        if (platform.x + platform.width > 0 && platform.x < canvas!.width) {
          ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        }
      });

      // Draw finish line
      ctx.fillStyle = "#FF0000";
      if (finishLine.x + finishLine.width > 0 && finishLine.x < canvas!.width) {
        ctx.fillRect(
          finishLine.x,
          finishLine.y,
          finishLine.width,
          finishLine.height
        );
      }

      // Draw player
      drawPlayer();

      // Draw poop piles
      ctx.font = "20px Arial";
      poops.forEach((poop) => {
        if (
          !poop.collected &&
          poop.x + poop.width > 0 &&
          poop.x < canvas!.width
        ) {
          ctx.fillText(poopEmoji, poop.x, poop.y);
        }
      });

      // Draw progress indicator
      ctx.fillStyle = "#000";
      ctx.font = "14px Arial";
      const progress = Math.floor((player.worldX / WORLD_WIDTH) * 100);
      ctx.fillText(`Progress: ${progress}%`, 10, 20);
    }

    let animationFrameId: number;

    function gameLoop() {
      update();
      draw();
      animationFrameId = requestAnimationFrame(gameLoop);
    }

    // Start game
    gameLoop();

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={styles.gameContainer}>
      <h2>Poop Collector</h2>
      <div>
        Score: <span ref={scoreRef}>0</span>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className={styles.gameCanvas}
      />
      <div>Use Arrow Keys to move and double jump</div>
    </div>
  );
}
