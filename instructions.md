
---

## Browser Game Inspired by Roblox's “Blox Fruits”

You are an expert full-stack game developer.
Your task is to build a **browser-based 3D action RPG** inspired by the *style and mechanics* of Roblox’s “Blox Fruits” — **but with fully original content** (no copied assets, no reused names, no reuse of copyrighted code, maps, or artwork).

The result must be:

* Playable in a modern desktop browser
* Using a **straightforward, common web tech stack**
* Structured, modular, and easy to extend over time

---

### 1. Tech Stack (Fixed – do not change unless explicitly asked)

Use this stack:

**Frontend / Game Client**

* **Language:** TypeScript
* **Build Tool:** Vite
* **UI Framework:** React
* **3D Engine:** Three.js via `@react-three/fiber` and `@react-three/drei`
* **State Management:** Zustand
* **Styling / UI:** Tailwind CSS (for menus, HUD, overlays)

**Backend (for now: optional / minimal)**

* **Initial MVP:** Client-side only (no backend), with save data stored in `localStorage`.
* **Optional later phase (if requested):**

  * Node.js + Express
  * Simple REST API for saving/loading player profiles (no full MMO required at first).

**Project Setup Requirements**

1. Create a new Vite + React + TypeScript project.
2. Install:

   * `react`, `react-dom`
   * `@react-three/fiber`, `@react-three/drei`, `three`
   * `zustand`
   * `tailwindcss`, `postcss`, `autoprefixer`
3. Configure Tailwind in the standard way and ensure basic styles are working.
4. Make sure the project runs with `npm run dev` and loads a blank React page before adding game logic.

---

### 2. Game Concept (Inspired, Not Copied)

Create an **original anime-style pirate / adventure game** with:

* A **small 3D island world** to explore
* **Melee combat** (sword style)
* **Special “Fruit Powers”** that grant abilities (dash, fireball, area attack)
* **Enemy NPCs** that respawn and give XP
* A **simple progression system** (levels, stats, unlocking powers)

Do **not** reuse any names, maps, or specific assets from “Blox Fruits”.
Use new names like:

* Game Name: **“Elemental Isles”** (example)
* Fruits: **“Flame Core”, “Shadow Orb”, “Thunder Seed”**, etc.
* Factions, locations, enemies: all original.

---

### 3. Core Features – MVP Scope

Implement at least the following playable features:

#### 3.1 World & Movement

* 3D low-poly island map:

  * A main island with:

    * A spawn area (dock or small village)
    * A training zone with low-level enemies
    * A hill or elevated platform to make verticality visible
* Third-person camera:

  * Orbit / follow player from behind
  * Mouse to rotate camera
* Player movement:

  * WASD movement on ground
  * Space = jump
  * Shift (or similar) = sprint (optional but nice)

#### 3.2 Player Character

* Simple low-poly humanoid mesh or capsule with a distinguishable “front.”
* Basic animations or at least:

  * Idle pose
  * Moving / running
  * Attack animation (can be simple if animation is complex)
* Stats:

  * Level
  * XP / XP to next level
  * Health
  * Energy / stamina (for abilities)

#### 3.3 Combat System

* Basic melee combat:

  * Left mouse click = light sword attack
  * Add a short cooldown and attack range
* Hit detection:

  * Either using simple bounding boxes/spheres or raycasts
  * On hit, enemy loses HP and flashes/damages visually
* Damage and death:

  * Enemies lose HP and “die” at 0 HP (despawn or play a simple death animation)
  * Player can also lose HP and respawn at a spawn point.

#### 3.4 Fruit Powers (Special Abilities)

Design **3 original fruit powers** that the player can unlock:

Example:

1. **Flame Core**

   * Ability: short-range fire burst in a cone
   * Effect: damages enemies in front of player
2. **Shadow Orb**

   * Ability: short dash or teleport a few meters in the facing direction
   * Effect: brief invisibility or damage ignoring
3. **Thunder Seed**

   * Ability: targeted lightning strike at a point in front of player
   * Effect: high damage to one target

For each ability:

* Assign a key: e.g. `1`, `2`, `3`
* Implement cooldown timers
* Display cooldowns in the HUD

#### 3.5 Enemies & NPCs

* At least **one enemy type** (e.g. “Bandit”):

  * Simple AI:

    * Idle / patrol near a point
    * Aggravate if player enters radius
    * Move toward player and attack at close range
  * Stats:

    * HP, damage, XP reward
  * Respawn logic after a delay

Optional:

* A friendly NPC that gives a simple “quest”:

  * Example: “Defeat 5 bandits and return.”

#### 3.6 Progression & XP

* Player gains XP from defeating enemies.
* Level-up logic:

  * Each level requires more XP.
  * On level-up, increase base stats (HP, damage, etc.).
* Unlock fruit powers at certain levels:

  * e.g. Level 2 = Flame Core, Level 4 = Shadow Orb, Level 6 = Thunder Seed
* Show level and XP bar in the UI.

#### 3.7 UI / HUD

Use React + Tailwind to create clean UI overlays:

* Top-left or top-center:

  * Player Level
  * XP bar with current / next level
* Bottom center:

  * Ability bar with icons or simple boxes:

    * `1: Flame`, `2: Shadow`, `3: Thunder`
    * Show cooldowns visually (faded overlay or timer text)
* Top-right:

  * Simple mini-panel for:

    * Current quest (if implemented)
    * Number of enemies defeated

#### 3.8 Saving & Loading

* Save to `localStorage`:

  * Player level
  * Current XP
  * Unlocked abilities
* Load this data when game starts.
* Provide a “Reset Progress” button in a small settings menu.

---

### 4. Architecture & Project Structure

Organize the project logically. A suggested structure:

```txt
src/
  main.tsx                 # app entry
  App.tsx                  # root React component

  game/
    GameCanvas.tsx         # R3F Canvas + scene
    GameScene.tsx          # main scene component
    Player.tsx             # player mesh + movement + input
    Enemy.tsx              # enemy mesh + AI
    World.tsx              # island / environment
    CombatSystem.ts        # combat logic, hit detection
    AbilitiesSystem.ts     # fruit powers implementation
    types.ts               # shared type definitions (PlayerState, EnemyState, etc.)

  state/
    useGameStore.ts        # Zustand store for game state
    usePlayerStore.ts      # optional separate store for player

  ui/
    Hud.tsx                # HUD (health, XP, level, abilities)
    MainMenu.tsx           # optional start menu
    PauseMenu.tsx          # optional pause/settings menu

  utils/
    math.ts                # helper math functions if needed
    saveLoad.ts            # localStorage load/save helpers
```

**Key Principles:**

* Keep **render logic** in R3F components and **game state** in Zustand.
* Combat and ability logic should be in separate modules (not hard-coded inside React components).
* Use TypeScript interfaces/types for player, enemy, and ability definitions.

---

### 5. Implementation Plan (Step-by-Step)

Follow these steps in order:

1. **Project setup**

   * Create Vite React TS app.
   * Add Tailwind.
   * Add `@react-three/fiber`, `@react-three/drei`, `three`.
   * Verify a basic `<Canvas>` renders a cube.

2. **Game world & camera**

   * Implement `GameCanvas` with `<Canvas>` and a `GameScene`.
   * Add a simple ground plane and some placeholder meshes for trees/rocks.
   * Implement a third-person camera that follows an invisible “camera rig” tied to the player.

3. **Player movement**

   * Create a `Player` component with:

     * A visible mesh (box or simple humanoid).
     * Keyboard input (WASD + Space).
   * Ensure movement is frame-rate independent (use delta time).

4. **State management**

   * Create a `usePlayerStore` (Zustand) for:

     * Position, health, energy
     * Level, XP
     * Unlocked abilities
   * Create `useGameStore` for:

     * Global game state (e.g., enemies, quests, time).

5. **Enemies & basic combat**

   * Implement an `Enemy` component with:

     * Patrol/idle behavior.
     * Simple chase/attack logic when close to player.
   * Implement combat:

     * Player’s left click triggers an attack.
     * Detect collisions (bounding box or raycast).
     * Reduce enemy HP and handle enemy death + XP.

6. **Fruit powers / abilities**

   * Design an `Ability` type with:

     * Name, key, cooldown, effect function.
   * Build an `AbilitiesSystem` that:

     * Listens to keys `1`, `2`, `3`.
     * Checks cooldowns and player state.
     * Spawns temporary effects (e.g., small particle or colored shape) and applies damage or movement.
   * Integrate visuals into the scene (e.g., glowing sphere for fire burst, streak for dash, etc.).

7. **HUD & UI**

   * Implement `Hud` with React + Tailwind:

     * HP bar, XP bar, Level display.
     * Ability bar with cooldown indicators.
   * Overlay the HUD over the R3F canvas.

8. **Progression logic**

   * Implement XP gain and level thresholds.
   * On level-up:

     * Increase player max HP or damage.
     * Unlock abilities at specific levels.

9. **Saving & loading**

   * Implement `saveGameState()` and `loadGameState()` using `localStorage`.
   * Automatically save on important events (e.g., level up, ability unlock).
   * Load on app start and update stores.

10. **Polish & cleanup**

* Replace placeholder meshes with slightly nicer low-poly shapes.
* Improve camera smoothness and input feel.
* Refactor any duplicated logic into utility functions.

---

### 6. Constraints & Style Guidelines

* Target: **Desktop browser** (Chrome, Edge, Firefox) – mobile responsiveness is optional.
* Aim for performance: keep poly counts low and enemy counts reasonable.
* Use **original** names, visuals, and game design elements:

  * Do NOT copy exact maps, codes, or assets from “Blox Fruits” or Roblox.
  * All source code must be newly written in this project.
* Write **clean, well-commented TypeScript**.
* Prefer small, focused modules over large files.

---

### 7. What to Generate

When I ask you to start or continue this project, you should:

1. Propose or adjust the **file structure** if needed.
2. Generate complete **code files** (not just fragments), so they can be pasted directly into the project.
3. When changing an existing file, show the full updated file unless I explicitly ask for a diff.
4. Explain briefly:

   * Where each new file should live in `src/`.
   * How to run or test the new features.

If something essential is ambiguous (e.g., exact visual style, complexity, or number of enemies), make a **reasonable default choice**, explain it in 1–2 sentences, and continue.

---

If you like, I can now also give you:

* A ready-to-paste `package.json` and basic Vite/Tailwind setup, or
* The initial file structure and starter code for `main.tsx`, `App.tsx`, and `GameCanvas.tsx`.
