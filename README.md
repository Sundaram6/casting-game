# Casting Office 3D 🎬

Welcome to the **Nepo Kid Simulator**. You play as an aspiring actor navigating a massive 3D field filled with casting offices and crowds. To secure a role, you must approach a casting office and type **"nepo kid"** as quickly as possible before the timer runs out!

## Features
- **3D World:** Built with Three.js. Includes a massive field, 10 casting offices, and a wandering crowd.
- **Typing Minigame:** Walk up to an office and quickly type "nepo kid". 
- **Dynamic Difficulty:** The timer decreases as you approach more offices, starting from 7 seconds down to 3 seconds.
- **Meme Sounds:** Features classic meme audio clips (Vine Boom, Yippee) sourced via MyInstants for comedic effect.
- **Immersive Controls:** Standard First-Person WASD + Mouse controls utilizing PointerLock API.

## Controls
- **W, A, S, D:** Move forward, left, backward, and right.
- **Mouse:** Look around the 3D environment.
- **Keyboard (during minigame):** Type the required phrase as fast as possible.

## How to Run
Since this game uses external assets (Three.js CDN, meme sounds), it is best run using a local web server to avoid CORS issues.

Using Python:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000` in your web browser.

## Failing the Game
If you fail to type "nepo kid" in time, you will be met with a very bold reminder that **"YOU ARE NOT A STAR KID"**. Good luck!
